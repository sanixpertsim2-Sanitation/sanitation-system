-- RLS policies (SAFE MODE)
-- Temporary anonymous access to keep shop-floor UX working.
-- Plan: tighten to authenticated roles once Microsoft OAuth is live.

-- Enable RLS
alter table pre_cleaning_logs enable row level security;
alter table post_cleaning_logs enable row level security;
alter table damage_reports enable row level security;
alter table handover_tasks enable row level security;
alter table area_inspection_logs enable row level security;
alter table line_release_logs enable row level security;

-- Anonymous inserts (shop-floor)
drop policy if exists "anon_insert_preclean" on pre_cleaning_logs;
create policy "anon_insert_preclean"
on pre_cleaning_logs
for insert
to anon
with check (true);

drop policy if exists "anon_insert_postclean" on post_cleaning_logs;
create policy "anon_insert_postclean"
on post_cleaning_logs
for insert
to anon
with check (true);

drop policy if exists "anon_insert_damage" on damage_reports;
create policy "anon_insert_damage"
on damage_reports
for insert
to anon
with check (true);

drop policy if exists "anon_insert_handover" on handover_tasks;
create policy "anon_insert_handover"
on handover_tasks
for insert
to anon
with check (true);

drop policy if exists "anon_insert_inspection" on area_inspection_logs;
create policy "anon_insert_inspection"
on area_inspection_logs
for insert
to anon
with check (true);

-- Anonymous reads needed for immediate UX (control panel, handover, damage review)
drop policy if exists "anon_select_preclean" on pre_cleaning_logs;
create policy "anon_select_preclean"
on pre_cleaning_logs
for select
to anon
using (true);

drop policy if exists "anon_select_postclean" on post_cleaning_logs;
create policy "anon_select_postclean"
on post_cleaning_logs
for select
to anon
using (true);

drop policy if exists "anon_select_damage" on damage_reports;
create policy "anon_select_damage"
on damage_reports
for select
to anon
using (true);

drop policy if exists "anon_select_handover" on handover_tasks;
create policy "anon_select_handover"
on handover_tasks
for select
to anon
using (true);

drop policy if exists "anon_select_release" on line_release_logs;
create policy "anon_select_release"
on line_release_logs
for select
to anon
using (true);

-- Authenticated dashboard reads (read-only)
drop policy if exists "auth_select_all_preclean" on pre_cleaning_logs;
create policy "auth_select_all_preclean"
on pre_cleaning_logs
for select
to authenticated
using (true);

drop policy if exists "auth_select_all_postclean" on post_cleaning_logs;
create policy "auth_select_all_postclean"
on post_cleaning_logs
for select
to authenticated
using (true);

drop policy if exists "auth_select_all_damage" on damage_reports;
create policy "auth_select_all_damage"
on damage_reports
for select
to authenticated
using (true);

drop policy if exists "auth_select_all_handover" on handover_tasks;
create policy "auth_select_all_handover"
on handover_tasks
for select
to authenticated
using (true);

drop policy if exists "auth_select_all_inspection" on area_inspection_logs;
create policy "auth_select_all_inspection"
on area_inspection_logs
for select
to authenticated
using (true);

drop policy if exists "auth_select_all_release" on line_release_logs;
create policy "auth_select_all_release"
on line_release_logs
for select
to authenticated
using (true);

-- Admin overrides (bootstrap admin email)
drop policy if exists "admin_update_damage" on damage_reports;
create policy "admin_update_damage"
on damage_reports
for update
to authenticated
using (auth.jwt() ->> 'email' = 'adarsh@sanixperts.com')
with check (auth.jwt() ->> 'email' = 'adarsh@sanixperts.com');

drop policy if exists "admin_update_handover" on handover_tasks;
create policy "admin_update_handover"
on handover_tasks
for update
to authenticated
using (auth.jwt() ->> 'email' = 'adarsh@sanixperts.com')
with check (auth.jwt() ->> 'email' = 'adarsh@sanixperts.com');

drop policy if exists "admin_update_release" on line_release_logs;
create policy "admin_update_release"
on line_release_logs
for update
to authenticated
using (auth.jwt() ->> 'email' = 'adarsh@sanixperts.com')
with check (auth.jwt() ->> 'email' = 'adarsh@sanixperts.com');
