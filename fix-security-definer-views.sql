-- Fix Security Definer View Issues
-- This script drops and recreates the problematic views without SECURITY DEFINER

-- 1. Fix v_damage_kpi view
DROP VIEW IF EXISTS public.v_damage_kpi;

CREATE OR REPLACE VIEW public.v_damage_kpi AS
SELECT
  area,
  count(*) FILTER (WHERE status='Open') AS open_count,
  count(*) FILTER (WHERE status='Completed') AS completed_count,
  count(*) FILTER (WHERE status='Handover') AS handover_count
FROM damage_reports
GROUP BY area;

-- 2. Fix v_line_status view
DROP VIEW IF EXISTS public.v_line_status;

CREATE OR REPLACE VIEW public.v_line_status AS
SELECT
  area,
  max(created_at) AS last_activity,
  bool_and(is_released) AS released
FROM line_release_logs
GROUP BY area;

-- 3. Fix v_daily_sanitation view
DROP VIEW IF EXISTS public.v_daily_sanitation;

CREATE OR REPLACE VIEW public.v_daily_sanitation AS
SELECT
  date(created_at) AS day,
  count(distinct area) AS lines_touched,
  count(*) AS actions
FROM pre_cleaning_logs
GROUP BY date(created_at);

-- 4. Fix v_open_handover view
DROP VIEW IF EXISTS public.v_open_handover;

CREATE OR REPLACE VIEW public.v_open_handover AS
SELECT *
FROM handover_tasks
WHERE status = 'Pending';

-- Grant appropriate permissions (adjust as needed for your security model)
GRANT SELECT ON public.v_damage_kpi TO authenticated, anon;
GRANT SELECT ON public.v_line_status TO authenticated, anon;
GRANT SELECT ON public.v_daily_sanitation TO authenticated, anon;
GRANT SELECT ON public.v_open_handover TO authenticated, anon;

-- Add comments for documentation
COMMENT ON VIEW public.v_damage_kpi IS 'Damage KPI metrics by area - counts of open, completed, and handover damages';
COMMENT ON VIEW public.v_line_status IS 'Live line status showing last activity and release state';
COMMENT ON VIEW public.v_daily_sanitation IS 'Daily sanitation activity summary';
COMMENT ON VIEW public.v_open_handover IS 'View of pending handover tasks';
