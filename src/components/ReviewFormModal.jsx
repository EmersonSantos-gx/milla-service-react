import { useState } from 'react';

export default function ReviewFormModal({ isOpen, onClose, onNotify }) {
  const [form, setForm] = useState({
    nome: '',
    personagem: '',
    servidor: '',
    level: '',
    estrelas: 5,
    descricao: '',
    website: '', // honeypot invisível
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar.');

      onNotify('Avaliação enviada! Assim que aprovada, aparecerá no site.');
      setForm({ nome: '', personagem: '', servidor: '', level: '', estrelas: 5, descricao: '', website: '' });
      onClose();
    } catch (err) {
      onNotify(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
    >
      <div className="glass-card w-full max-w-md rounded-3xl p-6 text-left border border-cyan-400/30">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Deixar Avaliação</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Campo invisível anti-spam */}
          <input
            type="text"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              placeholder="Seu nome"
              value={form.nome}
              onChange={(e) => update('nome', e.target.value)}
              className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
            />
            <input
              required
              placeholder="Personagem"
              value={form.personagem}
              onChange={(e) => update('personagem', e.target.value)}
              className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              placeholder="Servidor (Ex.: Jadebra)"
              value={form.servidor}
              onChange={(e) => update('servidor', e.target.value)}
              className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
            />
            <input
              required
              type="number"
              min="1"
              max="5000"
              placeholder="Level"
              value={form.level}
              onChange={(e) => update('level', e.target.value)}
              className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-300">Nota</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => update('estrelas', star)}
                  className="text-lg cursor-pointer"
                >
                  <i
                    className={
                      star <= form.estrelas
                        ? 'fa-solid fa-star text-amber-400'
                        : 'fa-regular fa-star text-slate-600'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            required
            rows={3}
            maxLength={400}
            placeholder="Conte como foi o serviço..."
            value={form.descricao}
            onChange={(e) => update('descricao', e.target.value)}
            className="dark-input w-full rounded-xl px-3 py-2.5 text-sm resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-tech-gradient w-full rounded-2xl py-3 text-sm font-bold text-white cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </form>
      </div>
    </div>
  );
}