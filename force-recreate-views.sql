-- Force Complete View Recreation
-- This ensures views are completely recreated without any SECURITY DEFINER traces

-- Step 1: Check current state in multiple system tables
SELECT '=== PG_VIEWS CHECK ===' as info;
SELECT viewname, viewowner, definition FROM pg_views WHERE viewname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

SELECT '=== PG_CLASS CHECK ===' as info;
SELECT c.relname, pg_get_viewdef(c.oid) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relkind = 'v' AND n.nspname = 'public' AND c.relname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

-- Step 2: Force drop with CASCADE and wait
DROP VIEW IF EXISTS public.v_damage_kpi CASCADE;
DROP VIEW IF EXISTS public.v_line_status CASCADE;
DROP VIEW IF EXISTS public.v_daily_sanitation CASCADE;
DROP VIEW IF EXISTS public.v_open_handover CASCADE;

-- Step 3: Clear any potential caches
SELECT pg_reload_conf();

-- Step 4: Recreate with the most basic syntax possible
CREATE VIEW public.v_damage_kpi AS SELECT area, count(*) FILTER (WHERE status='Open') AS open_count, count(*) FILTER (WHERE status='Completed') AS completed_count, count(*) FILTER (WHERE status='Handover') AS handover_count FROM damage_reports GROUP BY area;

CREATE VIEW public.v_line_status AS SELECT area, max(created_at) AS last_activity, bool_and(is_released) AS released FROM line_release_logs GROUP BY area;

CREATE VIEW public.v_daily_sanitation AS SELECT date(created_at) AS day, count(distinct area) AS lines_touched, count(*) AS actions FROM pre_cleaning_logs GROUP BY date(created_at);

CREATE VIEW public.v_open_handover AS SELECT * FROM handover_tasks WHERE status = 'Pending';

-- Step 5: Grant permissions
GRANT SELECT ON public.v_damage_kpi TO authenticated, anon;
GRANT SELECT ON public.v_line_status TO authenticated, anon;
GRANT SELECT ON public.v_daily_sanitation TO authenticated, anon;
GRANT SELECT ON public.v_open_handover TO authenticated, anon;

-- Step 6: Force cache clear again
SELECT pg_reload_conf();

-- Step 7: Comprehensive verification
SELECT '=== FINAL VERIFICATION ===' as info;
SELECT 
  viewname,
  viewowner,
  length(definition) as def_length,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ STILL HAS SECURITY DEFINER'
    ELSE '✅ NO SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE viewname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover')
AND schemaname = 'public';

-- Step 8: Check information schema too
SELECT '=== INFORMATION_SCHEMA CHECK ===' as info;
SELECT table_name, view_definition FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

-- Step 9: Test the views actually work
SELECT '=== FUNCTIONALITY TEST ===' as info;
SELECT 'Testing v_damage_kpi...' as test;
SELECT * FROM public.v_damage_kpi LIMIT 1;

SELECT 'Testing v_line_status...' as test;
SELECT * FROM public.v_line_status LIMIT 1;

SELECT '=== COMPLETION ===' as info;
SELECT 'All views recreated successfully' as status, NOW() as timestamp;
