"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, IdCard, ArrowRight } from "lucide-react";

type CardChoice = "cadastro" | "colaboradores" | null;

export default function WR2WelcomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<CardChoice>(null);

  const handleContinuar = () => {
    if (selected === "cadastro") router.push("/wr2/cadastro");
    else if (selected === "colaboradores") router.push("/wr2/colaboradores");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — vidro fosco */}
      <header className="wr2-header">
        <Link href="/" className="wr2-logo">
          <img
            src="/images/logo.png"
            alt="WR2 Serviços"
            className="h-10 w-auto"
          />
        </Link>
        <Link href="/wr2/login" className="wr2-login-btn">
          Já tem uma conta? <strong>Log in</strong>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="wr2-welcome-content">
          <p className="wr2-welcome-badge">Painel de gestão</p>
          <h1 className="wr2-welcome-title">
            Bem-vindo ao painel WR2 Serviços
          </h1>
          <p className="wr2-welcome-subtitle">
            Escolha uma opção e clique em Continuar
          </p>

          <div className="wr2-cards-grid">
            <button
              type="button"
              onClick={() => setSelected(selected === "cadastro" ? null : "cadastro")}
              className={`wr2-card ${selected === "cadastro" ? "wr2-card-selected" : ""}`}
            >
              <div className="wr2-card-glow" aria-hidden />
              <div className="wr2-card-icon-wrap">
                <Users className="wr2-card-icon" />
              </div>
              <div className="wr2-card-content">
                <h3 className="wr2-card-title">Complete seu cadastro</h3>
                <p className="wr2-card-desc">
                  Preencha os dados da sua empresa para acessar o painel
                </p>
              </div>
              <ArrowRight className="wr2-card-arrow" />
            </button>

            <button
              type="button"
              onClick={() => setSelected(selected === "colaboradores" ? null : "colaboradores")}
              className={`wr2-card ${selected === "colaboradores" ? "wr2-card-selected" : ""}`}
            >
              <div className="wr2-card-glow" aria-hidden />
              <div className="wr2-card-icon-wrap">
                <IdCard className="wr2-card-icon" />
              </div>
              <div className="wr2-card-content">
                <h3 className="wr2-card-title">Cadastro de colaboradores</h3>
                <p className="wr2-card-desc">
                  Área para cadastro de equipes e treinamento operacional
                </p>
              </div>
              <ArrowRight className="wr2-card-arrow" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleContinuar}
            disabled={!selected}
            className="wr2-cta disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continuar</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="wr2-progress">
            <div className="wr2-progress-dot active" />
            <div className="wr2-progress-dot" />
            <div className="wr2-progress-dot" />
          </div>
        </div>
      </main>
    </div>
  );
}
