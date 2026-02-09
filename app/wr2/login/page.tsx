"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const msg = searchParams.get("msg");
    if (msg) setError(decodeURIComponent(msg));
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const msg =
          error.message?.toLowerCase().includes("invalid") ||
          error.message?.toLowerCase().includes("credentials") ||
          error.status === 400
            ? "Email ou senha incorretos. Se ainda não criou o Super Admin, acesse /wr2/setup primeiro."
            : error.message;
        setError(msg);
        setLoading(false);
        return;
      }

      // Verificar status do perfil
      if (authData?.user) {
        const { data: profile } = await supabase
          .schema("wr2")
          .from("profiles")
          .select("status, role")
          .eq("id", authData.user.id)
          .single();

        if (profile?.role !== "super_admin" && profile?.status !== "aprovado") {
          await supabase.auth.signOut();
          setError("Seu cadastro ainda está em análise. Aguarde a aprovação do administrador para acessar o painel.");
          setLoading(false);
          return;
        }
      }

      router.push("/wr2/dashboard");
      router.refresh();
    } catch {
      setError("Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="wr2-welcome-badge mb-4">Acesso</p>
      <h1 className="wr2-welcome-title mb-2">Entrar</h1>
      <p className="wr2-welcome-subtitle mb-8">
        Acesse o painel com seu email e senha.
      </p>

      <form onSubmit={handleLogin} className="wr2-form">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="wr2-form-field">
          <label htmlFor="email" className="text-white/80">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="wr2-input"
            placeholder="seu@email.com"
          />
        </div>

        <div className="wr2-form-field">
          <label htmlFor="password" className="text-white/80">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="wr2-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="wr2-cta w-full max-w-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-[10px] mb-[10px] pt-[25px] pb-[25px] text-center text-sm text-white/50">
        Ainda não tem conta?{" "}
        <Link href="/wr2/cadastro" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
          Cadastre-se
        </Link>
      </p>
      <p className="text-center text-xs text-white/40 mt-2 pt-3">
        <Link href="/wr2/setup" className="hover:text-amber-400/80">Primeira vez? Criar Super Admin</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col wr2-panel-bg">
      <header className="wr2-header">
        <Link href="/" className="wr2-logo">
          <img src="/images/logo.png" alt="WR2 Serviços" className="h-10 w-auto" />
        </Link>
        <Link href="/wr2" className="wr2-login-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
          ← Voltar
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<p className="text-white/60 text-center">Carregando...</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
