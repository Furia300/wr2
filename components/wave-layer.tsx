"use client";

export function WaveLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-30" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 70%)" }} />
      <svg className="absolute bottom-0 left-0 w-full h-[180px] md:h-[220px] opacity-40" viewBox="0 0 1440 180" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </linearGradient>
        </defs>
        <path fill="url(#waveGrad)" d="M0 90 Q360 60 720 90 T1440 90 V180 H0 Z" style={{ animation: "hero-wave 8s ease-in-out infinite" }} />
        <path fill="url(#waveGrad)" fillOpacity={0.7} d="M0 100 Q360 70 720 100 T1440 100 V180 H0 Z" style={{ animation: "hero-wave 10s ease-in-out infinite 0.5s" }} />
        <path fill="url(#waveGrad)" fillOpacity={0.5} d="M0 110 Q360 80 720 110 T1440 110 V180 H0 Z" style={{ animation: "hero-wave 12s ease-in-out infinite 1s" }} />
      </svg>
    </div>
  );
}
