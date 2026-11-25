import { useEffect, useState } from 'react';

const ATALHOS_TC = [250, 500, 1000, 2500];

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0));

export default function StoreHero({
  refreshKey = 0,
  onIrParaCatalogo,
  onIrParaClubeVip,
  onIrParaServiceiros,
  onAdicionarTc,
  onSolicitarVendaTc,
  onNotify,
}) {
  const [slideAtivo, setSlideAtivo] = useState(0);
  const [abaTc, setAbaTc] = useState('comprar');
  const [qtdCompraTc, setQtdCompraTc] = useState(250);
  const [qtdVendaTc, setQtdVendaTc] = useState(250);
  const [personagemCalc, setPersonagemCalc] = useState('');

  const [cotacao, setCotacao] = useState({
    precoVendaUnit: 0.196,
    precoCompraUnit: 0.176,
    personagemRecebimento: 'Modotank',
    estoque: 1000,
    compraAtivo: true,
  });

  useEffect(() => {
    let ativo = true;
    fetch('/api/loja')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ativo || !data) return;
        setCotacao({
          precoVendaUnit: Number(data.preco_unitario) || 0.196,
          precoCompraUnit: Number(data.preco_compra_unitario) || 0.176,
          personagemRecebimento: data.personagem_recebimento || 'Modotank',
          estoque: Number(data.estoque) || 0,
          compraAtivo: data.compra_ativo !== false,
        });
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const precoVenda250 = cotacao.precoVendaUnit * 250;
  const valorCompraTc = qtdCompraTc * cotacao.precoVendaUnit;
  const valorVendaTc = qtdVendaTc * cotacao.precoCompraUnit;

  const slides = [
    {
      etiqueta: 'Cotação Oficial • Entrega Imediata',
      titulo: 'Tibia Coins com o Melhor Preço no PIX',
      subtitulo:
        'Compre ou venda suas Tibia Coins com segurança total, transferência rápida e suporte humanizado direto pelo WhatsApp.',
      cta: 'Ver Ofertas da Loja',
      ctaAction: () => onIrParaCatalogo?.(),
      badge: `250 TC por ${formatBRL(precoVenda250)}`,
    },
    {
      etiqueta: 'Clube Vip - Cupom MILLA5',
      titulo: 'Receba Alertas de Cotação em Tempo Real',
      subtitulo:
        'Seja avisado primeiro quando o preço das Tibia Coins cair ou subir na compra e garanta R$ 5,00 OFF no seu pedido.',
      cta: 'Ativar Alerta VIP',
      ctaAction: () => onIrParaClubeVip?.(),
      badge: 'Cupom MILLA5 ativo',
    },
    {
      etiqueta: 'Parceiros Verificados',
      titulo: 'Serviceiros de Confiança em Vários Mundos',
      subtitulo:
        'Precisa de Soul War, Rotten Blood ou bosses? Fale direto com serviceiros verificados pela Milla Store.',
      cta: 'Ver Serviceiros',
      ctaAction: () => onIrParaServiceiros?.(),
      badge: 'Serviceiros Verificados',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideAtivo((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCopiarPersonagem = async () => {
    try {
      await navigator.clipboard.writeText(cotacao.personagemRecebimento);
      onNotify?.(`Personagem "${cotacao.personagemRecebimento}" copiado!`);
    } catch {
      onNotify?.(`Envie para: ${cotacao.personagemRecebimento}`);
    }
  };

 const handleAcaoCalculadora = () => {
    if (abaTc === 'comprar') {
      onAdicionarTc?.({
        id: `tc-custom-${qtdCompraTc}`,
        nome: `${qtdCompraTc.toLocaleString('pt-BR')} Tibia Coins`,
        preco: Number(valorCompraTc.toFixed(2)),
        tcQtd: qtdCompraTc,
        personagem: personagemCalc.trim(),
      });
    } else {
      if (!cotacao.compraAtivo) {
        onNotify?.('A compra de Tibia Coins está temporariamente pausada.');
        return;
      }
      onSolicitarVendaTc?.({
        quantidade: qtdVendaTc,
        valorTotal: Number(valorVendaTc.toFixed(2)),
        personagemRecebimento: cotacao.personagemRecebimento,
      });
    }
  };



  const slideAtual = slides[slideAtivo];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Banner Dark Fantasy (7 colunas) */}
      <div className="lg:col-span-7 relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#A126F5]/35 bg-gradient-to-br from-[#23103A] via-[#170B28] to-[#100919] p-6 sm:p-8 shadow-[0_0_45px_rgba(161,38,245,0.18)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#A126F5]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-6 right-6 opacity-10">
          <i className="fa-solid fa-crown text-[150px] text-[#FFBF24]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DBADFF]/30 bg-[#A126F5]/20 px-3 py-1 text-[11px] font-bold text-[#DBADFF]">
              <i className="fa-solid fa-sparkles text-[#FFBF24]" />
              {slideAtual.etiqueta}
            </span>
            <span className="rounded-full border border-[#FFBF24]/45 bg-[#FFBF24]/15 px-3 py-1 text-[11px] font-extrabold text-[#FFBF24]">
              {slideAtual.badge}
            </span>
          </div>

          <h1 className="mt-5 text-2xl sm:text-4xl font-black tracking-tight text-[#FFF1D5] leading-tight max-w-xl">
            {slideAtual.titulo}
          </h1>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#DBADFF]/85 max-w-lg">
            {slideAtual.subtitulo}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={slideAtual.ctaAction}
              className="btn-gold-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm cursor-pointer"
            >
              <span>{slideAtual.cta}</span>
              <i className="fa-solid fa-arrow-right" />
            </button>

            <button
              type="button"
              onClick={() => onIrParaServiceiros?.()}
              className="btn-gold-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-xs cursor-pointer"
            >
              <i className="fa-solid fa-shield-halved" />
              <span>Serviceiro de Confiança</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex items-center justify-between border-t border-[#DBADFF]/15 pt-4">
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSlideAtivo(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  slideAtivo === idx
                    ? 'w-8 bg-[#FFBF24]'
                    : 'w-2 bg-[#DBADFF]/30 hover:bg-[#DBADFF]/60'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSlideAtivo((prev) => (prev - 1 + slides.length) % slides.length)}
              aria-label="Slide anterior"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFBF24]/35 bg-[#100919]/70 text-[#FFBF24] hover:bg-[#FFBF24] hover:text-[#100919] transition cursor-pointer"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
            <button
              type="button"
              onClick={() => setSlideAtivo((prev) => (prev + 1) % slides.length)}
              aria-label="Próximo slide"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFBF24]/35 bg-[#100919]/70 text-[#FFBF24] hover:bg-[#FFBF24] hover:text-[#100919] transition cursor-pointer"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Calculadora Rápida de Compra e Venda de TC (5 colunas) */}
      <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#FFBF24]/35 bg-[#190E27]/95 p-5 sm:p-6 shadow-[0_0_35px_rgba(255,191,36,0.08)]">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DBADFF]">
                Estoque: {cotacao.estoque.toLocaleString('pt-BR')} TC
              </span>
              <h2 className="text-lg font-black text-[#FFBF24]">Compra &amp; Venda de TC</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FFBF24]/35 bg-[#FFBF24]/15">
              <i className="fa-solid fa-coins text-lg text-[#FFBF24]" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl border border-[#DBADFF]/15 bg-[#100919] p-1">
            <button
              type="button"
              onClick={() => setAbaTc('comprar')}
              className={`rounded-lg py-2 text-xs transition cursor-pointer ${
                abaTc === 'comprar'
                  ? 'btn-gold-primary'
                  : 'font-bold text-[#DBADFF]/75 hover:text-[#FFBF24]'
              }`}
            >
              Comprar TC
            </button>
            <button
              type="button"
              onClick={() => setAbaTc('vender')}
              className={`rounded-lg py-2 text-xs transition cursor-pointer ${
                abaTc === 'vender'
                  ? 'btn-gold-primary'
                  : 'font-bold text-[#DBADFF]/75 hover:text-[#FFBF24]'
              }`}
            >
              Vender TC
            </button>
          </div>

          {abaTc === 'comprar' ? (
            <div className="mt-4 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#DBADFF]/80">Quantidade de Tibia Coins</span>
                <span className="text-base font-black text-[#FFBF24]">
                  {qtdCompraTc.toLocaleString('pt-BR')} TC
                </span>
              </div>

              <input
                type="range"
                min={25}
                max={5000}
                step={25}
                value={qtdCompraTc}
                onChange={(e) => setQtdCompraTc(Number(e.target.value))}
                className="w-full accent-[#FFBF24] cursor-pointer"
              />

              <div className="grid grid-cols-4 gap-1.5">
                {ATALHOS_TC.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setQtdCompraTc(v)}
                    className={`rounded-lg border py-1.5 text-[11px] font-bold transition cursor-pointer ${
                      qtdCompraTc === v
                        ? 'border-[#FFBF24] bg-[#FFBF24] text-[#100919] font-extrabold'
                        : 'border-[#FFBF24]/30 bg-[#100919] text-[#FFBF24] hover:bg-[#FFBF24]/15'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#DBADFF]">
                  Nome do Personagem (opcional)
                </label>
                <input
                  type="text"
                  value={personagemCalc}
                  onChange={(e) => setPersonagemCalc(e.target.value)}
                  placeholder="Ex: Knight Valente"
                  className="dark-input w-full rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#DBADFF]/80">Quantas TC deseja vender?</span>
                <span className="text-base font-black text-[#FFBF24]">
                  {qtdVendaTc.toLocaleString('pt-BR')} TC
                </span>
              </div>

              <input
                type="range"
                min={25}
                max={5000}
                step={25}
                value={qtdVendaTc}
                onChange={(e) => setQtdVendaTc(Number(e.target.value))}
                className="w-full accent-[#FFBF24] cursor-pointer"
              />

              <div className="grid grid-cols-4 gap-1.5">
                {ATALHOS_TC.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setQtdVendaTc(v)}
                    className={`rounded-lg border py-1.5 text-[11px] font-bold transition cursor-pointer ${
                      qtdVendaTc === v
                        ? 'border-[#FFBF24] bg-[#FFBF24] text-[#100919] font-extrabold'
                        : 'border-[#FFBF24]/30 bg-[#100919] text-[#FFBF24] hover:bg-[#FFBF24]/15'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#A126F5]/30 bg-[#100919] p-3 text-xs">
                <div>
                  <span className="block text-[10px] text-[#DBADFF]/70">
                    Transferir para o char:
                  </span>
                  <strong className="text-[#FFBF24]">{cotacao.personagemRecebimento}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleCopiarPersonagem}
                  className="btn-gold-secondary inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] cursor-pointer"
                >
                  <i className="fa-regular fa-copy" />
                  Copiar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-[#DBADFF]/15 pt-3.5">
          <button
            type="button"
            onClick={handleAcaoCalculadora}
            className="btn-gold-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm cursor-pointer"
          >
            {abaTc === 'comprar' ? (
              <>
                <i className="fa-solid fa-cart-shopping" />
                <span>Comprar Agora ({formatBRL(valorCompraTc)})</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-wallet" />
                <span>Solicitar Venda ({formatBRL(valorVendaTc)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}