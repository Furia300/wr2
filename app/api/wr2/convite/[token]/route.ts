import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET: valida token de convite e retorna dados para o formulário (condomínios da empresa).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: convite, error } = await admin
      .schema("wr2")
      .from("convites")
      .select("id, empresa_id, usado_em, expires_at")
      .eq("token", token)
      .single();

    if (error || !convite) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }
    if (convite.usado_em) {
      return NextResponse.json({ valid: false, reason: "used" });
    }
    if (convite.expires_at && new Date(convite.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, reason: "expired" });
    }

    const { data: condominios } = await admin
      .schema("wr2")
      .from("condominios")
      .select("id, nome")
      .eq("empresa_id", convite.empresa_id);

    return NextResponse.json({
      valid: true,
      empresa_id: convite.empresa_id,
      condominios: condominios || [],
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
