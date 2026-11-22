import { getDirectWhatsAppUrl } from '../utils/whatsapp';

export default function FloatingWhatsApp() {
  return (
    <a
      href={getDirectWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com Milla Service no WhatsApp"
      className="fab-pulse fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] via-[#06B6D4] to-[#22D3EE] text-white shadow-[0_8px_28px_rgba(6,182,212,0.5)] transition-transform duration-200 hover:scale-110 active:scale-95"
    >
      <i className="fa-brands fa-whatsapp text-2xl" />
      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#07040F] bg-rose-500 text-[11px] font-extrabold text-white shadow-md">
        3
      </span>
    </a>
  );
}
