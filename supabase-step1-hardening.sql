-- STEP 1 — SUPABASE HARDENING (SAFE MODE)
-- Enables RLS, adds permissive policies, and safe constraints.

-- 1) Enable RLS + allow_all_for_now policies
alter table pre_cleaning_logs enable row level security;
drop policy if exists "allow_all_for_now" on pre_cleaning_logs;
create policy "allow_all_for_now"
on pre_cleaning_logs
for all
using (true)
with check (true);

alter table post_cleaning_logs enable row level security;
drop policy if exists "allow_all_for_now" on post_cleaning_logs;
create policy "allow_all_for_now"
on post_cleaning_logs
for all
using (true)
with check (true);

alter table damage_reports enable row level security;
drop policy if exists "allow_all_for_now" on damage_reports;
create policy "allow_all_for_now"
on damage_reports
for all
using (true)
with check (true);

alter table handover_tasks enable row level security;
drop policy if exists "allow_all_for_now" on handover_tasks;
create policy "allow_all_for_now"
on handover_tasks
for all
using (true)
with check (true);

alter table area_inspection_logs enable row level security;
drop policy if exists "allow_all_for_now" on area_inspection_logs;
create policy "allow_all_for_now"
on area_inspection_logs
for all
using (true)
with check (true);

alter table line_release_logs enable row level security;
drop policy if exists "allow_all_for_now" on line_release_logs;
create policy "allow_all_for_now"
on line_release_logs
for all
using (true)
with check (true);

-- 2) Safe integrity constraints (non-breaking)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'damage_status_check'
  ) then
    alter table damage_reports
      add constraint damage_status_check
      check (status in ('Open','Completed','Handover'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'handover_status_check'
  ) then
    alter table handover_tasks
      add constraint handover_status_check
      check (status in ('Pending','Completed'));
  end if;
end $$;

-- release_status constraint is only added if the column exists
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'line_release_logs'
      and column_name = 'release_status'
  ) then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'release_status_check'
    ) then
      alter table line_release_logs
        add constraint release_status_check
        check (release_status in ('Released','Blocked'));
    end if;
  end if;
end $$;
