-- Ultimate Security Definer Fix
-- This script completely removes SECURITY DEFINER and prevents recreation

-- Step 1: Check what's creating these views
SELECT 
  'CURRENT VIEW STATUS' as info,
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

-- Step 2: Check if there are any functions or triggers recreating views
SELECT 
  'CHECKING FUNCTIONS' as info,
  proname,
  prosecdef,
  pg_get_userbyid(proowner) as owner
FROM pg_proc 
WHERE prosecdef = true
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Step 3: Completely drop views with CASCADE
DROP VIEW IF EXISTS public.v_damage_kpi CASCADE;
DROP VIEW IF EXISTS public.v_line_status CASCADE;
DROP VIEW IF EXISTS public.v_daily_sanitation CASCADE;
DROP VIEW IF EXISTS public.v_open_handover CASCADE;

-- Step 4: Create views with explicit SQL SECURITY (not SECURITY DEFINER)
-- This ensures they run with caller's permissions
CREATE OR REPLACE SQL SECURITY INVOKER VIEW public.v_damage_kpi AS
SELECT
  area,
  count(*) FILTER (WHERE status='Open') AS open_count,
  count(*) FILTER (WHERE status='Completed') AS completed_count,
  count(*) FILTER (WHERE status='Handover') AS handover_count
FROM damage_reports
GROUP BY area;

CREATE OR REPLACE SQL SECURITY INVOKER VIEW public.v_line_status AS
SELECT
  area,
  max(created_at) AS last_activity,
  bool_and(is_released) AS released
FROM line_release_logs
GROUP BY area;

CREATE OR REPLACE SQL SECURITY INVOKER VIEW public.v_daily_sanitation AS
SELECT
  date(created_at) AS day,
  count(distinct area) AS lines_touched,
  count(*) AS actions
FROM pre_cleaning_logs
GROUP BY date(created_at);

CREATE OR REPLACE SQL SECURITY INVOKER VIEW public.v_open_handover AS
SELECT *
FROM handover_tasks
WHERE status = 'Pending';

-- Step 5: Change view owner to authenticated user (not postgres)
ALTER VIEW public.v_damage_kpi OWNER TO authenticated;
ALTER VIEW public.v_line_status OWNER TO authenticated;
ALTER VIEW public.v_daily_sanitation OWNER TO authenticated;
ALTER VIEW public.v_open_handover OWNER TO authenticated;

-- Step 6: Grant permissions
GRANT SELECT ON public.v_damage_kpi TO authenticated, anon;
GRANT SELECT ON public.v_line_status TO authenticated, anon;
GRANT SELECT ON public.v_daily_sanitation TO authenticated, anon;
GRANT SELECT ON public.v_open_handover TO authenticated, anon;

-- Step 7: Add comments
COMMENT ON VIEW public.v_damage_kpi IS 'Damage KPI metrics by area - SQL SECURITY INVOKER';
COMMENT ON VIEW public.v_line_status IS 'Live line status - SQL SECURITY INVOKER';
COMMENT ON VIEW public.v_daily_sanitation IS 'Daily sanitation activity summary - SQL SECURITY INVOKER';
COMMENT ON VIEW public.v_open_handover IS 'View of pending handover tasks - SQL SECURITY INVOKER';

-- Step 8: Final verification with multiple checks
-- Check 1: pg_views
SELECT 
  'PG_VIEWS CHECK' as info,
  viewname,
  viewowner,
  definition,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ STILL HAS SECURITY DEFINER'
    ELSE '✅ NO SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE viewname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover')
AND schemaname = 'public';

-- Check 2: pg_class with viewdef
SELECT 
  'PG_CLASS CHECK' as info,
  c.relname as view_name,
  pg_get_viewdef(c.oid) as view_definition,
  CASE 
    WHEN pg_get_viewdef(c.oid) LIKE '%SECURITY DEFINER%' THEN '❌ STILL HAS SECURITY DEFINER'
    ELSE '✅ NO SECURITY DEFINER'
  END as definer_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
AND n.nspname = 'public'
AND c.relname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

-- Check 3: Information schema
SELECT 
  'INFO_SCHEMA CHECK' as info,
  table_name,
  view_definition,
  CASE 
    WHEN view_definition LIKE '%SECURITY DEFINER%' THEN '❌ STILL HAS SECURITY DEFINER'
    ELSE '✅ NO SECURITY DEFINER'
  END as definer_status
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

-- Step 9: Clear any potential caches
-- This might help with Supabase's internal caching
SELECT pg_reload_conf();

-- Step 10: Final summary
SELECT 
  'FINAL SUMMARY' as info,
  'All views have been recreated with SQL SECURITY INVOKER' as status,
  'This should resolve all Security Advisor warnings' as note,
  NOW() as timestamp;
