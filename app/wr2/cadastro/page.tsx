"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroEmpresaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    cnpj: "",
    nomeResponsavel: "",
    funcao: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    if (form.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { data: empData, error: empErr } = await supabase
        .schema("wr2")
        .from("empresas")
        .insert({
          cnpj: form.cnpj.replace(/\D/g, ""),
          nome_responsavel: form.nomeResponsavel,
          funcao: form.funcao || null,
          email: form.email,
        })
        .select("id")
        .single();

      if (empErr) {
        setError(empErr.message);
        setLoading(false);
        return;
      }

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          data: {
            empresa_id: empData?.id,
            cnpj: form.cnpj,
            nome_responsavel: form.nomeResponsavel,
            funcao: form.funcao,
          },
          emailRedirectTo: `${window.location.origin}/wr2/dashboard`,
        },
      });

      if (authErr) {
        setError(authErr.message);
        setLoading(false);
        return;
      }

      if (authData?.user) {
        await supabase.schema("wr2").from("profiles").upsert({
          id: authData.user.id,
          email: authData.user.email,
          empresa_id: empData?.id,
          cnpj: form.cnpj,
          nome_responsavel: form.nomeResponsavel,
          funcao: form.funcao,
          role: "dono",
          status: "pendente",
        });
      }

      setSubmitted(true);
    } catch {
      setError("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col wr2-panel-bg">
      <header className="wr2-header">
        <Link href="/wr2" className="wr2-logo">
          <img src="/images/logo.png" alt="WR2 Serviços" className="h-10 w-auto" />
        </Link>
        <Link href="/wr2/login" className="wr2-login-btn" style={{ padding: "0.6rem 1.25rem" }}>
          Já tem conta? <strong>Log in</strong>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pt-[35px] pb-[35px] mt-[35px] mb-[35px]">
        <div className="w-full max-w-lg pt-[30px] pb-[30px]">
          {submitted ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-amber-400 font-medium text-lg mb-2">Cadastro realizado com sucesso!</p>
              <p className="text-white/70 text-sm mb-6">
                Seu cadastro está em análise. Aguarde a aprovação do administrador para acessar o painel.
                Você receberá uma notificação quando sua conta for liberada.
              </p>
              <Link href="/wr2/login" className="wr2-cta inline-flex">
                Voltar ao login
              </Link>
            </div>
          ) : (
          <>
          <p className="wr2-welcome-badge mb-4">Cadastro de empresa</p>
          <h1 className="wr2-welcome-title mb-2">Complete seu cadastro</h1>
          <p className="wr2-welcome-subtitle mb-8">
            Preencha os dados da sua empresa para acessar o painel.
          </p>

          <form onSubmit={handleSubmit} className="wr2-form">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="wr2-form-field">
              <label className="text-white/80">CNPJ</label>
              <input
                name="cnpj"
                type="text"
                value={form.cnpj}
                onChange={handleChange}
                required
                className="wr2-input"
                placeholder="00.000.000/0001-00"
              />
            </div>

            <div className="wr2-form-field">
              <label className="text-white/80">Nome do responsável</label>
              <input
                name="nomeResponsavel"
                type="text"
                value={form.nomeResponsavel}
                onChange={handleChange}
                required
                className="wr2-input"
                placeholder="Nome completo"
              />
            </div>

            <div className="wr2-form-field">
              <label className="text-white/80">Função</label>
              <input
                name="funcao"
                type="text"
                value={form.funcao}
                onChange={handleChange}
                className="wr2-input"
                placeholder="Ex: Administrador, Gerente"
              />
            </div>

            <div className="wr2-form-field">
              <label className="text-white/80">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="wr2-input"
                placeholder="seu@email.com"
              />
            </div>

            <div className="wr2-form-field">
              <label className="text-white/80">Senha</label>
              <input
                name="senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                required
                minLength={6}
                className="wr2-input"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="wr2-form-field">
              <label className="text-white/80">Confirmar senha</label>
              <input
                name="confirmarSenha"
                type="password"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
                minLength={6}
                className="wr2-input"
                placeholder="Repita a senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="wr2-cta w-full max-w-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Cadastrando..." : "Cadastrar empresa"}
            </button>
          </form>
          </>
          )}
        </div>
      </main>
    </div>
  );
}
