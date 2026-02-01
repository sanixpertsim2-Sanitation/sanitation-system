-- Supabase read-only views for dashboards and automation

-- Latest pre-clean per area
create or replace view v_latest_pre_clean_per_area as
select distinct on (area)
  area,
  id as preclean_id,
  employee_name,
  bags_used,
  checklist,
  status,
  submitted_at
from pre_cleaning_logs
order by area, submitted_at desc;

-- Open or handover damages
create or replace view v_open_damages as
select *
from damage_reports
where status in ('Open', 'Handover');

-- Pending handover tasks
create or replace view v_pending_handover_tasks as
select *
from handover_tasks
where status = 'Pending';

-- Line release readiness by area (based on open damages + pending tasks)
create or replace view v_line_release_readiness as
select
  p.area,
  p.preclean_id,
  exists (
    select 1 from damage_reports d
    where d.area = p.area and d.status in ('Open', 'Handover')
  ) as has_blocking_damages,
  exists (
    select 1 from handover_tasks h
    where h.status = 'Pending'
  ) as has_pending_handovers,
  (select max(verified_at) from line_release_logs) as last_release_at,
  not exists (
    select 1 from damage_reports d
    where d.area = p.area and d.status in ('Open', 'Handover')
  ) and not exists (
    select 1 from handover_tasks h
    where h.status = 'Pending'
  ) as release_ready
from v_latest_pre_clean_per_area p;

-- Daily sanitation summary for dashboards
create or replace view v_daily_sanitation_summary as
select
  date_trunc('day', p.submitted_at) as day,
  count(distinct p.id) as preclean_count,
  count(distinct pc.id) as postclean_count,
  count(distinct d.id) as damage_count,
  count(distinct case when d.severity = 'Critical' then d.id end) as critical_damage_count,
  max(l.verified_at) as last_release_at
from pre_cleaning_logs p
left join post_cleaning_logs pc on pc.preclean_id = p.id
left join damage_reports d on d.area = p.area
left join line_release_logs l on 1=1
group by date_trunc('day', p.submitted_at)
order by day desc;
