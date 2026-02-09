import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const { data: profile } = await supabase
      .schema("wr2").from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role !== "super_admin") {
      return NextResponse.json({ error: "Apenas super admin pode rejeitar empresas." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const motivo = (body.motivo as string) || null;

    const admin = createAdminClient();

    await admin.schema("wr2").from("empresas")
      .update({ status: "rejeitado", motivo_rejeicao: motivo })
      .eq("id", id);

    await admin.schema("wr2").from("profiles")
      .update({ status: "rejeitado" })
      .eq("empresa_id", id);

    await admin.schema("wr2").from("notificacoes").insert({
      empresa_id: id,
      tipo: "empresa_rejeitada",
      titulo: "Cadastro não aprovado",
      mensagem: motivo || "Seu cadastro não foi aprovado. Entre em contato para mais informações.",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao rejeitar empresa." }, { status: 500 });
  }
}
