import { useEffect, useState } from 'react';
import CheckoutModal from './CheckoutModal';

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export default function StoreSection({ onNotify }) {
  const [loja, setLoja] = useState(null);
  const [quantidade, setQuantidade] = useState(250);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    fetch('/api/loja')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setLoja(data);
          const maxDisponivel = Math.floor(Number(data.estoque) / 25) * 25;
          const minimo = Number(data.minimo_tc) || 25;
          setQuantidade(Math.min(Math.max(250, minimo), maxDisponivel || minimo));
        }
      })
      .catch(() => {});
  }, []);

  if (!loja || !loja.ativo) return null;

  const precoUnitario = Number(loja.preco_unitario);
  const minimo = Number(loja.minimo_tc) || 25;
  const maxDisponivel = Math.floor(Number(loja.estoque) / 25) * 25;
  const semEstoque = maxDisponivel < minimo;
  const valorTotal = quantidade * precoUnitario;
  const atalhos = [250, 500, 1000, 2500].filter((v) => v >= minimo && v <= maxDisponivel);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
          <i className="fa-solid fa-coins mr-2 text-amber-400" />
          Loja de Tibia Coins
        </h2>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
          {semEstoque ? 'Esgotado' : `Estoque: ${maxDisponivel.toLocaleString('pt-BR')} TC`}
        </span>
      </div>

      <div className="glass-card rounded-3xl border border-cyan-400/25 p-5 text-left">
        <div className="flex items-center gap-4">
          <img
            src={loja.imagem_url || '/tibiacoins.png'}
            alt={loja.nome}
            className="h-20 w-20 rounded-2xl border border-white/10 bg-slate-900/80 object-cover p-1.5"
          />
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">{loja.nome}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{loja.descricao}</p>
            <p className="mt-1.5 text-[11px] text-cyan-300">
              {formatBRL(precoUnitario * 250)} a cada 250 TC
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                Quantidade
              </span>
              <span className="text-2xl font-extrabold text-amber-400">
                {semEstoque ? 0 : quantidade.toLocaleString('pt-BR')}{' '}
                <span className="text-sm font-bold text-amber-300/80">TC</span>
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                Total
              </span>
              <span className="text-2xl font-extrabold text-white">
                {semEstoque ? 'R$ 0,00' : formatBRL(valorTotal)}
              </span>
            </div>
          </div>

          <input
            type="range"
            min={minimo}
            max={Math.max(minimo, maxDisponivel)}
            step={25}
            disabled={semEstoque}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 disabled:opacity-40"
          />

          <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
            <span>{minimo} TC</span>
            <span>{maxDisponivel.toLocaleString('pt-BR')} TC</span>
          </div>

          {atalhos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {atalhos.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setQuantidade(valor)}
                  className={`rounded-xl border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    quantidade === valor
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {valor} TC
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={semEstoque}
          onClick={() => setCheckoutOpen(true)}
          className="btn-tech-gradient mt-4 w-full rounded-2xl py-3.5 text-sm font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <i className="fa-solid fa-cart-shopping mr-2" />
          {semEstoque ? 'Sem estoque no momento' : `Comprar ${quantidade} TC • ${formatBRL(valorTotal)}`}
        </button>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        loja={loja}
        quantidade={quantidade}
        valorTotal={valorTotal}
        onNotify={onNotify}
      />
    </section>
  );
}