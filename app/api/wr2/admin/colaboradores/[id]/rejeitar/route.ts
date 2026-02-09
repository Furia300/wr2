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

    // Verificar se pertence a empresa
    const admin = createAdminClient();
    if (profile?.role !== "super_admin") {
      const { data: colab } = await admin.schema("wr2").from("colaboradores")
        .select("empresa_id").eq("id", id).single();
      if (colab?.empresa_id !== profile?.empresa_id) {
        return NextResponse.json({ error: "Colaborador não pertence à sua empresa." }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const motivo = (body.motivo as string) || null;

    await admin.schema("wr2").from("colaboradores")
      .update({ status: "rejeitado", motivo_rejeicao: motivo })
      .eq("id", id);

    const { data: colab } = await admin.schema("wr2").from("colaboradores")
      .select("nome_completo, empresa_id").eq("id", id).single();

    if (colab) {
      await admin.schema("wr2").from("notificacoes").insert({
        empresa_id: colab.empresa_id,
        tipo: "colaborador_rejeitado",
        titulo: "Colaborador não aprovado",
        mensagem: `${colab.nome_completo} não foi aprovado.${motivo ? ` Motivo: ${motivo}` : ""}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao rejeitar colaborador." }, { status: 500 });
  }
}
