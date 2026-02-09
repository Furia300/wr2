"use client";

import { Clock, Cpu, GraduationCap, Settings, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Supervisão 24h",
    description:
      "Monitoramento contínuo, relatórios detalhados e comunicação direta com nossa central de operações.",
  },
  {
    icon: Cpu,
    title: "Tecnologia",
    description:
      "Sistemas de controle de acesso, câmeras IP e plataformas de gestão inteligente para total segurança.",
  },
  {
    icon: GraduationCap,
    title: "Equipe Qualificada",
    description:
      "Profissionais com treinamento constante, certificações atualizadas e comprovada experiência.",
  },
  {
    icon: Settings,
    title: "Soluções Personalizadas",
    description:
      "Atendimento sob medida para cada cliente, adaptando nossos serviços às suas necessidades específicas.",
  },
  {
    icon: TrendingUp,
    title: "Transparência Operacional",
    description:
      "Relatórios regulares, métricas de desempenho e comunicação direta para total transparência nos resultados e processos.",
  },
  {
    icon: Zap,
    title: "Resposta Rápida",
    description:
      "Atendimento ágil e prontidão para resolver demandas urgentes, garantindo eficiência na solução de ocorrências.",
  },
];

export function WhyChoose() {
  return (
    <section id="sobre" className="why-choose-section">
      <div className="why-choose-container">
        <h2 className="why-choose-title">Por que Escolher a WR2?</h2>
        <p className="why-choose-subtitle">
          Combinamos experiência, tecnologia e dedicação para oferecer soluções
          que superam expectativas
        </p>

        <div className="why-choose-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="why-choose-card">
                <div className="why-choose-card-header">
                  <div className="why-choose-card-icon">
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <h3 className="why-choose-card-title">{feature.title}</h3>
                </div>
                <p className="why-choose-card-description">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
