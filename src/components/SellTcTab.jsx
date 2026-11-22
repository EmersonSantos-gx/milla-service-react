import { useState } from 'react';

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0));

const comprimirImagem = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler imagem.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        const maxLargura = 1280;
        const escala = img.width > maxLargura ? maxLargura / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const MINIMO_TC = 25;
const MAXIMO_TC = 5000;
const ATALHOS = [250, 500, 1000, 2500];

export default function SellTcTab({ loja, onNotify }) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [personagemOrigem, setPersonagemOrigem] = useState('');
  const [quantidade, setQuantidade] = useState(250);
  const [chavePix, setChavePix] = useState('');
  const [comprovante, setComprovante] = useState('');
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const precoUnitario = Number(loja?.preco_compra_unitario || 0);
  const personagemDestino = loja?.personagem_recebimento || 'Aba em desenvolvimento'; // INFORMAR O NOME DO PERSONAGEM QUE VAI RECEBER AS TIBIA COINS
  const valorReceber = Number(quantidade || 0) * precoUnitario;

  const copiarPersonagem = async () => {
    try {
      await navigator.clipboard.writeText(personagemDestino);
      onNotify?.(`Personagem "${personagemDestino}" copiado!`);
    } catch {
      onNotify?.('Não foi possível copiar. Selecione manualmente.');
    }
  };

  const handleArquivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onNotify?.('Selecione um arquivo de imagem (PNG, JPG ou WEBP).');
      return;
    }
    try {
      const base64 = await comprimirImagem(file);
      setComprovante(base64);
      setNomeArquivo(file.name);
    } catch (err) {
      onNotify?.(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comprovante) {
      onNotify?.('Anexe a imagem/print da transferência para conferência.');
      return;
    }
    if (Number(quantidade) < 25 || Number(quantidade) % 25 !== 0) {
      onNotify?.('A quantidade deve ser múltipla de 25 TC.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('/api/compras-tc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: nomeCompleto,
          whatsapp,
          personagem_origem: personagemOrigem,
          quantidade: Number(quantidade),
          chave_pix: chavePix,
          comprovante_base64: comprovante,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar solicitação.');

      onNotify?.(`Solicitação #${data.id} enviada! Aguarde a análise no WhatsApp.`);
      setNomeCompleto('');
      setWhatsapp('');
      setPersonagemOrigem('');
      setQuantidade(250);
      setChavePix('');
      setComprovante('');
      setNomeArquivo('');
    } catch (err) {
      onNotify?.(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (loja && !loja.compra_ativo) {
    return (
      <div className="rounded-2xl border border-amber-400/20 bg-slate-950/60 p-5 text-center text-xs text-amber-200">
        A compra de Tibia Coins está temporariamente pausada. Volte em breve!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      {/* Personagem fixo para copiar */}
      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3.5">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
          Personagem que vai receber as Tibia Coins
        </span>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <strong className="text-base text-white select-all">{personagemDestino}</strong>
          <button
            type="button"
            onClick={copiarPersonagem}
            className="rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 cursor-pointer"
          >
            <i className="fa-regular fa-copy mr-1.5" />
            Copiar
          </button>
        </div>
      </div>

      {/* Seletor deslizante igual à aba de compra */}
      <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/60 p-4">
        <div className="mb-2 flex items-center justify-between text-[11px] text-emerald-300">
          <span>Cotação atual: {formatBRL(precoUnitario * 250)} a cada 250 TC</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-slate-400">
              Quantidade enviada
            </span>
            <span className="text-2xl font-extrabold text-amber-400">
              {Number(quantidade).toLocaleString('pt-BR')}{' '}
              <span className="text-sm font-bold text-amber-300/80">TC</span>
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400">
              Você recebe
            </span>
            <span className="text-2xl font-extrabold text-emerald-300">
              {formatBRL(valorReceber)}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={MINIMO_TC}
          max={MAXIMO_TC}
          step={25}
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-400"
        />

        <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
          <span>{MINIMO_TC} TC</span>
          <span>{MAXIMO_TC.toLocaleString('pt-BR')} TC</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ATALHOS.map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => setQuantidade(valor)}
              className={`rounded-xl border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                quantidade === valor
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {valor} TC
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">
            Nome Completo
          </label>
          <input
            required
            placeholder="Seu nome completo"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">
            WhatsApp para contato
          </label>
          <input
            required
            placeholder="(82) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-300">
          Personagem de origem (que enviou as Tibia Coins)
        </label>
        <input
          required
          placeholder="Nome exato do seu char"
          value={personagemOrigem}
          onChange={(e) => setPersonagemOrigem(e.target.value)}
          className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-300">
          Chave PIX para recebimento da venda
        </label>
        <input
          required
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          value={chavePix}
          onChange={(e) => setChavePix(e.target.value)}
          className="dark-input w-full rounded-xl px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-300">
          Anexo de imagem para conferência (print do envio)
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/35 bg-slate-950/60 p-4 text-center hover:bg-slate-950/80">
          <i className="fa-solid fa-cloud-arrow-up mb-1.5 text-lg text-cyan-300" />
          <span className="text-xs font-semibold text-slate-200">
            {nomeArquivo ? `Selecionado: ${nomeArquivo}` : 'Clique para anexar o print'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleArquivo}
            className="hidden"
          />
        </label>

        {comprovante && (
          <img
            src={comprovante}
            alt="Prévia do comprovante"
            className="mt-2 max-h-40 w-full rounded-xl border border-white/10 object-contain bg-black/40"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="btn-tech-gradient w-full rounded-2xl py-3 text-sm font-bold text-white cursor-pointer disabled:opacity-60"
      >
        {enviando ? 'Enviando solicitação...' : `Enviar Venda (${formatBRL(valorReceber)})`}
      </button>

      <p className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-[11px] leading-relaxed text-slate-300">
        Sua imagem será analisada e enviado o valor da compra o mais rápido possível após a
        análise, caso contrário iremos enviar de volta o valor do Tibia Coins e o comprovante
        de devolução pelo WhatsApp cadastrado.
      </p>
    </form>
  );
}