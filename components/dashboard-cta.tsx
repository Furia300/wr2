"use client";

export function DashboardCta() {
  return (
    <section id="section-dashboard" className="dashboard-cta-section">
      <div className="dashboard-cta-container">
        <div className="dashboard-cta-content">
          <h2 className="dashboard-cta-title">
            Gestão inteligente da sua segurança em um só lugar
          </h2>
          <p className="dashboard-cta-description">
            Com o painel WR2, você acompanha todos os serviços em um ambiente
            único, simples e seguro.
          </p>
          <a href="#contato" className="dashboard-cta-button">
            Comece Agora
          </a>
        </div>

        <div className="dashboard-cta-image-wrapper">
          <div className="dashboard-cta-image-frame">
            <img
              src="/dashboard.png"
              alt="Painel WR2 - Dashboard de gestão"
              className="dashboard-cta-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
