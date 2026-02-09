"use client";

const solutions = [
  {
    image: "/solutions/vigilancia.jpg",
    title: "Vigilância Móvel e Preventiva",
    description:
      "Rondas motorizadas e equipes de apoio tático para proteção perimetral e intervenção ágil.",
  },
  {
    image: "/solutions/monitoramento.jpg",
    title: "Monitoramento Inteligente 24/7",
    description:
      "Central de operações com tecnologia de ponta para vigilância eletrônica, alarme, CFTV e IA.",
  },
  {
    image: "/solutions/controle-acesso.jpg",
    title: "Recepcionista e Controle de Acesso",
    description:
      "Profissionais qualificados e sistemas tecnológicos para gerenciar a entrada e saída de pessoas e veículos.",
  },
  {
    image: "/solutions/portaria.jpg",
    title: "Portaria e Gestão de Atendimento",
    description:
      "Soluções de portaria presencial, remota e híbrida para garantir um atendimento seguro e eficiente.",
  },
  {
    image: "/solutions/limpeza.jpg",
    title: "Limpeza",
    description:
      "Equipes especializadas em limpeza, higienização e manutenção de áreas internas e externas.",
  },
  {
    image: "/solutions/jardinagem.jpg",
    title: "Jardinagem e Manutenção de Áreas Verdes",
    description:
      "Serviços especializados em poda, plantio, paisagismo e conservação para aprimorar a estética e a funcionalidade de áreas externas.",
  },
];

export function SolutionsGrid() {
  return (
    <section id="solucoes" className="solutions-grid-section">
      <div className="solutions-grid-container">
        <div className="solutions-grid-header">
          <h2 className="solutions-grid-title">
            Soluções Integradas em Proteção e Facilities
          </h2>
          <p className="solutions-grid-subtitle">
            A fusão de proteção especializada com serviços de gestão de ambientes{" "}
            <span className="solutions-subtitle-keep">em um só lugar.</span>
          </p>
        </div>

        <div className="solutions-grid-mosaic">
          {solutions.map((item) => (
            <article key={item.title} className="solutions-grid-card">
              <div className="solutions-grid-card-image-wrap">
                <img
                  src={item.image}
                  alt={item.title}
                  className="solutions-grid-card-image"
                />
              </div>
              <div className="solutions-grid-card-overlay">
                <div className="solutions-grid-card-content">
                  <h3 className="solutions-grid-card-title">{item.title}</h3>
                  <p className="solutions-grid-card-description">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
