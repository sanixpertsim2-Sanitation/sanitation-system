-- Supabase Storage bucket setup for photos
-- Run this once to create the storage bucket

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos', 
  'sanitation-photos', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow photo uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND 
  (storage.foldername(name))[1] IN ('sanitation-photos', 'damage-reports', 'handover-tasks', 'findings')
);

CREATE POLICY "Allow photo downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Allow photo updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'photos');

CREATE POLICY "Allow photo deletions" ON storage.objects
FOR DELETE USING (bucket_id = 'photos');

-- Add indexes for better performance (only for tables that exist and have these columns)
DO $$ 
BEGIN
    -- Only create indexes if tables exist and have the area column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pre_cleaning_logs' AND column_name = 'area') THEN
        CREATE INDEX IF NOT EXISTS idx_pre_cleaning_logs_area_time 
        ON pre_cleaning_logs(area, submitted_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_cleaning_logs' AND column_name = 'area') THEN
        CREATE INDEX IF NOT EXISTS idx_post_cleaning_logs_area_time 
        ON post_cleaning_logs(area, submitted_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'damage_reports' AND column_name = 'area') THEN
        CREATE INDEX IF NOT EXISTS idx_damage_reports_area_status 
        ON damage_reports(area, status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'handover_tasks' AND column_name = 'area') THEN
        CREATE INDEX IF NOT EXISTS idx_handover_tasks_area_status 
        ON handover_tasks(area, status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_locks' AND column_name = 'area') THEN
        CREATE INDEX IF NOT EXISTS idx_task_locks_area_task 
        ON task_locks(area, task);
    END IF;
END $$;

-- Function to clean up old data (can be called by scheduled job)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS TABLE(
  pre_clean_deleted bigint,
  post_clean_deleted bigint,
  handovers_deleted bigint,
  inspections_deleted bigint,
  findings_deleted bigint
) AS $$
DECLARE
  cutoff_pre_clean timestamptz := NOW() - INTERVAL '7 days';
  cutoff_post_clean timestamptz := NOW() - INTERVAL '7 days';
  cutoff_handovers timestamptz := NOW() - INTERVAL '3 days';
  cutoff_inspections timestamptz := NOW() - INTERVAL '30 days';
  cutoff_findings timestamptz := NOW() - INTERVAL '14 days';
BEGIN
  -- Delete old pre-clean records
  DELETE FROM pre_cleaning_logs 
  WHERE submitted_at < cutoff_pre_clean;
  GET DIAGNOSTICS pre_clean_deleted = ROW_COUNT;
  
  -- Delete old post-clean records
  DELETE FROM post_cleaning_logs 
  WHERE submitted_at < cutoff_post_clean;
  GET DIAGNOSTICS post_clean_deleted = ROW_COUNT;
  
  -- Delete completed handovers older than 3 days
  DELETE FROM handover_tasks 
  WHERE status = 'Completed' AND created_at < cutoff_handovers;
  GET DIAGNOSTICS handovers_deleted = ROW_COUNT;
  
  -- Delete old inspections
  DELETE FROM area_inspection_logs 
  WHERE submitted_at < cutoff_inspections;
  GET DIAGNOSTICS inspections_deleted = ROW_COUNT;
  
  -- Delete closed findings older than 14 days
  DELETE FROM post_release_findings 
  WHERE status = 'Closed' AND created_at < cutoff_findings;
  GET DIAGNOSTICS findings_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT pre_clean_deleted, post_clean_deleted, handovers_deleted, inspections_deleted, findings_deleted;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_old_data TO authenticated, anon;
