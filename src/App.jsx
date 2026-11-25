import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CONFIG } from './data/config';
import BackgroundLayers from './components/BackgroundLayers';
import StoreHeader from './components/StoreHeader';
import StoreHero from './components/StoreHero';
import FeaturedCatalog from './components/FeaturedCatalog';
import VipClubBanner from './components/VipClubBanner';
import TrustedServicesTab from './components/TrustedServicesTab';
import CartDrawer from './components/CartDrawer';
import OrderTrackingModal from './components/OrderTrackingModal';
import AccountModal from './components/AccountModal';
import SellTcModal from './components/SellTcModal';
import ReviewsGrid from './components/ReviewsGrid';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ShareModal from './components/ShareModal';
import ReviewFormModal from './components/ReviewFormModal';
import AdminPanelModal from './components/AdminPanelModal';
import Toast from './components/Toast';

const USER_STORAGE_KEY = 'milla_store_user';

function getShareUrl() {
  if (typeof window !== 'undefined' && window.location.href?.startsWith('http')) {
    return window.location.href;
  }
  return CONFIG.githubPagesUrl;
}

export default function App() {
  const [abaPrincipal, setAbaPrincipal] = useState('loja');
  const [busca, setBusca] = useState('');

  // Carrinho, Cupom, Rastreio, Venda de TC e Conta
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [cupomLiberado, setCupomLiberado] = useState('');

  const [rastreioAberto, setRastreioAberto] = useState(false);
  const [pedidosLocais, setPedidosLocais] = useState({});
  const [codigoRastreioAtivo, setCodigoRastreioAtivo] = useState('');

  const [vendaTcDados, setVendaTcDados] = useState(null);

  const [contaAberta, setContaAberta] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    try {
      const salvo = localStorage.getItem(USER_STORAGE_KEY);
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  // Estados globais do projeto
  const [toast, setToast] = useState({ message: '', visible: false });
  const [shareOpen, setShareOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [storeRefreshKey, setStoreRefreshKey] = useState(0);
  const [adminOpen, setAdminOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('admin') === '1'
  );
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const statusPagamento = params.get('pagamento');
    const pedidoId = params.get('pedido');

    if (statusPagamento === 'sucesso') {
      showToast(
        `Pagamento aprovado${pedidoId ? ` (Pedido #${pedidoId})` : ''}! Entrega em andamento.`
      );
      setStoreRefreshKey((k) => k + 1);
    } else if (statusPagamento === 'pendente') {
      showToast(
        `Pagamento pendente${pedidoId ? ` (Pedido #${pedidoId})` : ''}. Aguardando confirmação.`
      );
    } else if (statusPagamento === 'falha') {
      showToast(
        `Pagamento não concluído${pedidoId ? ` (Pedido #${pedidoId})` : ''}. Tente novamente.`
      );
    }

    if (statusPagamento || pedidoId) {
      params.delete('pagamento');
      params.delete('pedido');
      const novaQuery = params.toString();
      const novaUrl = `${window.location.pathname}${novaQuery ? `?${novaQuery}` : ''}`;
      window.history.replaceState({}, '', novaUrl);
    }
  }, [showToast]);

  const handleDataChanged = useCallback(() => {
    setReviewsRefreshKey((k) => k + 1);
    setStoreRefreshKey((k) => k + 1);
  }, []);

  const handleShare = useCallback(async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: CONFIG.nome,
          text: CONFIG.slogan,
          url,
        });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    setShareOpen(true);
  }, []);

  const salvarUsuario = useCallback((dados) => {
    setUsuarioLogado(dados);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(dados));
    } catch {
      // ignora erro de storage
    }
  }, []);

  const sairUsuario = useCallback(() => {
    setUsuarioLogado(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignora erro de storage
    }
  }, []);

  const adicionarAoCarrinho = useCallback(
    (produto, abrirDrawer = false) => {
      setItensCarrinho((prev) => {
        const existe = prev.find((i) => i.id === produto.id);
        if (existe) {
          return prev.map((i) =>
            i.id === produto.id
              ? {
                  ...i,
                  quantidade: i.quantidade + 1,
                  personagem: produto.personagem || i.personagem,
                }
              : i
          );
        }
        return [...prev, { ...produto, quantidade: 1 }];
      });
      showToast(`${produto.nome} adicionado ao carrinho!`);
      if (abrirDrawer) setCarrinhoAberto(true);
    },
    [showToast]
  );

  const alterarQuantidadeCarrinho = useCallback((id, delta) => {
    setItensCarrinho((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantidade: item.quantidade + delta } : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }, []);

  const removerDoCarrinho = useCallback((id) => {
    setItensCarrinho((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handlePedidoCriado = useCallback(
    ({ item, personagem, metodoPagamento, valor }) => {
      const novoId = `#W${String(Date.now()).slice(-4)}`;
      const novoPedido = {
        id: novoId,
        status: metodoPagamento === 'pix' ? 'Aguardando PIX' : 'Em confirmação',
        etapa: 1,
        item,
        personagem,
        metodoPagamento,
        valor,
        atualizadoEm: 'Agora mesmo',
      };
      setPedidosLocais((prev) => ({ ...prev, [novoId]: novoPedido }));
      showToast(`Pedido ${novoId} criado!`);
      return novoPedido;
    },
    [showToast]
  );

  const totalItensCarrinho = useMemo(
    () => itensCarrinho.reduce((acc, item) => acc + item.quantidade, 0),
    [itensCarrinho]
  );

  const rolarPara = (elementId) => {
    setAbaPrincipal('loja');
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#100919] text-[#FFF1D5]">
      <BackgroundLayers />

      {/* Topbar + Header Fixo */}
      <StoreHeader
        abaPrincipal={abaPrincipal}
        onMudarAba={(novaAba) => {
          setAbaPrincipal(novaAba);
          setBusca('');
        }}
        busca={busca}
        onMudarBusca={setBusca}
        totalItensCarrinho={totalItensCarrinho}
        usuarioLogado={usuarioLogado}
        onAbrirCarrinho={() => setCarrinhoAberto(true)}
        onAbrirRastreio={() => setRastreioAberto(true)}
        onAbrirConta={() => setContaAberta(true)}
        onIrParaClubeVip={() => rolarPara('clube-vip')}
      />

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1 w-full px-4 pt-6 pb-12 sm:px-6 sm:pt-8">
        {abaPrincipal === 'loja' ? (
          <div className="mx-auto w-full max-w-7xl space-y-10">
            {/* Hero 12 colunas (Banner + Calculadora) */}
            <StoreHero
              refreshKey={storeRefreshKey}
              onIrParaCatalogo={() => rolarPara('catalogo-destaque')}
              onIrParaClubeVip={() => rolarPara('clube-vip')}
              onIrParaServiceiros={() => {
                setAbaPrincipal('serviceiros');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAdicionarTc={(prod) => adicionarAoCarrinho(prod, true)}
              onSolicitarVendaTc={(dados) => setVendaTcDados(dados)}
              onNotify={showToast}
            />

            {/* Vitrine Dinâmica (Neon /api/produtos) */}
            <FeaturedCatalog
              refreshKey={storeRefreshKey}
              busca={busca}
              onLimparBusca={() => setBusca('')}
              onAdicionarProduto={(prod) => adicionarAoCarrinho(prod, false)}
            />

            {/* Clube VIP — Receba Alertas de Cotação (Neon /api/leads-vip) */}
            <VipClubBanner
              onNotify={showToast}
              onCupomLiberado={(cupom) => setCupomLiberado(cupom)}
            />

            {/* Chamada rápida para Serviceiro de Confiança */}
            <section className="rounded-3xl border border-[#FFBF24]/30 bg-[#190E27] p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#FFBF24]/40 bg-[#FFBF24]/15 text-[#FFBF24]">
                  <i className="fa-solid fa-shield-halved text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#FFF1D5]">
                    Precisa de um Serviceiro de Confiança?
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#DBADFF]/80">
                    Confira nossa lista de parceiros verificados pela Milla Store em Belobra,
                    Jadebra, Sombra, Gentebra, Kalibra e Venebra.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAbaPrincipal('serviceiros');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-gold-primary inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm cursor-pointer"
              >
                <span>Ver Serviceiros Verificados</span>
                <i className="fa-solid fa-arrow-right" />
              </button>
            </section>

            {/* Avaliações reais de clientes */}
            <ReviewsGrid
              refreshKey={reviewsRefreshKey}
              onOpenReviewForm={() => setReviewFormOpen(true)}
            />
          </div>
        ) : (
          <TrustedServicesTab
            refreshKey={storeRefreshKey}
            busca={busca}
            onMudarBusca={setBusca}
            onNotify={showToast}
          />
        )}
      </main>

      <Footer onShare={handleShare} />

      <FloatingWhatsApp />

      {/* Modais e Drawer da Milla Store */}
      <CartDrawer
        isOpen={carrinhoAberto}
        onClose={() => setCarrinhoAberto(false)}
        itens={itensCarrinho}
        onAlterarQuantidade={alterarQuantidadeCarrinho}
        onRemoverItem={removerDoCarrinho}
        onLimparCarrinho={() => setItensCarrinho([])}
        cupomInicial={cupomLiberado}
        usuarioLogado={usuarioLogado}
        onPedidoCriado={handlePedidoCriado}
        onAbrirRastreioPedido={(pedido) => {
          setCodigoRastreioAtivo(pedido.id);
          setCarrinhoAberto(false);
          setRastreioAberto(true);
        }}
        onNotify={showToast}
      />

      <SellTcModal
        isOpen={Boolean(vendaTcDados)}
        onClose={() => setVendaTcDados(null)}
        dadosIniciais={vendaTcDados}
        usuarioLogado={usuarioLogado}
        onNotify={showToast}
      />

      <OrderTrackingModal
        isOpen={rastreioAberto}
        onClose={() => setRastreioAberto(false)}
        pedidosLocais={pedidosLocais}
        codigoInicial={codigoRastreioAtivo}
        onNotify={showToast}
      />

      <AccountModal
        isOpen={contaAberta}
        onClose={() => setContaAberta(false)}
        usuarioLogado={usuarioLogado}
        onSalvarUsuario={salvarUsuario}
        onSair={sairUsuario}
        onNotify={showToast}
      />

      <ShareModal
        isOpen={shareOpen}
        shareUrl={getShareUrl()}
        onClose={() => setShareOpen(false)}
        onNotify={showToast}
      />

      <ReviewFormModal
        isOpen={reviewFormOpen}
        onClose={() => setReviewFormOpen(false)}
        onNotify={showToast}
      />

      <AdminPanelModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onNotify={showToast}
        onDataChanged={handleDataChanged}
      />

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
