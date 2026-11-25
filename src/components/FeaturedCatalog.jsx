import { useEffect, useMemo, useState } from 'react';

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0));

export default function FeaturedCatalog({
  refreshKey = 0,
  busca = '',
  onLimparBusca,
  onAdicionarProduto,
}) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [ordenacao, setOrdenacao] = useState('mais_vendidos');

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    fetch('/api/produtos')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!ativo) return;
        const normalizados = (Array.isArray(data) ? data : []).map((p) => ({
          id: p.slug || String(p.id),
          dbId: p.id,
          nome: p.nome,
          descricao: p.descricao,
          preco: Number(p.preco || 0),
          tag: p.tag || 'Destaque',
          icone: p.icone || 'fa-coins',
          corIcone: p.cor_icone || 'text-[#FFBF24]',
          destaque: p.destaque || 'Entrega rápida',
        }));
        setProdutos(normalizados);
      })
      .catch(() => {
        if (ativo) setProdutos([]);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = !termo
      ? [...produtos]
      : produtos.filter(
          (p) =>
            p.nome.toLowerCase().includes(termo) ||
            p.descricao.toLowerCase().includes(termo) ||
            p.tag.toLowerCase().includes(termo)
        );

    if (ordenacao === 'menor_preco') {
      lista.sort((a, b) => a.preco - b.preco);
    } else if (ordenacao === 'maior_preco') {
      lista.sort((a, b) => b.preco - a.preco);
    }
    return lista;
  }, [produtos, busca, ordenacao]);

  return (
    <section id="catalogo-destaque" className="scroll-mt-28 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#DBADFF]/15 pb-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#DBADFF]">
            Vitrine Oficial
          </span>
          <h2 className="mt-0.5 text-2xl font-black text-[#FFF1D5]">
            Destaques da Milla Store
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {busca.trim() && (
            <button
              type="button"
              onClick={() => onLimparBusca?.()}
              className="text-xs font-bold text-[#DBADFF] hover:text-[#FFBF24] transition cursor-pointer"
            >
              Limpar busca &ldquo;{busca}&rdquo;
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#DBADFF]/75">Ordenar:</span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="rounded-xl border border-[#FFBF24]/40 bg-[#190E27] px-3 py-1.5 text-xs font-bold text-[#FFF1D5] outline-none focus:border-[#FFBF24] cursor-pointer"
            >
              <option value="mais_vendidos">Mais vendidos</option>
              <option value="menor_preco">Menor preço</option>
              <option value="maior_preco">Maior preço</option>
            </select>
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-60 animate-pulse rounded-2xl border border-[#DBADFF]/10 bg-[#190E27]/60"
            />
          ))}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="rounded-3xl border border-[#DBADFF]/15 bg-[#190E27]/70 p-10 text-center text-sm text-[#DBADFF]/75">
          {busca.trim()
            ? `Nenhum item encontrado para "${busca}".`
            : 'Nenhum produto ativo cadastrado no momento.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {produtosFiltrados.map((prod) => {
            const precoPix = prod.preco * 0.95;
            return (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#DBADFF]/15 bg-[#190E27]/85 p-4 hover:border-[#FFBF24]/50 hover:shadow-[0_0_25px_rgba(161,38,245,0.18)] transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#A126F5]/35 bg-gradient-to-br from-[#2B124C] to-[#100919]">
                      <i className={`fa-solid ${prod.icone} text-xl ${prod.corIcone}`} />
                    </div>
                    <span className="rounded-full border border-[#FFBF24]/35 bg-[#FFBF24]/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#FFBF24]">
                      {prod.tag}
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-sm font-extrabold text-[#FFF1D5] group-hover:text-[#FFBF24] transition">
                    {prod.nome}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#DBADFF]/75">
                    {prod.descricao}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DBADFF]/10 space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-[#FFBF24]">
                        {formatBRL(precoPix)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300">
                        -5% no PIX
                      </span>
                    </div>
                    <span className="block text-[10px] text-[#DBADFF]/60">
                      ou {formatBRL(prod.preco)} no cartão • {prod.destaque}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAdicionarProduto?.(prod)}
                    className="btn-gold-primary flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs cursor-pointer"
                  >
                    <i className="fa-solid fa-plus" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}