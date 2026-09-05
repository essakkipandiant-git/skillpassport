/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_REQUIRE_REMOTE_SUPABASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
