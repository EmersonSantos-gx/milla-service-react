import { useState } from 'react';
import { CONFIG } from '../data/config';

export default function ProfileHeader() {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="flex flex-col items-center text-center">
      {/* Avatar 118px com Anel Glow / Bloom e Badge Online */}
      <div className="relative mb-5">
        <div className="avatar-ring-wrap flex items-center justify-center">
          <div className="relative h-[118px] w-[118px] overflow-hidden rounded-full bg-night-900 flex items-center justify-center">
            {!imgError && CONFIG.fotoUrl ? (
              <img
                src={CONFIG.fotoUrl}
                alt={`Foto de perfil ${CONFIG.nome}`}
                className="h-[118px] w-[118px] object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1C0F3A] via-[#120A26] to-[#082436] text-center">
                <span className="text-3xl font-extrabold tracking-tight text-tech-gradient">
                  MS
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  Tibia
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Badge Inferior Online */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-[#0B0618]/95 px-3 py-0.5 shadow-lg backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
          </span>
          <span className="text-[11px] font-semibold tracking-wide text-emerald-300">
            Online
          </span>
        </div>
      </div>

      {/* Selo de Credibilidade */}
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-gradient-to-r from-violet-600/20 to-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200 backdrop-blur-md">
        <i className="fa-solid fa-circle-check text-cyan-400" />
        <span>Perfil Oficial</span>
      </div>

      {/* Nome & Slogan */}
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {CONFIG.nome}
      </h1>
      <p className="mt-2 max-w-[380px] text-sm leading-relaxed text-slate-300 sm:text-[15px]">
        {CONFIG.slogan}
      </p>

      {/* Localização */}
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-slate-300 backdrop-blur-md">
        <i className="fa-solid fa-location-dot text-accent-electric" />
        <span>{CONFIG.cidade}</span>
      </div>
    </header>
  );
}
