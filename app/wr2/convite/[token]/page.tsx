"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ConviteColaboradorPage() {
  const params = useParams();
  const token = params?.token as string;
  const [status, setStatus] = useState<"loading" | "invalid" | "valid" | "success">("loading");
  const [condominios, setCondominios] = useState<{ id: string; nome: string }[]>([]);
  const [form, setForm] = useState({
    nome_completo: "",
    rg: "",
    cpf: "",
    email: "",
    cargo: "",
    data_admissao: "",
    condominio_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch(`/api/wr2/convite/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setStatus("valid");
          setCondominios(data.condominios || []);
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/wr2/convite/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nome_completo: form.nome_completo.trim(),
          rg: form.rg.trim() || undefined,
          cpf: form.cpf.replace(/\D/g, "") || undefined,
          email: form.email.trim() || undefined,
          cargo: form.cargo.trim() || undefined,
          data_admissao: form.data_admissao || undefined,
          condominio_id: form.condominio_id || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar.");
        return;
      }
      setStatus("success");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen wr2-panel-bg flex items-center justify-center">
        <p className="text-white/60">Carregando...</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen wr2-panel-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-white/80 mb-4">Link inválido, expirado ou já utilizado.</p>
          <Link href="/wr2" className="text-amber-400 hover:text-amber-300 font-medium">Voltar</Link>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen wr2-panel-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-xl bg-amber-500/10 border border-amber-500/20 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-amber-400 font-medium text-lg mb-2">Cadastro em análise</p>
          <p className="text-white/70 text-sm">
            Seu cadastro foi recebido e está aguardando aprovação do responsável da empresa.
            Você será notificado quando sua conta for liberada.
          </p>
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
          <p className="wr2-welcome-badge mb-4">Cadastro de colaborador</p>
          <h1 className="wr2-welcome-title mb-2">Preencha seus dados</h1>
          <p className="wr2-welcome-subtitle mb-8">
            Você foi convidado a se cadastrar. Preencha o formulário abaixo.
          </p>

          <form onSubmit={handleSubmit} className="wr2-form">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="wr2-form-field">
              <label className="text-white/80">Nome completo *</label>
              <input
                required
                value={form.nome_completo}
                onChange={(e) => setForm((f) => ({ ...f, nome_completo: e.target.value }))}
                className="wr2-input"
                placeholder="Nome completo"
              />
            </div>
            <div className="wr2-form-field">
              <label className="text-white/80">RG</label>
              <input
                value={form.rg}
                onChange={(e) => setForm((f) => ({ ...f, rg: e.target.value }))}
                className="wr2-input"
                placeholder="RG"
              />
            </div>
            <div className="wr2-form-field">
              <label className="text-white/80">CPF</label>
              <input
                value={form.cpf}
                onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                className="wr2-input"
                placeholder="000.000.000-00"
              />
            </div>
            <div className="wr2-form-field">
              <label className="text-white/80">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="wr2-input"
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="wr2-form-field">
              <label className="text-white/80">Cargo</label>
              <input
                value={form.cargo}
                onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                className="wr2-input"
                placeholder="Ex: Auxiliar"
              />
            </div>
            {condominios.length > 0 && (
              <div className="wr2-form-field">
                <label className="text-white/80">Departamento</label>
                <select
                  value={form.condominio_id}
                  onChange={(e) => setForm((f) => ({ ...f, condominio_id: e.target.value }))}
                  className="wr2-input"
                >
                  <option value="">Selecione</option>
                  {condominios.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="wr2-form-field">
              <label className="text-white/80">Data admissão</label>
              <input
                type="date"
                value={form.data_admissao}
                onChange={(e) => setForm((f) => ({ ...f, data_admissao: e.target.value }))}
                className="wr2-input"
              />
            </div>
            <button type="submit" disabled={loading} className="wr2-cta w-full max-w-none disabled:opacity-60">
              {loading ? "Enviando..." : "Concluir cadastro"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
