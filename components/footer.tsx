"use client";

import Link from "next/link";
import { NavLink } from "./nav-link";
import {
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  Shield,
  Award,
} from "lucide-react";

const LOGO_SRC = "/images/logo.png";

const navSections = [
  {
    title: "Navegação",
    links: [
      { label: "Início", href: "#home" },
      { label: "Resultados", href: "#resultados" },
      { label: "Sobre", href: "#sobre" },
      { label: "Serviços", href: "#servicos" },
      { label: "Como Trabalhamos", href: "#como-trabalhamos" },
      { label: "Soluções", href: "#solucoes" },
      { label: "Contato", href: "#contato" },
    ],
  },
  {
    title: "Serviços",
    links: [
      { label: "Segurança Patrimonial", href: "#servicos" },
      { label: "Portaria", href: "#servicos" },
      { label: "Limpeza", href: "#servicos" },
      { label: "Facilities", href: "#servicos" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      {/* Linha de destaque superior */}
      <div className="footer-accent" aria-hidden />

      <div className="footer-container">
        {/* Topo — Logo + CTA */}
        <div className="footer-top">
          <NavLink href="#home" className="footer-logo" aria-label="WR2 Serviços - Início">
            <img
              src={LOGO_SRC}
              alt="WR2 Serviços"
              className="footer-logo-img"
              width={140}
              height={48}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = (e.target as HTMLImageElement).nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = "inline-flex";
              }}
            />
            <span className="footer-logo-fallback">WR2 Serviços</span>
          </NavLink>
          <NavLink href="#contato" className="footer-cta">
            Solicitar cotação
            <ExternalLink size={14} strokeWidth={2.5} />
          </NavLink>
        </div>

        {/* Conteúdo principal */}
        <div className="footer-main">
          {/* Coluna Info */}
          <div className="footer-info">
            <p className="footer-tagline">
              Excelência em segurança, portaria e facilities para sua empresa.
            </p>
            <ul className="footer-contact-list">
              <li>
                <span className="footer-contact-text">
                  <MapPin size={16} aria-hidden />
                  R. Min. Gastão Mesquita - Perdizes - SP
                </span>
              </li>
              <li>
                <a href="mailto:contato@grupowr2servicos.com.br" className="footer-contact-link">
                  <Mail size={16} aria-hidden />
                  contato@grupowr2servicos.com.br
                </a>
              </li>
              <li>
                <a href="tel:+551138651511" className="footer-contact-link">
                  <Phone size={16} aria-hidden />
                  (011) 3865-1511
                </a>
              </li>
            </ul>
            <div className="footer-badges">
              <span className="footer-badge">
                <Shield size={14} aria-hidden />
                +500 certificados
              </span>
              <span className="footer-badge">
                <Award size={14} aria-hidden />
                Qualidade WR2
              </span>
            </div>
          </div>

          {/* Colunas de links */}
          {navSections.map((section) => (
            <nav key={section.title} className="footer-nav-col" aria-label={section.title}>
              <h3 className="footer-nav-title">{section.title}</h3>
              <ul className="footer-nav-list">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <NavLink href={link.href} className="footer-nav-link">
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Rodapé inferior */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="footer-copyright">
              © {new Date().getFullYear()} WR2 Serviços. Todos os direitos reservados.
            </p>
            <p className="footer-legal">
              Segurança patrimonial, portaria e facilities em São Paulo e região.
            </p>
          </div>
          <div className="footer-nookweb">
            <span className="footer-nookweb-text">Desenvolvido por</span>
            <a
              href="https://nookweb.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-nookweb-link"
            >
              Nookweb
            </a>
          </div>
        </div>
      </div>

      {/* Degradê sutil no fundo */}
      <div className="footer-gradient" aria-hidden />
    </footer>
  );
}
