const MILLA_WHATSAPP = '5582993643044';

function SeloPix() {
  return (
    <span
      title="PIX — Aprovação instantânea"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#32BCAD]/40 bg-[#0D1E22] px-2.5 shadow-sm"
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 512 512" aria-hidden="true">
        <path
          fill="#32BCAD"
          d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.1 231.1 518.1 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C256.1 224.4 247.9 224.5 242.4 218.9L165.7 142.2C151.5 127.1 132.6 120.2 112.6 120.2H103.3L200.7 22.76C231.1-7.586 280.3-7.586 310.6 22.76L407.8 119.9H392.6C372.6 119.9 353.7 127.7 339.5 141.9L262.5 218.9zM112.6 142.7C126.4 142.7 139.1 148.3 149.7 158.1L226.4 234.8C233.6 241.1 243 245.6 252.5 245.6C261.9 245.6 271.3 241.1 278.5 234.8L355.5 157.8C365.3 148.1 378.8 142.5 392.6 142.5H430.3L488.6 200.8C518.9 231.1 518.9 280.3 488.6 310.6L430.3 368.9H392.6C378.8 368.9 365.3 363.3 355.5 353.5L278.5 276.5C264.6 262.6 240.3 262.6 226.4 276.6L149.7 353.2C139.1 363 126.4 368.6 112.6 368.6H80.78L22.76 310.6C-7.586 280.3-7.586 231.1 22.76 200.8L80.78 142.7H112.6z"
        />
      </svg>
      <span className="text-xs font-extrabold tracking-wide text-[#32BCAD]">pix</span>
    </span>
  );
}

function BandeiraVisa() {
  return (
    <span
      title="Visa"
      className="inline-flex h-8 w-[54px] items-center justify-center rounded-md border border-white/15 bg-white px-1.5 shadow-sm"
    >
      <svg className="h-4 w-full" viewBox="0 0 64 22" aria-hidden="true">
        <text
          x="32"
          y="16.5"
          textAnchor="middle"
          fill="#1A1F71"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="16"
          letterSpacing="0.5"
        >
          VISA
        </text>
      </svg>
    </span>
  );
}

function BandeiraMastercard() {
  return (
    <span
      title="Mastercard"
      className="inline-flex h-8 w-[54px] items-center justify-center rounded-md border border-white/15 bg-[#1B1726] px-1.5 shadow-sm"
    >
      <svg className="h-5 w-9" viewBox="0 0 40 24" aria-hidden="true">
        <circle cx="15" cy="12" r="9" fill="#EB001B" />
        <circle cx="25" cy="12" r="9" fill="#F79E1B" />
        <path
          d="M20 5.3A9 9 0 0 0 16.4 12 9 9 0 0 0 20 18.7 9 9 0 0 0 23.6 12 9 9 0 0 0 20 5.3Z"
          fill="#FF5F00"
        />
      </svg>
    </span>
  );
}

function BandeiraElo() {
  return (
    <span
      title="Elo"
      className="inline-flex h-8 w-[54px] items-center justify-center rounded-md border border-white/15 bg-[#111111] px-1.5 shadow-sm"
    >
      <svg className="h-5 w-11" viewBox="0 0 54 24" aria-hidden="true">
        {/* Arco tricolor característico da Elo */}
        <path d="M8 8 A6 6 0 0 1 16 8" fill="none" stroke="#FFCB05" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 10 A6 6 0 0 1 11 17" fill="none" stroke="#00A4E0" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M9 16 A6 6 0 0 1 7 10" fill="none" stroke="#EF4123" strokeWidth="2.4" strokeLinecap="round" />
        <text
          x="22"
          y="16"
          fill="#FFFFFF"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="800"
          fontSize="13"
        >
          elo
        </text>
      </svg>
    </span>
  );
}

function BandeiraAmex() {
  return (
    <span
      title="American Express"
      className="inline-flex h-8 w-[54px] items-center justify-center rounded-md border border-[#38BDF8]/40 bg-[#006FCF] px-1 shadow-sm"
    >
      <svg className="h-6 w-full" viewBox="0 0 60 28" aria-hidden="true">
        <rect
          x="2"
          y="2"
          width="56"
          height="24"
          rx="2.5"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <text
          x="30"
          y="12.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="7.5"
          letterSpacing="0.4"
        >
          AMERICAN
        </text>
        <text
          x="30"
          y="21.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="7.5"
          letterSpacing="0.6"
        >
          EXPRESS
        </text>
      </svg>
    </span>
  );
}

function BandeiraHipercard() {
  return (
    <span
      title="Hipercard"
      className="inline-flex h-8 w-[64px] items-center justify-center rounded-md border border-rose-300/30 bg-[#B3131B] px-1.5 shadow-sm"
    >
      <svg className="h-5 w-full" viewBox="0 0 74 22" aria-hidden="true">
        <text
          x="37"
          y="15"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Georgia, Times New Roman, serif"
          fontWeight="700"
          fontStyle="italic"
          fontSize="13.5"
          letterSpacing="0.2"
        >
          Hipercard
        </text>
      </svg>
    </span>
  );
}

