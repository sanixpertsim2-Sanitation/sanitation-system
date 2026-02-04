-- Fix missing auto-fill date columns
-- This script adds DEFAULT now() to date columns that should auto-fill

-- 1. Fix damage_reports table - completed_at and handover_at should auto-fill when updated
ALTER TABLE damage_reports 
ALTER COLUMN completed_at SET DEFAULT now();

ALTER TABLE damage_reports 
ALTER COLUMN handover_at SET DEFAULT now();

-- 2. Fix handover_tasks table - completed_at should auto-fill when updated
ALTER TABLE handover_tasks 
ALTER COLUMN completed_at SET DEFAULT now();

-- 3. Create triggers to automatically update timestamps when status changes

-- Damage reports trigger
CREATE OR REPLACE FUNCTION update_damage_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update completed_at when status changes to 'Completed'
  IF OLD.status != 'Completed' AND NEW.status = 'Completed' THEN
    NEW.completed_at = now();
  END IF;
  
  -- Update handover_at when status changes to 'Handover'
  IF OLD.status != 'Handover' AND NEW.status = 'Handover' THEN
    NEW.handover_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS damage_timestamp_update ON damage_reports;
CREATE TRIGGER damage_timestamp_update
  BEFORE UPDATE ON damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_damage_timestamps();

-- Handover tasks trigger
CREATE OR REPLACE FUNCTION update_handover_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update completed_at when status changes to 'Completed'
  IF OLD.status != 'Completed' AND NEW.status = 'Completed' THEN
    NEW.completed_at = now();
    NEW.completed_by = current_setting('app.current_user_id', true); -- Set current user if available
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handover_timestamp_update ON handover_tasks;
CREATE TRIGGER handover_timestamp_update
  BEFORE UPDATE ON handover_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_handover_timestamps();

-- 4. Add created_at column to any tables missing it (if needed)
-- Check if area_inspection_logs has created_at (it has submitted_at which is similar)

-- 5. Verify all timestamp columns have proper defaults
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

-- 6. Test the triggers with sample updates (commented out for safety)
-- UPDATE damage_reports SET status = 'Completed' WHERE id = 'test-uuid' LIMIT 1;
-- UPDATE handover_tasks SET status = 'Completed' WHERE id = 'test-uuid' LIMIT 1;
