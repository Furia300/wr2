import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

/**
 * POST: gera um link de convite para colaborador se cadastrar.
 * Requer usuário logado com role dono/financeiro/super_admin e empresa_id (ou super_admin).
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { data: profile } = await supabase.schema("wr2").from("profiles").select("empresa_id, role").eq("id", user.id).single();
    const allowed = ["super_admin", "dono", "financeiro"].includes(profile?.role || "");
    if (!allowed) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const empresaId = profile?.empresa_id;
    if (!empresaId && profile?.role !== "super_admin") {
      return NextResponse.json({ error: "Empresa não vinculada ao seu perfil." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const empId = (body.empresa_id as string) || empresaId;
    if (!empId) {
      return NextResponse.json({ error: "Informe empresa_id ou vincule uma empresa ao seu perfil." }, { status: 400 });
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const admin = createAdminClient();
    const { error } = await admin.schema("wr2").from("convites").insert({
      empresa_id: empId,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "http://localhost:3000";
    const url = `${base}/wr2/convite/${token}`;
    return NextResponse.json({ url, token });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao gerar convite." }, { status: 500 });
  }
}
