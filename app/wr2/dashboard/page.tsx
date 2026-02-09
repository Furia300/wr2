import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WR2Dashboard } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/wr2/login");
  }

  const { data: profile } = await supabase.schema("wr2").from("profiles").select("role, empresa_id, status").eq("id", user.id).single();
  const allowed = ["super_admin", "dono", "financeiro"].includes(profile?.role || "");
  if (!allowed) {
    redirect("/wr2/login?msg=Sem permissão. Apenas dono ou financeiro podem acessar o painel.");
  }
  if (profile?.role !== "super_admin" && profile?.status !== "aprovado") {
    redirect("/wr2/login?msg=Seu cadastro ainda está em análise. Aguarde aprovação.");
  }

  return <WR2Dashboard user={user} empresaId={profile?.empresa_id ?? null} />;
}
