import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const { data: profile } = await supabase
      .schema("wr2").from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role !== "super_admin") {
      return NextResponse.json({ error: "Apenas super admin pode gerenciar empresas." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pendente";

    const admin = createAdminClient();
    let query = admin.schema("wr2").from("empresas")
      .select("id, cnpj, nome_responsavel, funcao, email, status, created_at, motivo_rejeicao")
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: empresas, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ empresas: empresas || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar empresas." }, { status: 500 });
  }
}
