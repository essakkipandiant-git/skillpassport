import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read environment variables with robust fallback support across Vite and deployment platforms
const rawUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  ""
).trim();

const rawKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();

// Clean surrounding quotes or accidental whitespace
export const supabaseUrl = rawUrl.replace(/^["']|["']$/g, "").trim();
export const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, "").trim();

/**
 * Checks whether valid Supabase configuration is present in the build/runtime environment.
 * Evaluates strictly to true only when required environment variables are supplied.
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

// Log diagnostic configuration status (strictly boolean; never prints secrets)
if (typeof window !== "undefined") {
  console.log("Supabase configured:", isSupabaseConfigured());
}

// Fallback dummy credentials to prevent @supabase/supabase-js from throwing on initial instantiation if unconfigured
const safeUrl = isSupabaseConfigured() ? supabaseUrl : "https://placeholder-project.supabase.co";
const safeKey = isSupabaseConfigured() ? supabaseAnonKey : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

/**
 * Application-wide singleton Supabase client
 */
export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
