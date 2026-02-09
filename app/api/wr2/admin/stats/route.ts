import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const { data: profile } = await supabase
      .schema("wr2").from("profiles").select("role, empresa_id").eq("id", user.id).single();

    const allowed = ["super_admin", "dono", "financeiro"].includes(profile?.role || "");
    if (!allowed) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

    const admin = createAdminClient();

    // Empresas pendentes (apenas super_admin ve)
    let pendingEmpresas = 0;
    if (profile?.role === "super_admin") {
      const { count } = await admin.schema("wr2").from("empresas")
        .select("id", { count: "exact", head: true })
        .eq("status", "pendente");
      pendingEmpresas = count || 0;
    }

    // Colaboradores pendentes
    let colabQuery = admin.schema("wr2").from("colaboradores")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente");

    if (profile?.role !== "super_admin" && profile?.empresa_id) {
      colabQuery = colabQuery.eq("empresa_id", profile.empresa_id);
    }

    const { count: pendingColabs } = await colabQuery;

    return NextResponse.json({
      pendingEmpresas,
      pendingColaboradores: pendingColabs || 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar estatísticas." }, { status: 500 });
  }
}
