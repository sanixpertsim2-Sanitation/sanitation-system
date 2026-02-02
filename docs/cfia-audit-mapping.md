# CFIA Audit Mapping

This table maps audit requirements to evidence stored in Supabase.

| Audit Requirement | Evidence Source | Table / Field | Notes |
|---|---|---|---|
| Who performed pre‑clean | Operator name | `pre_cleaning_logs.employee_name` | Captured on pre‑clean submission |
| When pre‑clean happened | Timestamp | `pre_cleaning_logs.submitted_at` | ISO timestamp |
| Area cleaned | Area | `pre_cleaning_logs.area` | Selected area |
| Pre‑clean checklist evidence | Checklist JSON | `pre_cleaning_logs.checklist` | Includes question text + comments |
| Bag count reference | Bag count | `pre_cleaning_logs.bags_used` | Authoritative reference |
| Who performed post‑clean | Operator name | `post_cleaning_logs.employee_name` | Captured on post‑clean submission |
| When post‑clean happened | Timestamp | `post_cleaning_logs.submitted_at` | ISO timestamp |
| Bag reconciliation | Bags returned | `post_cleaning_logs.bags_returned` | Soft validated in UI |
| Post‑clean checklist evidence | Checklist JSON | `post_cleaning_logs.checklist` | Includes photos if required |
| Damage report | Damage entry | `damage_reports.*` | Status lifecycle tracked |
| Corrective action | Handover completion | `handover_tasks.status`, `completed_photo` | Photo required on completion |
| Area lead verification | Inspection record | `area_inspection_logs.checklist` | Includes signature snapshot |
| Line release | Release record | `line_release_logs.*` | Signature + timestamp |

## Audit readiness notes
- Every critical action has who/when/where/evidence.
- No destructive deletes; status transitions only.
- Photos/signatures stored in record fields (base64 or storage URL).
