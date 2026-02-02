# Power Automate Mapping (Spec)

## Overview
This mapping enables automated notifications, approvals, and exports without modifying UI logic. All triggers are based on Supabase table changes and follow CFIA-friendly naming.

## Global retry strategy
- Retry 3 times with exponential backoff (5s, 15s, 45s)
- On failure, log to Teams channel + email admin
- Do not block shop-floor UX if automation fails

## Notifications
- Email: `sanitation-supervisors@sanixperts.com` (placeholder)
- Teams: `#sanitation-alerts` (placeholder)

---

## pre_cleaning_logs
**Trigger:** New row inserted  
**When to run:** `status = 'submitted'`  
**Fields:**  
- `area` → Area  
- `employee_name` → Operator  
- `bags_used` → BagsUsed  
- `submitted_at` → SubmittedAt  
- `checklist` → ChecklistJSON  

**Action:**  
Send "Pre-Clean Submitted" email + append to Excel/Sheets.

---

## post_cleaning_logs
**Trigger:** New row inserted  
**When to run:** Always on insert  
**Fields:**  
- `preclean_id` → PrecleanRef  
- `employee_name` → Operator  
- `bags_returned` → BagsReturned  
- `handover_required` → HandoverRequired  
- `submitted_at` → SubmittedAt  

**Action:**  
If `handover_required = true` → create Planner task + notify supervisor.

---

## damage_reports
**Trigger:** Row updated  
**When to run:** `status = 'Handover'`  
**Fields:**  
- `area` → Area  
- `description` → Description  
- `severity` → Severity  
- `handover_reason` → HandoverReason  

**Action:**  
Notify maintenance + create corrective action record.

---

## handover_tasks
**Trigger:** Row updated  
**When to run:** `status = 'Completed'`  
**Fields:**  
- `task_description` → Task  
- `completed_by` → CompletedBy  
- `completed_at` → CompletedAt  
- `completed_photo` → Evidence  

**Action:**  
Send completion notice; update compliance log.

---

## area_inspection_logs
**Trigger:** New row inserted  
**When to run:** Always on insert  
**Fields:**  
- `inspector_name` → AreaLead  
- `submitted_at` → SubmittedAt  
- `checklist` → ChecklistJSON  
- `comments` → Findings  

**Action:**  
If `comments` present → auto-create handover tasks (already done in UI) and notify supervisor.

---

## line_release_logs
**Trigger:** New row inserted  
**When to run:** Always on insert  
**Fields:**  
- `released_by` → AreaLead  
- `verified_at` → ReleasedAt  
- `signature` → Signature  

**Action:**  
Send "Line Released" notification; archive daily report.
