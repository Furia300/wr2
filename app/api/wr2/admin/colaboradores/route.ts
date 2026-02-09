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
    const status = searchParams.get("status") || "pendente";
    const empresaIdParam = searchParams.get("empresa_id");

    const admin = createAdminClient();
    let query = admin.schema("wr2").from("colaboradores")
      .select("id, numero_registro, nome_completo, rg, cpf, email, cargo, status, created_at, data_admissao, motivo_rejeicao, empresa_id")
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    // Dono/financeiro so ve da propria empresa
    if (profile?.role !== "super_admin") {
      query = query.eq("empresa_id", profile?.empresa_id);
    } else if (empresaIdParam) {
      query = query.eq("empresa_id", empresaIdParam);
    }

    const { data: colaboradores, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ colaboradores: colaboradores || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar colaboradores." }, { status: 500 });
  }
}
