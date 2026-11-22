import { useState } from 'react';
import {
  buildWhatsAppUrl,
  generateSimulatorMessage,
  generateSimulatorPreview,
} from '../utils/whatsapp';

const VOCATIONS = [
  { id: 'Knight', label: 'Knight', icon: 'fa-solid fa-shield-halved text-cyan-300' },
  { id: 'Paladin', label: 'Paladin', icon: 'fa-solid fa-crosshairs text-violet-300' },
];

const UPLEVEL_TYPES = [
  { id: 'Solo', label: 'Solo', icon: 'fa-solid fa-user-ninja text-cyan-300' },
  { id: 'PT4x', label: 'PT4x', icon: 'fa-solid fa-users text-violet-300' },
];

export default function CharacterSimulator({ onNotify }) {
  const [formState, setFormState] = useState({
    vocation: 'Knight',
    playerName: '',
    level: '',
    server: '',
    uplevelType: 'Solo',
  });

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = buildWhatsAppUrl(generateSimulatorMessage(formState));
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotify('Abrindo simulação no WhatsApp...');
  };

  const previewText = generateSimulatorPreview(formState);

  return (
    <section
      aria-labelledby="simuladorTitle"
      className="glass-card rounded-3xl p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400">
            Orçamento Instantâneo
          </span>
          <h2 id="simuladorTitle" className="mt-0.5 text-lg font-bold text-white sm:text-xl">
            Informe os dados do seu personagem.
          </h2>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple/30 to-accent-cyan/30 border border-white/10 text-cyan-300">
          <i className="fa-solid fa-wand-magic-sparkles" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vocação */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Vocação do Personagem
          </label>
          <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Selecionar vocação">
            {VOCATIONS.map((voc) => (
              <button
                key={voc.id}
                type="button"
                onClick={() => updateField('vocation', voc.id)}
                className={`selector-pill flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-sm font-bold cursor-pointer ${
                  formState.vocation === voc.id ? 'is-active' : ''
                }`}
              >
                <i className={voc.icon} />
                <span>{voc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seu Nome (Opcional) */}
        <div>
          <label
            htmlFor="inputPlayerName"
            className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            <span>Seu nome</span>
            <span className="text-[10px] font-normal normal-case text-slate-400">
              (opcional)
            </span>
          </label>
          <div className="relative">
            <i className="fa-regular fa-user pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              id="inputPlayerName"
              type="text"
              value={formState.playerName}
              onChange={(e) => updateField('playerName', e.target.value)}
              placeholder="Digite seu nome"
              autoComplete="name"
              className="dark-input w-full rounded-xl py-2.5 pl-9 pr-3.5 text-sm"
            />
          </div>
        </div>

        {/* Level & Servidor */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="inputLevel"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Level
            </label>
            <div className="relative">
              <i className="fa-solid fa-arrow-trend-up pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-cyan-400/80" />
              <input
                id="inputLevel"
                type="number"
                min="1"
                max="5000"
                inputMode="numeric"
                value={formState.level}
                onChange={(e) => updateField('level', e.target.value)}
                placeholder="Ex.: 750"
                className="dark-input w-full rounded-xl py-2.5 pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="inputServer"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Servidor
            </label>
            <div className="relative">
              <i className="fa-solid fa-globe pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-violet-400/80" />
              <input
                id="inputServer"
                type="text"
                value={formState.server}
                onChange={(e) => updateField('server', e.target.value)}
                placeholder="Ex.: Jadebra"
                className="dark-input w-full rounded-xl py-2.5 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tipo de Uplevel */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Tipo de Up level
          </label>
          <div
            className="grid grid-cols-2 gap-2.5"
            role="group"
            aria-label="Selecionar tipo de Uplevel"
          >
            {UPLEVEL_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => updateField('uplevelType', type.id)}
                className={`selector-pill flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-sm font-bold cursor-pointer ${
                  formState.uplevelType === type.id ? 'is-active' : ''
                }`}
              >
                <i className={type.icon} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prévia da Mensagem Automática */}
        <div className="rounded-2xl border border-white/10 bg-[#07040F]/70 p-3.5">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>
              <i className="fa-brands fa-whatsapp mr-1 text-emerald-400" />
              Prévia da mensagem
            </span>
            <span className="text-cyan-400">Automática</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-200">{previewText}</p>
        </div>

        {/* CTA Principal */}
        <button
          type="submit"
          className="btn-tech-gradient flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 px-5 text-sm font-bold tracking-wide text-white shadow-neon-purple cursor-pointer sm:text-base"
        >
          <i className="fa-brands fa-whatsapp text-lg" />
          <span>Enviar Simulação no WhatsApp</span>
          <i className="fa-solid fa-arrow-right text-xs" />
        </button>
      </form>
    </section>
  );
}
