import { useEffect, useRef } from 'react';
import { CONFIG } from '../data/config';

export default function ShareModal({ isOpen, shareUrl, onClose, onNotify }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const zapShareHref = `https://wa.me/?text=${encodeURIComponent(
    `${CONFIG.nome} — ${CONFIG.slogan} ${shareUrl}`
  )}`;

  const fallbackCopy = () => {
    if (!inputRef.current) return;
    inputRef.current.select();
    inputRef.current.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      onNotify('Link copiado para a área de transferência!');
    } catch {
      onNotify('Selecione e copie o link manualmente.');
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => onNotify('Link copiado para a área de transferência!'))
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shareModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
    >
      <div className="glass-card w-full max-w-sm rounded-3xl p-6 text-left border border-cyan-400/30">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-cyan-500/40 text-cyan-300">
              <i className="fa-solid fa-link" />
            </div>
            <h3 id="shareModalTitle" className="text-base font-bold text-white">
              Compartilhar Cartão
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-slate-300">
          Copie o link abaixo para enviar o cartão digital da{' '}
          <strong className="text-white">{CONFIG.nome}</strong> no WhatsApp, Discord ou Instagram:
        </p>

        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#07040F]/80 p-2">
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-transparent px-2 text-xs text-cyan-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="btn-tech-gradient shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold text-white cursor-pointer"
          >
            Copiar
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <a
            href={zapShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
          >
            <i className="fa-brands fa-whatsapp" />
            <span>Enviar no Zap</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
