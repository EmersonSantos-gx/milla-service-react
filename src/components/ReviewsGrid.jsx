import { CONFIG } from '../data/config';

export default function ReviewsGrid() {
  return (
    <section aria-labelledby="avaliacoesTitle" className="mx-auto mt-10 w-full max-w-[680px]">
      <div className="mb-5 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left px-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400">
            Prova Social Verificada
          </span>
          <h2 id="avaliacoesTitle" className="mt-0.5 text-xl font-extrabold text-white sm:text-2xl">
            Avaliações de quem já contratou
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 backdrop-blur-md">
          <div className="flex items-center gap-0.5 text-xs text-amber-400" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, idx) => (
              <i key={idx} className="fa-solid fa-star" />
            ))}
          </div>
          <span className="text-xs font-bold text-amber-200">
            5.0 • {CONFIG.avaliacoes.length} avaliações
          </span>
        </div>
      </div>

      {/* Bento Grid 2x3 */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {CONFIG.avaliacoes.map((rev, index) => (
          <article
            key={`${rev.nome}-${index}`}
            className="glass-card flex flex-col justify-between rounded-2xl p-4 text-left"
          >
            <div>
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div
                  className="flex items-center gap-0.5 text-[11px]"
                  aria-label={`${rev.estrelas} de 5 estrelas`}
                >
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <i
                      key={idx}
                      className={
                        idx < rev.estrelas
                          ? 'fa-solid fa-star text-amber-400'
                          : 'fa-regular fa-star text-slate-600'
                      }
                    />
                  ))}
                </div>
                <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  Lv. {rev.level}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">
                &ldquo;{rev.descricao}&rdquo;
              </p>
            </div>

            <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-2.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{rev.nome}</p>
                <p className="truncate text-[11px] text-violet-300">{rev.personagem}</p>
              </div>
              <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                <i className="fa-solid fa-globe mr-1 text-cyan-400/80" />
                {rev.servidor}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
