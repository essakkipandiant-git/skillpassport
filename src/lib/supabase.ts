import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Clean surrounding quotes or whitespace if accidentally included in deployment environment
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
const supabaseUrl = rawUrl.replace(/^["']|["']$/g, "").trim();
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, "").trim();

/**
 * Checks whether valid Supabase configuration is present in the environment.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project.supabase.co") &&
    !supabaseUrl.includes("placeholder-project.supabase.co")
  );
}

// Fallback dummy credentials to prevent @supabase/supabase-js from throwing on init if unconfigured
const safeUrl = isSupabaseConfigured() ? supabaseUrl : "https://placeholder-project.supabase.co";
const safeKey = isSupabaseConfigured() ? supabaseAnonKey : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
