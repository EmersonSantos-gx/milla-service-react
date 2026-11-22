import { useState } from 'react';

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export default function CheckoutModal({ isOpen, onClose, loja, quantidade, valorTotal, onNotify }) {
  const [form, setForm] = useState({
    nome: '',
    whatsapp: '',
    personagem: '',
    servidor: '',
    metodo: loja?.pix_ativo ? 'pix' : 'cartao',
  });
  const [confirmouChar, setConfirmouChar] = useState(false);
  const [buscandoChar, setBuscandoChar] = useState(false);
  const [charStatus, setCharStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const buscarPersonagem = async () => {
    const nomeLimpo = form.personagem.trim();
    if (!nomeLimpo) {
      setCharStatus({ tipo: 'erro', texto: 'Digite o nome do personagem primeiro.' });
      return;
    }

    setBuscandoChar(true);
    setCharStatus(null);
    try {
      const res = await fetch(`/api/tibia?name=${encodeURIComponent(nomeLimpo)}`);
      const char = await res.json();

      if (!res.ok || !char.name) {
        setCharStatus({
          tipo: 'erro',
          texto: char.error || 'Personagem não encontrado. Confira o nome digitado.',
        });
        return;
      }

      setForm((prev) => ({
        ...prev,
        personagem: char.name,
        servidor: char.world || '',
      }));
      setCharStatus({
        tipo: 'ok',
        texto: `${char.vocation} • Lv ${char.level} • ${char.world}`,
      });
    } catch {
      setCharStatus({
        tipo: 'erro',
        texto: 'TibiaData indisponível agora. Confira o nome manualmente.',
      });
    } finally {
      setBuscandoChar(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!confirmouChar) {
      onNotify?.('Confirme que o nome do personagem está correto antes de continuar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantidade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao iniciar pagamento.');

      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err) {
      onNotify?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="glass-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-cyan-400/30 p-6 text-left">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Finalizar Compra</h3>
            <p className="text-xs text-cyan-300">
              {quantidade} TC • {formatBRL(valorTotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="space-y-3">
          <input
            required
            placeholder="Seu nome completo"
            value={form.nome}
            onChange={(e) => update('nome', e.target.value)}
            className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
          />

          <input
            required
            type="tel"
            placeholder="WhatsApp com DDD (Ex.: 82999999999)"
            value={form.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
            className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
          />

          <div>
            <div className="flex gap-2">
              <input
                required
                placeholder="Personagem que vai receber os TC"
                value={form.personagem}
                onChange={(e) => {
                  update('personagem', e.target.value);
                  setConfirmouChar(false);
                  if (charStatus) setCharStatus(null);
                }}
                className="dark-input flex-1 rounded-xl px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={buscarPersonagem}
                disabled={buscandoChar}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3.5 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 cursor-pointer disabled:opacity-50"
              >
                <i className={buscandoChar ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-magnifying-glass'} />
                <span>{buscandoChar ? '...' : 'Buscar'}</span>
              </button>
            </div>

            {charStatus && (
              <p
                className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                  charStatus.tipo === 'ok' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                <i
                  className={
                    charStatus.tipo === 'ok'
                      ? 'fa-solid fa-circle-check'
                      : 'fa-solid fa-triangle-exclamation'
                  }
                />
                <span>{charStatus.texto}</span>
              </p>
            )}
          </div>

          {/* Confirmação obrigatória do personagem */}
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-xs text-amber-200">
            <input
              type="checkbox"
              checked={confirmouChar}
              onChange={(e) => setConfirmouChar(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-cyan-400"
            />
            <span>
              Confirmo que o personagem{' '}
              <strong className="text-white">{form.personagem || '(digite acima)'}</strong> está
              correto para receber os <strong>{quantidade} Tibia Coins</strong>.
            </span>
          </label>

          {/* Forma de pagamento */}
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-300">
              Forma de Pagamento (Mercado Pago)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {loja.pix_ativo && (
                <button
                  type="button"
                  onClick={() => update('metodo', 'pix')}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                    form.metodo === 'pix'
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  <i className="fa-brands fa-pix text-sm" />
                  PIX
                </button>
              )}

              {loja.cartao_ativo && (
                <button
                  type="button"
                  onClick={() => update('metodo', 'cartao')}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                    form.metodo === 'cartao'
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  <i className="fa-regular fa-credit-card text-sm" />
                  Cartão
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !confirmouChar}
            className="btn-tech-gradient w-full rounded-2xl py-3 text-sm font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Gerando pagamento...' : `Pagar ${formatBRL(valorTotal)}`}
          </button>
        </form>
      </div>
    </div>
  );
}