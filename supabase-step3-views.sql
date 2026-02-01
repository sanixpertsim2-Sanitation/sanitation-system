-- STEP 3 — REPORTING & DASHBOARD SQL VIEWS

-- 1) Live line status view
create or replace view v_line_status as
select
  area,
  max(created_at) as last_activity,
  bool_and(is_released) as released
from line_release_logs
group by area;

-- 2) Open handover view
create or replace view v_open_handover as
select *
from handover_tasks
where status = 'Pending';

-- 3) Damage KPI view
create or replace view v_damage_kpi as
select
  area,
  count(*) filter (where status='Open') as open_count,
  count(*) filter (where status='Completed') as completed_count,
  count(*) filter (where status='Handover') as handover_count
from damage_reports
group by area;

-- 4) Daily sanitation summary
create or replace view v_daily_sanitation as
select
  date(created_at) as day,
  count(distinct area) as lines_touched,
  count(*) as actions
from pre_cleaning_logs
group by date(created_at);
