"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RecibosClient } from "./recibos-client";
import { createClient } from "@/lib/supabase/client";

export default function RecibosPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        router.push("/wr2/login");
        return;
      }
      const { data: profile } = await supabase.schema("wr2").from("profiles").select("empresa_id, role, status").eq("id", u.id).single();
      const allowed = ["super_admin", "dono", "financeiro"].includes(profile?.role || "");
      if (!allowed) {
        router.push("/wr2/login?msg=Sem permissão para acessar. Apenas dono ou financeiro.");
        return;
      }
      if (profile?.role !== "super_admin" && profile?.status !== "aprovado") {
        router.push("/wr2/login?msg=Seu cadastro ainda está em análise. Aguarde aprovação.");
        return;
      }
      setUser(u);
      setEmpresaId(profile?.empresa_id || null);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen wr2-panel-bg flex items-center justify-center">
        <p className="text-white/60">Carregando...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <RecibosClient
      user={user}
      empresaId={empresaId}
    />
  );
}
