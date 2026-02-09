import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST: cria o primeiro usuário super_admin (uma vez só).
 * Body: { email, password }
 * Só funciona se ainda não existir nenhum perfil com role = 'super_admin'.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email e senha (mín. 6 caracteres) são obrigatórios." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .schema("wr2")
      .from("profiles")
      .select("id")
      .eq("role", "super_admin")
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um super admin. Use a tela de login." },
        { status: 403 }
      );
    }

    const { data: userData, error: authError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!userData.user) {
      return NextResponse.json({ error: "Falha ao criar usuário." }, { status: 500 });
    }

    await admin.schema("wr2").from("profiles").upsert({
      id: userData.user.id,
      email: userData.user.email,
      role: "super_admin",
      status: "aprovado",
    });

    return NextResponse.json({
      ok: true,
      message: "Super admin criado. Use este email e senha para entrar e altere a senha no painel.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao criar super admin." },
      { status: 500 }
    );
  }
}
