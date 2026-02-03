# Audit Export Templates (Production + Decoration)

These templates are **read-only export layouts** to support CFIA/HACCP audits.
They do **not** change any application logic or database schema.

## 1) Daily Sanitation Log (CSV)

**Purpose:** One row per area per day with the full sanitation cycle.

**Filename pattern:** `sanitation_daily_log_YYYY-MM-DD.csv`

**Columns:**
- `date`
- `area`
- `pre_clean_employee`
- `pre_clean_time`
- `bags_used`
- `post_clean_employee`
- `post_clean_time`
- `bags_returned`
- `handover_required`
- `inspection_lead`
- `inspection_time`
- `line_released`
- `release_time`

**Sources:**
- `pre_cleaning_logs` (area, employee_name, bags_used, submitted_at)
- `post_cleaning_logs` (employee_name, bags_returned, submitted_at, handover_required)
- `area_inspection_logs` (inspector_name, submitted_at)
- `line_release_logs` (released_by, verified_at)

## 2) Corrective Action Log (CSV)

**Purpose:** One row per corrective action (handover task or damage).

**Filename pattern:** `corrective_actions_YYYY-MM-DD.csv`

**Columns:**
- `date`
- `area`
- `source` (post-clean / area-verification / damage)
- `description`
- `status`
- `created_at`
- `completed_at`
- `completed_by`
- `has_photo` (Yes/No)

**Sources:**
- `handover_tasks` (source, task_description, status, created_at, completed_at, completed_by, completed_photo)
- `damage_reports` (description, status, created_at, completed_at, completed_by, completed_photo, area)

## 3) Damage Summary (CSV)

**Purpose:** Summarized damage metrics per area and day.

**Filename pattern:** `damage_summary_YYYY-MM-DD.csv`

**Columns:**
- `date`
- `area`
- `open_count`
- `handover_count`
- `completed_count`

**Sources:**
- `damage_reports` (status, created_at, area)

## 4) Inspection Evidence Export (CSV + ZIP)

**Purpose:** Evidence trail for inspections (signature + photos).

**Filename pattern:**
- `inspection_evidence_YYYY-MM-DD.csv`
- `inspection_photos_YYYY-MM-DD.zip`

**Columns (CSV):**
- `date`
- `area`
- `inspector_name`
- `inspection_time`
- `question`
- `answer`
- `comment`
- `photo_present`
- `signature_present`

**Sources:**
- `area_inspection_logs` (checklist JSON)

## 5) Area Coverage Report (CSV)

**Purpose:** Pre-clean coverage verification by area and day.

**Filename pattern:** `coverage_report_YYYY-MM-DD.csv`

**Columns:**
- `date`
- `area`
- `employee_name`
- `coverage_count`

**Sources:**
- `pre_cleaning_logs` (checklist JSON; extract "Number of equipment covered")

## Notes
- Exports can be generated via Power Automate or a scheduled script.
- All timestamps should be exported in ISO8601 format.
- Use `area` values exactly as stored (`MACY_PRODUCTION`, `MACY_DECORATION`).
