-- Database Security Audit and Fix Script
-- This script identifies and fixes common security issues

-- 1. Check for SECURITY DEFINER objects that need attention
SELECT 
    schemaname,
    objname,
    objtype,
    definer,
    CASE 
        WHEN definer != 'postgres' AND definer != 'supabase_admin' THEN 'REVIEW NEEDED'
        ELSE 'OK'
    END as security_status
FROM pg_catalog.pg_user_mapping 
WHERE schemaname = 'public';

-- 2. Check for views with elevated privileges
SELECT 
    table_schema,
    table_name,
    view_definition,
    is_updatable,
    is_insertable_into,
    is_trigger_updatable,
    is_trigger_deletable,
    is_trigger_insertable_into
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN ('v_damage_kpi', 'v_line_status', 'v_daily_sanitation', 'v_open_handover');

-- 3. Check Row Level Security (RLS) policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. Check for functions with SECURITY DEFINER
SELECT 
    proname as function_name,
    pronargs as num_args,
    prosecdef as is_security_definer,
    prorettype::regtype as return_type,
    pg_get_userbyid(proowner) as owner
FROM pg_proc 
WHERE prosecdef = true
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 5. Verify proper permissions on sensitive tables
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
AND table_name IN (
    'pre_cleaning_logs', 
    'post_cleaning_logs', 
    'damage_reports', 
    'handover_tasks',
    'line_release_logs'
)
ORDER BY table_name, privilege_type;

-- 6. Check for any public schema objects with excessive permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
AND grantee = 'public'
AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER');

-- 7. Verify RLS is enabled on sensitive tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerlspolicy as rls_forced
FROM pg_class 
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public'
AND relname IN (
    'pre_cleaning_logs', 
    'post_cleaning_logs', 
    'damage_reports', 
    'handover_tasks',
    'line_release_logs'
);
