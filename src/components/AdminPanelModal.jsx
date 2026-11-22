import { useEffect, useState } from 'react';
import { DEFAULT_TC_IMAGE } from './StoreSection';

const MILLA_WHATSAPP = '5582993643044';
const UMA_HORA_MS = 60 * 60 * 1000;

const formatBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0));

const parseDecimal = (valor) => {
  const num = Number(String(valor ?? '').replace(',', '.').trim());
  return Number.isFinite(num) ? num : 0;
};

const passouUmaHora = (criadoEm) => {
  if (!criadoEm) return false;
  return Date.now() - new Date(criadoEm).getTime() >= UMA_HORA_MS;
};

const abrirWhatsAppPedido = (p) => {
  const texto = [
    `✅ *Pagamento Aprovado - Milla Service*`,
    `*Pedido:* #${p.id}`,
    `*Personagem:* ${p.personagem}${p.servidor ? ` (${p.servidor})` : ''}`,
    `*Quantidade:* ${Number(p.quantidade).toLocaleString('pt-BR')} TC`,
    `*Valor:* ${formatBRL(p.valor_total)}`,
    `*Método:* ${String(p.metodo_pagamento || '').toUpperCase()}`,
    `*Cliente:* ${p.cliente_nome} (${p.whatsapp})`,
  ].join('\n');

  window.open(
    `https://wa.me/${MILLA_WHATSAPP}?text=${encodeURIComponent(texto)}`,
    '_blank',
    'noopener,noreferrer'
  );
};

