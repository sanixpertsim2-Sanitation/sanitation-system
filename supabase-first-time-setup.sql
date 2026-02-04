-- First-time setup for Sanixpert MACY System
-- Run this file first to create all necessary tables and functions

-- ======================================================
-- 1️⃣ PRE-CLEANING LOGS
-- ======================================================
create table if not exists pre_cleaning_logs (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  employee_name text not null,
  bags_used integer not null,
  checklist jsonb not null,
  status text default 'submitted',
  submitted_at timestamp with time zone default now()
);

alter table pre_cleaning_logs enable row level security;

drop policy if exists "preclean open access" on pre_cleaning_logs;
create policy "preclean open access"
on pre_cleaning_logs
for all
using (true)
with check (true);

-- ======================================================
-- 2️⃣ POST-CLEANING LOGS
-- ======================================================
create table if not exists post_cleaning_logs (
  id uuid primary key default gen_random_uuid(),
  preclean_id uuid references pre_cleaning_logs(id) on delete cascade,
  employee_name text not null,
  bags_returned integer not null,
  checklist jsonb not null,
  handover_required boolean default false,
  submitted_at timestamp with time zone default now()
);

alter table post_cleaning_logs enable row level security;

drop policy if exists "postclean open access" on post_cleaning_logs;
create policy "postclean open access"
on post_cleaning_logs
for all
using (true)
with check (true);

