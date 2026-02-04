# Sanixpert MACY System - Final Architecture

## Overview
The Sanixpert MACY system implements a strict workflow with automatic 48-hour "Clean Slate" refresh to optimize for free Supabase tier usage.

## Workflow Architecture
```
Pre-clean → Post-clean → Lead Verification
    ↓           ↓              ↓
Bag Count   Equipment      Face ID
Validation   Matching       Required
```

## Key Features

### 1. **Sequential Workflow**
- **Pre-clean**: Initial setup with equipment covering count
- **Post-clean**: Equipment retrieval validation (must match pre-clean)
- **Lead Verification**: Final approval with face detection

### 2. **Equipment Matching Logic**
- Pre-clean: "No. of Equipment Covered ____"
- Post-clean: "No. of Equipment Retrieved ____"
- **Validation**: Counts must match exactly
- **Error**: "Covering is missing to retrieve! Need to recover X equipment(s)"

### 3. **Face ID System**
- Required for every workflow transition
- Lean vector storage in `face_registry` table
- Auto-fill name/role on recognition
- Prevents unauthorized access

### 4. **48-Hour Clean Slate**
- **Frequency**: Every 48 hours automatically
- **What's Kept**: Face registry, Open damage reports (To-Do list)
- **What's Archived**: All other data (pre/post-clean, inspections, completed tasks)
- **Storage**: Local JSON backup before cleanup

### 5. **Memory Optimization**
- **Photos**: Supabase Storage (not base64)
- **Compression**: 500KB max per image
- **Limits**: 3 photos per submission
- **Result**: ~50MB monthly usage (under 500MB free tier)

## Database Schema

### Core Tables
```sql
face_registry          -- Face ID data (PERMANENT)
pre_cleaning_logs     -- Pre-clean data (48hr retention)
post_cleaning_logs    -- Post-clean data (48hr retention)
damage_reports        -- Damage reports (Open kept, Closed archived)
handover_tasks        -- Handover tasks (48hr retention)
area_inspection_logs  -- Lead verification (48hr retention)
```

### Storage
```sql
storage.photos        -- Compressed images with URLs
```

## GitHub Actions

### Keep-Alive Heartbeat
```yaml
# .github/workflows/keep_awake.yml
schedule: '0 0 */3 * *'  # Every 3 days
```
Prevents Supabase database pausing during inactive periods.

## Implementation Files

### Frontend
- `macy-decoration-*.html` -- Workflow pages
- `js/validationUtils.js` -- Equipment matching
- `js/faceUtils.js` -- Face detection
- `js/photoStorage.js` -- Optimized photo handling

### Backend
- `supabase-clean-slate.sql` -- 48-hour cleanup function
- `supabase-storage-setup.sql` -- Storage bucket setup

### Automation
- `js/backupManager.js` -- Clean slate backup system
- `js/dataCleanup.js` -- Data optimization
- `js/systemInitializer.js` -- Auto-initialization

## Memory Usage Strategy

### Before Optimization
- Base64 photos: ~2MB each
- Unlimited retention
- Database bloat

### After Optimization
- Compressed photos: ~500KB each
- 48-hour automatic cleanup
- Storage URLs instead of base64
- **Result**: 75% memory reduction

## Clean Slate Process

1. **Backup**: Export all data to local JSON
2. **Archive**: Delete records older than 48 hours
3. **Preserve**: Keep face registry + open damages
4. **Refresh**: System starts fresh every 48 hours

## Benefits

✅ **Free Tier Compatible**: Under 500MB limit
✅ **Automatic Maintenance**: No manual cleanup needed
✅ **Data Integrity**: Equipment matching prevents errors
✅ **Security**: Face ID required for all transitions
✅ **Scalable**: GitHub Actions prevent database sleep

## Setup Instructions

1. Run `supabase-storage-setup.sql`
2. Run `supabase-clean-slate.sql`
3. Configure GitHub secrets for keep-alive action
4. System auto-initializes on first load

The system now maintains a "clean slate" every 48 hours while preserving essential data and workflow integrity.
