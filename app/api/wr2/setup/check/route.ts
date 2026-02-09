import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET: verifica se ainda pode criar super admin (nenhum super_admin existe).
 */
export async function GET() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .schema("wr2")
      .from("profiles")
      .select("id")
      .eq("role", "super_admin")
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ allowed: !data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json({
        allowed: false,
        error: "Configure SUPABASE_SERVICE_ROLE_KEY no .env.local (Supabase Dashboard > Settings > API > service_role). Se já configurou, reinicie o servidor (Ctrl+C e npm run dev).",
      });
    }
    return NextResponse.json({ allowed: false });
  }
}
