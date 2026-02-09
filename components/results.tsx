"use client";

import { useEffect, useState, useRef } from "react";
import { Calendar, Users, Clock, Star } from "lucide-react";

const metrics = [
  {
    icon: Calendar,
    value: 15,
    suffix: "",
    label: "Anos de Experiência",
  },
  {
    icon: Users,
    value: "+500",
    suffix: "",
    label: "certificados",
  },
  {
    icon: Clock,
    value: 24,
    suffix: "/7",
    label: "Supervisão 24/7",
  },
  {
    icon: Star,
    value: 100,
    suffix: "%",
    label: "Satisfação",
  },
];

function useCountUp(
  end: number,
  duration: number,
  startOnView: boolean,
  ref: React.RefObject<HTMLElement | null>
) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!startOnView || typeof end !== "number") return;
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();
          const startVal = 0;

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(startVal + (end - startVal) * easeOut));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView, hasAnimated, ref]);

  return count;
}

export function Results() {
  const containerRef = useRef<HTMLDivElement>(null);
  const count15 = useCountUp(15, 1500, true, containerRef);
  const count24 = useCountUp(24, 1200, true, containerRef);
  const count100 = useCountUp(100, 1800, true, containerRef);

  return (
    <section id="resultados" className="results-section" ref={containerRef}>
      <div className="results-container">
        <h2 className="results-title">Nossos Resultados</h2>
        <p className="results-subtitle">
          Excelência comprovada em cada número
        </p>

        <div className="results-cards-wrapper">
          <div className="results-cards">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const displayValue =
                index === 0
                  ? count15
                  : index === 2
                    ? count24
                    : index === 3
                      ? count100
                      : metric.value;

              return (
                <div key={metric.label} className="results-card">
                  <div className="results-card-icon">
                    <Icon size={28} strokeWidth={2} />
                  </div>
                  <div className="results-card-value">
                    {displayValue}
                    {metric.suffix}
                  </div>
                  <div className="results-card-label">{metric.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
