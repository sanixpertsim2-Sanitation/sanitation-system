-- Sanitation Digital System – Supabase schema
-- Aligned to the executed table names and columns.

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

create policy "damage open access"
on damage_reports
for all
using (true)
with check (true);


-- ======================================================
-- 4️⃣ HANDOVER TASKS (AUTO FROM COMMENTS)
-- ======================================================
create table if not exists handover_tasks (
  id uuid primary key default gen_random_uuid(),

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

create policy "handover open access"
on handover_tasks
for all
using (true)
with check (true);


-- ======================================================
-- 5️⃣ AREA INSPECTION (ARYAA)
-- ======================================================
create table if not exists area_inspection_logs (
  id uuid primary key default gen_random_uuid(),

  inspector_name text not null,

  checklist jsonb not null,

  comments text,

  submitted_at timestamp with time zone default now()
);

alter table area_inspection_logs enable row level security;

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

create policy "release open access"
on line_release_logs
for all
using (true)
with check (true);
