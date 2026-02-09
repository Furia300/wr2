"use client";

import { Search, FileEdit, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Search,
    title: "Consultoria Inicial",
    description: "Análise detalhada das suas necessidades",
  },
  {
    number: 2,
    icon: FileEdit,
    title: "Proposta Personalizada",
    description: "Desenvolvimento de solução sob medida",
  },
  {
    number: 3,
    icon: Rocket,
    title: "Implementação",
    description: "Início dos serviços com treinamento da equipe",
  },
  {
    number: 4,
    icon: BarChart3,
    title: "Monitoramento",
    description: "Acompanhamento contínuo com gestão integrada",
  },
];

export function HowWeWork() {
  return (
    <section id="como-trabalhamos" className="how-we-work-section">
      <div className="how-we-work-container">
        <div className="how-we-work-header">
          <h2 className="how-we-work-title">Como Trabalhamos</h2>
          <p className="how-we-work-subtitle">
            Processo estruturado para garantir a melhor solução para seu negócio.
          </p>
        </div>

        <div className="how-we-work-timeline">
          <div className="how-we-work-line" aria-hidden />
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} className="how-we-work-card">
                <div className="how-we-work-card-node">
                  <span className="how-we-work-number">{step.number}</span>
                  <div className="how-we-work-icon-wrap">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                </div>
                <div className="how-we-work-card-content">
                  <h3 className="how-we-work-card-title">{step.title}</h3>
                  <p className="how-we-work-card-description">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
