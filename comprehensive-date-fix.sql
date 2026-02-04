-- Comprehensive Date Auto-Fill Fix
-- This script fixes all date column issues in the database

-- ======================================================
-- 1. FIX TABLE SCHEMA - Add proper defaults
-- ======================================================

-- Damage reports table
ALTER TABLE damage_reports 
ALTER COLUMN completed_at SET DEFAULT now(),
ALTER COLUMN handover_at SET DEFAULT now();

-- Handover tasks table  
ALTER TABLE handover_tasks 
ALTER COLUMN completed_at SET DEFAULT now();

-- ======================================================
-- 2. CREATE TRIGGERS for automatic timestamp updates
-- ======================================================

-- Function to update damage report timestamps based on status changes
CREATE OR REPLACE FUNCTION update_damage_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set completed_at when status changes to 'Completed'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Completed' THEN
    NEW.completed_at = now();
    NEW.completed_by = current_setting('app.current_user_id', true);
  END IF;
  
  -- Auto-set handover_at when status changes to 'Handover'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Handover' THEN
    NEW.handover_at = now();
  END IF;
  
  -- Ensure created_at is always set
  IF NEW.created_at IS NULL THEN
    NEW.created_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update handover task timestamps based on status changes
CREATE OR REPLACE FUNCTION update_handover_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set completed_at when status changes to 'Completed'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Completed' THEN
    NEW.completed_at = now();
    NEW.completed_by = current_setting('app.current_user_id', true);
  END IF;
  
  -- Ensure created_at is always set
  IF NEW.created_at IS NULL THEN
    NEW.created_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS damage_timestamp_update ON damage_reports;
DROP TRIGGER IF EXISTS handover_timestamp_update ON handover_tasks;

-- Create new triggers
CREATE TRIGGER damage_timestamp_update
  BEFORE INSERT OR UPDATE ON damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_damage_timestamps();

CREATE TRIGGER handover_timestamp_update
  BEFORE INSERT OR UPDATE ON handover_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_handover_timestamps();

-- ======================================================
-- 3. ENSURE ALL TABLES HAVE PROPER TIMESTAMP DEFAULTS
-- ======================================================

-- Check and fix any missing created_at defaults
DO $$
BEGIN
  -- Ensure pre_cleaning_logs has proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pre_cleaning_logs' 
    AND column_name = 'submitted_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE pre_cleaning_logs ALTER COLUMN submitted_at SET DEFAULT now();
  END IF;
  
  -- Ensure post_cleaning_logs has proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post_cleaning_logs' 
    AND column_name = 'submitted_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE post_cleaning_logs ALTER COLUMN submitted_at SET DEFAULT now();
  END IF;
  
  -- Ensure damage_reports has proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'damage_reports' 
    AND column_name = 'created_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE damage_reports ALTER COLUMN created_at SET DEFAULT now();
  END IF;
  
  -- Ensure handover_tasks has proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'handover_tasks' 
    AND column_name = 'created_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE handover_tasks ALTER COLUMN created_at SET DEFAULT now();
  END IF;
  
  -- Ensure area_inspection_logs has proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'area_inspection_logs' 
    AND column_name = 'submitted_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE area_inspection_logs ALTER COLUMN submitted_at SET DEFAULT now();
  END IF;
  
  -- Ensure line_release_logs has proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'line_release_logs' 
    AND column_name = 'verified_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE line_release_logs ALTER COLUMN verified_at SET DEFAULT now();
  END IF;
END $$;

-- ======================================================
-- 4. VERIFICATION QUERIES
-- ======================================================

-- Show all timestamp columns and their defaults
SELECT 
  table_name,
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('pre_cleaning_logs', 'post_cleaning_logs', 'damage_reports', 'handover_tasks', 'area_inspection_logs', 'line_release_logs')
AND data_type LIKE '%timestamp%'
ORDER BY table_name, column_name;

-- Show all triggers
SELECT 
  event_object_table as table_name,
  trigger_name,
  action_timing,
  action_condition,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('damage_reports', 'handover_tasks')
ORDER BY event_object_table, trigger_name;

-- ======================================================
-- 5. TEST DATA (Optional - Comment out for production)
-- ======================================================

-- Test the triggers (uncomment to test)
/*
-- Test damage report timestamp update
INSERT INTO damage_reports (area, description, severity, status) 
VALUES ('MACY_PRODUCTION', 'Test damage', 'Low', 'Open');

UPDATE damage_reports 
SET status = 'Completed', completed_by = 'test_user' 
WHERE description = 'Test damage';

-- Test handover task timestamp update
INSERT INTO handover_tasks (area, source, task_description, status) 
VALUES ('MACY_PRODUCTION', 'test', 'Test task', 'Pending');

UPDATE handover_tasks 
SET status = 'Completed' 
WHERE task_description = 'Test task';

-- Verify timestamps were set
SELECT * FROM damage_reports WHERE description = 'Test damage';
SELECT * FROM handover_tasks WHERE task_description = 'Test task';
*/
