import { useEffect, useState } from 'react';

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0));

const comprimirImagem = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler a imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        const maxLargura = 1200;
        const escala = img.width > maxLargura ? maxLargura / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

export default function SellTcModal({
  isOpen,
  onClose,
  dadosIniciais = null,
  usuarioLogado = null,
  onNotify,
}) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [personagemOrigem, setPersonagemOrigem] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [comprovanteBase64, setComprovanteBase64] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [solicitacaoCriada, setSolicitacaoCriada] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setSolicitacaoCriada(null);
    setComprovanteBase64('');
    if (usuarioLogado) {
      if (usuarioLogado.nomeCompleto && !nomeCompleto) setNomeCompleto(usuarioLogado.nomeCompleto);
      if (usuarioLogado.contato && !whatsapp) setWhatsapp(usuarioLogado.contato);
      if (usuarioLogado.personagem && !personagemOrigem) {
        setPersonagemOrigem(usuarioLogado.personagem);
      }
    }
  }, [isOpen, usuarioLogado]);

  if (!isOpen || !dadosIniciais) return null;

  const {
    quantidade = 250,
    valorTotal = 0,
    personagemRecebimento = 'Modotank',
  } = dadosIniciais;

  const handleCopiarChar = async () => {
    try {
      await navigator.clipboard.writeText(personagemRecebimento);
      onNotify?.(`Personagem "${personagemRecebimento}" copiado!`);
    } catch {
      onNotify?.(`Envie para: ${personagemRecebimento}`);
    }
  };

  const handleArquivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onNotify?.('Envie apenas arquivos de imagem (PNG, JPG ou WEBP).');
      return;
    }
    try {
      const base64 = await comprimirImagem(file);
      setComprovanteBase64(base64);
    } catch (err) {
      onNotify?.(err.message || 'Erro ao processar comprovante.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comprovanteBase64) {
      onNotify?.('Anexe o print da transferência das Tibia Coins.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('/api/compras-tc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: nomeCompleto.trim(),
          whatsapp: whatsapp.trim(),
          personagem_origem: personagemOrigem.trim(),
          quantidade: Number(quantidade),
          chave_pix: chavePix.trim(),
          comprovante_base64: comprovanteBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar solicitação de venda.');

      setSolicitacaoCriada(data);
      onNotify?.(`Solicitação #${data.id} enviada! Aguarde a confirmação do PIX.`);
    } catch (err) {
      onNotify?.(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#FFBF24]/40 bg-[#190E27] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#DBADFF]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#FFBF24]/40 bg-[#FFBF24]/15 text-[#FFBF24]">
              <i className="fa-solid fa-wallet" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#FFF1D5]">Vender Tibia Coins</h3>
              <p className="text-[11px] text-[#DBADFF]/75">
                {Number(quantidade).toLocaleString('pt-BR')} TC • Receba{' '}
                <strong className="text-[#FFBF24]">{formatBRL(valorTotal)}</strong> no PIX
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-[#DBADFF] hover:text-[#FFBF24] cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {solicitacaoCriada ? (
          <div className="rounded-2xl border border-[#FFBF24]/40 bg-[#100919] p-5 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <i className="fa-solid fa-check text-xl" />
            </div>
            <h4 className="text-base font-black text-[#FFF1D5]">
              Solicitação #{solicitacaoCriada.id} Recebida!
            </h4>
            <p className="text-xs text-[#DBADFF]/85 leading-relaxed">
              Nossa equipe vai conferir o print das{' '}
              <strong className="text-[#FFBF24]">
                {Number(solicitacaoCriada.quantidade).toLocaleString('pt-BR')} TC
              </strong>{' '}
              e enviar <strong className="text-[#FFBF24]">{formatBRL(solicitacaoCriada.valor_total)}</strong>{' '}
              para sua chave PIX em instantes.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-gold-primary w-full rounded-xl py-2.5 text-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#A126F5]/35 bg-[#100919] p-3.5">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-[#DBADFF]/70">
                  1º Passo — Transfira as TCs para:
                </span>
                <strong className="text-sm text-[#FFBF24]">{personagemRecebimento}</strong>
              </div>
              <button
                type="button"
                onClick={handleCopiarChar}
                className="btn-gold-secondary inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] cursor-pointer"
              >
                <i className="fa-regular fa-copy" />
                Copiar Char
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-bold text-[#DBADFF]">Seu Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Nome do titular"
                  className="dark-input w-full rounded-xl px-3 py-2.5 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-[#DBADFF]">WhatsApp</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(82) 99999-9999"
                  className="dark-input w-full rounded-xl px-3 py-2.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-bold text-[#DBADFF]">
                  Personagem que enviou as TC
                </label>
                <input
                  type="text"
                  required
                  value={personagemOrigem}
                  onChange={(e) => setPersonagemOrigem(e.target.value)}
                  placeholder="Ex: Knight Valente"
                  className="dark-input w-full rounded-xl px-3 py-2.5 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-[#DBADFF]">Sua Chave PIX</label>
                <input
                  type="text"
                  required
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="CPF, telefone, e-mail ou aleatória"
                  className="dark-input w-full rounded-xl px-3 py-2.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-[#DBADFF]">
                2º Passo — Print do Tibia Store History (obrigatório)
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#FFBF24]/45 bg-[#100919]/80 p-4 text-center hover:border-[#FFBF24] transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArquivo}
                  className="hidden"
                />
                {comprovanteBase64 ? (
                  <div className="space-y-2">
                    <img
                      src={comprovanteBase64}
                      alt="Prévia do comprovante"
                      className="mx-auto max-h-36 rounded-xl border border-[#DBADFF]/20 object-contain"
                    />
                    <span className="block text-[11px] font-bold text-[#FFBF24]">
                      Clique para trocar a imagem
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1 text-[#DBADFF]/75">
                    <i className="fa-solid fa-cloud-arrow-up text-xl text-[#FFBF24]" />
                    <span className="block font-bold text-[#FFF1D5]">
                      Clique para anexar o print da transferência
                    </span>
                    <span className="block text-[10px]">PNG, JPG ou WEBP</span>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="btn-gold-primary w-full rounded-xl py-3 text-xs sm:text-sm cursor-pointer disabled:opacity-60"
            >
              {enviando
                ? 'Enviando solicitação...'
                : `Confirmar Venda (${Number(quantidade).toLocaleString('pt-BR')} TC • ${formatBRL(
                    valorTotal
                  )})`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}