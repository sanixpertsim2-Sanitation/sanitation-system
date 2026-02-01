import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://rlpcuibazfgfapfnijgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscGN1aWJhemZnZmFwZm5pamdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzUwOTQsImV4cCI6MjA4NTQ1MTA5NH0.cbzGQmDijoBFofP8Erit8N-_zUQ6qOfzvJDo1Oxhvus";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
