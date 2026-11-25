import { useState } from 'react';

export default function VipClubBanner({ onNotify, onCupomLiberado }) {
  const [contatoVip, setContatoVip] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cadastrado, setCadastrado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contatoVip.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch('/api/leads-vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contato: contatoVip.trim(),
          origem: 'clube_vip',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar alerta VIP.');

      const cupom = data.cupom || 'MILLA5';
      setCadastrado(true);
      onCupomLiberado?.(cupom);

      try {
        await navigator.clipboard.writeText(cupom);
      } catch {
        // fallback silencioso
      }

      onNotify?.(`Alerta de Cotação ativado! Cupom ${cupom} liberado e copiado.`);
    } catch (err) {
      onNotify?.(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section
      id="clube-vip"
      className="scroll-mt-28 relative overflow-hidden rounded-3xl border border-[#A126F5]/40 bg-gradient-to-r from-[#23103A] via-[#190E27] to-[#100919] p-6 sm:p-8 shadow-[0_0_40px_rgba(161,38,245,0.16)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#A126F5]/20 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFBF24]/45 bg-[#FFBF24]/15 px-3 py-1 text-[11px] font-extrabold text-[#FFBF24]">
            <i className="fa-solid fa-tag" />
            Clube Vip - Cupom MILLA5
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-[#FFF1D5]">
            Receba Alertas de Cotação
          </h2>

          <p className="text-xs sm:text-sm text-[#DBADFF]/80">
            Informe seu WhatsApp ou e-mail para ser avisado quando a cotação das Tibia Coins mudar
            e libere na hora o cupom <strong className="text-[#FFBF24]">MILLA5</strong>.
          </p>
        </div>

        {cadastrado ? (
          <div className="flex items-center gap-3 rounded-2xl border border-[#FFBF24]/45 bg-[#100919]/90 px-5 py-4">
            <i className="fa-solid fa-circle-check text-2xl text-[#FFBF24]" />
            <div className="text-xs">
              <strong className="block text-sm text-[#FFF1D5]">
                Alerta VIP ativado com sucesso!
              </strong>
              <span className="text-[#DBADFF]">
                Use o cupom <strong className="text-[#FFBF24]">MILLA5</strong> no carrinho.
              </span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full lg:w-auto flex-col sm:flex-row gap-2.5 lg:min-w-[430px]"
          >
            <input
              type="text"
              required
              value={contatoVip}
              onChange={(e) => setContatoVip(e.target.value)}
              placeholder="Seu WhatsApp ou e-mail..."
              className="dark-input flex-1 rounded-xl px-4 py-3 text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={enviando}
              className="btn-gold-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm shrink-0 cursor-pointer disabled:opacity-60"
            >
              <i className="fa-solid fa-bell" />
              <span>{enviando ? 'Ativando...' : 'Receber Alerta de Cotação'}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
