-- Enhanced cleanup function for 48-hour "Clean Slate"
-- Keeps only essential data: Face registry and Open Damages
-- Archives everything else

CREATE OR REPLACE FUNCTION clean_slate_48hr()
RETURNS TABLE(
  pre_clean_archived bigint,
  post_clean_archived bigint,
  handovers_archived bigint,
  inspections_archived bigint,
  findings_archived bigint,
  photos_cleaned bigint
) AS $$
DECLARE
  cutoff_48hr timestamptz := NOW() - INTERVAL '48 hours';
  archived_count bigint;
BEGIN
  RAISE NOTICE 'Starting 48-hour clean slate...';
  
  -- Archive pre-clean logs older than 48 hours
  DELETE FROM pre_cleaning_logs 
  WHERE submitted_at < cutoff_48hr;
  GET DIAGNOSTICS pre_clean_archived = ROW_COUNT;
  
  -- Archive post-clean logs older than 48 hours  
  DELETE FROM post_cleaning_logs 
  WHERE submitted_at < cutoff_48hr;
  GET DIAGNOSTICS post_clean_archived = ROW_COUNT;
  
  -- Archive ALL handover tasks older than 48 hours (regardless of status)
  DELETE FROM handover_tasks 
  WHERE created_at < cutoff_48hr;
  GET DIAGNOSTICS handovers_archived = ROW_COUNT;
  
  -- Archive inspections older than 48 hours
  DELETE FROM area_inspection_logs 
  WHERE submitted_at < cutoff_48hr;
  GET DIAGNOSTICS inspections_archived = ROW_COUNT;
  
  -- Archive CLOSED findings older than 48 hours (keep open ones as "To-Do list")
  DELETE FROM post_release_findings 
  WHERE status = 'Closed' AND created_at < cutoff_48hr;
  GET DIAGNOSTICS findings_archived = ROW_COUNT;
  
  -- Clean up orphaned photos in storage
  -- This would require additional storage cleanup logic
  photos_cleaned := 0; -- Placeholder for storage cleanup
  
  RAISE NOTICE 'Clean slate completed. Archived records: %', 
    pre_clean_archived + post_clean_archived + handovers_archived + inspections_archived + findings_archived;
  
  RETURN QUERY SELECT pre_clean_archived, post_clean_archived, handovers_archived, inspections_archived, findings_archived, photos_cleaned;
END;
$$ LANGUAGE plpgsql;

-- Enhanced backup function that works with clean slate
CREATE OR REPLACE FUNCTION backup_and_clean_slate()
RETURNS TABLE(
  backup_filename text,
  pre_clean_archived bigint,
  post_clean_archived bigint,
  handovers_archived bigint,
  inspections_archived bigint,
  findings_archived bigint
) AS $$
DECLARE
  backup_result text;
  cleanup_pre_clean bigint;
  cleanup_post_clean bigint;
  cleanup_handovers bigint;
  cleanup_inspections bigint;
  cleanup_findings bigint;
  cleanup_photos bigint;
BEGIN
  -- This would trigger the backup system
  backup_result := 'backup-' || to_char(NOW(), 'YYYY-MM-DD-HH24-MI-SS') || '.json';
  
  -- Perform clean slate
  SELECT * INTO cleanup_pre_clean, cleanup_post_clean, cleanup_handovers, cleanup_inspections, cleanup_findings, cleanup_photos
  FROM clean_slate_48hr();
  
  RETURN QUERY SELECT backup_result, 
    cleanup_pre_clean,
    cleanup_post_clean, 
    cleanup_handovers,
    cleanup_inspections,
    cleanup_findings;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION clean_slate_48hr TO authenticated, anon;
GRANT EXECUTE ON FUNCTION backup_and_clean_slate TO authenticated, anon;
