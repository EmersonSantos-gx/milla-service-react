import { useEffect, useState } from 'react';

const formatarTempoRelativo = (dataIso) => {
  if (!dataIso) return 'recentemente';
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const minutos = Math.floor(diffMs / 60000);

  if (minutos < 2) return 'agora há pouco';
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas}h`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias <= 7) return `há ${dias} dias`;

  return 'recentemente';
};

export default function SocialProofToast() {
  const [vendas, setVendas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [visivel, setVisivel] = useState(false);
  const [dispensado, setDispensado] = useState(
    () => sessionStorage.getItem('milla_proof_closed') === '1'
  );

  useEffect(() => {
    if (dispensado) return;

    fetch('/api/ultimas-vendas')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVendas(data);
        }
      })
      .catch(() => {});
  }, [dispensado]);

  useEffect(() => {
    if (dispensado || vendas.length === 0) return;

    let timerOcultar;
    let timerProximo;

    const timerInicial = setTimeout(() => {
      setVisivel(true);

      timerOcultar = setTimeout(() => {
        setVisivel(false);

        timerProximo = setTimeout(() => {
          setIndice((prev) => (prev + 1) % vendas.length);
        }, 12000);
      }, 6000);
    }, 4000);

    return () => {
      clearTimeout(timerInicial);
      clearTimeout(timerOcultar);
      clearTimeout(timerProximo);
    };
  }, [vendas, indice, dispensado]);

  const fechar = () => {
    setVisivel(false);
    setDispensado(true);
    sessionStorage.setItem('milla_proof_closed', '1');
  };

  if (dispensado || vendas.length === 0) return null;

  const vendaAtual = vendas[indice];
  const local = vendaAtual.servidor ? `em ${vendaAtual.servidor}` : 'no Tibia';

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-[300px] transition-all duration-500 ${
        visivel
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <div className="glass-card flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
          <i className="fa-solid fa-fire text-sm" />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs leading-snug text-slate-200">
            Jogador <strong className="text-cyan-300">{local}</strong> comprou{' '}
            <strong className="text-amber-300">
              {Number(vendaAtual.quantidade).toLocaleString('pt-BR')} TC
            </strong>
          </p>
          <span className="mt-1 block text-[11px] text-slate-400">
            <i className="fa-solid fa-circle-check mr-1 text-emerald-400" />
            Compra verificada • {formatarTempoRelativo(vendaAtual.criado_em)}
          </span>
        </div>

        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar aviso"
          className="text-slate-500 hover:text-white cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>
      </div>
    </div>
  );
}