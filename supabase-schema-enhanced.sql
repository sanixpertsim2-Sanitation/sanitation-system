-- ======================================================
-- SANIXPERT ENHANCED DATABASE SCHEMA
-- Give & Go Facilities - Digital Sanitation System
-- ======================================================

-- ======================================================
-- 1️⃣ LINES TABLE (MACY, JFK, CECE)
-- ======================================================
CREATE TABLE IF NOT EXISTS lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- e.g., 'MACY Production', 'JFK Doughnut', 'CECE Cookie'
    line_type VARCHAR(20) NOT NULL, -- 'MACY', 'JFK', 'CECE'
    status VARCHAR(50) DEFAULT 'Ready', -- Ready, Pre-Cleaning, Post-Cleaning, Handover, Released
    locked_by VARCHAR(100), -- Name of the user currently working
    lock_timestamp TIMESTAMP WITH TIME ZONE,
    current_session_id UUID REFERENCES cleaning_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lines_open_access" ON lines
FOR ALL USING (true) WITH CHECK (true);

-- Insert default lines
INSERT INTO lines (name, line_type, status) VALUES
('MACY Production Line', 'MACY', 'Ready'),
('MACY Decoration Line', 'MACY', 'Ready'),
('JFK Doughnut Line', 'JFK', 'Coming Soon'),
('CECE Cookie Line', 'CECE', 'Coming Soon')
ON CONFLICT (name) DO NOTHING;

-- ======================================================
-- 2️⃣ USER REGISTRY (Manual Authentication)
-- ======================================================
CREATE TABLE IF NOT EXISTS user_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50), -- Sanitation, Maintenance, Production, Contractor
    is_active BOOLEAN DEFAULT true,
    first_login_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_registry_open_access" ON user_registry
FOR ALL USING (true) WITH CHECK (true);

-- ======================================================
-- 3️⃣ CLEANING SESSIONS (Core Logic for Bag Matching)
-- ======================================================
CREATE TABLE IF NOT EXISTS cleaning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_id UUID REFERENCES lines(id) NOT NULL,
    
    -- Pre-Clean Data
    pre_clean_user VARCHAR(100) NOT NULL,
    bags_covered INTEGER NOT NULL,
    pre_clean_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pre_clean_checklist JSONB NOT NULL,
    
    -- Post-Clean Data
    post_clean_user VARCHAR(100),
    bags_retrieved INTEGER, -- This must match bags_covered to allow submission
    post_clean_timestamp TIMESTAMP WITH TIME ZONE,
    post_clean_checklist JSONB,
    
    -- Lead Verification Data
    lead_verified_by VARCHAR(100),
    lead_signature_url TEXT,
    lead_findings JSONB,
    lead_timestamp TIMESTAMP WITH TIME ZONE,
    
    status VARCHAR(50) DEFAULT 'Open', -- Open, Pending_Post, Pending_Lead, Completed, Released
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE cleaning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cleaning_sessions_open_access" ON cleaning_sessions
FOR ALL USING (true) WITH CHECK (true);

-- ======================================================
-- 4️⃣ ENHANCED DAMAGE REPORTS & FINDINGS
-- ======================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES cleaning_sessions(id),
    line_id UUID REFERENCES lines(id),
    
    type VARCHAR(50) NOT NULL, -- 'Damage' or 'Finding'
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'Medium', -- 'Low', 'Medium', 'High' (High triggers Red Email)
    
    -- Photo Management
    photo_urls TEXT[], -- Array of photo URLs for unlimited photos
    timestamped_photos BOOLEAN DEFAULT true, -- All photos should be timestamped
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'Open', -- Open, Handover, Closed, Acknowledged
    assigned_to VARCHAR(100), -- Night Shift / Maintenance / etc.
    resolved_by VARCHAR(100),
    resolution_photo_url TEXT,
    resolution_notes TEXT,
    
    -- Metadata
    reported_by VARCHAR(100) NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_open_access" ON reports
FOR ALL USING (true) WITH CHECK (true);

-- ======================================================
-- 5️⃣ HANDOVER TASKS (From Post-Clean Comments)
-- ======================================================
CREATE TABLE IF NOT EXISTS handover_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES cleaning_sessions(id),
    line_id UUID REFERENCES lines(id),
    
    task_description TEXT NOT NULL,
    task_type VARCHAR(50) DEFAULT 'Maintenance', -- Maintenance, Sanitation, Production
    
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, In Progress, Completed
    assigned_to VARCHAR(100),
    completed_by VARCHAR(100),
    completion_photo_url TEXT,
    
    -- Metadata
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE handover_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "handover_tasks_open_access" ON handover_tasks
FOR ALL USING (true) WITH CHECK (true);

-- ======================================================
-- 6️⃣ SYSTEM LOGS (For Audit Trail)
-- ======================================================
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    event_type VARCHAR(50) NOT NULL, -- 'LINE_LOCK', 'LINE_UNLOCK', 'BAG_MISMATCH', 'HIGH_SEVERITY_ALERT'
    line_id UUID REFERENCES lines(id),
    user_name VARCHAR(100),
    session_id UUID REFERENCES cleaning_sessions(id),
    
    event_data JSONB, -- Additional event-specific data
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_logs_open_access" ON system_logs
FOR ALL USING (true) WITH CHECK (true);