-- ======================================================
-- 3️⃣ DAMAGE REPORTS
-- ======================================================
create table if not exists damage_reports (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  description text not null,
  severity text,
  status text default 'Open', -- Open | Completed | Handover
  completed_by text,
  completed_photo text,
  completed_at timestamp with time zone,
  handover_reason text,
  handover_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table damage_reports enable row level security;

drop policy if exists "damage open access" on damage_reports;
create policy "damage open access"
on damage_reports
for all
using (true)
with check (true);

-- ======================================================
-- 4️⃣ HANDOVER TASKS
-- ======================================================
create table if not exists handover_tasks (
  id uuid primary key default gen_random_uuid(),
  area text,
  source text not null, 
  -- pre-clean | post-clean | area-verification | damage
  reference_id uuid,
  task_description text not null,
  status text default 'Pending', -- Pending | Completed
  completed_photo text,
  completed_by text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table handover_tasks enable row level security;

drop policy if exists "handover open access" on handover_tasks;
create policy "handover open access"
on handover_tasks
for all
using (true)
with check (true);

-- ======================================================
-- 5️⃣ AREA INSPECTION
-- ======================================================
create table if not exists area_inspection_logs (
  id uuid primary key default gen_random_uuid(),
  inspector_name text not null,
  checklist jsonb not null,
  comments text,
  submitted_at timestamp with time zone default now()
);

alter table area_inspection_logs enable row level security;

drop policy if exists "inspection open access" on area_inspection_logs;
create policy "inspection open access"
on area_inspection_logs
for all
using (true)
with check (true);

-- ======================================================
-- 6️⃣ FINAL LINE RELEASE
-- ======================================================
create table if not exists line_release_logs (
  id uuid primary key default gen_random_uuid(),
  released_by text not null,
  signature text,
  verified_at timestamp with time zone default now()
);

alter table line_release_logs enable row level security;

drop policy if exists "release open access" on line_release_logs;
create policy "release open access"
on line_release_logs
for all
using (true)
with check (true);

-- ======================================================
-- 7️⃣ FACE REGISTRY (Identity System)
-- ======================================================
create table if not exists face_registry (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null, -- sanitation / area-lead / handover
  photo text not null, -- base64 with timestamp overlay
  created_at timestamptz default now(),
  last_seen_at timestamptz
);

alter table face_registry enable row level security;

drop policy if exists "face_registry_open_insert" on face_registry;
create policy "face_registry_open_insert" on face_registry
  for insert with check (true);
  
drop policy if exists "face_registry_open_select" on face_registry;
create policy "face_registry_open_select" on face_registry
  for select using (true);
  
drop policy if exists "face_registry_open_update" on face_registry;
create policy "face_registry_open_update" on face_registry
  for update using (true) with check (true);

-- ======================================================
-- 8️⃣ TASK LOCKS (Concurrency Control)
-- ======================================================
create table if not exists task_locks (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  task text not null, -- preclean | postclean | handover | inspection
  locked_by text not null,
  locked_at timestamptz default now(),
  status text default 'InProgress', -- InProgress | Completed | Unlocked
  unlock_reason text
);

create unique index if not exists idx_task_locks_unique
  on task_locks(area, task);

alter table task_locks enable row level security;

drop policy if exists "task_locks_open_access" on task_locks;
create policy "task_locks_open_access" on task_locks
  for all using (true) with check (true);

-- ======================================================
-- 9️⃣ POST-RELEASE FINDINGS
-- ======================================================
create table if not exists post_release_findings (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  reported_by text not null,
  description text not null,
  photos jsonb not null,
  status text default 'Open', -- Open | Closed
  closed_by text,
  closed_photo text,
  created_at timestamptz default now(),
  closed_at timestamptz
);

alter table post_release_findings enable row level security;

drop policy if exists "findings_open_access" on post_release_findings;
create policy "findings_open_access" on post_release_findings
  for all using (true) with check (true);

-- ======================================================
-- 🔟 INDEXES FOR PERFORMANCE
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_pre_cleaning_logs_area_time 
ON pre_cleaning_logs(area, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_cleaning_logs_area_time 
ON post_cleaning_logs(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_damage_reports_area_status 
ON damage_reports(area, status);

CREATE INDEX IF NOT EXISTS idx_handover_tasks_area_status 
ON handover_tasks(area, status);

CREATE INDEX IF NOT EXISTS idx_task_locks_area_task 
ON task_locks(area, task);

-- ======================================================
-- 🧹 CLEAN SLATE FUNCTION (48-hour refresh)
-- ======================================================
CREATE OR REPLACE FUNCTION clean_slate_48hr()
RETURNS TABLE(
  pre_clean_archived bigint,
  post_clean_archived bigint,
  handovers_archived bigint,
  inspections_archived bigint,
  findings_archived bigint,
  photos_cleaned bigint
) AS $$
DECLARE
  cutoff_48hr timestamptz := NOW() - INTERVAL '48 hours';
BEGIN
  RAISE NOTICE 'Starting 48-hour clean slate...';
  
  -- Archive pre-clean logs older than 48 hours
  DELETE FROM pre_cleaning_logs 
  WHERE submitted_at < cutoff_48hr;
  GET DIAGNOSTICS pre_clean_archived = ROW_COUNT;
  
  -- Archive post-clean logs older than 48 hours  
  DELETE FROM post_cleaning_logs 
  WHERE submitted_at < cutoff_48hr;
  GET DIAGNOSTICS post_clean_archived = ROW_COUNT;
  
  -- Archive ALL handover tasks older than 48 hours (regardless of status)
  DELETE FROM handover_tasks 
  WHERE created_at < cutoff_48hr;
  GET DIAGNOSTICS handovers_archived = ROW_COUNT;
  
  -- Archive inspections older than 48 hours
  DELETE FROM area_inspection_logs 
  WHERE submitted_at < cutoff_48hr;
  GET DIAGNOSTICS inspections_archived = ROW_COUNT;
  
  -- Archive CLOSED findings older than 48 hours (keep open ones as "To-Do list")
  DELETE FROM post_release_findings 
  WHERE status = 'Closed' AND created_at < cutoff_48hr;
  GET DIAGNOSTICS findings_archived = ROW_COUNT;
  
  -- Clean up orphaned photos in storage (placeholder)
  photos_cleaned := 0;
  
  RAISE NOTICE 'Clean slate completed. Archived records: %', 
    pre_clean_archived + post_clean_archived + handovers_archived + inspections_archived + findings_archived;
  
  RETURN QUERY SELECT pre_clean_archived, post_clean_archived, handovers_archived, inspections_archived, findings_archived, photos_cleaned;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for clean slate function
GRANT EXECUTE ON FUNCTION clean_slate_48hr TO authenticated, anon;

-- ======================================================
-- 📦 STORAGE BUCKET SETUP
-- ======================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos', 
  'sanitation-photos', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
drop policy if exists "Allow photo uploads" on storage.objects;
CREATE POLICY "Allow photo uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'photos');

drop policy if exists "Allow photo downloads" on storage.objects;
CREATE POLICY "Allow photo downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

drop policy if exists "Allow photo updates" on storage.objects;
CREATE POLICY "Allow photo updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'photos');

drop policy if exists "Allow photo deletions" on storage.objects;
CREATE POLICY "Allow photo deletions" ON storage.objects
FOR DELETE USING (bucket_id = 'photos');

-- ======================================================
-- ✅ SETUP COMPLETE
-- ======================================================
-- All tables, indexes, functions, and storage are now ready
-- Run this file once to initialize the entire Sanixpert system
