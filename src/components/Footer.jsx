import { useState } from 'react';
import { CONFIG } from '../data/config';

export default function Footer({ onShare }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="mx-auto mt-10 w-full max-w-[460px] space-y-5 text-center">
      {/* Botão Compartilhar Cartão Digital */}
      <button
        type="button"
        onClick={onShare}
        className="glass-card inline-flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-bold text-white cursor-pointer"
      >
        <i className="fa-solid fa-share-nodes text-cyan-400" />
        <span>Compartilhar este Cartão Digital</span>
      </button>

      {/* Créditos e Avisos Legais */}
      <div className="space-y-2.5 pt-2 text-xs text-slate-400">
        <p className="font-medium text-slate-300">
          © 2026 <span>{CONFIG.nome}</span>. Todos os direitos reservados.
        </p>
        <p className="text-[11px] leading-relaxed text-slate-400/90">
          Service independente, sem vínculo com a CipSoft GmbH.
        </p>

        {/* Desenvolvido por GXDEV */}
        <div className="flex flex-col items-center justify-center gap-1.5 pt-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Desenvolvido por
          </span>
          <a
            href={CONFIG.devSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 transition hover:border-cyan-400/40 hover:bg-white/[0.06]"
            aria-label="Desenvolvido por GXDEV"
          >
            {!logoError && CONFIG.devLogoUrl ? (
              <img
                src={CONFIG.devLogoUrl}
                alt="Logo GXDEV"
                className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xs font-extrabold tracking-[0.22em] text-tech-gradient">
                GXDEV.SPACE
              </span>
            )}
          </a>
        </div>
      </div>
    </footer>
  );
}
