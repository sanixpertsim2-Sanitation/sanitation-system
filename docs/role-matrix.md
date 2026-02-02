# Role Matrix

Roles:
- `sanitation_operator` (shop-floor, anonymous)
- `supervisor`
- `area_lead`
- `admin` (bootstrap: adarsh@sanixperts.com)

## Permissions by table/action

| Table | Action | Operator | Supervisor | Area Lead | Admin |
|---|---|---|---|---|---|
| pre_cleaning_logs | INSERT | Yes | No | No | Yes |
| pre_cleaning_logs | SELECT | No | Yes | Yes | Yes |
| post_cleaning_logs | INSERT | Yes | No | No | Yes |
| post_cleaning_logs | SELECT | No | Yes | Yes | Yes |
| damage_reports | INSERT | Yes | No | No | Yes |
| damage_reports | UPDATE (status) | No | Yes | Yes (read-only by default) | Yes |
| damage_reports | SELECT | No | Yes | Yes | Yes |
| handover_tasks | INSERT | Yes | No | No | Yes |
| handover_tasks | UPDATE (complete) | No | Yes | Yes | Yes |
| handover_tasks | SELECT | No | Yes | Yes | Yes |
| area_inspection_logs | INSERT | No | No | Yes | Yes |
| area_inspection_logs | SELECT | No | Yes | Yes | Yes |
| line_release_logs | INSERT | No | No | Yes | Yes |
| line_release_logs | SELECT | No | Yes | Yes | Yes |

## Notes
- Shop-floor access is anonymous and insert-only for operational logs.
- Dashboards use authenticated sessions (Microsoft SSO placeholder).
- Admin has full CRUD for audit correction and governance.
