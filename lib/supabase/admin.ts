import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service_role — usar APENAS no servidor (API routes, Server Actions).
 * Nunca exponha SUPABASE_SERVICE_ROLE_KEY no client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Configure SUPABASE_SERVICE_ROLE_KEY no .env.local (Supabase Dashboard > Settings > API)");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
