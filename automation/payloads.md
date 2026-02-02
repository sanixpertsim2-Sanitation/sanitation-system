# Power Automate Payloads (Sample)

These JSON payloads are audit‑readable and map directly to Supabase tables.

## Events
- `post_clean_submitted` → `post_cleaning_logs`
- `damage_handover` → `damage_reports`
- `handover_completed` → `handover_tasks`
- `line_released` → `line_release_logs`

## Field mapping (common)
- `event` → Event name in flow trigger
- `occurred_at` → ISO timestamp (UTC)
- `area` → Area / line identifier
- `actor_name` → Human name captured on UI
- `actor_role` → Role label (sanitation_operator / supervisor / area_lead / admin)
- `record_ids` → Supabase UUIDs for traceability
- `evidence` → Photo/signature (base64 or storage URL)

## Notes
- Payloads are designed to be CFIA‑friendly and include who/when/where/evidence.
- Replace base64 placeholders with storage URLs if you later move images to Supabase Storage.
