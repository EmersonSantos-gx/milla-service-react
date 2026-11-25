import { useEffect, useMemo, useState } from 'react';

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0));

export default function CartDrawer({
  isOpen,
  onClose,
  itens = [],
  onAlterarQuantidade,
  onRemoverItem,
  onLimparCarrinho,
  cupomInicial = '',
  usuarioLogado = null,
  onNotify,
}) {
  const [cupomInput, setCupomInput] = useState(cupomInicial);
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [nome, setNome] = useState('');
  const [personagem, setPersonagem] = useState('');
  const [servidor, setServidor] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (cupomInicial) {
      setCupomInput(cupomInicial);
    }
  }, [cupomInicial]);

  useEffect(() => {
    if (usuarioLogado) {
      if ((usuarioLogado.nomeCompleto || usuarioLogado.nome) && !nome) {
        setNome(usuarioLogado.nomeCompleto || usuarioLogado.nome);
      }
      if (usuarioLogado.personagem && !personagem) setPersonagem(usuarioLogado.personagem);
      if (usuarioLogado.servidor && !servidor) setServidor(usuarioLogado.servidor);
      if (usuarioLogado.contato && !whatsapp) setWhatsapp(usuarioLogado.contato);
    }
  }, [usuarioLogado]);

  // Se o cliente informou o personagem na calculadora, preenche automaticamente
  useEffect(() => {
    const itemComChar = itens.find((i) => i.personagem);
    if (itemComChar && !personagem) {
      setPersonagem(itemComChar.personagem);
    }
  }, [itens]);

  const totalItens = useMemo(
    () => itens.reduce((acc, item) => acc + item.quantidade, 0),
    [itens]
  );

  const subtotal = useMemo(
    () => itens.reduce((acc, item) => acc + Number(item.preco || 0) * item.quantidade, 0),
    [itens]
  );

  const descontoPix = metodoPagamento === 'pix' ? subtotal * 0.05 : 0;
  const descontoCupom = cupomAplicado === 'MILLA5' ? 5.0 : 0;
  const totalFinal = Math.max(1, subtotal - descontoPix - descontoCupom);

  if (!isOpen) return null;

  const handleAplicarCupom = (e) => {
    e.preventDefault();
    const codigo = cupomInput.trim().toUpperCase();
    if (codigo === 'MILLA5') {
      setCupomAplicado('MILLA5');
      onNotify?.('Cupom MILLA5 aplicado! Desconto de R$ 5,00 ativado.');
    } else {
      onNotify?.('Cupom inválido. Use o cupom MILLA5 do Clube VIP.');
    }
  };

  const handleFinalizarPedido = async (e) => {
    e.preventDefault();
    if (itens.length === 0 || enviando) return;

    setEnviando(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          whatsapp: whatsapp.trim(),
          personagem: personagem.trim(),
          servidor: servidor.trim(),
          metodo: metodoPagamento,
          cupom: cupomAplicado || '',
          itens: itens.map((i) => ({
            id: i.id,
            dbId: i.dbId,
            nome: i.nome,
            quantidade: i.quantidade,
            tcQtd: i.tcQtd || 0,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.init_point) {
        throw new Error(data.error || 'Erro ao gerar pagamento no Mercado Pago.');
      }

      onNotify?.(`Pedido #${data.pedido_id} gerado! Redirecionando para o Mercado Pago...`);
      onLimparCarrinho?.();
      window.location.href = data.init_point;
    } catch (err) {
      onNotify?.(err.message || 'Não foi possível finalizar o pedido.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col border-l border-[#DBADFF]/20 bg-[#140B21] shadow-2xl"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-[#DBADFF]/15 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-cart-shopping text-[#FFBF24]" />
            <h3 className="text-sm font-black text-[#FFF1D5]">
              Seu Carrinho ({totalItens})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DBADFF]/15 text-[#DBADFF] hover:border-[#FFBF24]/50 hover:text-[#FFBF24] transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {itens.length === 0 ? (
            <div className="rounded-2xl border border-[#DBADFF]/15 bg-[#190E27]/60 p-8 text-center space-y-2">
              <i className="fa-solid fa-cart-shopping text-2xl text-[#DBADFF]/35" />
              <p className="text-xs text-[#DBADFF]/75">
                Seu carrinho está vazio. Adicione Tibia Coins, Quests ou Gift Cards para continuar.
              </p>
            </div>
          ) : (
            itens.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#DBADFF]/15 bg-[#190E27] p-3.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="text-[#FFF1D5]">{item.nome}</strong>
                    {item.personagem && (
                      <span className="block text-[11px] text-[#DBADFF]/70">
                        Char: {item.personagem}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoverItem?.(item.id)}
                    aria-label="Remover item"
                    className="text-[#DBADFF]/50 hover:text-rose-400 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#DBADFF]/15 bg-[#100919] p-1">
                    <button
                      type="button"
                      onClick={() => onAlterarQuantidade?.(item.id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#FFBF24] hover:bg-[#FFBF24]/15 cursor-pointer"
                    >
                      <i className="fa-solid fa-minus text-[10px]" />
                    </button>
                    <span className="w-6 text-center font-bold text-[#FFF1D5]">
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAlterarQuantidade?.(item.id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#FFBF24] hover:bg-[#FFBF24]/15 cursor-pointer"
                    >
                      <i className="fa-solid fa-plus text-[10px]" />
                    </button>
                  </div>

                  <strong className="text-sm text-[#FFBF24]">
                    {formatBRL(Number(item.preco) * item.quantidade)}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé com Cupom, Pagamento e Checkout Mercado Pago */}
        {itens.length > 0 && (
          <div className="border-t border-[#DBADFF]/15 bg-[#100919]/95 p-5 space-y-3">
            <form onSubmit={handleAplicarCupom} className="flex gap-2">
              <input
                type="text"
                placeholder="Cupom (use MILLA5)"
                value={cupomInput}
                onChange={(e) => setCupomInput(e.target.value)}
                className="dark-input flex-1 rounded-xl px-3 py-2 text-xs uppercase"
              />
              <button
                type="submit"
                className="btn-gold-primary rounded-xl px-3.5 py-2 text-xs cursor-pointer"
              >
                Aplicar
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMetodoPagamento('pix')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition cursor-pointer ${
                  metodoPagamento === 'pix'
                    ? 'border-[#FFBF24] bg-[#FFBF24]/20 text-[#FFBF24]'
                    : 'border-[#DBADFF]/15 bg-[#190E27] text-[#DBADFF]/70'
                }`}
              >
                <i className="fa-solid fa-bolt" />
                <span>PIX (-5% OFF)</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPagamento('cartao')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition cursor-pointer ${
                  metodoPagamento === 'cartao'
                    ? 'border-[#FFBF24] bg-[#FFBF24]/20 text-[#FFBF24]'
                    : 'border-[#DBADFF]/15 bg-[#190E27] text-[#DBADFF]/70'
                }`}
              >
                <i className="fa-solid fa-credit-card" />
                <span>Cartão</span>
              </button>
            </div>

            <form onSubmit={handleFinalizarPedido} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="dark-input rounded-xl px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp (com DDD)"
                  className="dark-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={personagem}
                  onChange={(e) => setPersonagem(e.target.value)}
                  placeholder="Personagem"
                  className="dark-input rounded-xl px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  value={servidor}
                  onChange={(e) => setServidor(e.target.value)}
                  placeholder="Servidor (opcional)"
                  className="dark-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1 pt-1 text-xs">
                <div className="flex justify-between text-[#DBADFF]/75">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                {descontoPix > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Desconto PIX (5%)</span>
                    <span>-{formatBRL(descontoPix)}</span>
                  </div>
                )}
                {descontoCupom > 0 && (
                  <div className="flex justify-between text-[#FFBF24]">
                    <span>Cupom MILLA5</span>
                    <span>-{formatBRL(descontoCupom)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#DBADFF]/15 pt-1.5 text-sm font-black text-[#FFF1D5]">
                  <span>Total</span>
                  <span className="text-[#FFBF24]">{formatBRL(totalFinal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="btn-gold-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm cursor-pointer disabled:opacity-60"
              >
                <i className="fa-solid fa-lock" />
                <span>
                  {enviando
                    ? 'Gerando pagamento...'
                    : `Pagar com Mercado Pago (${metodoPagamento === 'pix' ? 'PIX' : 'Cartão'})`}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}