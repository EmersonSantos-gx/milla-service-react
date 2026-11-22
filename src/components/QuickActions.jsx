import { CONFIG } from '../data/config';
import { getDirectWhatsAppUrl } from '../utils/whatsapp';
import { downloadVCard } from '../utils/vcard';

export default function QuickActions({ onNotify }) {
  const handleSaveContact = () => {
    downloadVCard();
    onNotify('Contato Milla Service (.vcf) salvo!');
  };

  return (
    <section aria-label="Contato rápido" className="grid grid-cols-2 gap-3">
      {/* Botão 1: WhatsApp Direto */}
      <a
        href={getDirectWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-card group flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3.5 text-center"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-cyan-400/30 text-cyan-300 transition-transform duration-200 group-hover:scale-110">
          <i className="fa-brands fa-whatsapp text-xl" />
        </div>
        <span className="text-xs font-bold tracking-wide text-white sm:text-sm">
          WhatsApp Direto
        </span>
        <span className="text-[11px] text-cyan-300/90">
          {CONFIG.whatsappExibicao}
        </span>
      </a>

      {/* Botão 2: Salvar Contato na Agenda (.vcf) */}
      <button
        type="button"
        onClick={handleSaveContact}
        className="glass-card group flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3.5 text-center cursor-pointer"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-violet-400/30 text-violet-300 transition-transform duration-200 group-hover:scale-110">
          <i className="fa-solid fa-address-card text-lg" />
        </div>
        <span className="text-xs font-bold tracking-wide text-white sm:text-sm">
          Salvar na Agenda
        </span>
        <span className="text-[11px] text-slate-400">Baixar vCard (.vcf)</span>
      </button>
    </section>
  );
}