export default function Footer({ onShare }) {
  const anoAtual = new Date().getFullYear();

  const abrirWhatsApp = () => {
    const msg = encodeURIComponent('Olá Milla Store! Gostaria de tirar uma dúvida pelo site.');
    window.open(`https://wa.me/${MILLA_WHATSAPP}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="relative z-10 mt-10 w-full border-t border-[#DBADFF]/15 bg-[#0A0510]/95 text-[#DBADFF]/80">
      {/* Faixa de Benefícios / Confiança do E-commerce */}
      <div className="border-b border-[#DBADFF]/10 bg-[#140B21]/70">
        <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FFBF24]/35 bg-[#FFBF24]/10 text-[#FFBF24]">
              <i className="fa-solid fa-bolt" />
            </div>
            <div className="text-xs">
              <strong className="block font-extrabold text-[#FFF1D5]">Entrega Rápida</strong>
              <span className="text-[11px] text-[#DBADFF]/70">Média de ~5 minutos após o PIX</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FFBF24]/35 bg-[#FFBF24]/10 text-[#FFBF24]">
              <i className="fa-solid fa-lock" />
            </div>
            <div className="text-xs">
              <strong className="block font-extrabold text-[#FFF1D5]">Checkout Seguro</strong>
              <span className="text-[11px] text-[#DBADFF]/70">Processado pelo Mercado Pago</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FFBF24]/35 bg-[#FFBF24]/10 text-[#FFBF24]">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <div className="text-xs">
              <strong className="block font-extrabold text-[#FFF1D5]">Serviceiros Verificados</strong>
              <span className="text-[11px] text-[#DBADFF]/70">Parceiros selecionados por mundo</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FFBF24]/35 bg-[#FFBF24]/10 text-[#FFBF24]">
              <i className="fa-brands fa-whatsapp text-sm" />
            </div>
            <div className="text-xs">
              <strong className="block font-extrabold text-[#FFF1D5]">Suporte Humanizado</strong>
              <span className="text-[11px] text-[#DBADFF]/70">Atendimento direto no WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corpo Principal do Rodapé (4 Colunas) */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 px-4 py-10 sm:px-6">
        {/* Coluna 1: Marca e Descrição (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FFBF24]/45 bg-gradient-to-br from-[#A126F5] to-[#23103A] shadow-[0_0_16px_rgba(161,38,245,0.35)]">
              <i className="fa-solid fa-crown text-[#FFBF24]" />
            </div>
            <div>
              <span className="block text-base font-black tracking-tight text-[#FFF1D5]">
                Milla Store
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#DBADFF]/75">
                Tibia Coins &amp; Services
              </span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[#DBADFF]/75 max-w-sm">
            Sua loja especializada em compra e venda de Tibia Coins, Quests Endgame, Bosses e Gift
            Cards com segurança, agilidade e transparência em cada negociação.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={abrirWhatsApp}
              className="btn-gold-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-sm" />
              <span>Falar no WhatsApp</span>
            </button>

            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="btn-gold-secondary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs cursor-pointer"
              >
                <i className="fa-solid fa-share-nodes" />
                <span>Compartilhar</span>
              </button>
            )}
          </div>
        </div>

        {/* Coluna 2: Navegação Rápida (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#FFBF24]">
            Navegação
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="#catalogo-destaque"
                className="hover:text-[#FFBF24] transition inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-chevron-right text-[9px] text-[#FFBF24]/70" />
                Vitrine de Ofertas
              </a>
            </li>
            <li>
              <a
                href="#clube-vip"
                className="hover:text-[#FFBF24] transition inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-chevron-right text-[9px] text-[#FFBF24]/70" />
                Clube VIP (MILLA5)
              </a>
            </li>
            <li>
              <a
                href="#avaliacoes-clientes"
                className="hover:text-[#FFBF24] transition inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-chevron-right text-[9px] text-[#FFBF24]/70" />
                Avaliações de Clientes
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={abrirWhatsApp}
                className="hover:text-[#FFBF24] transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-chevron-right text-[9px] text-[#FFBF24]/70" />
                Suporte WhatsApp
              </button>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Atendimento & Segurança (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#FFBF24]">
            Atendimento &amp; Segurança
          </h4>
          <ul className="space-y-2 text-xs text-[#DBADFF]/80">
            <li className="flex items-center gap-2">
              <i className="fa-brands fa-whatsapp text-[#FFBF24]" />
              <span>(82) 99364-3044</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-[#FFBF24]" />
              <span>Maceió — AL • Brasil</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-clock text-[#FFBF24]" />
              <span>Todos os dias • PIX 24h</span>
            </li>
          </ul>

          <div className="pt-1 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
              <i className="fa-solid fa-lock" />
              Site Blindado SSL
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-300">
              <i className="fa-solid fa-handshake" />
              Mercado Pago Oficial
            </span>
          </div>
        </div>

        {/* Coluna 4: Formas de Pagamento Aceitas (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#FFBF24]">
            Formas de Pagamento
          </h4>
          <p className="text-[11px] text-[#DBADFF]/70">
            Aceitamos PIX com <strong className="text-emerald-300">5% OFF</strong> e os principais
            cartões via Mercado Pago:
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <SeloPix />
            <BandeiraVisa />
            <BandeiraMastercard />
            <BandeiraElo />
            <BandeiraAmex />
            <BandeiraHipercard />
          </div>

          <div className="rounded-xl border border-[#009EE3]/30 bg-[#0A1929]/80 px-3 py-2 text-[10px] text-[#DBADFF]/85 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-solid fa-shield-halved text-[#009EE3]" />
              Checkout criptografado
            </span>
            <strong className="text-[#38BDF8]">Mercado Pago</strong>
          </div>
        </div>
      </div>

      {/* Barra Inferior Legal */}
      <div className="border-t border-[#DBADFF]/10 bg-[#07030B]">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 text-[11px] text-[#DBADFF]/55 sm:px-6">
          <p className="text-center sm:text-left">
            © {anoAtual} <strong className="text-[#FFF1D5]">Milla Store</strong> — Todos os direitos
            reservados.
          </p>
          <p className="text-center sm:text-right text-[10px] text-[#DBADFF]/45">
            Tibia é uma marca registrada da CipSoft GmbH. A Milla Store é uma loja independente. // Adicionar link para política de privacidade e termos de uso.
          </p>
        </div>
      </div>
    </footer>
  );
}