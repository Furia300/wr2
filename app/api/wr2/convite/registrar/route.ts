import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST: registra colaborador via link de convite (cadastro pelo funcionário).
 * Body: { token, nome_completo, rg?, cpf?, email?, cargo?, data_admissao?, condominio_id? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, nome_completo, rg, cpf, email, cargo, data_admissao, condominio_id } = body as {
      token?: string;
      nome_completo?: string;
      rg?: string;
      cpf?: string;
      email?: string;
      cargo?: string;
      data_admissao?: string;
      condominio_id?: string;
    };

    if (!token || !nome_completo?.trim()) {
      return NextResponse.json({ error: "Token e nome completo são obrigatórios." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: convite, error: convErr } = await admin
      .schema("wr2")
      .from("convites")
      .select("id, empresa_id, usado_em, expires_at")
      .eq("token", token)
      .single();

    if (convErr || !convite) {
      return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
    }
    if (convite.usado_em) {
      return NextResponse.json({ error: "Este link já foi utilizado." }, { status: 400 });
    }
    if (convite.expires_at && new Date(convite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Link expirado." }, { status: 400 });
    }

    const { data: colab, error: insertErr } = await admin
      .schema("wr2")
      .from("colaboradores")
      .insert({
        empresa_id: convite.empresa_id,
        condominio_id: condominio_id || null,
        nome_completo: nome_completo.trim(),
        rg: rg?.trim() || null,
        cpf: cpf?.replace(/\D/g, "") || null,
        email: email?.trim() || null,
        cargo: cargo?.trim() || null,
        data_admissao: data_admissao || null,
        status: "pendente",
      })
      .select("id, nome_completo")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    await admin.schema("wr2").from("notificacoes").insert({
      empresa_id: convite.empresa_id,
      tipo: "novo_colaborador",
      titulo: "Colaborador pendente",
      mensagem: `${colab?.nome_completo || "Novo colaborador"} se cadastrou pelo link de convite e aguarda aprovação.`,
    });

    await admin.schema("wr2").from("convites").update({ usado_em: new Date().toISOString() }).eq("id", convite.id);

    return NextResponse.json({ ok: true, message: "Cadastro realizado. O dono ou financeiro foi notificado." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao registrar." }, { status: 500 });
  }
}
