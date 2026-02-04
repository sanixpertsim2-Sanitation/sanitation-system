-- STEP 3 — REPORTING & DASHBOARD SQL VIEWS
-- Note: These views are created without SECURITY DEFINER for security

-- 1) Live line status view
DROP VIEW IF EXISTS public.v_line_status;
CREATE OR REPLACE VIEW public.v_line_status AS
SELECT
  area,
  max(created_at) as last_activity,
  bool_and(is_released) as released
FROM line_release_logs
GROUP BY area;

-- 2) Open handover view
DROP VIEW IF EXISTS public.v_open_handover;
CREATE OR REPLACE VIEW public.v_open_handover AS
SELECT *
FROM handover_tasks
WHERE status = 'Pending';

-- 3) Damage KPI view
DROP VIEW IF EXISTS public.v_damage_kpi;
CREATE OR REPLACE VIEW public.v_damage_kpi AS
SELECT
  area,
  count(*) filter (where status='Open') as open_count,
  count(*) filter (where status='Completed') as completed_count,
  count(*) filter (where status='Handover') as handover_count
FROM damage_reports
GROUP BY area;

-- 4) Daily sanitation summary
DROP VIEW IF EXISTS public.v_daily_sanitation;
CREATE OR REPLACE VIEW public.v_daily_sanitation AS
SELECT
  date(created_at) as day,
  count(distinct area) as lines_touched,
  count(*) as actions
FROM pre_cleaning_logs
GROUP BY date(created_at);

-- Grant appropriate permissions for the views
GRANT SELECT ON public.v_line_status TO authenticated, anon;
GRANT SELECT ON public.v_open_handover TO authenticated, anon;
GRANT SELECT ON public.v_damage_kpi TO authenticated, anon;
GRANT SELECT ON public.v_daily_sanitation TO authenticated, anon;
