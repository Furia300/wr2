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
      return NextResponse.json({ error: "Apenas super admin pode aprovar empresas." }, { status: 403 });
    }

    const admin = createAdminClient();

    // Aprovar empresa
    const { error: empErr } = await admin.schema("wr2").from("empresas")
      .update({ status: "aprovado", aprovado_por: user.id, aprovado_em: new Date().toISOString() })
      .eq("id", id);

    if (empErr) return NextResponse.json({ error: empErr.message }, { status: 500 });

    // Aprovar profiles vinculados a essa empresa
    await admin.schema("wr2").from("profiles")
      .update({ status: "aprovado" })
      .eq("empresa_id", id);

    // Criar permissoes default para o dono da empresa
    const { data: donoProfile } = await admin.schema("wr2").from("profiles")
      .select("id")
      .eq("empresa_id", id)
      .eq("role", "dono")
      .maybeSingle();

    if (donoProfile) {
      await admin.schema("wr2").from("permissoes").upsert({
        profile_id: donoProfile.id,
        empresa_id: id,
        can_view_dashboard: true,
        can_view_colaboradores: true,
        can_edit_colaboradores: true,
        can_approve_colaboradores: true,
        can_view_recibos: true,
        can_edit_recibos: true,
        can_view_condominios: true,
        can_edit_condominios: true,
        can_approve_empresas: false,
        can_view_admin_panel: true,
      }, { onConflict: "profile_id,empresa_id" });
    }

    // Notificacao
    await admin.schema("wr2").from("notificacoes").insert({
      empresa_id: id,
      tipo: "empresa_aprovada",
      titulo: "Empresa aprovada",
      mensagem: "Sua empresa foi aprovada! Agora você pode acessar o painel.",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao aprovar empresa." }, { status: 500 });
  }
}
