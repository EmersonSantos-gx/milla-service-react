import { useEffect, useState } from 'react';

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0));

export default function OrderTrackingModal({
  isOpen,
  onClose,
  pedidosLocais = {},
  codigoInicial = '',
  onNotify,
}) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const [resultado, setResultado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const consultarPedido = async (rawCodigo) => {
    const limpo = String(rawCodigo || '').trim();
    if (!limpo) return;

    const normalizado = limpo.startsWith('#') ? limpo : `#${limpo}`;
    setBuscando(true);

    try {
      const idNumerico = limpo.replace(/\D/g, '');
      if (idNumerico) {
        const res = await fetch(`/api/rastrear-pedido?id=${encodeURIComponent(idNumerico)}`);
        if (res.ok) {
          const data = await res.json();
          setResultado(data);
          setBuscando(false);
          return;
        }
      }

      if (pedidosLocais[normalizado]) {
        setResultado(pedidosLocais[normalizado]);
      } else {
        setResultado(null);
        onNotify?.(`Pedido ${normalizado} não encontrado.`);
      }
    } catch {
      if (pedidosLocais[normalizado]) {
        setResultado(pedidosLocais[normalizado]);
      } else {
        setResultado(null);
        onNotify?.('Erro ao consultar pedido.');
      }
    } finally {
      setBuscando(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (codigoInicial) {
      setCodigo(codigoInicial);
      consultarPedido(codigoInicial);
    } else {
      setResultado(null);
    }
  }, [isOpen, codigoInicial]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    consultarPedido(codigo);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-[#FFBF24]/35 bg-[#190E27] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-box text-[#FFBF24]" />
            <h3 className="text-base font-black text-[#FFF1D5]">Rastrear Pedido</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar rastreador"
            className="text-[#DBADFF] hover:text-[#FFBF24] cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Digite o nº do pedido (ex: 12)"
            className="dark-input flex-1 rounded-xl px-3.5 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={buscando}
            className="btn-gold-primary rounded-xl px-4 py-2 text-xs cursor-pointer disabled:opacity-60"
          >
            {buscando ? '...' : 'Consultar'}
          </button>
        </form>

        {resultado ? (
          <div className="rounded-2xl border border-[#DBADFF]/15 bg-[#100919] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm text-[#FFF1D5]">{resultado.id}</strong>
              <span className="rounded-full border border-[#FFBF24]/40 bg-[#FFBF24]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#FFBF24]">
                {resultado.status}
              </span>
            </div>

            <p className="text-[#DBADFF]/85">
              {resultado.item} • <strong className="text-[#FFF1D5]">{resultado.personagem}</strong>
            </p>

            {resultado.valor !== undefined && (
              <p className="text-[11px] font-bold text-[#FFBF24]">
                Valor: {formatBRL(resultado.valor)}
              </p>
            )}

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['PIX / Pedido', 'Confirmado', 'Entregue'].map((etapaLabel, i) => {
                const concluida = Number(resultado.etapa || 0) >= i + 1;
                return (
                  <div key={etapaLabel} className="space-y-1 text-center">
                    <div
                      className={`h-1.5 rounded-full ${
                        concluida ? 'bg-[#FFBF24]' : 'bg-[#DBADFF]/15'
                      }`}
                    />
                    <span
                      className={`block text-[10px] font-bold ${
                        concluida ? 'text-[#FFBF24]' : 'text-[#DBADFF]/45'
                      }`}
                    >
                      {etapaLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="flex items-center gap-1.5 pt-1 text-[10px] text-[#DBADFF]/60">
              <i className="fa-regular fa-clock" />
              <span>Atualizado: {resultado.atualizadoEm}</span>
            </p>
          </div>
        ) : (
          <p className="rounded-2xl border border-[#DBADFF]/10 bg-[#100919]/60 p-4 text-center text-xs text-[#DBADFF]/65">
            Informe o número do pedido para acompanhar o status em tempo real.
          </p>
        )}
      </div>
    </div>
  );
}