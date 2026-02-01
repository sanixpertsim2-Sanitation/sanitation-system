import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "YOUR_PROJECT_URL",
  "YOUR_ANON_PUBLIC_KEY"
);
