"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColaboradoresClient } from "./colaboradores-client";
import { createClient } from "@/lib/supabase/client";

export default function ColaboradoresPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao carregar";
        if (msg.includes("NEXT_PUBLIC_SUPABASE")) {
          setConfigError("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local (copie de .env.local.example).");
        } else {
          setConfigError(msg);
        }
      } finally {
        setLoading(false);
      }
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

  if (configError) {
    return (
      <div className="min-h-screen wr2-panel-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-xl bg-white/5 border border-white/10 p-6 text-center">
          <p className="text-amber-400 font-medium mb-2">Configuração necessária</p>
          <p className="text-white/70 text-sm mb-4">{configError}</p>
          <Link href="/wr2" className="text-amber-400 hover:text-amber-300 text-sm font-medium">
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <ColaboradoresClient
      user={user}
      empresaId={empresaId}
    />
  );
}
