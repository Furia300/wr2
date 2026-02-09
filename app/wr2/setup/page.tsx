"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetupSuperAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [canSetup, setCanSetup] = useState<boolean | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/wr2/setup/check");
        const data = await res.json();
        setCanSetup(data.allowed === true);
        if (data.error) setSetupError(data.error);
      } catch {
        setCanSetup(false);
      }
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wr2/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar super admin.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (canSetup === null) {
    return (
      <div className="min-h-screen wr2-panel-bg flex items-center justify-center">
        <p className="text-white/60">Verificando...</p>
      </div>
    );
  }

  if (canSetup === false) {
    return (
      <div className="min-h-screen wr2-panel-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {setupError ? (
            <p className="text-amber-400 mb-4">{setupError}</p>
          ) : (
            <p className="text-white/80 mb-4">O super admin já foi criado. Use a tela de login para entrar.</p>
          )}
          <Link href="/wr2/login" className="text-amber-400 hover:text-amber-300 font-medium">
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen wr2-panel-bg flex flex-col">
      <header className="wr2-header">
        <Link href="/" className="wr2-logo">
          <img src="/images/logo.png" alt="WR2 Serviços" className="h-10 w-auto" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <p className="wr2-welcome-badge mb-4">Configuração inicial</p>
          <h1 className="wr2-welcome-title mb-2">Criar Super Admin</h1>
          <p className="wr2-welcome-subtitle mb-8">
            Crie a primeira conta com acesso total. Passe estas credenciais ao dono da empresa; ele poderá alterar a senha no painel.
          </p>

          {success ? (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-6 text-center">
              <p className="text-green-400 font-medium mb-2">Super admin criado com sucesso.</p>
              <p className="text-white/70 text-sm mb-4">
                Use o email e a senha informados para entrar. No painel, altere a senha em &quot;Alterar senha&quot;.
              </p>
              <Link href="/wr2/login" className="wr2-cta inline-flex">
                Ir para Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="wr2-form">
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
                  placeholder="admin@empresa.com"
                />
              </div>
              <div className="wr2-form-field">
                <label htmlFor="password" className="text-white/80">Senha (mín. 6 caracteres)</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="wr2-input"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="wr2-cta w-full max-w-none disabled:opacity-60">
                {loading ? "Criando..." : "Criar Super Admin"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
