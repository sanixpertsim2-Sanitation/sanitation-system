const SUPABASE_URL = "https://vfpaiatebgcecfyruvvd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcGFpYXRlYmdjZWNmeXJ1dnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTM4MDEsImV4cCI6MjA4NTQ4OTgwMX0.Sj_FoTM34F6gWTjdPxrYSGhcrk-hB9ORJHj0rY_QwPg";

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
