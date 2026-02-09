import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL = "superadmin@wr2.local";
const SENHA = "TrocarSenha123!";

/**
 * POST: cria Super Admin com senha fixa (uma vez). Não exige body.
 */
export async function POST() {
  try {
    const admin = createAdminClient();

    const { data: existing } = await admin
      .schema("wr2")
      .from("profiles")
      .select("id")
      .eq("role", "super_admin")
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        ok: false,
        message: "Super Admin já existe. Use a tela de login.",
      });
    }

    const { data: userData, error: authError } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: SENHA,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ ok: false, error: authError.message }, { status: 400 });
    }
    if (!userData.user) {
      return NextResponse.json({ ok: false, error: "Falha ao criar usuário." }, { status: 500 });
    }

    await admin.schema("wr2").from("profiles").upsert({
      id: userData.user.id,
      email: userData.user.email,
      role: "super_admin",
    });

    return NextResponse.json({
      ok: true,
      message: "Super Admin criado. Altere a senha no painel (Alterar senha).",
      email: EMAIL,
      password: SENHA,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Erro ao criar Super Admin." },
      { status: 500 }
    );
  }
}
