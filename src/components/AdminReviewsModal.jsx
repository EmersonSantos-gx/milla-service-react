import { useState } from 'react';

export default function AdminReviewsModal({ isOpen, onClose, onNotify, onUpdated }) {
  const [token, setToken] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const fetchAll = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/avaliacoes?all=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Senha inválida.');
      const data = await res.json();
      setReviews(data);
      setLoaded(true);
    } catch (err) {
      onNotify(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleApprove = async (id, aprovado) => {
    const res = await fetch(`/api/avaliacoes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ aprovado }),
    });
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, aprovado } : r)));
      onUpdated();
      onNotify(aprovado ? 'Avaliação aprovada!' : 'Avaliação ocultada.');
    }
  };

  const removeReview = async (id) => {
    const res = await fetch(`/api/avaliacoes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      onUpdated();
      onNotify('Avaliação excluída.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="glass-card flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl p-6 text-left border border-violet-400/30">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Moderar Avaliações</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {!loaded ? (
          <form onSubmit={fetchAll} className="space-y-3">
            <input
              type="password"
              required
              placeholder="Digite sua senha de admin"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="dark-input w-full rounded-xl px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-tech-gradient w-full rounded-xl py-2.5 text-sm font-bold text-white cursor-pointer"
            >
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </form>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-1">
            {reviews.length === 0 && (
              <p className="text-xs text-slate-400">Nenhuma avaliação cadastrada.</p>
            )}
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-white/10 bg-[#07040F]/70 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">
                    {rev.nome} ({rev.personagem} • Lv. {rev.level} • {rev.servidor})
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      rev.aprovado
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {rev.aprovado ? 'Aprovada' : 'Pendente'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">&ldquo;{rev.descricao}&rdquo;</p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleApprove(rev.id, !rev.aprovado)}
                    className="rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-3 py-1.5 text-[11px] font-bold text-cyan-200 cursor-pointer"
                  >
                    {rev.aprovado ? 'Ocultar' : 'Aprovar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeReview(rev.id)}
                    className="rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-[11px] font-bold text-rose-200 cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}