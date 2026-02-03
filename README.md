# Sanixpert – Intelligent Digital Sanitation Checklist
Sanitation control platform for Give & Go (Sanixpert).

## Architecture overview
- Static HTML/JS frontend (mobile-first)
- Supabase backend (Postgres + Storage-ready)
- Anonymous shop-floor access for speed and reliability
- Authenticated dashboards (Microsoft SSO placeholder only)

## Anonymous vs Authenticated flows
### Anonymous (shop-floor, no login)
- Pre-Clean, Post-Clean, Damage, Handover, Area Lead Verification, Post-Release Findings
- Insert-only access via RLS (see `supabase/rls.sql`)

### Authenticated (dashboard/admin)
- Read-only dashboards and reports
- Admin override (bootstrap): `adarsh@sanixperts.com`

## Microsoft OAuth (future setup)
OAuth is not configured yet. Use these stubs only:
- Env stubs: `.env.example` (VITE_MS_CLIENT_ID, VITE_MS_TENANT_ID, VITE_MS_REDIRECT_URL)
- Placeholder docs: `docs/sso-placeholder.md`

## RLS strategy
- Anonymous: INSERT only for shop-floor tables; SELECT only where required for UX
- Authenticated: SELECT all for dashboards
- Admin (bootstrap): UPDATE on damage/handover/release tables
- No deletes

## Audit readiness
- Every critical action captures who/when/area/evidence
- Photos and signatures are stored in record fields (base64 or future storage URL)
- Status transitions are preserved for traceability

## Deployment notes
- Static deployment ready (Vercel/Netlify compatible)
- Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` in deploy environment

## SQL helpers
- `supabase/rls.sql` — RLS policies (safe mode)
- `supabase-step1-hardening.sql` — RLS + constraints
- `supabase-step2-automation.sql` — audit fields + indexes
- `supabase-step3-views.sql` — reporting views
- `supabase-step4-identity-locking.sql` — face registry + task locking + findings