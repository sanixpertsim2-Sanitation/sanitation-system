-- STEP 2 — AUTOMATION-READY SCHEMA
-- Adds audit timestamps, derived fields, and indexes.

-- 2.1 Audit columns
alter table pre_cleaning_logs
  add column if not exists created_at timestamptz default now();

alter table post_cleaning_logs
  add column if not exists created_at timestamptz default now();

alter table damage_reports
  add column if not exists created_at timestamptz default now();

alter table handover_tasks
  add column if not exists created_at timestamptz default now(),
  add column if not exists completed_at timestamptz;

alter table area_inspection_logs
  add column if not exists created_at timestamptz default now();

alter table line_release_logs
  add column if not exists created_at timestamptz default now();

-- 2.2 Derived automation fields
alter table damage_reports
  add column if not exists requires_handover boolean
  generated always as (status = 'Handover') stored;

alter table handover_tasks
  add column if not exists is_open boolean
  generated always as (status = 'Pending') stored;

-- Add release_status (safe default) before derived column
alter table line_release_logs
  add column if not exists release_status text default 'Released';

alter table line_release_logs
  add column if not exists is_released boolean
  generated always as (release_status = 'Released') stored;

-- 2.3 Performance indexes
create index if not exists idx_preclean_area_time
on pre_cleaning_logs(area, created_at desc);

create index if not exists idx_postclean_area_time
on post_cleaning_logs(area, created_at desc);

create index if not exists idx_damage_open
on damage_reports(status);

create index if not exists idx_handover_open
on handover_tasks(status);

create index if not exists idx_release_status
on line_release_logs(release_status);