const abrirWhatsAppCompra = (c, tipo = 'geral') => {
  const digitos = String(c.whatsapp || '').replace(/\D/g, '');
  const numero = digitos.startsWith('55') ? digitos : `55${digitos}`;
  const qtdFormatada = Number(c.quantidade).toLocaleString('pt-BR');

  let texto = '';

  if (tipo === 'pago') {
    texto = [
      `✅ *Pagamento Realizado - Milla Service*`,
      `Olá ${c.nome_completo}! Sua venda de *${qtdFormatada} TC* (#${c.id}) foi aprovada.`,
      `• Valor enviado: *${formatBRL(c.valor_total)}*`,
      `• Chave PIX: ${c.chave_pix}`,
      `Segue abaixo o comprovante do PIX:`,
    ].join('\n');
  } else if (tipo === 'devolvido') {
    texto = [
      `↩️ *Devolução de Tibia Coins - Milla Service*`,
      `Olá ${c.nome_completo}! Após análise da sua solicitação #${c.id}, não foi possível concluir a compra.`,
      `Já realizamos a devolução de *${qtdFormatada} TC* para o personagem *${c.personagem_origem}*.`,
      `Segue abaixo o comprovante da devolução:`,
    ].join('\n');
  } else {
    texto = [
      `Olá ${c.nome_completo}! Sobre sua venda de *${qtdFormatada} TC* (#${c.id}) na *Milla Service*:`,
      `• Personagem de origem: ${c.personagem_origem}`,
      `• Valor: ${formatBRL(c.valor_total)}`,
      `• PIX: ${c.chave_pix}`,
    ].join('\n');
  }

  window.open(
    `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,
    '_blank',
    'noopener,noreferrer'
  );
};

const STORAGE_KEY = 'milla_admin_token';

export default function AdminPanelModal({ isOpen, onClose, onNotify, onDataChanged }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [autenticado, setAutenticado] = useState(false);
  const [aba, setAba] = useState('avaliacoes');
  const [filtroAvaliacoes, setFiltroAvaliacoes] = useState('pendentes');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loja, setLoja] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [comprasTc, setComprasTc] = useState([]);
  const [imagemAmpliada, setImagemAmpliada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [salvandoLoja, setSalvandoLoja] = useState(false);

  const headersAdmin = (tk = token) => ({
    'Content-Type': 'application/json',
    'x-admin-token': tk,
  });

  const carregarTudo = async (tk = token) => {
    if (!tk) return;
    setLoading(true);
    try {
      const [resAv, resLoja, resPed, resCompras] = await Promise.all([
        fetch('/api/avaliacoes?all=1', { headers: headersAdmin(tk) }),
        fetch('/api/loja'),
        fetch('/api/pedidos', { headers: headersAdmin(tk) }),
        fetch('/api/compras-tc', { headers: headersAdmin(tk) }),
      ]);

      if (resAv.status === 401 || resPed.status === 401 || resCompras.status === 401) {
        setAutenticado(false);
        sessionStorage.removeItem(STORAGE_KEY);
        onNotify?.('Token administrativo inválido.');
        return;
      }

      const [dataAv, dataLoja, dataPed, dataCompras] = await Promise.all([
        resAv.json(),
        resLoja.json(),
        resPed.json(),
        resCompras.ok ? resCompras.json() : [],
      ]);

      setAutenticado(true);
      sessionStorage.setItem(STORAGE_KEY, tk);
      setAvaliacoes(Array.isArray(dataAv) ? dataAv : []);
      if (dataLoja && dataLoja.id) setLoja(dataLoja);
      setPedidos(Array.isArray(dataPed) ? dataPed : []);
      setComprasTc(Array.isArray(dataCompras) ? dataCompras : []);
    } catch {
      onNotify?.('Erro ao carregar dados do painel admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const salvo = sessionStorage.getItem(STORAGE_KEY);
    if (salvo) {
      setToken(salvo);
      carregarTudo(salvo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    carregarTudo(token.trim());
  };

  const alterarAprovacao = async (id, aprovado) => {
    try {
      const res = await fetch(`/api/avaliacoes/${id}`, {
        method: 'PATCH',
        headers: headersAdmin(),
        body: JSON.stringify({ aprovado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar avaliação.');

      setAvaliacoes((prev) => prev.map((item) => (item.id === id ? { ...item, aprovado } : item)));
      onDataChanged?.();
      onNotify?.(aprovado ? 'Avaliação aprovada!' : 'Avaliação ocultada do site.');
    } catch (err) {
      onNotify?.(err.message);
    }
  };

  const excluirAvaliacao = async (id, nomeChar) => {
    const ok = window.confirm(`Excluir permanentemente a avaliação de ${nomeChar || `#${id}`}?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/avaliacoes/${id}`, {
        method: 'DELETE',
        headers: headersAdmin(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir avaliação.');

      setAvaliacoes((prev) => prev.filter((item) => item.id !== id));
      onDataChanged?.();
      onNotify?.('Avaliação excluída.');
    } catch (err) {
      onNotify?.(err.message);
    }
  };

  const salvarLoja = async (e) => {
    e.preventDefault();
    if (!loja) return;
    setSalvandoLoja(true);
    try {
      const precoNormalizado = parseDecimal(loja.preco_unitario);
      const precoCompraNormalizado = parseDecimal(loja.preco_compra_unitario);
      const payload = {
        nome: loja.nome,
        descricao: loja.descricao,
        imagem_url: loja.imagem_url || DEFAULT_TC_IMAGE,
        preco_unitario: precoNormalizado,
        estoque: Number(loja.estoque),
        minimo_tc: Number(loja.minimo_tc),
        ativo: Boolean(loja.ativo),
        pix_ativo: Boolean(loja.pix_ativo),
        cartao_ativo: Boolean(loja.cartao_ativo),
        preco_compra_unitario: precoCompraNormalizado,
        compra_ativo: Boolean(loja.compra_ativo),
        personagem_recebimento: loja.personagem_recebimento || 'Modotank',
      };

      const res = await fetch('/api/loja', {
        method: 'PUT',
        headers: headersAdmin(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar configurações da loja.');

      setLoja(data);
      onDataChanged?.();
      onNotify?.('Configurações da Loja de TC salvas!');
    } catch (err) {
      onNotify?.(err.message);
    } finally {
      setSalvandoLoja(false);
    }
  };

  const marcarEntregue = async (id) => {
    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: headersAdmin(),
        body: JSON.stringify({ id, status: 'entregue' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar pedido.');

      setPedidos((prev) => prev.map((p) => (p.id === id ? data : p)));
      onNotify?.(`Pedido #${id} marcado como entregue.`);
    } catch (err) {
      onNotify?.(err.message);
    }
  };

  const cancelarPedido = async (id) => {
    const ok = window.confirm(`Cancelar o pedido #${id} por falta de pagamento (+1h)?`);
    if (!ok) return;

    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: headersAdmin(),
        body: JSON.stringify({ id, status: 'cancelado' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cancelar pedido.');

      setPedidos((prev) => prev.map((p) => (p.id === id ? data : p)));
      onNotify?.(`Pedido #${id} cancelado.`);
    } catch (err) {
      onNotify?.(err.message);
    }
  };

  const cancelarPedidosExpirados = async () => {
    const ok = window.confirm(
      'Cancelar todos os pedidos pendentes que passaram de 1 hora sem pagamento?'
    );
    if (!ok) return;

    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: headersAdmin(),
        body: JSON.stringify({ acao: 'cancelar_expirados' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cancelar pedidos expirados.');

      const idsCancelados = new Set((data.cancelados || []).map((p) => p.id));
      if (idsCancelados.size === 0) {
        onNotify?.('Nenhum pedido pendente com mais de 1 hora encontrado.');
        return;
      }

      setPedidos((prev) =>
        prev.map((p) => (idsCancelados.has(p.id) ? { ...p, status: 'cancelado' } : p))
      );
      onNotify?.(`${idsCancelados.size} pedido(s) expirado(s) cancelado(s).`);
    } catch (err) {
      onNotify?.(err.message);
    }
  };

  const atualizarStatusCompra = async (compra, status) => {
    try {
      const res = await fetch('/api/compras-tc', {
        method: 'PATCH',
        headers: headersAdmin(),
        body: JSON.stringify({ id: compra.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar compra de TC.');

      setComprasTc((prev) => prev.map((c) => (c.id === compra.id ? data : c)));
      onNotify?.(
        status === 'pago'
          ? `Compra #${compra.id} marcada como paga! Abrindo WhatsApp...`
          : `Compra #${compra.id} marcada como devolvida! Abrindo WhatsApp...`
      );

      abrirWhatsAppCompra(compra, status);
    } catch (err) {
      onNotify?.(err.message);
    }
  };

  const copiarTexto = async (texto, label) => {
    try {
      await navigator.clipboard.writeText(texto);
      onNotify?.(`${label} copiado!`);
    } catch {
      onNotify?.('Não foi possível copiar.');
    }
  };

  const pendentes = avaliacoes.filter((a) => !a.aprovado);
  const aprovadas = avaliacoes.filter((a) => Boolean(a.aprovado));
  const listaAvaliacoes = filtroAvaliacoes === 'pendentes' ? pendentes : aprovadas;
  const precoPreview = parseDecimal(loja?.preco_unitario);
  const precoCompraPreview = parseDecimal(loja?.preco_compra_unitario);
  const pedidosExpirados = pedidos.filter(
    (p) => p.status === 'pendente' && passouUmaHora(p.criado_em)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md"
    >
      <div className="glass-card max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-400/30 p-5 text-left">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Painel Administrativo</h3>
            <p className="text-xs text-slate-400">
              Avaliações, Loja de Tibia Coins, Pedidos e Compras de TC
            </p>
          </div>

          <div className="flex items-center gap-2">
            {autenticado && (
              <button
                type="button"
                onClick={() => carregarTudo()}
                disabled={loading}
                title="Atualizar dados"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <i className={`fa-solid fa-rotate-right text-xs ${loading ? 'fa-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {!autenticado ? (
          <form onSubmit={handleLogin} className="space-y-3 py-4">
            <label className="block text-xs font-semibold text-slate-300">
              Chave de Acesso Admin (`ADMIN_TOKEN`)
            </label>
            <input
              type="password"
              required
              placeholder="Digite o token administrativo"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="dark-input w-full rounded-xl px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-tech-gradient w-full rounded-2xl py-3 text-sm font-bold text-white cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-1">
              <button
                type="button"
                onClick={() => setAba('avaliacoes')}
                className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                  aba === 'avaliacoes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Avaliações ({avaliacoes.length})
              </button>
              <button
                type="button"
                onClick={() => setAba('loja')}
                className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                  aba === 'loja'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Loja de TC
              </button>
              <button
                type="button"
                onClick={() => setAba('pedidos')}
                className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                  aba === 'pedidos'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pedidos ({pedidos.length})
              </button>
              <button
                type="button"
                onClick={() => setAba('compras_tc')}
                className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                  aba === 'compras_tc'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compras TC ({comprasTc.length})
              </button>
            </div>

            {aba === 'avaliacoes' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltroAvaliacoes('pendentes')}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      filtroAvaliacoes === 'pendentes'
                        ? 'border-amber-400/40 bg-amber-500/20 text-amber-200'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    Pendentes ({pendentes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroAvaliacoes('aprovadas')}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      filtroAvaliacoes === 'aprovadas'
                        ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    Aprovadas ({aprovadas.length})
                  </button>
                </div>

                {listaAvaliacoes.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 text-center text-xs text-slate-400">
                    Nenhuma avaliação nesta categoria.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {listaAvaliacoes.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-sm font-bold text-white">{item.personagem}</span>
                            <span className="ml-2 text-xs text-cyan-300">
                              {item.servidor} • Lv {item.level}
                            </span>
                            <span className="ml-2 text-xs text-slate-400">({item.nome})</span>
                          </div>
                          <span className="text-xs font-bold text-amber-400">
                            {'★'.repeat(Number(item.estrelas || 5))}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-slate-300">
                          {item.descricao}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2.5">
                          <span className="text-[11px] text-slate-500">
                            {item.criado_em
                              ? new Date(item.criado_em).toLocaleDateString('pt-BR')
                              : `#${item.id}`}
                          </span>

                          <div className="flex gap-2">
                            {!item.aprovado ? (
                              <button
                                type="button"
                                onClick={() => alterarAprovacao(item.id, true)}
                                className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                              >
                                <i className="fa-solid fa-check mr-1" />
                                Aprovar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => alterarAprovacao(item.id, false)}
                                className="rounded-lg border border-amber-400/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                              >
                                <i className="fa-solid fa-eye-slash mr-1" />
                                Ocultar
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => excluirAvaliacao(item.id, item.personagem)}
                              className="rounded-lg border border-rose-400/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 cursor-pointer"
                            >
                              <i className="fa-solid fa-trash mr-1" />
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {aba === 'loja' && loja && (
              <form onSubmit={salvarLoja} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Nome do Produto
                    </label>
                    <input
                      required
                      value={loja.nome || ''}
                      onChange={(e) => setLoja({ ...loja, nome: e.target.value })}
                      className="dark-input w-full rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-slate-300">URL da Imagem</label>
                      <button
                        type="button"
                        onClick={() => setLoja({ ...loja, imagem_url: DEFAULT_TC_IMAGE })}
                        className="text-[11px] font-semibold text-cyan-300 hover:underline cursor-pointer"
                      >
                        Usar imagem padrão
                      </button>
                    </div>
                    <input
                      required
                      value={loja.imagem_url || ''}
                      onChange={(e) => setLoja({ ...loja, imagem_url: e.target.value })}
                      className="dark-input w-full rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Descrição curta
                  </label>
                  <input
                    required
                    value={loja.descricao || ''}
                    onChange={(e) => setLoja({ ...loja, descricao: e.target.value })}
                    className="dark-input w-full rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Venda / TC (R$)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      required
                      value={loja.preco_unitario ?? ''}
                      onChange={(e) => setLoja({ ...loja, preco_unitario: e.target.value })}
                      className="dark-input w-full rounded-xl px-3 py-2 text-sm"
                    />
                    <span className="mt-1 block text-[11px] text-cyan-300">
                      250 TC = {formatBRL(precoPreview * 250)}
                    </span>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Estoque (TC)
                    </label>
                    <input
                      type="number"
                      step="25"
                      min="0"
                      required
                      value={loja.estoque ?? ''}
                      onChange={(e) => setLoja({ ...loja, estoque: e.target.value })}
                      className="dark-input w-full rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Mínimo (TC)
                    </label>
                    <input
                      type="number"
                      step="25"
                      min="25"
                      required
                      value={loja.minimo_tc ?? 25}
                      onChange={(e) => setLoja({ ...loja, minimo_tc: e.target.value })}
                      className="dark-input w-full rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Configuração da Compra de Tibia Coins */}
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-3.5 space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Configuração — Compra de Tibia Coins
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-300">
                        Valor Compra / TC (R$)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        required
                        value={loja.preco_compra_unitario ?? '0.1750'}
                        onChange={(e) =>
                          setLoja({ ...loja, preco_compra_unitario: e.target.value })
                        }
                        className="dark-input w-full rounded-xl px-3 py-2 text-sm"
                      />
                      <span className="mt-1 block text-[11px] text-emerald-300">
                        250 TC = {formatBRL(precoCompraPreview * 250)}
                      </span>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-300">
                        Personagem que recebe (fixo p/ copiar)
                      </label>
                      <input
                        required
                        value={loja.personagem_recebimento ?? 'Modotank'}
                        onChange={(e) =>
                          setLoja({ ...loja, personagem_recebimento: e.target.value })
                        }
                        className="dark-input w-full rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(loja.compra_ativo)}
                      onChange={(e) => setLoja({ ...loja, compra_ativo: e.target.checked })}
                      className="h-4 w-4 accent-emerald-400"
                    />
                    Ativar aba de Compra de Tibia Coins na vitrine
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(loja.ativo)}
                      onChange={(e) => setLoja({ ...loja, ativo: e.target.checked })}
                      className="h-4 w-4 accent-cyan-400"
                    />
                    Loja ativa no site
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(loja.pix_ativo)}
                      onChange={(e) => setLoja({ ...loja, pix_ativo: e.target.checked })}
                      className="h-4 w-4 accent-emerald-400"
                    />
                    Aceitar PIX
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(loja.cartao_ativo)}
                      onChange={(e) => setLoja({ ...loja, cartao_ativo: e.target.checked })}
                      className="h-4 w-4 accent-cyan-400"
                    />
                    Aceitar Cartão
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={salvandoLoja}
                  className="btn-tech-gradient mt-2 w-full rounded-2xl py-3 text-sm font-bold text-white cursor-pointer disabled:opacity-60"
                >
                  {salvandoLoja ? 'Salvando...' : 'Salvar Configurações da Loja'}
                </button>
              </form>
            )}

            {aba === 'pedidos' && (
              <div className="space-y-2.5">
                {pedidosExpirados.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs">
                    <span className="text-rose-200">
                      <i className="fa-solid fa-clock mr-1.5" />
                      <strong>{pedidosExpirados.length}</strong> pedido(s) pendente(s) há mais de 1h
                    </span>
                    <button
                      type="button"
                      onClick={cancelarPedidosExpirados}
                      className="rounded-lg border border-rose-400/40 bg-rose-500/20 px-3 py-1 font-bold text-rose-100 hover:bg-rose-500/30 cursor-pointer"
                    >
                      Cancelar expirados (+1h)
                    </button>
                  </div>
                )}

                {pedidos.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 text-center text-xs text-slate-400">
                    Nenhum pedido registrado ainda.
                  </p>
                ) : (
                  pedidos.map((p) => {
                    const expirado = p.status === 'pendente' && passouUmaHora(p.criado_em);
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <strong className="text-sm text-white">
                              #{p.id} • {p.personagem}
                            </strong>
                            {p.servidor && (
                              <span className="ml-2 text-cyan-300">({p.servidor})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {expirado && (
                              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                                +1h sem pagamento
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2.5 py-0.5 font-bold uppercase ${
                                p.status === 'pago'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : p.status === 'entregue'
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : p.status === 'cancelado'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>

                        <p className="mt-1.5 text-slate-300">
                          Cliente: <strong>{p.cliente_nome}</strong> • WhatsApp:{' '}
                          <strong>{p.whatsapp}</strong>
                        </p>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2">
                          <span className="font-bold text-amber-300">
                            {Number(p.quantidade).toLocaleString('pt-BR')} TC •{' '}
                            {formatBRL(p.valor_total)} ({String(p.metodo_pagamento).toUpperCase()})
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => abrirWhatsAppPedido(p)}
                              className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer"
                            >
                              <i className="fa-brands fa-whatsapp mr-1" />
                              WhatsApp
                            </button>

                            {p.status === 'pago' && (
                              <button
                                type="button"
                                onClick={() => marcarEntregue(p.id)}
                                className="rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-1 font-semibold text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
                              >
                                Marcar Entregue
                              </button>
                            )}

                            {expirado && (
                              <button
                                type="button"
                                onClick={() => cancelarPedido(p.id)}
                                className="rounded-lg border border-rose-400/30 bg-rose-500/15 px-2.5 py-1 font-semibold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                              >
                                <i className="fa-solid fa-ban mr-1" />
                                Cancelar (+1h)
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {aba === 'compras_tc' && (
              <div className="space-y-3">
                {comprasTc.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 text-center text-xs text-slate-400">
                    Nenhuma solicitação de compra de Tibia Coins recebida ainda.
                  </p>
                ) : (
                  comprasTc.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-xs space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <strong className="text-sm text-white">
                            #{c.id} • {c.personagem_origem}
                          </strong>
                          <span className="ml-2 text-slate-400">→ {c.personagem_destino}</span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-bold uppercase ${
                            c.status === 'pago'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : c.status === 'devolvido'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-300">
                        <p>
                          Cliente: <strong className="text-white">{c.nome_completo}</strong>
                        </p>
                        <p>
                          WhatsApp: <strong className="text-white">{c.whatsapp}</strong>
                        </p>
                        <p className="sm:col-span-2 flex flex-wrap items-center gap-2">
                          <span>
                            Chave PIX: <strong className="text-cyan-300">{c.chave_pix}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => copiarTexto(c.chave_pix, 'Chave PIX')}
                            className="rounded-md border border-cyan-400/30 bg-cyan-500/15 px-2 py-0.5 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
                          >
                            <i className="fa-regular fa-copy mr-1" />
                            Copiar PIX
                          </button>
                        </p>
                      </div>

                      {c.comprovante_base64 && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setImagemAmpliada(c.comprovante_base64)}
                            className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 cursor-pointer"
                          >
                            <img
                              src={c.comprovante_base64}
                              alt={`Comprovante #${c.id}`}
                              className="h-28 w-auto max-w-full object-contain transition group-hover:scale-105"
                            />
                            <span className="absolute bottom-1 right-1 rounded-md bg-black/75 px-2 py-0.5 text-[10px] text-cyan-300">
                              <i className="fa-solid fa-magnifying-glass-plus mr-1" />
                              Ampliar
                            </span>
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2.5">
                        <span className="font-bold text-emerald-300">
                          {Number(c.quantidade).toLocaleString('pt-BR')} TC • Pagar{' '}
                          {formatBRL(c.valor_total)}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => abrirWhatsAppCompra(c, c.status)}
                            className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer"
                          >
                            <i className="fa-brands fa-whatsapp mr-1" />
                            WhatsApp
                          </button>

                          {c.status !== 'pago' && (
                            <button
                              type="button"
                              onClick={() => atualizarStatusCompra(c, 'pago')}
                              className="rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-1 font-semibold text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
                            >
                              Marcar Pago
                            </button>
                          )}

                          {c.status !== 'devolvido' && (
                            <button
                              type="button"
                              onClick={() => atualizarStatusCompra(c, 'devolvido')}
                              className="rounded-lg border border-rose-400/30 bg-rose-500/15 px-2.5 py-1 font-semibold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                            >
                              Devolvido
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox para ampliar o comprovante */}
      {imagemAmpliada && (
        <div
          onClick={() => setImagemAmpliada(null)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm cursor-pointer"
        >
          <img
            src={imagemAmpliada}
            alt="Comprovante ampliado"
            className="max-h-[90vh] max-w-[95vw] rounded-2xl border border-white/15 object-contain"
          />
        </div>
      )}
    </div>
  );
}