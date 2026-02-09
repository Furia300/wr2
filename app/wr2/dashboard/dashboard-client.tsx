"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Search,
  Shield,
  ShieldCheck,
  Video,
  FileText,
  AlertTriangle,
  SprayCan,
  Users,
  Wrench,
  CreditCard,
  FileCheck,
  HeadphonesIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function WR2Dashboard({ user, empresaId }: { user: User; empresaId?: string | null }) {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<{ id: string; tipo: string; titulo: string; mensagem: string | null; lida: boolean; created_at: string }[]>([]);
  const [showAlterarSenha, setShowAlterarSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    if (!empresaId) return;
    const supabase = createClient();
    supabase.schema("wr2").from("notificacoes").select("id, tipo, titulo, mensagem, lida, created_at").eq("empresa_id", empresaId).order("created_at", { ascending: false }).limit(10).then(({ data }) => setNotificacoes(data || []));
  }, [empresaId]);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) return;
    setSalvandoSenha(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvandoSenha(false);
    if (error) alert(error.message);
    else {
      setShowAlterarSenha(false);
      setNovaSenha("");
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/wr2/login");
    router.refresh();
  };

  const sidebarItems = [
    { label: "Dashboard", icon: TrendingUp, active: true },
    { label: "Overview", icon: TrendingUp },
  ];

  const monitoramento = [
    { label: "Supervisão 24h", icon: Shield },
    { label: "Câmeras ao Vivo", icon: Video },
    { label: "Relatórios de Ronda", icon: FileText },
    { label: "Alertas de Segurança", icon: AlertTriangle },
  ];

  const facilities = [
    { label: "Limpeza e Conservação", icon: SprayCan },
    { label: "Portaria / Recepção", icon: Users },
    { label: "Sistema IoT", icon: Wrench },
  ];

  const financeiro = [
    { label: "Boletos", icon: CreditCard },
    { label: "Emissão de NF", icon: FileCheck },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0b0d] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo.png"
              alt="WR2 Serviços"
              className="h-9 w-auto"
            />
          </Link>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-6">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${
                  item.active ? "bg-amber-500/20 text-amber-400" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="px-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-3">
              Monitoramento
            </p>
            {monitoramento.map((item) => (
              <Link
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 mb-1"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="px-4 mt-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-3">
              Facilities
            </p>
            {facilities.map((item) => (
              <Link
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 mb-1"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="px-4 mt-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-3">
              Finanças
            </p>
            {financeiro.map((item) => (
              <Link
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 mb-1"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="px-4 mt-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-3">
              Administração
            </p>
            <Link
              href="/wr2/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 mb-1"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm">Gerenciamento</span>
            </Link>
          </div>
          <div className="px-4 mt-6">
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <HeadphonesIcon className="w-4 h-4" />
              <span className="text-sm">Suporte</span>
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Notificações">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAlterarSenha(true)}
              className="text-sm text-gray-600 hover:text-amber-600"
            >
              Alterar senha
            </button>
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm">
              {user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        {showAlterarSenha && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAlterarSenha(false)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-gray-900 mb-4">Alterar senha</h3>
              <form onSubmit={handleAlterarSenha}>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={salvandoSenha || novaSenha.length < 6} className="px-4 py-2 bg-amber-500 text-white rounded-lg disabled:opacity-50">
                    {salvandoSenha ? "Salvando..." : "Salvar"}
                  </button>
                  <button type="button" onClick={() => setShowAlterarSenha(false)} className="px-4 py-2 border border-gray-200 rounded-lg">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Olá {user.email?.split("@")[0]} — aqui estão as métricas dos seus serviços!
          </h2>

          {/* Cards de acesso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link
              href="/wr2/colaboradores"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-amber-500/50 hover:shadow-md transition-all group"
            >
              <Users className="w-8 h-8 text-amber-500 mb-3" />
              <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-600">Colaboradores</p>
              <p className="text-xs text-gray-500 mt-1">Gerencie colaboradores e recibos</p>
            </Link>
            <Link
              href="/wr2/recibos"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-amber-500/50 hover:shadow-md transition-all group"
            >
              <FileText className="w-8 h-8 text-amber-500 mb-3" />
              <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-600">Recibos</p>
              <p className="text-xs text-gray-500 mt-1">Dashboard de recibos e valores</p>
            </Link>
            <Link
              href="/wr2/admin"
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-amber-500/50 hover:shadow-md transition-all group"
            >
              <ShieldCheck className="w-8 h-8 text-amber-500 mb-3" />
              <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-600">Gerenciamento</p>
              <p className="text-xs text-gray-500 mt-1">Aprovar empresas e colaboradores</p>
            </Link>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "GUARDAS ATIVOS", value: "8", change: "+12%", positive: true },
              { label: "INCIDENTES", value: "0", change: "-100%", positive: false },
              { label: "EFICIÊNCIA MENSAL", value: "98.5%", change: "+23%", positive: true },
              { label: "SATISFAÇÃO", value: "4.8/5", change: "-0.2", positive: false },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {kpi.label}
                </p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                  <span
                    className={`text-sm font-medium ${
                      kpi.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {kpi.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Gráfico */}
            <div className="bg-[#0a0b0d] rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">Status de Segurança</h3>
              <div className="h-48 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 70, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-amber-500/60 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Últimos 7 dias</p>
            </div>

            {/* Serviços ativos */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Serviços Ativos</h3>
              <ul className="space-y-3">
                {[
                  "Segurança Patrimonial: 5 Guardas",
                  "Limpeza e Conservação: 3 Funcionários",
                  "Portaria / Recepção: 2 Técnicos",
                  "Solicitações: 24h Ativo",
                  "Outros serviços: 6 Ativos",
                ].map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            {/* Notificações (ex.: novo colaborador ativo) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Notificações</h3>
              {notificacoes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma notificação recente.</p>
              ) : (
                <ul className="space-y-3">
                  {notificacoes.map((n) => (
                    <li key={n.id} className={`text-sm flex items-center gap-2 ${n.lida ? "text-gray-500" : "text-gray-900 font-medium"}`}>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{n.titulo}</span>
                      {n.mensagem && <span className="text-gray-500">— {n.mensagem}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Equipe */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Equipe Destacada</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold">
                  JS
                </div>
                <div>
                  <p className="font-medium text-gray-900">João Santos</p>
                  <p className="text-sm text-gray-500">joao@wr2.com</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
