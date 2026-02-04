-- Simple Security Definer Fix
-- This uses basic PostgreSQL syntax that should work in Supabase

-- Step 1: Drop all problematic views
DROP VIEW IF EXISTS public.v_damage_kpi CASCADE;
DROP VIEW IF EXISTS public.v_line_status CASCADE;
DROP VIEW IF EXISTS public.v_daily_sanitation CASCADE;
DROP VIEW IF EXISTS public.v_open_handover CASCADE;

-- Step 2: Recreate views without SECURITY DEFINER
CREATE VIEW public.v_damage_kpi AS
SELECT
  area,
  count(*) FILTER (WHERE status='Open') AS open_count,
  count(*) FILTER (WHERE status='Completed') AS completed_count,
  count(*) FILTER (WHERE status='Handover') AS handover_count
FROM damage_reports
GROUP BY area;

CREATE VIEW public.v_line_status AS
SELECT
  area,
  max(created_at) AS last_activity,
  bool_and(is_released) AS released
FROM line_release_logs
GROUP BY area;

CREATE VIEW public.v_daily_sanitation AS
SELECT
  date(created_at) AS day,
  count(distinct area) AS lines_touched,
  count(*) AS actions
FROM pre_cleaning_logs
GROUP BY date(created_at);

CREATE VIEW public.v_open_handover AS
SELECT *
FROM handover_tasks
WHERE status = 'Pending';

-- Step 3: Grant permissions
GRANT SELECT ON public.v_damage_kpi TO authenticated, anon;
GRANT SELECT ON public.v_line_status TO authenticated, anon;
GRANT SELECT ON public.v_daily_sanitation TO authenticated, anon;
GRANT SELECT ON public.v_open_handover TO authenticated, anon;

-- Step 4: Verify the fix
SELECT 
  viewname,
  viewowner,
  definition,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ STILL HAS SECURITY DEFINER'
    ELSE '✅ FIXED - NO SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE viewname IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover')
AND schemaname = 'public';
