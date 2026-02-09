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
      .schema("wr2").from("profiles").select("role, empresa_id").eq("id", user.id).single();

    const allowed = ["super_admin", "dono", "financeiro"].includes(profile?.role || "");
    if (!allowed) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const admin = createAdminClient();

    // Verificar se o colaborador pertence a empresa do usuario (exceto super_admin)
    if (profile?.role !== "super_admin") {
      const { data: colab } = await admin.schema("wr2").from("colaboradores")
        .select("empresa_id").eq("id", id).single();
      if (colab?.empresa_id !== profile?.empresa_id) {
        return NextResponse.json({ error: "Colaborador não pertence à sua empresa." }, { status: 403 });
      }
    }

    const { error } = await admin.schema("wr2").from("colaboradores")
      .update({ status: "ativo", aprovado_por: user.id, aprovado_em: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Buscar dados para notificacao
    const { data: colab } = await admin.schema("wr2").from("colaboradores")
      .select("nome_completo, empresa_id").eq("id", id).single();

    if (colab) {
      await admin.schema("wr2").from("notificacoes").insert({
        empresa_id: colab.empresa_id,
        tipo: "colaborador_aprovado",
        titulo: "Colaborador aprovado",
        mensagem: `${colab.nome_completo} foi aprovado e está ativo.`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao aprovar colaborador." }, { status: 500 });
  }
}
