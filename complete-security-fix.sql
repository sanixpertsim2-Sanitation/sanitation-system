-- Complete Security Definer View Fix
-- This script completely drops and recreates views without SECURITY DEFINER

-- First, let's check the current view definitions
SELECT viewname, viewowner, definition FROM pg_views WHERE viewname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

-- Drop all problematic views completely
DROP VIEW IF EXISTS public.v_damage_kpi CASCADE;
DROP VIEW IF EXISTS public.v_line_status CASCADE;
DROP VIEW IF EXISTS public.v_daily_sanitation CASCADE;
DROP VIEW IF EXISTS public.v_open_handover CASCADE;

-- Recreate v_damage_kpi without SECURITY DEFINER
CREATE VIEW public.v_damage_kpi AS
SELECT
  area,
  count(*) FILTER (WHERE status='Open') AS open_count,
  count(*) FILTER (WHERE status='Completed') AS completed_count,
  count(*) FILTER (WHERE status='Handover') AS handover_count
FROM damage_reports
GROUP BY area;

-- Recreate v_line_status without SECURITY DEFINER
CREATE VIEW public.v_line_status AS
SELECT
  area,
  max(created_at) AS last_activity,
  bool_and(is_released) AS released
FROM line_release_logs
GROUP BY area;

-- Recreate v_daily_sanitation without SECURITY DEFINER
CREATE VIEW public.v_daily_sanitation AS
SELECT
  date(created_at) AS day,
  count(distinct area) AS lines_touched,
  count(*) AS actions
FROM pre_cleaning_logs
GROUP BY date(created_at);

-- Recreate v_open_handover without SECURITY DEFINER
CREATE VIEW public.v_open_handover AS
SELECT *
FROM handover_tasks
WHERE status = 'Pending';

-- Verify the views were created without SECURITY DEFINER
SELECT 
  viewname, 
  viewowner, 
  definition,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER'
    ELSE 'NO SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE viewname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

-- Grant proper permissions
GRANT SELECT ON public.v_damage_kpi TO authenticated, anon;
GRANT SELECT ON public.v_line_status TO authenticated, anon;
GRANT SELECT ON public.v_daily_sanitation TO authenticated, anon;
GRANT SELECT ON public.v_open_handover TO authenticated, anon;

-- Add comments
COMMENT ON VIEW public.v_damage_kpi IS 'Damage KPI metrics by area - counts of open, completed, and handover damages';
COMMENT ON VIEW public.v_line_status IS 'Live line status showing last activity and release state';
COMMENT ON VIEW public.v_daily_sanitation IS 'Daily sanitation activity summary';
COMMENT ON VIEW public.v_open_handover IS 'View of pending handover tasks';
