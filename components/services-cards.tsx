"use client";

import {
  Shield,
  SprayCan,
  Users,
  Building2,
  Video,
  LineChart,
  Check,
} from "lucide-react";

const services = [
  {
    icon: Shield,
    title: "Segurança Patrimonial",
    features: [
      "Vigilância armada e desarmada",
      "Rondas motorizadas e a pé",
      "Sistemas de monitoramento",
      "Profissionais altamente treinados",
    ],
  },
  {
    icon: SprayCan,
    title: "Limpeza e Conservação",
    features: [
      "Limpeza áreas internas e externas",
      "Higienização de ambientes",
      "Equipes treinadas",
      "Produtos de qualidade",
    ],
  },
  {
    icon: Users,
    title: "Portaria e Recepção",
    features: [
      "Atendimento profissional",
      "Controle de acesso",
      "Recepção de visitantes",
      "Comunicados internos",
    ],
  },
  {
    icon: Building2,
    title: "Facilities Management",
    features: [
      "Gestão integrada de serviços",
      "Manutenção preventiva",
      "Redução de custos",
      "Suporte completo",
    ],
  },
  {
    icon: Video,
    title: "Portaria à Distância",
    features: [
      "Monitoramento remoto 24h",
      "Controle de acesso por vídeo",
      "Integração com sistemas",
      "Redução de custos operacionais",
    ],
  },
  {
    icon: LineChart,
    title: "Consultoria Personalizada",
    features: [
      "Mapeamento de riscos",
      "Planejamento estratégico",
      "Consultoria por segmento",
      "Otimização de investimento",
    ],
  },
];

export function ServicesCards() {
  return (
    <section id="servicos" className="services-cards-section">
      <div className="services-cards-container">
        <div className="services-cards-header">
          <h2 className="services-cards-title">Nossos Serviços</h2>
          <p className="services-cards-subtitle">
            Soluções completas para segurança e facilities do seu negócio
          </p>
        </div>

        <div className="services-cards-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="services-card">
                <div className="services-card-inner">
                  <div className="services-card-header">
                    <span className="services-card-icon-wrap">
                      <Icon size={28} strokeWidth={2} />
                    </span>
                    <h3 className="services-card-title">{service.title}</h3>
                  </div>
                  <div className="services-card-divider" />
                  <ul className="services-card-features">
                    {service.features.map((feature) => (
                      <li key={feature}>
                        <Check size={16} strokeWidth={3} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
