# Damage report persistence and alerts

## Behavior

- New reports and handover/closure updates wait for Supabase confirmation. The UUID returned by the database is used for later updates.
- Failed or unconfirmed writes keep the entered report/closure details and do not send email. Inspect the report log before retrying an uncertain write.
- New reports require a configured database. There is no silent device-only success fallback.
- Previously cached reports remain visible after loading database records. Older `damage-*` IDs are device-only records and cannot be updated as UUID database rows. They need a separately reviewed migration; this fix does not delete, automatically duplicate, or migrate historical data.
- Report saving and email acceptance are separate outcomes. An email problem never prompts resubmission of a successfully saved report. SMTP acceptance does not guarantee inbox delivery.
- Low severity report creation does not send an alert. Existing acknowledgement notifications are retained. The corrected recipient is `adarsh@sanixperts.ca`; recipients are not expanded to PR18's historical list.
- Photo evidence is sent as a CID attachment rather than a data URL in email HTML. Attachments are limited to 5 MB. Remote image URLs are not fetched.

## Configuration and rollout checks

Use the existing Supabase schema (`supabase/schema.sql`) and configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Database access must permit the existing intended insert/select/update operations. Verify the project's authorization/RLS configuration before rollout. Do not disable RLS to make the application work. No policies or permissions are changed by this fix.

Configure server-only `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, and a provider-authorized `ALERT_FROM`. `SMTP_SECURE=true` uses implicit TLS; the default is true for port 465 and false otherwise. Missing SMTP configuration produces an explicit 503 failure, never mocked success. Never commit credentials.

Run `npm ci`, `npm test`, `npm run lint`, and `npm run build` before release. The tests use mock database/mail transports and do not contact production or send email.

Before production rollout, verify an authorized staging report survives reload and is visible to another authorized user; confirm handover/closure updates address that same UUID. With separately authorized test email, verify provider acceptance and final receipt. Review legacy device-only records separately.

## Known boundaries

No production migration, deployment, permission changes, or external test email was performed. No durable email queue/retry worker is added. If an alert is unconfirmed, the UI explicitly asks the operator to contact management directly. If the browser closes after saving but before sending, automated delivery is not guaranteed. Authentication and abuse/rate limiting for the pre-existing email endpoint require a separate security review; the endpoint now fixes its recipient and forbids file/URL attachment reads, but this patch does not introduce a new identity system.
