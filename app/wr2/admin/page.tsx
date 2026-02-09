import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminPanelClient } from "./admin-client";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/wr2/login");

  const { data: profile } = await supabase
    .schema("wr2")
    .from("profiles")
    .select("role, empresa_id, status")
    .eq("id", user.id)
    .single();

  const allowed = ["super_admin", "dono", "financeiro"].includes(profile?.role || "");
  if (!allowed || (profile?.role !== "super_admin" && profile?.status !== "aprovado")) {
    redirect("/wr2/login?msg=Sem permissão para acessar o painel de gerenciamento.");
  }

  return (
    <AdminPanelClient
      user={user}
      role={profile?.role || ""}
      empresaId={profile?.empresa_id ?? null}
    />
  );
}
