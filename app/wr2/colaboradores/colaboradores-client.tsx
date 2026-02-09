"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Search,
  ChevronDown,
  Pencil,
  Trash2,
  ChevronUp,
  Plus,
  FileText,
  Calendar,
  Link2,
  Copy,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Condominio {
  id: string;
  nome: string;
}

interface Colaborador {
  id: string;
  numero_registro: number;
  nome_completo: string;
  rg: string | null;
  cpf: string | null;
  email: string | null;
  cargo: string | null;
  data_admissao: string | null;
  status: string;
  condominio: { nome: string } | null;
}

interface Recibo {
  id: string;
  cod: string;
  descricao: string;
  qtds: number;
  data_inicio: string;
  data_final: string;
  valor_total: number;
}

export function ColaboradoresClient({
  user,
  empresaId,
}: {
  user: User;
  empresaId: string | null;
}) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("wr2-theme") !== "light";
  });
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [modalColab, setModalColab] = useState<Colaborador | null>(null);
  const [filtros, setFiltros] = useState({
    registro: "",
    nome: "",
    cargo: "",
    departamento: "",
    dataInicio: "",
    dataFinal: "",
    valeRefeicao: "",
    cestaBasica: "",
    beneficios: "",
  });
  const [form, setForm] = useState({
    nome_completo: "",
    rg: "",
    cpf: "",
    email: "",
    cargo: "",
    departamento: "",
    data_admissao: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!empresaId) return;
    const loadCondominios = async () => {
      const { data } = await supabase.schema("wr2").from("condominios").select("id, nome").eq("empresa_id", empresaId);
      setCondominios(data || []);
    };
    loadCondominios();
  }, [empresaId]);

  useEffect(() => {
    if (!empresaId) return;
    const loadColaboradores = async () => {
      let q = supabase.schema("wr2").from("colaboradores").select(`
        id, numero_registro, nome_completo, rg, cpf, email, cargo, data_admissao, status,
        condominio:condominios(nome)
      `).eq("empresa_id", empresaId).order("numero_registro", { ascending: false });
      if (filtros.nome) q = q.ilike("nome_completo", `%${filtros.nome}%`);
      if (filtros.cargo) q = q.ilike("cargo", `%${filtros.cargo}%`);
      if (filtros.departamento) q = q.eq("condominio_id", filtros.departamento);
      const { data } = await q;
      setColaboradores(data || []);
    };
    loadColaboradores();
  }, [empresaId, filtros.nome, filtros.cargo, filtros.departamento]);

  const openModal = async (colab: Colaborador) => {
    setModalColab(colab);
    const { data } = await supabase.schema("wr2").from("recibos").select(`
      id, tipo_cod, descricao, qtds, data_inicio, data_final, valor_total
    `).eq("colaborador_id", colab.id).order("data_inicio", { ascending: false });
    setRecibos(data || []);
  };

  const handleSubmitColab = async (e: React.FormEvent) => {
    e.preventDefault();
    const condId = form.departamento || null;
    const { error } = await supabase.schema("wr2").from("colaboradores").insert({
      empresa_id: empresaId,
      condominio_id: condId,
      nome_completo: form.nome_completo,
      rg: form.rg || null,
      cpf: form.cpf || null,
      email: form.email || null,
      cargo: form.cargo || null,
      data_admissao: form.data_admissao || null,
      status: "pendente",
    });
    if (!error) {
      setForm({ nome_completo: "", rg: "", cpf: "", email: "", cargo: "", departamento: "", data_admissao: "" });
      setShowForm(false);
      const { data } = await supabase.schema("wr2").from("colaboradores").select().eq("empresa_id", empresaId!).order("numero_registro", { ascending: false });
      setColaboradores(data || []);
    }
  };

  const totalRecibos = colaboradores.reduce((acc, c) => acc + 0, 0);

  const theme = darkMode ? "wr2-panel-bg" : "bg-gray-100";
  const cardClass = darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200";
  const inputClass = darkMode ? "wr2-input" : "wr2-input-light";

  return (
    <div className={`min-h-screen ${theme}`}>
      <header className={`${darkMode ? "wr2-header" : "bg-white border-gray-200"} flex items-center justify-between px-6 py-4`}>
        <div className="flex items-center gap-4">
          <Link href="/wr2/dashboard" className="flex items-center">
            <img src="/images/logo.png" alt="WR2" className="h-9 w-auto" />
          </Link>
          <span className={`text-sm font-medium ${darkMode ? "text-white/60" : "text-gray-600"}`}>Colaboradores</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const next = !darkMode;
              setDarkMode(next);
              localStorage.setItem("wr2-theme", next ? "dark" : "light");
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${darkMode ? "bg-white/10 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {darkMode ? "☀️ Claro" : "🌙 Escuro"}
          </button>
          <Link href="/wr2/dashboard" className={`text-sm ${darkMode ? "text-white/80" : "text-gray-600"}`}>Dashboard</Link>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Filtros */}
        <div className={`rounded-xl p-5 mb-6 ${darkMode ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200"}`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>FILTROS</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>N° Registro</label>
              <input
                value={filtros.registro}
                onChange={(e) => setFiltros((f) => ({ ...f, registro: e.target.value }))}
                className={inputClass}
                placeholder="N°"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>Nome</label>
              <input
                value={filtros.nome}
                onChange={(e) => setFiltros((f) => ({ ...f, nome: e.target.value }))}
                className={inputClass}
                placeholder="Nome do colaborador"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>Cargo</label>
              <input
                value={filtros.cargo}
                onChange={(e) => setFiltros((f) => ({ ...f, cargo: e.target.value }))}
                className={inputClass}
                placeholder="Cargo"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>Departamento</label>
              <select
                value={filtros.departamento}
                onChange={(e) => setFiltros((f) => ({ ...f, departamento: e.target.value }))}
                className={inputClass}
              >
                <option value="">Todos</option>
                {condominios.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>Data Início</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros((f) => ({ ...f, dataInicio: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>Data Final</label>
              <input
                type="date"
                value={filtros.dataFinal}
                onChange={(e) => setFiltros((f) => ({ ...f, dataFinal: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Botão adicionar + Form + Link de convite */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="wr2-cta inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar colaborador
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!empresaId) return;
                setGeneratingInvite(true);
                setInviteUrl(null);
                try {
                  const res = await fetch("/api/wr2/convites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ empresa_id: empresaId }) });
                  const data = await res.json();
                  if (data.url) setInviteUrl(data.url);
                  else alert(data.error || "Erro ao gerar link.");
                } catch {
                  alert("Erro ao gerar link.");
                } finally {
                  setGeneratingInvite(false);
                }
              }}
              disabled={generatingInvite || !empresaId}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${darkMode ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10" : "border-amber-500/50 text-amber-600 hover:bg-amber-50"}`}
            >
              <Link2 className="w-4 h-4" /> {generatingInvite ? "Gerando..." : "Gerar link de convite"}
            </button>
          </div>
          {inviteUrl && (
            <div className={`mb-4 p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
              <p className={`text-sm font-medium mb-2 ${darkMode ? "text-white/80" : "text-gray-700"}`}>Envie este link para o colaborador se cadastrar (válido por 7 dias):</p>
              <div className="flex gap-2">
                <input readOnly value={inviteUrl} className={`flex-1 px-3 py-2 rounded-lg text-sm ${darkMode ? "bg-black/20 text-white" : "bg-white border border-gray-200"}`} />
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(inviteUrl); alert("Link copiado!"); }}
                  className={`p-2 rounded-lg ${darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"}`}
                  title="Copiar"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          {showForm && (
            <form onSubmit={handleSubmitColab} className={`mt-4 rounded-xl p-6 ${cardClass} border`}>
              <h4 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Novo colaborador</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.9rem]">
                <div className="wr2-form-field">
                  <label className={darkMode ? "text-white/70" : "text-gray-600"}>Nome completo</label>
                  <input
                    required
                    value={form.nome_completo}
                    onChange={(e) => setForm((f) => ({ ...f, nome_completo: e.target.value }))}
                    className={inputClass}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="wr2-form-field">
                  <label className={darkMode ? "text-white/70" : "text-gray-600"}>RG</label>
                  <input
                    value={form.rg}
                    onChange={(e) => setForm((f) => ({ ...f, rg: e.target.value }))}
                    className={inputClass}
                    placeholder="RG"
                  />
                </div>
                <div className="wr2-form-field">
                  <label className={darkMode ? "text-white/70" : "text-gray-600"}>CPF</label>
                  <input
                    value={form.cpf}
                    onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                    className={inputClass}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="wr2-form-field">
                  <label className={darkMode ? "text-white/70" : "text-gray-600"}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputClass}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="wr2-form-field">
                  <label className={darkMode ? "text-white/70" : "text-gray-600"}>Cargo</label>
                  <input
                    value={form.cargo}
                    onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                    className={inputClass}
                    placeholder="Ex: Supervisor"
                  />
                </div>
                <div className="wr2-form-field">
                  <label className={darkMode ? "text-white/70" : "text-gray-600"}>Departamento (Condomínio)</label>
                  <select
                    value={form.departamento}
                    onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Selecione</option>
                    {condominios.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="wr2-form-field">
                  <label className={darkMode ? "text-white/70" : "text-gray-600"}>Data admissão</label>
                  <input
                    type="date"
                    value={form.data_admissao}
                    onChange={(e) => setForm((f) => ({ ...f, data_admissao: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="wr2-cta">Salvar</button>
                <button type="button" onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg ${darkMode ? "bg-white/10 text-white" : "bg-gray-200 text-gray-700"}`}>Cancelar</button>
              </div>
            </form>
          )}
        </div>

        {/* Tabela */}
        <div className={`rounded-xl overflow-hidden border ${darkMode ? "border-white/10" : "border-gray-200"}`}>
          <div className={`overflow-x-auto ${darkMode ? "bg-[#0a0b0d]" : "bg-white"}`}>
            <table className="w-full">
              <thead>
                <tr className={darkMode ? "bg-amber-500/10" : "bg-gray-50"}>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}></th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>N°</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Colaborador</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Cargo</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Departamento</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Data Admissão</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Status</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}></th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-t ${darkMode ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded text-blue-500 hover:bg-blue-500/20"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded text-red-500 hover:bg-red-500/20 ml-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{c.numero_registro}</td>
                    <td className={`px-4 py-3 font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{c.nome_completo}</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/70" : "text-gray-600"}`}>{c.cargo || "-"}</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/70" : "text-gray-600"}`}>{(c as any).condominio?.nome || "-"}</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/70" : "text-gray-600"}`}>{c.data_admissao ? new Date(c.data_admissao).toLocaleDateString("pt-BR") : "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.status === "ativo" ? "bg-green-500/20 text-green-400" :
                        c.status === "pendente" ? "bg-amber-500/20 text-amber-400" :
                        c.status === "rejeitado" ? "bg-red-500/20 text-red-400" :
                        "bg-white/10 text-white/60"
                      }`}>
                        {c.status || "ativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal(c)}
                        className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                        title="Ver recibos"
                      >
                        <ChevronUp className="w-5 h-5 rotate-180" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Recibos */}
      {modalColab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModalColab(null)}>
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl p-6 ${darkMode ? "bg-[#0a0b0d] border border-white/10" : "bg-white border border-gray-200"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Recibos - {modalColab.nome_completo}</h3>
              <button onClick={() => setModalColab(null)} className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"} ${darkMode ? "text-white" : "text-gray-600"}`}>✕</button>
            </div>
            <div className={`rounded-xl border overflow-hidden mb-4 ${darkMode ? "border-white/10" : "border-gray-200"}`}>
              <table className="w-full">
                <thead>
                  <tr className={darkMode ? "bg-white/5" : "bg-gray-50"}>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>COD</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>Descrição</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>QTDS</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>Data Início</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>Data Final</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recibos.length === 0 ? (
                    <tr><td colSpan={6} className={`px-4 py-8 text-center ${darkMode ? "text-white/50" : "text-gray-500"}`}>Nenhum recibo cadastrado</td></tr>
                  ) : (
                    recibos.map((r) => (
                      <tr key={r.id} className={`border-t ${darkMode ? "border-white/5" : "border-gray-100"}`}>
                        <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{(r as any).tipo_cod || r.cod}</td>
                        <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{(r as any).descricao || r.descricao || "-"}</td>
                        <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{r.qtds}</td>
                        <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{r.data_inicio}</td>
                        <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{r.data_final}</td>
                        <td className={`px-4 py-2 font-medium ${darkMode ? "text-amber-400" : "text-amber-600"}`}>R$ {Number(r.valor_total).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className={`text-right font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              TOTAL: R$ {recibos.reduce((s, r) => s + Number(r.valor_total), 0).toLocaleString("pt-BR")}
            </div>
            <div className="flex gap-2 mt-6">
              <button className="wr2-cta inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar recibo
              </button>
              <button className={`px-4 py-2 rounded-xl border ${darkMode ? "border-amber-500/50 text-amber-400" : "border-amber-500 text-amber-600"}`}>
                <FileText className="w-4 h-4 inline mr-2" /> PDF Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
