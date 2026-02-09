"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NavLink } from "./nav-link";
import { Menu, X } from "lucide-react";

const LOGO_SRC = "/images/logo.png";

function Logo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="text-xl font-bold text-[#FFD700]">WR2</span>
        <span className="text-[10px] font-medium text-white/60 tracking-widest uppercase">
          Serviços
        </span>
      </span>
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt="WR2 Serviços"
      className="h-11 w-auto sm:h-12 object-contain"
      width={56}
      height={56}
      onError={() => setFailed(true)}
    />
  );
}

const navLinks = [
  { label: "Início", href: "#home" },
  { label: "Resultados", href: "#resultados" },
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Como Trabalhamos", href: "#como-trabalhamos" },
  { label: "Soluções", href: "#solucoes" },
  { label: "Contato", href: "#contato" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lightSectionIds = [
      "sobre",
      "section-dashboard",
      "section-comparison",
    ];

    const checkLightSection = () => {
      const inLight = lightSectionIds.some((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < 150 && rect.bottom > 80;
      });
      setIsLightSection(inLight);
    };

    window.addEventListener("scroll", checkLightSection, { passive: true });
    checkLightSection();
    return () => window.removeEventListener("scroll", checkLightSection);
  }, []);

  const headerLight = isLightSection;
  const showBorder = scrolled && (headerLight || !headerLight);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${
        headerLight
          ? "bg-white/95 header-light"
          : "bg-[#0a0b0d]/90"
      } ${showBorder ? (headerLight ? "border-b border-black/[0.08]" : "border-b border-white/[0.06]") : ""}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[72px]">
        {/* Logo — padding esquerdo para respiro visual */}
        <NavLink
          href="#home"
          className="header-logo-link flex items-center flex-shrink-0"
          aria-label="WR2 Serviços - Página inicial"
        >
          <Logo />
        </NavLink>

        {/* Desktop Nav — mais espaço, texto discreto */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium tracking-wide text-white/80 hover:text-[#FFD700] transition-colors duration-200"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Login — estilo moderno 2026 */}
        <div className="hidden md:flex items-center pr-2">
          <Link href="/wr2" className="header-login-btn">
            Login
          </Link>
        </div>

        {/* Mobile Menu Toggle — mesmo espaçamento da logo (padding-right = padding-left da logo) */}
        <button
          className="md:hidden p-2 pr-5 text-white/80 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-[#0a0b0d]/98 backdrop-blur-lg border-t border-white/5 px-4 py-5">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                className="text-[15px] py-3 text-white/80 hover:text-white transition-colors border-b border-white/5 last:border-0 block"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              href="/wr2"
              className="header-login-btn mt-4 block text-center"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
