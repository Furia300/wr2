"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Users,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  FileText,
  Sun,
  Moon,
  RefreshCw,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface PendingEmpresa {
  id: string;
  cnpj: string;
  nome_responsavel: string;
  funcao: string | null;
  email: string;
  status: string;
  created_at: string;
  motivo_rejeicao: string | null;
}

interface PendingColaborador {
  id: string;
  numero_registro: number;
  nome_completo: string;
  rg: string | null;
  cpf: string | null;
  email: string | null;
  cargo: string | null;
  status: string;
  created_at: string;
  data_admissao: string | null;
  motivo_rejeicao: string | null;
}

const PERM_LABELS: Record<string, string> = {
  can_view_dashboard: "Ver dashboard",
  can_view_colaboradores: "Ver colaboradores",
  can_edit_colaboradores: "Editar colaboradores",
  can_approve_colaboradores: "Aprovar colaboradores",
  can_view_recibos: "Ver recibos",
  can_edit_recibos: "Editar recibos",
  can_view_condominios: "Ver departamentos",
  can_edit_condominios: "Editar departamentos",
  can_approve_empresas: "Aprovar empresas",
  can_view_admin_panel: "Ver painel admin",
};

export function AdminPanelClient({
  user,
  role,
  empresaId,
}: {
  user: User;
  role: string;
  empresaId: string | null;
}) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("wr2-theme") !== "light";
  });
  const [activeTab, setActiveTab] = useState<"empresas" | "colaboradores">(
    role === "super_admin" ? "empresas" : "colaboradores"
  );
  const [empresas, setEmpresas] = useState<PendingEmpresa[]>([]);
  const [colaboradores, setColaboradores] = useState<PendingColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pendente");

  // Modal de rejeicao
  const [rejectModal, setRejectModal] = useState<{ type: "empresa" | "colaborador"; id: string } | null>(null);
  const [rejectMotivo, setRejectMotivo] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Modal de permissoes
  const [permModal, setPermModal] = useState<{ colabId: string; name: string } | null>(null);

  // Stats
  const [stats, setStats] = useState({ pendingEmpresas: 0, pendingColaboradores: 0 });

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/wr2/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  }, []);

  const loadEmpresas = useCallback(async () => {
    try {
      const res = await fetch(`/api/wr2/admin/empresas?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data.empresas || []);
      }
    } catch {}
  }, [statusFilter]);

  const loadColaboradores = useCallback(async () => {
    try {
      const res = await fetch(`/api/wr2/admin/colaboradores?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setColaboradores(data.colaboradores || []);
      }
    } catch {}
  }, [statusFilter]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadEmpresas(), loadColaboradores()]);
      setLoading(false);
    };
    load();
  }, [loadStats, loadEmpresas, loadColaboradores]);

  useEffect(() => {
    localStorage.setItem("wr2-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleAprovarEmpresa = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/wr2/admin/empresas/${id}/aprovar`, { method: "POST" });
      if (res.ok) {
        await Promise.all([loadEmpresas(), loadStats()]);
      }
    } catch {} finally {
      setActionLoading(null);
    }
  };

  const handleAprovarColaborador = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/wr2/admin/colaboradores/${id}/aprovar`, { method: "POST" });
      if (res.ok) {
        await Promise.all([loadColaboradores(), loadStats()]);
      }
    } catch {} finally {
      setActionLoading(null);
    }
  };

  const handleRejeitar = async () => {
    if (!rejectModal) return;
    setRejectLoading(true);
    try {
      const url = rejectModal.type === "empresa"
        ? `/api/wr2/admin/empresas/${rejectModal.id}/rejeitar`
        : `/api/wr2/admin/colaboradores/${rejectModal.id}/rejeitar`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: rejectMotivo || null }),
      });
      if (res.ok) {
        setRejectModal(null);
        setRejectMotivo("");
        await Promise.all([loadEmpresas(), loadColaboradores(), loadStats()]);
      }
    } catch {} finally {
      setRejectLoading(false);
    }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return d; }
  };

  const formatCnpj = (c: string) => {
    const n = c.replace(/\D/g, "");
    if (n.length !== 14) return c;
    return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12)}`;
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pendente: "bg-amber-500/20 text-amber-400",
      aprovado: "bg-green-500/20 text-green-400",
      ativo: "bg-green-500/20 text-green-400",
      rejeitado: "bg-red-500/20 text-red-400",
    };
    return map[s] || "bg-white/10 text-white/60";
  };

  const theme = darkMode ? "wr2-panel-bg" : "bg-gray-100";
  const cardClass = darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200";
  const inputClass = darkMode ? "wr2-input" : "wr2-input-light";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-white/60" : "text-gray-500";
  const textMuted = darkMode ? "text-white/40" : "text-gray-400";

  return (
    <div className={`min-h-screen ${theme}`}>
      {/* Header */}
      <header className={`${darkMode ? "wr2-header" : "bg-white border-b border-gray-200"} flex items-center justify-between px-6 py-4`}>
        <div className="flex items-center gap-4">
          <Link href="/wr2/dashboard" className="flex items-center">
            <img src="/images/logo.png" alt="WR2" className="h-9 w-auto" />
          </Link>
          <ShieldCheck className={`w-5 h-5 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
          <span className={`text-sm font-medium ${textSecondary}`}>Gerenciamento</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10 text-white/60" : "hover:bg-gray-100 text-gray-500"}`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            href="/wr2/dashboard"
            className={`text-sm px-3 py-1.5 rounded-lg ${darkMode ? "text-white/70 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {role === "super_admin" && (
            <div className={`rounded-xl border p-5 ${cardClass}`}>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span className={`text-sm font-medium ${textSecondary}`}>Empresas pendentes</span>
              </div>
              <p className={`text-3xl font-bold ${textPrimary}`}>{stats.pendingEmpresas}</p>
            </div>
          )}
          <div className={`rounded-xl border p-5 ${cardClass}`}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span className={`text-sm font-medium ${textSecondary}`}>Colaboradores pendentes</span>
            </div>
            <p className={`text-3xl font-bold ${textPrimary}`}>{stats.pendingColaboradores}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6">
          {role === "super_admin" && (
            <button
              onClick={() => setActiveTab("empresas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "empresas"
                  ? "bg-amber-500/20 text-amber-400"
                  : `${darkMode ? "text-white/50 hover:text-white/80 hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Empresas
              {stats.pendingEmpresas > 0 && (
                <span className="ml-2 bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingEmpresas}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab("colaboradores")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "colaboradores"
                ? "bg-amber-500/20 text-amber-400"
                : `${darkMode ? "text-white/50 hover:text-white/80 hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Colaboradores
            {stats.pendingColaboradores > 0 && (
              <span className="ml-2 bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {stats.pendingColaboradores}
              </span>
            )}
          </button>

          {/* Filtro de status */}
          <div className="ml-auto flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`text-sm rounded-lg px-3 py-1.5 border ${
                darkMode
                  ? "bg-white/5 border-white/10 text-white/80"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              <option value="pendente">Pendentes</option>
              <option value="all">Todos</option>
              <option value="aprovado">Aprovados</option>
              <option value="ativo">Ativos</option>
              <option value="rejeitado">Rejeitados</option>
            </select>
            <button
              onClick={() => {
                loadEmpresas();
                loadColaboradores();
                loadStats();
              }}
              className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10 text-white/50" : "hover:bg-gray-100 text-gray-400"}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className={textSecondary}>Carregando...</p>
          </div>
        ) : (
          <>
            {/* ====== EMPRESAS ====== */}
            {activeTab === "empresas" && role === "super_admin" && (
              <div className={`rounded-xl border overflow-hidden ${cardClass}`}>
                <div className={`px-6 py-4 border-b ${darkMode ? "border-white/10" : "border-gray-100"}`}>
                  <h2 className={`text-lg font-semibold ${textPrimary}`}>
                    Empresas {statusFilter === "pendente" ? "pendentes" : ""}
                  </h2>
                </div>

                {empresas.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Building2 className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
                    <p className={textSecondary}>Nenhuma empresa {statusFilter === "pendente" ? "pendente" : ""} encontrada.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={darkMode ? "border-b border-white/10" : "border-b border-gray-100"}>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>CNPJ</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Responsável</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Email</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Função</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Data</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Status</th>
                          <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empresas.map((emp) => (
                          <tr key={emp.id} className={`${darkMode ? "border-b border-white/5 hover:bg-white/5" : "border-b border-gray-50 hover:bg-gray-50"} transition-colors`}>
                            <td className={`px-6 py-4 text-sm font-mono ${textPrimary}`}>{formatCnpj(emp.cnpj)}</td>
                            <td className={`px-6 py-4 text-sm ${textPrimary}`}>{emp.nome_responsavel}</td>
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>{emp.email}</td>
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>{emp.funcao || "—"}</td>
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>{formatDate(emp.created_at)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(emp.status)}`}>
                                {emp.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {emp.status === "pendente" && (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleAprovarEmpresa(emp.id)}
                                    disabled={actionLoading === emp.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => setRejectModal({ type: "empresa", id: emp.id })}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Rejeitar
                                  </button>
                                </div>
                              )}
                              {emp.status === "rejeitado" && emp.motivo_rejeicao && (
                                <span className={`text-xs ${textMuted}`}>Motivo: {emp.motivo_rejeicao}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ====== COLABORADORES ====== */}
            {activeTab === "colaboradores" && (
              <div className={`rounded-xl border overflow-hidden ${cardClass}`}>
                <div className={`px-6 py-4 border-b ${darkMode ? "border-white/10" : "border-gray-100"}`}>
                  <h2 className={`text-lg font-semibold ${textPrimary}`}>
                    Colaboradores {statusFilter === "pendente" ? "pendentes" : ""}
                  </h2>
                </div>

                {colaboradores.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Users className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
                    <p className={textSecondary}>Nenhum colaborador {statusFilter === "pendente" ? "pendente" : ""} encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={darkMode ? "border-b border-white/10" : "border-b border-gray-100"}>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>N°</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Nome</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Email</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Cargo</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Data</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Status</th>
                          <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${textSecondary}`}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {colaboradores.map((col) => (
                          <tr key={col.id} className={`${darkMode ? "border-b border-white/5 hover:bg-white/5" : "border-b border-gray-50 hover:bg-gray-50"} transition-colors`}>
                            <td className={`px-6 py-4 text-sm font-mono ${textSecondary}`}>{col.numero_registro}</td>
                            <td className={`px-6 py-4 text-sm font-medium ${textPrimary}`}>{col.nome_completo}</td>
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>{col.email || "—"}</td>
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>{col.cargo || "—"}</td>
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>{formatDate(col.created_at)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(col.status)}`}>
                                {col.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {col.status === "pendente" && (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleAprovarColaborador(col.id)}
                                    disabled={actionLoading === col.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => setRejectModal({ type: "colaborador", id: col.id })}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Rejeitar
                                  </button>
                                </div>
                              )}
                              {col.status === "rejeitado" && col.motivo_rejeicao && (
                                <span className={`text-xs ${textMuted}`}>Motivo: {col.motivo_rejeicao}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Rejeicao */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-xl border p-6 ${darkMode ? "bg-[#0d0d0d] border-white/10" : "bg-white border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
              Rejeitar {rejectModal.type === "empresa" ? "empresa" : "colaborador"}
            </h3>
            <div className="mb-4">
              <label className={`text-sm mb-1 block ${textSecondary}`}>Motivo (opcional)</label>
              <textarea
                value={rejectMotivo}
                onChange={(e) => setRejectMotivo(e.target.value)}
                rows={3}
                className={`w-full rounded-lg px-3 py-2 text-sm border ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                }`}
                placeholder="Informe o motivo da rejeição..."
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectMotivo(""); }}
                className={`px-4 py-2 rounded-lg text-sm ${darkMode ? "text-white/60 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleRejeitar}
                disabled={rejectLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
              >
                {rejectLoading ? "Rejeitando..." : "Confirmar rejeição"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
