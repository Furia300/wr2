"use client";

import { useState, useEffect, useRef } from "react";
import { HeroParticles } from "./hero-particles";
import { NavLink } from "./nav-link";
import { Shield, UserCheck, Cpu } from "lucide-react";

const words = ["Tranquilidade", "Confiança"];

function useTypewriter(
  words: string[],
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000
) {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const wordIndex = useRef(0);

  useEffect(() => {
    const currentWord = words[wordIndex.current];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(currentWord.substring(0, text.length + 1));
          if (text.length + 1 === currentWord.length) {
            setTimeout(() => setIsDeleting(true), pauseTime);
            return;
          }
        } else {
          setText(currentWord.substring(0, text.length - 1));
          if (text.length - 1 === 0) {
            setIsDeleting(false);
            wordIndex.current = (wordIndex.current + 1) % words.length;
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}

const features = [
  { icon: Shield, label: "Proteção 24/7" },
  { icon: UserCheck, label: "Equipe Certificada" },
  { icon: Cpu, label: "Tecnologia Avançada" },
];

export function Hero() {
  const animatedWord = useTypewriter(words);

  return (
    <section id="home" className="hero">
      <HeroParticles />

      <div className="hero-container">
        <div className="hero-content">
          <h1>
            <span className="static-text">
              Soluções inteligentes para garantir sua total
            </span>
            <span className="highlight">
              {animatedWord}
              <span className="cursor">|</span>
            </span>
          </h1>

          <p className="subtitle">
            A WR2 Serviços une tecnologia avançada e inovação para proteger o
            seu negócio. Oferecemos soluções modernas e eficazes, atuando em
            condomínios, indústrias, instituições de ensino, hospitais e
            empresas de todos os portes.
          </p>

          <NavLink href="#contato" className="hero-cta-wrap" aria-label="Falar com especialista - ir para formulário">
            <span className="hero-cta-shimmer" aria-hidden />
            <span className="hero-cta">
              FALE COM ESPECIALISTA
            </span>
          </NavLink>
        </div>

        <div className="hero-image-col">
          <div className="hero-image">
            <div className="hero-image-mask">
              <img
                src="/hero-predios.jpg"
                alt="Proteção Empresarial WR2"
              />
            </div>
          </div>
          <div className="features">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="feature">
                <Icon className="feature-icon" size={16} strokeWidth={2} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
