import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const { data: profile } = await supabase
      .schema("wr2").from("profiles").select("role, empresa_id").eq("id", user.id).single();

    const allowed = ["super_admin", "dono", "financeiro"].includes(profile?.role || "");
    if (!allowed) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profile_id");
    if (!profileId) return NextResponse.json({ error: "profile_id obrigatório." }, { status: 400 });

    const admin = createAdminClient();
    const { data: perms, error } = await admin.schema("wr2").from("permissoes")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ permissoes: perms });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar permissões." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const { data: profile } = await supabase
      .schema("wr2").from("profiles").select("role, empresa_id").eq("id", user.id).single();

    const allowed = ["super_admin", "dono", "financeiro"].includes(profile?.role || "");
    if (!allowed) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const body = await req.json();
    const { profile_id, empresa_id, ...flags } = body;

    if (!profile_id || !empresa_id) {
      return NextResponse.json({ error: "profile_id e empresa_id obrigatórios." }, { status: 400 });
    }

    // Dono/financeiro so pode alterar permissoes da propria empresa
    if (profile?.role !== "super_admin" && empresa_id !== profile?.empresa_id) {
      return NextResponse.json({ error: "Sem permissão para alterar essa empresa." }, { status: 403 });
    }

    const admin = createAdminClient();
    const { error } = await admin.schema("wr2").from("permissoes").upsert({
      profile_id,
      empresa_id,
      ...flags,
      updated_at: new Date().toISOString(),
    }, { onConflict: "profile_id,empresa_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao atualizar permissões." }, { status: 500 });
  }
}
