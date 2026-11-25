import { useEffect, useMemo, useState } from 'react';

const ITENS_POR_PAGINA = 12; // Grid 4 colunas x 3 linhas

const formatarDataCompleta = (dataIso) => {
  if (!dataIso) return '';
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function ReviewsGrid({ refreshKey = 0, onOpenReviewForm }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    fetch('/api/avaliacoes')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!ativo) return;
        const lista = Array.isArray(data) ? data : [];
        setAvaliacoes(lista);
        setPaginaAtual(1);
      })
      .catch(() => {
        if (ativo) setAvaliacoes([]);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const mediaEstrelas = useMemo(() => {
    if (avaliacoes.length === 0) return '5.0';
    const soma = avaliacoes.reduce((acc, item) => acc + Number(item.estrelas || 5), 0);
    return (soma / avaliacoes.length).toFixed(1);
  }, [avaliacoes]);

  const totalPaginas = Math.max(1, Math.ceil(avaliacoes.length / ITENS_POR_PAGINA));

  const avaliacoesPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return avaliacoes.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [avaliacoes, paginaAtual]);

  return (
    <section id="avaliacoes-clientes" className="scroll-mt-28 space-y-6">
      {/* Cabeçalho Profissional */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DBADFF]/15 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFBF24]/35 bg-[#FFBF24]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#FFBF24]">
            <i className="fa-solid fa-circle-check" />
            Feedback Verificado
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#FFF1D5]">
            Avaliações de Clientes
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#DBADFF]/75">
            Relatos reais de jogadores que já negociaram Tibia Coins e serviços na Milla Store.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {avaliacoes.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-[#DBADFF]/15 bg-[#190E27] px-3.5 py-2 text-xs">
              <i className="fa-solid fa-star text-[#FFBF24]" />
              <strong className="text-sm font-black text-[#FFF1D5]">{mediaEstrelas}</strong>
              <span className="text-[#DBADFF]/70">
                ({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </div>
          )}

          {onOpenReviewForm && (
            <button
              type="button"
              onClick={onOpenReviewForm}
              className="btn-gold-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs cursor-pointer"
            >
              <i className="fa-solid fa-pen-to-square" />
              <span>Avaliar Atendimento</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid 4x3 */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-48 animate-pulse rounded-2xl border border-[#DBADFF]/10 bg-[#190E27]/60"
            />
          ))}
        </div>
      ) : avaliacoesPagina.length === 0 ? (
        <div className="rounded-3xl border border-[#DBADFF]/15 bg-[#190E27]/75 p-10 text-center space-y-3">
          <i className="fa-regular fa-comment-dots text-2xl text-[#FFBF24]/70" />
          <p className="text-sm text-[#DBADFF]/80">
            Ainda não há avaliações publicadas. Seja o primeiro a deixar seu feedback!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {avaliacoesPagina.map((item) => {
              const estrelas = Math.min(5, Math.max(1, Number(item.estrelas || 5)));
              const dataPostagem = formatarDataCompleta(item.criado_em);

              return (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#DBADFF]/15 bg-[#190E27]/90 p-4 hover:border-[#FFBF24]/45 hover:shadow-[0_0_24px_rgba(161,38,245,0.16)] transition"
                >
                  <div>
                    {/* Topo: Estrelas + Data de Postagem */}
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-0.5 text-[11px] text-[#FFBF24]"
                        aria-label={`${estrelas} de 5 estrelas`}
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i
                            key={i}
                            className={`fa-star ${
                              i < estrelas
                                ? 'fa-solid text-[#FFBF24]'
                                : 'fa-regular text-[#DBADFF]/25'
                            }`}
                          />
                        ))}
                      </div>

                      {dataPostagem && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#DBADFF]/60">
                          <i className="fa-regular fa-calendar text-[9px] text-[#FFBF24]/75" />
                          {dataPostagem}
                        </span>
                      )}
                    </div>

                    {/* Comentário */}
                    <p className="mt-3 text-xs leading-relaxed text-[#FFF1D5]/90">
                      &ldquo;{item.descricao}&rdquo;
                    </p>
                  </div>

                  {/* Rodapé: Personagem, Servidor/Level e Cliente */}
                  <div className="mt-4 border-t border-[#DBADFF]/10 pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="truncate text-xs font-extrabold text-[#FFF1D5]">
                        {item.personagem || item.nome}
                      </strong>
                      <span className="shrink-0 rounded-md border border-[#A126F5]/35 bg-[#A126F5]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#DBADFF]">
                        {item.servidor || 'Tibia'}
                        {item.level ? ` • Lv ${item.level}` : ''}
                      </span>
                    </div>

                    {item.nome && item.personagem && (
                      <span className="mt-1 block truncate text-[10px] text-[#DBADFF]/55">
                        Cliente: {item.nome}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Paginação (aparece automaticamente se passar de 12 comentários) */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                className="btn-gold-secondary rounded-xl px-3.5 py-2 text-xs disabled:opacity-40 cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left mr-1.5" />
                Anterior
              </button>

              <span className="px-3 text-xs font-bold text-[#DBADFF]">
                Página <strong className="text-[#FFBF24]">{paginaAtual}</strong> de {totalPaginas}
              </span>

              <button
                type="button"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                className="btn-gold-secondary rounded-xl px-3.5 py-2 text-xs disabled:opacity-40 cursor-pointer"
              >
                Próxima
                <i className="fa-solid fa-chevron-right ml-1.5" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}