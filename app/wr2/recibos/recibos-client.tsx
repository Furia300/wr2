"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FileText, ChevronUp, Plus, Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface ReciboRow {
  colaborador_id: string;
  colaborador_nome: string;
  colaborador_registro: number;
  recibo_id: string;
  tipo_cod: string;
  descricao: string;
  qtds: number;
  data_inicio: string;
  data_final: string;
  valor_total: number;
}

export function RecibosClient({
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
  const [recibos, setRecibos] = useState<ReciboRow[]>([]);
  const [modalColab, setModalColab] = useState<string | null>(null);
  const [recibosModal, setRecibosModal] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFinal: "",
    valeRefeicao: "",
    cestaBasica: "",
    beneficios: "",
  });

  const supabase = createClient();

  useEffect(() => {
    if (!empresaId) return;
    const load = async () => {
      const { data: cols } = await supabase.schema("wr2").from("colaboradores").select("id, nome_completo, numero_registro").eq("empresa_id", empresaId);
      const colIds = (cols || []).map((c) => c.id);
      if (colIds.length === 0) {
        setRecibos([]);
        return;
      }
      const { data } = await supabase.schema("wr2")
        .from("recibos")
        .select("id, tipo_cod, descricao, qtds, data_inicio, data_final, valor_total, colaborador_id")
        .in("colaborador_id", colIds)
        .order("data_inicio", { ascending: false });
      const colMap = new Map((cols || []).map((c) => [c.id, c]));
      if (data) {
        setRecibos(data.map((r: any) => {
          const col = colMap.get(r.colaborador_id);
          return {
            colaborador_id: r.colaborador_id,
            colaborador_nome: col?.nome_completo || "-",
            colaborador_registro: col?.numero_registro || 0,
            recibo_id: r.id,
            tipo_cod: r.tipo_cod,
            descricao: r.descricao || "-",
            qtds: r.qtds,
            data_inicio: r.data_inicio,
            data_final: r.data_final,
            valor_total: r.valor_total,
          };
        }));
      }
    };
    load();
  }, [empresaId]);

  const openModal = async (colabId: string) => {
    setModalColab(colabId);
    const { data } = await supabase.schema("wr2").from("recibos").select("*").eq("colaborador_id", colabId).order("data_inicio", { ascending: false });
    setRecibosModal(data || []);
  };

  const totalValeRefeicao = recibos.filter((r) => r.tipo_cod === "0001").reduce((s, r) => s + Number(r.valor_total), 0);
  const totalCestaBasica = recibos.filter((r) => r.tipo_cod === "0002").reduce((s, r) => s + Number(r.valor_total), 0);
  const totalGratificacao = recibos.filter((r) => r.tipo_cod === "0003").reduce((s, r) => s + Number(r.valor_total), 0);
  const totalBeneficios = recibos.filter((r) => r.tipo_cod === "0004").reduce((s, r) => s + Number(r.valor_total), 0);
  const totalGeral = recibos.reduce((s, r) => s + Number(r.valor_total), 0);

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
          <span className={`text-sm font-medium ${darkMode ? "text-white/60" : "text-gray-600"}`}>Recibos</span>
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
          <Link href="/wr2/colaboradores" className={`text-sm ${darkMode ? "text-white/80" : "text-gray-600"}`}>Colaboradores</Link>
          <Link href="/wr2/dashboard" className={`text-sm ${darkMode ? "text-white/80" : "text-gray-600"}`}>Dashboard</Link>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Cards de totais */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Vale Refeição", value: totalValeRefeicao },
            { label: "Cesta Básica", value: totalCestaBasica },
            { label: "Gratificação", value: totalGratificacao },
            { label: "Benefícios", value: totalBeneficios },
            { label: "Total Geral", value: totalGeral },
          ].map((card) => (
            <div key={card.label} className={`rounded-xl p-5 border ${cardClass}`}>
              <p className={`text-xs font-semibold uppercase mb-2 ${darkMode ? "text-white/60" : "text-gray-500"}`}>{card.label}</p>
              <p className={`text-xl font-bold ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
                R$ {Number(card.value).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className={`rounded-xl p-5 mb-6 ${cardClass} border`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>FILTROS</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>Vale Refeição</label>
              <input
                value={filtros.valeRefeicao}
                onChange={(e) => setFiltros((f) => ({ ...f, valeRefeicao: e.target.value }))}
                className={inputClass}
                placeholder="Valor"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>Cesta Básica</label>
              <input
                value={filtros.cestaBasica}
                onChange={(e) => setFiltros((f) => ({ ...f, cestaBasica: e.target.value }))}
                className={inputClass}
                placeholder="Valor"
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-white/60" : "text-gray-500"}`}>Benefícios</label>
              <input
                value={filtros.beneficios}
                onChange={(e) => setFiltros((f) => ({ ...f, beneficios: e.target.value }))}
                className={inputClass}
                placeholder="Valor"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className={`rounded-xl overflow-hidden border ${darkMode ? "border-white/10" : "border-gray-200"}`}>
          <div className={`overflow-x-auto ${darkMode ? "bg-[#0a0b0d]" : "bg-white"}`}>
            <table className="w-full">
              <thead>
                <tr className={darkMode ? "bg-amber-500/10" : "bg-gray-50"}>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}></th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>N° Registro</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Colaborador</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Código</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Descrição</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Data Início</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Data Final</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? "text-amber-400" : "text-gray-600"}`}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {recibos.length === 0 ? (
                  <tr><td colSpan={8} className={`px-4 py-12 text-center ${darkMode ? "text-white/50" : "text-gray-500"}`}>Nenhum recibo cadastrado</td></tr>
                ) : (
                  recibos.map((r) => (
                    <tr
                      key={r.recibo_id}
                      className={`border-t ${darkMode ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openModal(r.colaborador_id)}
                          className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                          title="Ver recibos do colaborador"
                        >
                          <ChevronUp className="w-5 h-5 rotate-180" />
                        </button>
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{r.colaborador_registro}</td>
                      <td className={`px-4 py-3 font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{r.colaborador_nome}</td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/70" : "text-gray-600"}`}>{r.tipo_cod}</td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/70" : "text-gray-600"}`}>{r.descricao}</td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/70" : "text-gray-600"}`}>{r.data_inicio}</td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? "text-white/70" : "text-gray-600"}`}>{r.data_final}</td>
                      <td className={`px-4 py-3 font-medium ${darkMode ? "text-amber-400" : "text-amber-600"}`}>R$ {Number(r.valor_total).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalColab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModalColab(null)}>
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl p-6 ${darkMode ? "bg-[#0a0b0d] border border-white/10" : "bg-white border border-gray-200"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Recibos do colaborador</h3>
              <button onClick={() => setModalColab(null)} className={`p-2 rounded-lg hover:bg-white/10 ${darkMode ? "text-white" : "text-gray-600"}`}>✕</button>
            </div>
            <div className={`rounded-xl border overflow-hidden ${darkMode ? "border-white/10" : "border-gray-200"}`}>
              <table className="w-full">
                <thead>
                  <tr className={darkMode ? "bg-white/5" : "bg-gray-50"}>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>COD</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>Descrição</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>Data Início</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>Data Final</th>
                    <th className={`px-4 py-2 text-left text-xs font-semibold ${darkMode ? "text-white/70" : "text-gray-600"}`}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recibosModal.map((r) => (
                    <tr key={r.id} className={`border-t ${darkMode ? "border-white/5" : "border-gray-100"}`}>
                      <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{r.tipo_cod}</td>
                      <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{r.descricao || "-"}</td>
                      <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{r.data_inicio}</td>
                      <td className={`px-4 py-2 text-sm ${darkMode ? "text-white/80" : "text-gray-700"}`}>{r.data_final}</td>
                      <td className={`px-4 py-2 font-medium ${darkMode ? "text-amber-400" : "text-amber-600"}`}>R$ {Number(r.valor_total).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`text-right font-bold mt-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              TOTAL: R$ {recibosModal.reduce((s, r) => s + Number(r.valor_total), 0).toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