-- ======================================================
-- 7️⃣ INDEXES FOR PERFORMANCE
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_lines_status ON lines(status);
CREATE INDEX IF NOT EXISTS idx_lines_locked_by ON lines(locked_by);
CREATE INDEX IF NOT EXISTS idx_cleaning_sessions_line_id ON cleaning_sessions(line_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_sessions_status ON cleaning_sessions(status);
CREATE INDEX IF NOT EXISTS idx_reports_session_id ON reports(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_handover_tasks_session_id ON handover_tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_event_type ON system_logs(event_type);

-- ======================================================
-- 8️⃣ TRIGGERS FOR AUTOMATIC UPDATES
-- ======================================================
-- Update lines.updated_at when line status changes
CREATE OR REPLACE FUNCTION update_lines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lines_updated_at
    BEFORE UPDATE ON lines
    FOR EACH ROW
    EXECUTE FUNCTION update_lines_updated_at();

-- Update cleaning_sessions.updated_at when session changes
CREATE OR REPLACE FUNCTION update_cleaning_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cleaning_sessions_updated_at
    BEFORE UPDATE ON cleaning_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_cleaning_sessions_updated_at();

-- ======================================================
-- 9️⃣ VIEWS FOR DASHBOARD ANALYTICS
-- ======================================================
-- Line Status Overview
CREATE OR REPLACE VIEW line_status_overview AS
SELECT 
    l.id,
    l.name,
    l.line_type,
    l.status,
    l.locked_by,
    l.lock_timestamp,
    COUNT(cs.id) as total_sessions,
    COUNT(CASE WHEN cs.status = 'Completed' THEN 1 END) as completed_sessions,
    COUNT(r.id) as open_reports,
    COUNT(CASE WHEN r.severity = 'High' AND r.status = 'Open' THEN 1 END) as high_severity_reports
FROM lines l
LEFT JOIN cleaning_sessions cs ON l.id = cs.line_id
LEFT JOIN reports r ON l.id = r.line_id AND r.status = 'Open'
GROUP BY l.id, l.name, l.line_type, l.status, l.locked_by, l.lock_timestamp;

-- Daily Activity Summary
CREATE OR REPLACE VIEW daily_activity_summary AS
SELECT 
    DATE(cs.created_at) as activity_date,
    COUNT(cs.id) as sessions_started,
    COUNT(CASE WHEN cs.status = 'Completed' THEN 1 END) as sessions_completed,
    COUNT(r.id) as reports_created,
    COUNT(CASE WHEN r.severity = 'High' THEN 1 END) as high_severity_reports,
    AVG(EXTRACT(EPOCH FROM (cs.completed_at - cs.created_at))/60) as avg_completion_time_minutes
FROM cleaning_sessions cs
LEFT JOIN reports r ON cs.id = r.session_id
GROUP BY DATE(cs.created_at)
ORDER BY activity_date DESC;

-- ======================================================
-- 🔟 FUNCTIONS FOR BUSINESS LOGIC
-- ======================================================
-- Function to lock a line
CREATE OR REPLACE FUNCTION lock_line(line_uuid UUID, user_name VARCHAR(100))
RETURNS BOOLEAN AS $$
DECLARE
    current_lock VARCHAR(100);
BEGIN
    -- Check if line is already locked by someone else
    SELECT locked_by INTO current_lock FROM lines WHERE id = line_uuid;
    
    IF current_lock IS NOT NULL AND current_lock != user_name THEN
        -- Line is locked by someone else
        RETURN FALSE;
    END IF;
    
    -- Lock the line
    UPDATE lines 
    SET locked_by = user_name, 
        lock_timestamp = NOW(),
        status = 'Pre-Cleaning'
    WHERE id = line_uuid;
    
    -- Log the lock event
    INSERT INTO system_logs (event_type, line_id, user_name, description)
    VALUES ('LINE_LOCK', line_uuid, user_name, 'Line locked for pre-cleaning');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to unlock a line
CREATE OR REPLACE FUNCTION unlock_line(line_uuid UUID, user_name VARCHAR(100))
RETURNS VOID AS $$
BEGIN
    UPDATE lines 
    SET locked_by = NULL, 
        lock_timestamp = NULL,
        status = 'Ready'
    WHERE id = line_uuid AND locked_by = user_name;
    
    -- Log the unlock event
    INSERT INTO system_logs (event_type, line_id, user_name, description)
    VALUES ('LINE_UNLOCK', line_uuid, user_name, 'Line unlocked');
END;
$$ LANGUAGE plpgsql;

-- Function to force unlock (admin only)
CREATE OR REPLACE FUNCTION force_unlock_line(line_uuid UUID, admin_name VARCHAR(100))
RETURNS VOID AS $$
BEGIN
    UPDATE lines 
    SET locked_by = NULL, 
        lock_timestamp = NULL,
        status = 'Ready'
    WHERE id = line_uuid;
    
    -- Log the force unlock
    INSERT INTO system_logs (event_type, line_id, user_name, description)
    VALUES ('FORCE_UNLOCK', line_uuid, admin_name, 'Admin force unlocked line');
END;
$$ LANGUAGE plpgsql;
