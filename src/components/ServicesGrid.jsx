import { CONFIG } from '../data/config';
import { buildWhatsAppUrl } from '../utils/whatsapp';

export default function ServicesGrid() {
  return (
    <section aria-labelledby="servicosTitle" className="space-y-3.5">
      <div className="flex items-end justify-between px-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-400">
            Vitrine de Serviços
          </span>
          <h2 id="servicosTitle" className="text-lg font-bold text-white sm:text-xl">
            Escolha o serviço que deseja.
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">Fique a vontade para escolher!</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CONFIG.servicos.map((item) => (
          <a
            key={item.numero}
            href={buildWhatsAppUrl(item.mensagemZap)}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card group relative flex flex-col justify-between rounded-2xl p-4 text-left overflow-hidden"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-widest text-tech-gradient">
                {item.numero}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 ${item.corIcone} transition-transform duration-200 group-hover:scale-110`}
              >
                <i className={`${item.icone} text-sm`} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-snug group-hover:text-cyan-200 transition-colors">
                {item.titulo}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {item.descricao}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
