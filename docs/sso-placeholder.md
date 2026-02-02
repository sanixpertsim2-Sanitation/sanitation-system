# Microsoft SSO Placeholder (Supabase)

This is a placeholder setup note. OAuth is not configured yet.

## Supabase settings to prepare
- Auth → Providers → Azure (Microsoft)
- Create an Azure App Registration
  - Redirect URL: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
  - Configure Client ID and Client Secret in Supabase

## Frontend placeholder
- UI should show a “Sign in with Microsoft” button on dashboard pages only.
- Shop‑floor pages remain anonymous.

## Bootstrap admin
- Hard‑coded bootstrap admin email: `adarsh@sanixperts.com`
- RLS policies should allow full CRUD for this email.
