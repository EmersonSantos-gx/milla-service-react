import { useState } from 'react';

export default function StoreHeader({
  abaPrincipal = 'loja',
  onMudarAba,
  busca = '',
  onMudarBusca,
  totalItensCarrinho = 0,
  usuarioLogado = null,
  onAbrirCarrinho,
  onAbrirRastreio,
  onAbrirConta,
  onIrParaClubeVip,
  avatarUrl = '/avatar.png',
}) {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [imgErro, setImgErro] = useState(false);

  const selecionarAba = (novaAba) => {
    onMudarAba?.(novaAba);
    setMenuMobileAberto(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Topbar de Utilidades */}
      <div className="relative z-40 border-b border-[#DBADFF]/15 bg-[#0A0510]/95 text-[11px] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#FFF1D5]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Online • Entrega em ~5 min
            </span>

            <span className="hidden md:inline text-[#DBADFF]/25">|</span>

            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#FFBF24]/30 bg-[#FFBF24]/10 px-2.5 py-0.5 font-semibold text-[#FFBF24]">
              <i className="fa-solid fa-bolt text-[10px]" />
              PIX 24h Automático
            </span>

            <span className="hidden lg:inline text-[#DBADFF]/25">|</span>

            <button
              type="button"
              onClick={() => {
                selecionarAba('loja');
                onIrParaClubeVip?.();
              }}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[#A126F5]/45 bg-[#A126F5]/15 px-2.5 py-0.5 font-bold text-[#FFBF24] hover:border-[#FFBF24]/70 transition cursor-pointer"
            >
              <i className="fa-solid fa-tag text-[10px]" />
              Clube Vip - Cupom MILLA5
            </button>
          </div>

          <button
            type="button"
            onClick={() => selecionarAba('serviceiros')}
            className="inline-flex items-center gap-1.5 font-bold text-[#DBADFF] hover:text-[#FFBF24] transition cursor-pointer"
          >
            <i className="fa-solid fa-shield-halved text-[#FFBF24]" />
            Serviceiros Verificados
          </button>
        </div>
      </div>

      {/* Header Principal Fixo */}
      <header className="sticky top-0 z-40 border-b border-[#DBADFF]/15 bg-[#100919]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              type="button"
              onClick={() => selecionarAba('loja')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#FFBF24]/50 bg-gradient-to-br from-[#A126F5] to-[#23103A] shadow-[0_0_16px_rgba(161,38,245,0.4)] transition group-hover:scale-105">
                {avatarUrl && !imgErro ? (
                  <img
                    src={avatarUrl}
                    alt="Milla Store"
                    onError={() => setImgErro(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <i className="fa-solid fa-crown text-[#FFBF24]" />
                )}
              </div>
              <div>
                <span className="block text-base sm:text-lg font-black tracking-tight text-[#FFF1D5] leading-none">
                  Milla Store
                </span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-widest text-[#DBADFF]/80">
                  Tibia Coins &amp; Services
                </span>
              </div>
            </button>

            <nav className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#DBADFF]/15 bg-[#190E27]/90 p-1">
              <button
                type="button"
                onClick={() => selecionarAba('loja')}
                className={`rounded-lg px-4 py-2 text-xs transition cursor-pointer ${
                  abaPrincipal === 'loja'
                    ? 'btn-gold-primary'
                    : 'font-bold text-[#DBADFF]/80 hover:text-[#FFBF24]'
                }`}
              >
                Loja
              </button>

              <button
                type="button"
                onClick={() => selecionarAba('serviceiros')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs transition cursor-pointer ${
                  abaPrincipal === 'serviceiros'
                    ? 'btn-gold-primary'
                    : 'font-bold text-[#DBADFF]/85 hover:text-[#FFBF24]'
                }`}
              >
                <i
                  className={`fa-solid fa-shield-halved ${
                    abaPrincipal === 'serviceiros' ? 'text-[#100919]' : 'text-[#FFBF24]'
                  }`}
                />
                Serviceiro de Confiança
              </button>
            </nav>
          </div>

          <div className="hidden lg:block flex-1 max-w-sm">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#DBADFF]/60" />
              <input
                type="text"
                value={busca}
                onChange={(e) => onMudarBusca?.(e.target.value)}
                placeholder={
                  abaPrincipal === 'loja'
                    ? 'Buscar Tibia Coins, Quests, Gift Cards...'
                    : 'Buscar serviceiro ou servidor...'
                }
                className="dark-input w-full rounded-xl py-2 pl-9 pr-4 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAbrirRastreio}
              className="btn-gold-secondary hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs cursor-pointer"
            >
              <i className="fa-solid fa-box" />
              <span className="hidden xl:inline">Rastrear Pedido</span>
              <span className="xl:hidden">Rastrear</span>
            </button>

            <button
              type="button"
              onClick={onAbrirConta}
              className="btn-gold-secondary hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs cursor-pointer"
            >
              <i className="fa-solid fa-user" />
              <span>{usuarioLogado?.nome || 'Entrar / Cadastrar'}</span>
            </button>

            <button
              type="button"
              onClick={onAbrirCarrinho}
              className="btn-gold-primary inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs cursor-pointer"
            >
              <i className="fa-solid fa-cart-shopping" />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border border-[#FFBF24]/50 bg-[#100919] px-1.5 text-[10px] font-black text-[#FFBF24]">
                {totalItensCarrinho}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuMobileAberto((v) => !v)}
              aria-label="Abrir menu"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[#FFBF24]/45 bg-[#190E27] text-[#FFBF24] cursor-pointer"
            >
              <i className={`fa-solid ${menuMobileAberto ? 'fa-xmark' : 'fa-bars'}`} />
            </button>
          </div>
        </div>

        {menuMobileAberto && (
          <div className="md:hidden border-t border-[#DBADFF]/15 bg-[#190E27] px-4 py-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selecionarAba('loja')}
                className={`rounded-xl py-2.5 text-xs cursor-pointer ${
                  abaPrincipal === 'loja' ? 'btn-gold-primary' : 'btn-gold-secondary'
                }`}
              >
                Loja
              </button>
              <button
                type="button"
                onClick={() => selecionarAba('serviceiros')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs cursor-pointer ${
                  abaPrincipal === 'serviceiros' ? 'btn-gold-primary' : 'btn-gold-secondary'
                }`}
              >
                <i className="fa-solid fa-shield-halved" />
                Serviceiros
              </button>
            </div>

            <div className="relative">
              <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#DBADFF]/60" />
              <input
                type="text"
                value={busca}
                onChange={(e) => onMudarBusca?.(e.target.value)}
                placeholder={
                  abaPrincipal === 'loja' ? 'Buscar na loja...' : 'Buscar serviceiro ou servidor...'
                }
                className="dark-input w-full rounded-xl py-2 pl-9 pr-3 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuMobileAberto(false);
                  onAbrirRastreio?.();
                }}
                className="btn-gold-secondary rounded-xl py-2 text-xs cursor-pointer"
              >
                <i className="fa-solid fa-box mr-1.5" />
                Rastrear Pedido
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuMobileAberto(false);
                  onAbrirConta?.();
                }}
                className="btn-gold-secondary rounded-xl py-2 text-xs cursor-pointer"
              >
                <i className="fa-solid fa-user mr-1.5" />
                {usuarioLogado?.nome || 'Entrar / Cadastrar'}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}