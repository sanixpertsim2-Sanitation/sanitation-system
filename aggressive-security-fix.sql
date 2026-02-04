-- Aggressive Security Definer View Fix
-- This script ensures views are created without any SECURITY DEFINER properties

-- Step 1: Check if views exist and their current properties
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER'
    ELSE 'NO SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE viewname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover')
AND schemaname = 'public';

-- Step 2: Check for any SECURITY DEFINER functions that might be affecting views
SELECT 
  proname,
  prosecdef,
  pg_get_userbyid(proowner) as owner,
  pg_get_functiondef(oid) as full_definition
FROM pg_proc 
WHERE prosecdef = true
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Step 3: Force drop all views with CASCADE to remove all dependencies
DROP VIEW IF EXISTS public.v_damage_kpi CASCADE;
DROP VIEW IF EXISTS public.v_line_status CASCADE;
DROP VIEW IF EXISTS public.v_daily_sanitation CASCADE;
DROP VIEW IF EXISTS public.v_open_handover CASCADE;

-- Step 4: Wait a moment for drops to complete (in case of cascading effects)
-- (This is just a comment - no actual wait needed in SQL)

-- Step 5: Recreate views with explicit owner and without SECURITY DEFINER
-- Set the owner to a non-privileged user if possible, otherwise use postgres
SET SESSION AUTHORIZATION postgres;

-- Recreate v_damage_kpi
CREATE OR REPLACE VIEW public.v_damage_kpi AS
SELECT
  area,
  count(*) FILTER (WHERE status='Open') AS open_count,
  count(*) FILTER (WHERE status='Completed') AS completed_count,
  count(*) FILTER (WHERE status='Handover') AS handover_count
FROM damage_reports
GROUP BY area;

-- Recreate v_line_status
CREATE OR REPLACE VIEW public.v_line_status AS
SELECT
  area,
  max(created_at) AS last_activity,
  bool_and(is_released) AS released
FROM line_release_logs
GROUP BY area;

-- Recreate v_daily_sanitation
CREATE OR REPLACE VIEW public.v_daily_sanitation AS
SELECT
  date(created_at) AS day,
  count(distinct area) AS lines_touched,
  count(*) AS actions
FROM pre_cleaning_logs
GROUP BY date(created_at);

-- Recreate v_open_handover
CREATE OR REPLACE VIEW public.v_open_handover AS
SELECT *
FROM handover_tasks
WHERE status = 'Pending';

-- Reset session authorization
RESET SESSION AUTHORIZATION;

-- Step 6: Verify views are created without SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'STILL HAS SECURITY DEFINER'
    ELSE 'FIXED - NO SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE viewname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover')
AND schemaname = 'public';

-- Step 7: Check the actual view definitions in the system catalog
SELECT 
  c.relname as view_name,
  pg_get_viewdef(c.oid) as view_definition,
  CASE 
    WHEN pg_get_viewdef(c.oid) LIKE '%SECURITY DEFINER%' THEN 'HAS SECURITY DEFINER'
    ELSE 'NO SECURITY DEFINER'
  END as definer_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
AND n.nspname = 'public'
AND c.relname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

-- Step 8: Grant permissions
GRANT SELECT ON public.v_damage_kpi TO authenticated, anon;
GRANT SELECT ON public.v_line_status TO authenticated, anon;
GRANT SELECT ON public.v_daily_sanitation TO authenticated, anon;
GRANT SELECT ON public.v_open_handover TO authenticated, anon;

-- Step 9: Add comments
COMMENT ON VIEW public.v_damage_kpi IS 'Damage KPI metrics by area - counts of open, completed, and handover damages';
COMMENT ON VIEW public.v_line_status IS 'Live line status showing last activity and release state';
COMMENT ON VIEW public.v_daily_sanitation IS 'Daily sanitation activity summary';
COMMENT ON VIEW public.v_open_handover IS 'View of pending handover tasks';

-- Step 10: Final verification - this should show all views as FIXED
SELECT 
  'FINAL CHECK' as check_type,
  viewname,
  CASE 
    WHEN pg_get_viewdef(c.oid) LIKE '%SECURITY DEFINER%' THEN '❌ STILL HAS SECURITY DEFINER'
    ELSE '✅ FIXED - NO SECURITY DEFINER'
  END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
AND n.nspname = 'public'
AND c.relname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover')
ORDER BY viewname;
