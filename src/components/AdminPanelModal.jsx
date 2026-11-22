import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_TC_IMAGE } from './StoreSection';

const MILLA_WHATSAPP = '5582993643044';
const UMA_HORA_MS = 60 * 60 * 1000;
const ESTOQUE_MINIMO_ALERTA = 1000;
const STORAGE_KEY = 'milla_admin_token';

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

const exportarCSV = (nomeArquivo, cabecalhos, linhas) => {
  const escapar = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const conteudo = [
    cabecalhos.map(escapar).join(';'),
    ...linhas.map((l) => l.map(escapar).join(';')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
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

const montarUrlWhatsAppCompra = (c, tipo = 'geral') => {
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

  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
};

function ToggleSwitch({ checked, onChange, label, description, color = 'cyan' }) {
  const activeBg =
    color === 'emerald'
      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.45)]'
      : 'bg-gradient-to-r from-cyan-500 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,0.45)]';

  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-white/20 hover:bg-white/[0.05] transition"
    >
      <div>
        <span className="block text-xs font-bold text-white">{label}</span>
        {description && <span className="block text-[10px] text-slate-400">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all cursor-pointer ${
          checked ? activeBg : 'bg-slate-800 border border-white/10'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminPanelModal({ isOpen, onClose, onNotify, onDataChanged }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [autenticado, setAutenticado] = useState(false);
  const [aba, setAba] = useState('resumo');
  const [diaHover, setDiaHover] = useState(null);

  const [filtroAvaliacoes, setFiltroAvaliacoes] = useState('pendentes');
  const [filtroPedidos, setFiltroPedidos] = useState('todos');
  const [buscaPedidos, setBuscaPedidos] = useState('');
  const [filtroCompras, setFiltroCompras] = useState('todos');
  const [buscaCompras, setBuscaCompras] = useState('');

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

  const metricas = useMemo(() => {
    const vendasValidas = pedidos.filter((p) => ['pago', 'entregue'].includes(p.status));
    const comprasPagas = comprasTc.filter((c) => c.status === 'pago');

    const totalVendido = vendasValidas.reduce((acc, p) => acc + Number(p.valor_total || 0), 0);
    const totalComprado = comprasPagas.reduce((acc, c) => acc + Number(c.valor_total || 0), 0);
    const tcVendidas = vendasValidas.reduce((acc, p) => acc + Number(p.quantidade || 0), 0);
    const tcCompradas = comprasPagas.reduce((acc, c) => acc + Number(c.quantidade || 0), 0);

    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const chave = d.toISOString().slice(0, 10);
      const label =
        i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      dias.push({ chave, label, vendas: 0, compras: 0 });
    }

    vendasValidas.forEach((p) => {
      if (!p.criado_em) return;
      const chave = new Date(p.criado_em).toISOString().slice(0, 10);
      const dia = dias.find((d) => d.chave === chave);
      if (dia) dia.vendas += Number(p.valor_total || 0);
    });

    comprasPagas.forEach((c) => {
      if (!c.criado_em) return;
      const chave = new Date(c.criado_em).toISOString().slice(0, 10);
      const dia = dias.find((d) => d.chave === chave);
      if (dia) dia.compras += Number(c.valor_total || 0);
    });

    const maxGrafico = Math.max(100, ...dias.map((d) => Math.max(d.vendas, d.compras)));

    return {
      totalVendido,
      totalComprado,
      balanco: totalVendido - totalComprado,
      tcVendidas,
      tcCompradas,
      dias,
      maxGrafico,
    };
  }, [pedidos, comprasTc]);

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
      const payload = {
        nome: loja.nome,
        descricao: loja.descricao,
        imagem_url: loja.imagem_url || DEFAULT_TC_IMAGE,
        preco_unitario: parseDecimal(loja.preco_unitario),
        estoque: Number(loja.estoque),
        minimo_tc: Number(loja.minimo_tc),
        ativo: Boolean(loja.ativo),
        pix_ativo: Boolean(loja.pix_ativo),
        cartao_ativo: Boolean(loja.cartao_ativo),
        preco_compra_unitario: parseDecimal(loja.preco_compra_unitario),
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
    const ok = window.confirm('Cancelar todos os pedidos pendentes com mais de 1 hora?');
    if (!ok) return;

    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: headersAdmin(),
        body: JSON.stringify({ acao: 'cancelar_expirados' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cancelar pedidos expirados.');

      const ids = new Set((data.cancelados || []).map((p) => p.id));
      if (ids.size === 0) {
        onNotify?.('Nenhum pedido pendente com mais de 1 hora encontrado.');
        return;
      }

      setPedidos((prev) => prev.map((p) => (ids.has(p.id) ? { ...p, status: 'cancelado' } : p)));
      onNotify?.(`${ids.size} pedido(s) expirado(s) cancelado(s).`);
    } catch (err) {
      onNotify?.(err.message);
    }
  };

  const atualizarStatusCompra = async (compra, status) => {
    const whatsappUrl = montarUrlWhatsAppCompra(compra, status);
    const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    try {
      const res = await fetch('/api/compras-tc', {
        method: 'PATCH',
        headers: headersAdmin(),
        body: JSON.stringify({ id: compra.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar compra de TC.');

      setComprasTc((prev) => prev.map((c) => (c.id === compra.id ? data : c)));

      if (data.novo_estoque !== null && data.novo_estoque !== undefined) {
        setLoja((prev) => (prev ? { ...prev, estoque: data.novo_estoque } : prev));
        onDataChanged?.();
      }

      onNotify?.(
        status === 'pago'
          ? `Compra #${compra.id} paga! +${Number(compra.quantidade).toLocaleString('pt-BR')} TC adicionadas ao estoque.`
          : `Compra #${compra.id} marcada como devolvida.`
      );

      if (!popup) window.location.href = whatsappUrl;
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

  const pendentesAv = avaliacoes.filter((a) => !a.aprovado);
  const aprovadasAv = avaliacoes.filter((a) => Boolean(a.aprovado));
  const listaAvaliacoes = filtroAvaliacoes === 'pendentes' ? pendentesAv : aprovadasAv;

  const pedidosParaEntregar = pedidos.filter((p) => p.status === 'pago').length;
  const pedidosExpirados = pedidos.filter((p) => p.status === 'pendente' && passouUmaHora(p.criado_em));
  const comprasPendentes = comprasTc.filter((c) => c.status === 'pendente').length;
  const estoqueAtual = Number(loja?.estoque || 0);
  const estoqueBaixo = loja && estoqueAtual < ESTOQUE_MINIMO_ALERTA;

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroPedidos !== 'todos' && p.status !== filtroPedidos) return false;
    if (!buscaPedidos.trim()) return true;
    const q = buscaPedidos.toLowerCase();
    return (
      String(p.id).includes(q) ||
      String(p.personagem || '').toLowerCase().includes(q) ||
      String(p.cliente_nome || '').toLowerCase().includes(q) ||
      String(p.whatsapp || '').toLowerCase().includes(q)
    );
  });

  const comprasFiltradas = comprasTc.filter((c) => {
    if (filtroCompras !== 'todos' && c.status !== filtroCompras) return false;
    if (!buscaCompras.trim()) return true;
    const q = buscaCompras.toLowerCase();
    return (
      String(c.id).includes(q) ||
      String(c.personagem_origem || '').toLowerCase().includes(q) ||
      String(c.nome_completo || '').toLowerCase().includes(q) ||
      String(c.chave_pix || '').toLowerCase().includes(q)
    );
  });

  const precoVenda250 = parseDecimal(loja?.preco_unitario) * 250;
  const precoCompra250 = parseDecimal(loja?.preco_compra_unitario) * 250;
  const spread250 = precoVenda250 - precoCompra250;
  const margemPercent = precoVenda250 > 0 ? (spread250 / precoVenda250) * 100 : 0;

  const navItems = [
    { id: 'resumo', label: 'Resumo Executivo', short: 'Resumo', icon: 'fa-chart-line', badge: estoqueBaixo ? '!' : 0 },
    { id: 'pedidos', label: 'Pedidos (Vendas)', short: 'Pedidos', icon: 'fa-bag-shopping', badge: pedidosParaEntregar },
    { id: 'compras_tc', label: 'Compras de TC', short: 'Compras TC', icon: 'fa-hand-holding-dollar', badge: comprasPendentes },
    { id: 'loja', label: 'Loja & Cotações', short: 'Loja', icon: 'fa-sliders', badge: 0 },
    { id: 'avaliacoes', label: 'Avaliações', short: 'Reviews', icon: 'fa-star', badge: pendentesAv.length },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-xl"
    >
      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-[28px] border border-cyan-400/25 bg-[#060B18] text-left shadow-[0_0_80px_rgba(6,182,212,0.18)] transition-all ${
          autenticado ? 'h-[90vh] sm:h-[85vh] max-w-6xl' : 'max-h-[90vh] max-w-md'
        }`}
      >
        {/* Glows ambientes */}
        <div className="pointer-events-none absolute -top-28 -left-28 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />

        {/* Topbar */}
        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/70 px-5 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.35)]">
              <i className="fa-solid fa-crown text-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                  Milla Service
                </h3>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Admin Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Central Operacional • Neon DB em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {autenticado && (
              <button
                type="button"
                onClick={() => carregarTudo()}
                disabled={loading}
                title="Sincronizar dados"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400/30 hover:bg-white/10 cursor-pointer transition"
              >
                <i className={`fa-solid fa-rotate-right text-cyan-300 ${loading ? 'fa-spin' : ''}`} />
                <span className="hidden sm:inline">Sincronizar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:border-rose-400/30 hover:bg-rose-500/15 hover:text-rose-300 cursor-pointer transition"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </header>

        {!autenticado ? (
          <form onSubmit={handleLogin} className="relative z-10 mx-auto my-auto w-full max-w-md space-y-4 p-8">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
                <i className="fa-solid fa-shield-halved text-2xl" />
              </div>
              <h4 className="text-base font-extrabold text-white">Autenticação Administrativa</h4>
              <p className="mt-1 text-xs text-slate-400">
                Digite sua chave secreta para acessar o painel financeiro e operacional
              </p>
            </div>
            <input
              type="password"
              required
              placeholder="Digite o ADMIN_TOKEN"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="dark-input w-full rounded-2xl px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-tech-gradient w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Validando acesso...' : 'Desbloquear Painel'}
            </button>
          </form>
        ) : (
          <div className="relative z-10 flex min-h-0 flex-1 flex-col md:flex-row overflow-hidden">
            {/* Sidebar Desktop / Nav Compacta Mobile */}
            <aside className="flex md:w-64 shrink-0 flex-row md:flex-col justify-between gap-2 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/50 p-3">
              <nav className="flex md:flex-col gap-1.5 w-full">
                {navItems.map((item) => {
                  const ativo = aba === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAba(item.id)}
                      className={`flex shrink-0 items-center justify-between gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                        ativo
                          ? 'border border-cyan-400/35 bg-gradient-to-r from-cyan-500/20 to-violet-500/15 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                          : 'border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <i
                          className={`fa-solid ${item.icon} w-4 text-center ${
                            ativo ? 'text-cyan-300' : 'text-slate-500'
                          }`}
                        />
                        <span className="hidden md:inline">{item.label}</span>
                        <span className="md:hidden">{item.short}</span>
                      </span>
                      {item.badge ? (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500/25 px-1.5 text-[10px] font-extrabold text-rose-300 border border-rose-400/30">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              {/* Mini-card de Estoque ao Vivo no rodapé da Sidebar (Desktop) */}
              <div className="hidden md:block mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-3.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Estoque em Cofre</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      estoqueBaixo ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <p className="mt-1 text-xl font-black text-amber-400">
                  {estoqueAtual.toLocaleString('pt-BR')}{' '}
                  <span className="text-xs font-bold text-amber-300/70">TC</span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    style={{ width: `${Math.min(100, (estoqueAtual / 5000) * 100)}%` }}
                    className={`h-full rounded-full transition-all ${
                      estoqueBaixo
                        ? 'bg-gradient-to-r from-rose-500 to-amber-400'
                        : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                    }`}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  Spread: <strong className="text-emerald-300">{formatBRL(spread250)}</strong> / 250 TC
                </p>
              </div>
            </aside>

            {/* Área de Conteúdo (scroll isolado + sem pulo lateral) */}
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] p-4 sm:p-6 space-y-5">
              {/* ================= RESUMO EXECUTIVO ================= */}
              {aba === 'resumo' && (
                <div className="space-y-5">
                  {estoqueBaixo && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent p-4 shadow-[0_0_25px_rgba(245,158,11,0.12)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 animate-pulse">
                          <i className="fa-solid fa-triangle-exclamation text-lg" />
                        </div>
                        <div className="text-xs">
                          <strong className="block text-sm text-amber-200">
                            Alerta de Estoque Baixo
                          </strong>
                          <span className="text-slate-300">
                            Restam apenas <strong>{estoqueAtual.toLocaleString('pt-BR')} TC</strong>. Aprove compras de jogadores para repor automaticamente.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAba('compras_tc')}
                        className="rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 cursor-pointer transition"
                      >
                        Ir para Compras TC →
                      </button>
                    </div>
                  )}

                  {/* KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-950/80 to-slate-950 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Faturamento
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                          <i className="fa-solid fa-arrow-trend-up text-xs" />
                        </span>
                      </div>
                      <p className="mt-2 text-xl font-black text-white">
                        {formatBRL(metricas.totalVendido)}
                      </p>
                      <span className="text-[11px] text-cyan-300">
                        {metricas.tcVendidas.toLocaleString('pt-BR')} TC vendidas
                      </span>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-slate-950/80 to-slate-950 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Compras TC
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                          <i className="fa-solid fa-hand-holding-dollar text-xs" />
                        </span>
                      </div>
                      <p className="mt-2 text-xl font-black text-white">
                        {formatBRL(metricas.totalComprado)}
                      </p>
                      <span className="text-[11px] text-emerald-300">
                        +{metricas.tcCompradas.toLocaleString('pt-BR')} TC compradas
                      </span>
                    </div>

                    <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 via-slate-950/80 to-slate-950 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Balanço
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                          <i className="fa-solid fa-wallet text-xs" />
                        </span>
                      </div>
                      <p className="mt-2 text-xl font-black text-white">
                        {formatBRL(metricas.balanco)}
                      </p>
                      <span className="text-[11px] text-violet-300">Entradas − Saídas</span>
                    </div>

                    <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-slate-950/80 to-slate-950 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Estoque
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                          <i className="fa-solid fa-coins text-xs" />
                        </span>
                      </div>
                      <p className="mt-2 text-xl font-black text-amber-400">
                        {estoqueAtual.toLocaleString('pt-BR')} TC
                      </p>
                      <span className="text-[11px] text-slate-400">
                        Margem: <strong className="text-emerald-300">{margemPercent.toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Gráfico Interativo de 7 dias */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-white">
                          Fluxo Financeiro (Últimos 7 dias)
                        </h4>
                        <p className="text-xs text-slate-400">
                          Passe o mouse nas barras para ver os valores exatos do dia
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-semibold">
                        <span className="flex items-center gap-1.5 text-cyan-300">
                          <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" /> Vendas
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-300">
                          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Compras TC
                        </span>
                      </div>
                    </div>

                    <div className="relative grid h-44 grid-cols-7 items-end gap-2 sm:gap-4 pt-6">
                      {metricas.dias.map((d) => {
                        const hV = Math.max(5, Math.round((d.vendas / metricas.maxGrafico) * 100));
                        const hC = Math.max(5, Math.round((d.compras / metricas.maxGrafico) * 100));
                        const isHover = diaHover === d.chave;

                        return (
                          <div
                            key={d.chave}
                            onMouseEnter={() => setDiaHover(d.chave)}
                            onMouseLeave={() => setDiaHover(null)}
                            className="relative flex h-full flex-col items-center justify-end gap-2 cursor-pointer"
                          >
                            {isHover && (
                              <div className="pointer-events-none absolute -top-10 z-20 whitespace-nowrap rounded-xl border border-cyan-400/30 bg-slate-950/95 px-2.5 py-1.5 text-[10px] shadow-xl">
                                <p className="font-bold text-cyan-300">Vendas: {formatBRL(d.vendas)}</p>
                                <p className="font-bold text-emerald-300">Compras: {formatBRL(d.compras)}</p>
                              </div>
                            )}

                            <div className="flex h-full w-full items-end justify-center gap-1.5 rounded-xl bg-white/[0.02] px-1 pt-2">
                              <div
                                style={{ height: `${d.vendas > 0 ? hV : 4}%` }}
                                className="w-3 sm:w-4 rounded-t-lg bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)] transition-all duration-300"
                              />
                              <div
                                style={{ height: `${d.compras > 0 ? hC : 4}%` }}
                                className="w-3 sm:w-4 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-300"
                              />
                            </div>
                            <span
                              className={`text-[11px] font-bold capitalize ${
                                isHover ? 'text-white' : 'text-slate-400'
                              }`}
                            >
                              {d.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= PEDIDOS ================= */}
              {aba === 'pedidos' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative flex-1 min-w-[220px]">
                      <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                      <input
                        placeholder="Buscar #ID, personagem, cliente ou WhatsApp..."
                        value={buscaPedidos}
                        onChange={(e) => setBuscaPedidos(e.target.value)}
                        className="dark-input w-full rounded-2xl py-2.5 pl-9 pr-3 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        exportarCSV(
                          `pedidos-tc-${new Date().toISOString().slice(0, 10)}.csv`,
                          ['ID', 'Status', 'Personagem', 'Servidor', 'TC', 'Valor', 'Metodo', 'Cliente', 'WhatsApp', 'Data'],
                          pedidosFiltrados.map((p) => [
                            p.id, p.status, p.personagem, p.servidor, p.quantidade,
                            p.valor_total, p.metodo_pagamento, p.cliente_nome, p.whatsapp, p.criado_em,
                          ])
                        )
                      }
                      className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/20 cursor-pointer transition"
                    >
                      <i className="fa-solid fa-file-csv mr-1.5" />
                      Exportar CSV
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {['todos', 'pendente', 'pago', 'entregue', 'cancelado'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFiltroPedidos(st)}
                        className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold uppercase cursor-pointer transition ${
                          filtroPedidos === st
                            ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-200'
                            : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {pedidosExpirados.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3.5 text-xs">
                      <span className="text-rose-200">
                        <i className="fa-solid fa-clock mr-1.5" />
                        <strong>{pedidosExpirados.length}</strong> pedido(s) pendente(s) há mais de 1h
                      </span>
                      <button
                        type="button"
                        onClick={cancelarPedidosExpirados}
                        className="rounded-xl bg-rose-500/25 border border-rose-400/40 px-3 py-1.5 font-bold text-rose-100 hover:bg-rose-500/35 cursor-pointer"
                      >
                        Cancelar expirados (+1h)
                      </button>
                    </div>
                  )}

                  {pedidosFiltrados.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-xs text-slate-400">
                      Nenhum pedido encontrado com esse filtro.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {pedidosFiltrados.map((p) => {
                        const expirado = p.status === 'pendente' && passouUmaHora(p.criado_em);
                        return (
                          <div
                            key={p.id}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs hover:border-cyan-400/25 transition"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <strong className="text-sm text-white">#{p.id} • {p.personagem}</strong>
                                {p.servidor && <span className="ml-2 text-cyan-300">({p.servidor})</span>}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {expirado && (
                                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                                    +1h expirado
                                  </span>
                                )}
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
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

                            <p className="mt-2 text-slate-300">
                              Cliente: <strong className="text-white">{p.cliente_nome}</strong> • WhatsApp:{' '}
                              <strong className="text-white">{p.whatsapp}</strong>
                            </p>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                              <span className="text-sm font-extrabold text-amber-400">
                                {Number(p.quantidade).toLocaleString('pt-BR')} TC • {formatBRL(p.valor_total)}{' '}
                                <span className="text-[11px] font-semibold text-slate-400">
                                  ({String(p.metodo_pagamento).toUpperCase()})
                                </span>
                              </span>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => abrirWhatsAppPedido(p)}
                                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 font-bold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer"
                                >
                                  <i className="fa-brands fa-whatsapp mr-1" />
                                  WhatsApp
                                </button>
                                {p.status === 'pago' && (
                                  <button
                                    type="button"
                                    onClick={() => marcarEntregue(p.id)}
                                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3 py-1.5 font-bold text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
                                  >
                                    Marcar Entregue
                                  </button>
                                )}
                                {expirado && (
                                  <button
                                    type="button"
                                    onClick={() => cancelarPedido(p.id)}
                                    className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 font-bold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                                  >
                                    Cancelar (+1h)
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ================= COMPRAS DE TC ================= */}
              {aba === 'compras_tc' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative flex-1 min-w-[220px]">
                      <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                      <input
                        placeholder="Buscar #ID, personagem, cliente ou chave PIX..."
                        value={buscaCompras}
                        onChange={(e) => setBuscaCompras(e.target.value)}
                        className="dark-input w-full rounded-2xl py-2.5 pl-9 pr-3 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        exportarCSV(
                          `compras-tc-${new Date().toISOString().slice(0, 10)}.csv`,
                          ['ID', 'Status', 'Origem', 'Destino', 'TC', 'Valor', 'Cliente', 'WhatsApp', 'PIX', 'Data'],
                          comprasFiltradas.map((c) => [
                            c.id, c.status, c.personagem_origem, c.personagem_destino, c.quantidade,
                            c.valor_total, c.nome_completo, c.whatsapp, c.chave_pix, c.criado_em,
                          ])
                        )
                      }
                      className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/20 cursor-pointer transition"
                    >
                      <i className="fa-solid fa-file-csv mr-1.5" />
                      Exportar CSV
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {['todos', 'pendente', 'pago', 'devolvido'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFiltroCompras(st)}
                        className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold uppercase cursor-pointer transition ${
                          filtroCompras === st
                            ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                            : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {comprasFiltradas.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-xs text-slate-400">
                      Nenhuma solicitação de compra encontrada.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {comprasFiltradas.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-3 hover:border-emerald-400/25 transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <strong className="text-sm text-white">#{c.id} • {c.personagem_origem}</strong>
                              <span className="ml-2 text-slate-400">→ {c.personagem_destino}</span>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
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
                            <p>Cliente: <strong className="text-white">{c.nome_completo}</strong></p>
                            <p>WhatsApp: <strong className="text-white">{c.whatsapp}</strong></p>
                            <p className="sm:col-span-2 flex flex-wrap items-center gap-2">
                              <span>PIX: <strong className="text-cyan-300">{c.chave_pix}</strong></span>
                              <button
                                type="button"
                                onClick={() => copiarTexto(c.chave_pix, 'Chave PIX')}
                                className="rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
                              >
                                <i className="fa-regular fa-copy mr-1" />
                                Copiar PIX
                              </button>
                            </p>
                          </div>

                          {c.comprovante_base64 && (
                            <button
                              type="button"
                              onClick={() => setImagemAmpliada(c.comprovante_base64)}
                              className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/50 cursor-pointer"
                            >
                              <img
                                src={c.comprovante_base64}
                                alt={`Comprovante #${c.id}`}
                                className="h-28 w-auto max-w-full object-contain transition group-hover:scale-105"
                              />
                              <span className="absolute bottom-1.5 right-1.5 rounded-lg bg-black/80 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                                <i className="fa-solid fa-magnifying-glass-plus mr-1" />
                                Ampliar
                              </span>
                            </button>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                            <span className="text-sm font-extrabold text-emerald-300">
                              {Number(c.quantidade).toLocaleString('pt-BR')} TC • Pagar {formatBRL(c.valor_total)}
                            </span>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(montarUrlWhatsAppCompra(c, c.status), '_blank', 'noopener,noreferrer')
                                }
                                className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 font-bold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer"
                              >
                                <i className="fa-brands fa-whatsapp mr-1" />
                                WhatsApp
                              </button>

                              {c.status !== 'pago' && (
                                <button
                                  type="button"
                                  onClick={() => atualizarStatusCompra(c, 'pago')}
                                  className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3 py-1.5 font-bold text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
                                >
                                  Marcar Pago (+{Number(c.quantidade).toLocaleString('pt-BR')} TC)
                                </button>
                              )}

                              {c.status !== 'devolvido' && (
                                <button
                                  type="button"
                                  onClick={() => atualizarStatusCompra(c, 'devolvido')}
                                  className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 font-bold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                                >
                                  Devolvido
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================= LOJA & COTAÇÕES ================= */}
              {aba === 'loja' && loja && (
                <form onSubmit={salvarLoja} className="space-y-4">
                  {/* Banner Spread / Margem */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-500/15 via-cyan-500/10 to-transparent p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                        <i className="fa-solid fa-percent" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Spread Atual (a cada 250 TC)
                        </span>
                        <strong className="text-base font-black text-white">
                          {formatBRL(spread250)} de lucro bruto
                        </strong>
                      </div>
                    </div>
                    <span className="rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1 text-xs font-extrabold text-violet-200">
                      Margem: {margemPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-300">Nome do Produto</label>
                      <input
                        required
                        value={loja.nome || ''}
                        onChange={(e) => setLoja({ ...loja, nome: e.target.value })}
                        className="dark-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">URL da Imagem</label>
                        <button
                          type="button"
                          onClick={() => setLoja({ ...loja, imagem_url: DEFAULT_TC_IMAGE })}
                          className="text-[11px] font-bold text-cyan-300 hover:underline cursor-pointer"
                        >
                          Usar padrão
                        </button>
                      </div>
                      <input
                        required
                        value={loja.imagem_url || ''}
                        onChange={(e) => setLoja({ ...loja, imagem_url: e.target.value })}
                        className="dark-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-300">Descrição curta</label>
                    <input
                      required
                      value={loja.descricao || ''}
                      onChange={(e) => setLoja({ ...loja, descricao: e.target.value })}
                      className="dark-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-3">
                      <label className="mb-1 block text-xs font-bold text-cyan-300">
                        Venda — 250 TC (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        required
                        value={Number((parseDecimal(loja.preco_unitario) * 250).toFixed(2))}
                        onChange={(e) => {
                          const v250 = parseDecimal(e.target.value);
                          setLoja({ ...loja, preco_unitario: (v250 / 250).toFixed(4) });
                        }}
                        className="dark-input w-full rounded-xl px-3 py-2 text-sm font-bold"
                      />
                      <span className="mt-1.5 block text-[10px] text-slate-400">
                        Unitário: R$ {parseDecimal(loja.preco_unitario).toFixed(4)} / TC
                      </span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                      <label className="mb-1 block text-xs font-bold text-slate-300">Estoque (TC)</label>
                      <input
                        type="number"
                        step="25"
                        min="0"
                        required
                        value={loja.estoque ?? ''}
                        onChange={(e) => setLoja({ ...loja, estoque: e.target.value })}
                        className="dark-input w-full rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                      <label className="mb-1 block text-xs font-bold text-slate-300">Mínimo (TC)</label>
                      <input
                        type="number"
                        step="25"
                        min="25"
                        required
                        value={loja.minimo_tc ?? 25}
                        onChange={(e) => setLoja({ ...loja, minimo_tc: e.target.value })}
                        className="dark-input w-full rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  </div>

                  {/* Bloco Compra de TC */}
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-4 space-y-3">
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                      <i className="fa-solid fa-hand-holding-dollar mr-1.5" />
                      Compra de Tibia Coins (Jogador vende para a loja)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-emerald-300">
                          Compra — 250 TC (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          required
                          value={Number((parseDecimal(loja.preco_compra_unitario) * 250).toFixed(2))}
                          onChange={(e) => {
                            const v250 = parseDecimal(e.target.value);
                            setLoja({ ...loja, preco_compra_unitario: (v250 / 250).toFixed(4) });
                          }}
                          className="dark-input w-full rounded-xl px-3 py-2 text-sm font-bold"
                        />
                        <span className="mt-1 block text-[10px] text-slate-400">
                          Unitário: R$ {parseDecimal(loja.preco_compra_unitario).toFixed(4)} / TC
                        </span>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">
                          Personagem de recebimento (fixo)
                        </label>
                        <input
                          required
                          value={loja.personagem_recebimento ?? 'Modotank'}
                          onChange={(e) => setLoja({ ...loja, personagem_recebimento: e.target.value })}
                          className="dark-input w-full rounded-xl px-3 py-2 text-sm font-bold"
                        />
                      </div>
                    </div>

                    <ToggleSwitch
                      label="Aba de Compra de TC ativa na vitrine"
                      description="Permite que jogadores enviem TCs e solicitem pagamento via PIX"
                      color="emerald"
                      checked={Boolean(loja.compra_ativo)}
                      onChange={(val) => setLoja({ ...loja, compra_ativo: val })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <ToggleSwitch
                      label="Loja ativa"
                      checked={Boolean(loja.ativo)}
                      onChange={(val) => setLoja({ ...loja, ativo: val })}
                    />
                    <ToggleSwitch
                      label="Aceitar PIX"
                      color="emerald"
                      checked={Boolean(loja.pix_ativo)}
                      onChange={(val) => setLoja({ ...loja, pix_ativo: val })}
                    />
                    <ToggleSwitch
                      label="Aceitar Cartão"
                      checked={Boolean(loja.cartao_ativo)}
                      onChange={(val) => setLoja({ ...loja, cartao_ativo: val })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={salvandoLoja}
                    className="btn-tech-gradient w-full rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-lg cursor-pointer disabled:opacity-60"
                  >
                    {salvandoLoja ? 'Salvando alterações...' : 'Salvar Configurações da Loja'}
                  </button>
                </form>
              )}

              {/* ================= AVALIAÇÕES ================= */}
              {aba === 'avaliacoes' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFiltroAvaliacoes('pendentes')}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                        filtroAvaliacoes === 'pendentes'
                          ? 'border-amber-400/40 bg-amber-500/20 text-amber-200'
                          : 'border-white/10 bg-white/[0.03] text-slate-400'
                      }`}
                    >
                      Pendentes ({pendentesAv.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFiltroAvaliacoes('aprovadas')}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                        filtroAvaliacoes === 'aprovadas'
                          ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                          : 'border-white/10 bg-white/[0.03] text-slate-400'
                      }`}
                    >
                      Aprovadas ({aprovadasAv.length})
                    </button>
                  </div>

                  {listaAvaliacoes.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-xs text-slate-400">
                      Nenhuma avaliação nesta categoria.
                    </p>
                  ) : (
                    listaAvaliacoes.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">{item.descricao}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2.5">
                          <span className="text-[11px] text-slate-500">
                            {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : `#${item.id}`}
                          </span>
                          <div className="flex gap-2">
                            {!item.aprovado ? (
                              <button
                                type="button"
                                onClick={() => alterarAprovacao(item.id, true)}
                                className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                              >
                                Aprovar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => alterarAprovacao(item.id, false)}
                                className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                              >
                                Ocultar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => excluirAvaliacao(item.id, item.personagem)}
                              className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/25 cursor-pointer"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox do comprovante */}
      {imagemAmpliada && (
        <div
          onClick={() => setImagemAmpliada(null)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-pointer"
        >
          <img
            src={imagemAmpliada}
            alt="Comprovante ampliado"
            className="max-h-[90vh] max-w-[95vw] rounded-2xl border border-white/15 object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}