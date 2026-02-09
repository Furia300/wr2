"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

const features = [
  "Análise de Dados & Inteligência",
  "Consultoria com especialistas em cibersegurança",
  "Auditoria de sistemas integrada",
  "Integração com IoT e sensores inteligentes",
  "Resposta automatizada para incidentes menores",
  "Gestão Avançada de Riscos",
  "Capacitação Tecnológica Contínua",
  "Integração Total de Sistemas",
  "Sincronização automática com RH, Financeiro e Operacional",
  "Inteligência Artificial Proprietária",
  "Tecnologia Mobile Avançada",
  "Painel Financeiro Inteligente",
];

export function ComparisonTable() {
  const [logoError, setLogoError] = useState(false);

  return (
    <section id="section-comparison" className="comparison-section">
      <div className="comparison-container">
        <div className="comparison-header">
          <h2 className="comparison-title">Tabela Comparativa Detalhada</h2>
          <p className="comparison-subtitle">WR2 vs. Concorrência</p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="comparison-col-feature">Vantagem Competitiva</th>
                <th className="comparison-col-wr2">
                  <div className="comparison-logo-cell">
                    {!logoError ? (
                      <img
                        src="/images/logo.png"
                        alt="WR2"
                        className="comparison-logo"
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <span className="comparison-logo-fallback">WR2</span>
                    )}
                    <span className="comparison-brand">WR2</span>
                  </div>
                </th>
                <th className="comparison-col-competitor">Concorrente A</th>
                <th className="comparison-col-competitor">Concorrente B</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={feature}
                  className={index % 2 === 1 ? "comparison-row-alt" : ""}
                >
                  <td className="comparison-col-feature">{feature}</td>
                  <td className="comparison-col-wr2">
                    <span className="comparison-check">
                      <Check size={20} strokeWidth={3} />
                    </span>
                  </td>
                  <td className="comparison-col-competitor">
                    <span className="comparison-cross">
                      <X size={20} strokeWidth={3} />
                    </span>
                  </td>
                  <td className="comparison-col-competitor">
                    <span className="comparison-cross">
                      <X size={20} strokeWidth={3} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="comparison-footer">
          <p className="comparison-footer-text">
            <strong>12 vantagens competitivas</strong> que colocam a WR2 à
            frente no mercado de segurança e facilities
          </p>
        </div>
      </div>
    </section>
  );
}
