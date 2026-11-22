import { getDirectWhatsAppUrl } from '../utils/whatsapp';

const DIFERENCIAIS = [
  {
    icone: 'fa-solid fa-wifi',
    cor: 'text-cyan-300',
    titulo: 'Duas conexões de internet',
    texto: 'Vivo e Brisanet Fibra.',
  },
  {
    icone: 'fa-solid fa-gauge-high',
    cor: 'text-violet-300',
    titulo: 'ExitLag',
    texto: 'Para auxiliar no uso das duas conexões durante o serviço.',
  },
  {
    icone: 'fa-solid fa-bolt',
    cor: 'text-cyan-300',
    titulo: 'Nobreak',
    texto: 'Fornece energia temporária em caso de queda de energia.',
  },
  {
    icone: 'fa-solid fa-clock',
    cor: 'text-violet-300',
    titulo: 'Horários flexíveis',
    texto: 'Consulte a disponibilidade pelo WhatsApp.',
  },
];

export default function AboutSection() {
  return (
    <section aria-labelledby="sobreTitle" className="space-y-4">
      <div className="glass-card rounded-3xl p-5 sm:p-6 text-left">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400">
              Sobre Mim
            </span>
            <h2 id="sobreTitle" className="mt-0.5 text-xl font-extrabold text-white">
              Kamilla — Milla “Modotank”
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300">
            Lv. 1300 • Jadebra
          </span>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
          <p>
            Olá, tudo bem? Sou a Kamilla, mais conhecida como{' '}
            <strong className="text-white">Milla “Modotank”</strong>. Atualmente, tenho um
            personagem de nível 1300 no servidor Jadebra.
          </p>
          <p>
            Ofereço serviços no Tibia com foco em ganho de experiência (XP). Trabalho com
            pontualidade, transparência e cuidado com a sua conta. Antes de começar, combinamos
            todos os detalhes do serviço. Durante o processo, você recebe atualizações pelo
            WhatsApp.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
            Meus diferenciais
          </h3>

          <div className="space-y-2.5">
            {DIFERENCIAIS.map((item) => (
              <div
                key={item.titulo}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#07040F]/60 p-3.5"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 ${item.cor}`}
                >
                  <i className={`${item.icone} text-sm`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.titulo}</h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {item.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href={getDirectWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-tech-gradient mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 px-5 text-sm font-bold tracking-wide text-white shadow-neon-purple"
        >
          <i className="fa-brands fa-whatsapp text-lg" />
          <span>Consultar disponibilidade no WhatsApp</span>
        </a>
      </div>
    </section>
  );
}