-- ======================================================
-- SANIXPERT DATABASE HEARTBEAT FUNCTIONS
-- Optimized functions for keeping database active
-- ======================================================

-- ======================================================
-- 1️⃣ HEARTBEAT FUNCTION (Lightweight)
-- ======================================================
CREATE OR REPLACE FUNCTION public.heartbeat_check()
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    current_timestamp := NOW();
    
    result := json_build_object(
        'status', 'ok',
        'timestamp', current_timestamp,
        'database', 'active',
        'message', 'Heartbeat successful'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'timestamp', NOW(),
            'database', 'error',
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- 2️⃣ SYSTEM STATUS FUNCTION
-- ======================================================
CREATE OR REPLACE FUNCTION public.system_status()
RETURNS JSON AS $$
DECLARE
    result JSON;
    active_sessions INTEGER;
    pending_reports INTEGER;
    system_load TEXT;
BEGIN
    -- Count active sessions
    SELECT COUNT(*) INTO active_sessions
    FROM cleaning_sessions
    WHERE status IN ('Open', 'Pending_Post', 'Pending_Lead');
    
    -- Count pending high-severity reports
    SELECT COUNT(*) INTO pending_reports
    FROM reports
    WHERE severity = 'High' AND status = 'Open';
    
    -- Get system load (simplified)
    system_load := 'normal';
    
    result := json_build_object(
        'status', 'ok',
        'timestamp', NOW(),
        'active_sessions', active_sessions,
        'pending_reports', pending_reports,
        'system_load', system_load,
        'database', 'active'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'timestamp', NOW(),
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- 3️⃣ LIGHTWEIGHT PING FUNCTION
-- ======================================================
CREATE OR REPLACE FUNCTION public.ping()
RETURNS TEXT AS $$
BEGIN
    RETURN 'pong';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- 4️⃣ CONNECTION TEST FUNCTION
-- ======================================================
CREATE OR REPLACE FUNCTION public.connection_test()
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_time TIMESTAMP WITH TIME ZONE;
    end_time TIMESTAMP WITH TIME ZONE;
    response_time INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    -- Perform a simple query
    PERFORM 1 FROM lines LIMIT 1;
    
    end_time := clock_timestamp();
    response_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    
    result := json_build_object(
        'status', 'ok',
        'timestamp', NOW(),
        'response_time_ms', response_time,
        'database', 'responsive'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'timestamp', NOW(),
            'response_time_ms', -1,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- 5️⃣ HEARTBEAT LOGGING FUNCTION
-- ======================================================
CREATE OR REPLACE FUNCTION public.log_heartbeat(
    p_response_time INTEGER DEFAULT 0,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_logs (
        event_type,
        description,
        event_data,
        created_at
    ) VALUES (
        'HEARTBEAT',
        CASE 
            WHEN p_success THEN 'Database heartbeat successful'
            ELSE 'Database heartbeat failed'
        END,
        json_build_object(
            'response_time', p_response_time,
            'success', p_success,
            'error', p_error_message,
            'user_agent', current_setting('request.headers', true)::json->>'user-agent'
        ),
        NOW()
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Silently fail logging to avoid infinite loops
        NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- 6️⃣ CLEANUP OLD HEARTBEAT LOGS
-- ======================================================
CREATE OR REPLACE FUNCTION public.cleanup_heartbeat_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete heartbeat logs older than 7 days
    DELETE FROM system_logs
    WHERE event_type = 'HEARTBEAT'
    AND created_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- 7️⃣ AUTOMATIC CLEANUP (Run daily)
-- ======================================================
CREATE OR REPLACE FUNCTION public.maintenance_cleanup()
RETURNS JSON AS $$
DECLARE
    heartbeat_logs_deleted INTEGER;
    result JSON;
BEGIN
    -- Clean old heartbeat logs
    heartbeat_logs_deleted := cleanup_heartbeat_logs();
    
    result := json_build_object(
        'status', 'ok',
        'timestamp', NOW(),
        'heartbeat_logs_deleted', heartbeat_logs_deleted,
        'message', 'Maintenance completed'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'timestamp', NOW(),
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- 8️⃣ CREATE INDEX FOR HEARTBEAT PERFORMANCE
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_system_logs_heartbeat_created_at 
ON system_logs(created_at) 
WHERE event_type = 'HEARTBEAT';

-- ======================================================
-- 9️⃣ SET UP ROW LEVEL SECURITY
-- ======================================================
-- Grant public access to heartbeat functions
GRANT EXECUTE ON FUNCTION public.heartbeat_check() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.system_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ping() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.connection_test() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_heartbeat(INTEGER, BOOLEAN, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_heartbeat_logs() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.maintenance_cleanup() TO anon, authenticated;

-- ======================================================
-- 🔟 CREATE VIEW FOR HEARTBEAT MONITORING
-- ======================================================
CREATE OR REPLACE VIEW public.heartbeat_status AS
SELECT 
    'HEARTBEAT' as metric_type,
    COUNT(*) as total_heartbeats,
    COUNT(CASE WHEN event_data->>'success' = 'true' THEN 1 END) as successful_heartbeats,
    COUNT(CASE WHEN event_data->>'success' = 'false' THEN 1 END) as failed_heartbeats,
    AVG(CASE WHEN event_data->>'response_time' != '0' THEN (event_data->>'response_time')::INTEGER END) as avg_response_time,
    MAX(created_at) as last_heartbeat,
    MIN(created_at) as first_heartbeat
FROM system_logs 
WHERE event_type = 'HEARTBEAT'
AND created_at >= NOW() - INTERVAL '24 hours';

-- Grant access to the view
GRANT SELECT ON public.heartbeat_status TO anon, authenticated;
