import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from './data/config';
import BackgroundLayers from './components/BackgroundLayers';
import ProfileHeader from './components/ProfileHeader';
import QuickActions from './components/QuickActions';
import CharacterSimulator from './components/CharacterSimulator';
import ServicesGrid from './components/ServicesGrid';
import StoreSection from './components/StoreSection';
import AuthorityStrip from './components/AuthorityStrip';
import ReviewsGrid from './components/ReviewsGrid';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ShareModal from './components/ShareModal';
import ReviewFormModal from './components/ReviewFormModal';
import AdminPanelModal from './components/AdminPanelModal';
import Toast from './components/Toast';

function getShareUrl() {
  if (typeof window !== 'undefined' && window.location.href?.startsWith('http')) {
    return window.location.href;
  }
  return CONFIG.githubPagesUrl;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('servicos');
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

  return (
    <>
      <BackgroundLayers />

      <main className="fixed inset-0 z-10 overflow-y-auto overflow-x-hidden overscroll-y-none scroll-smooth w-full px-4 pt-8 pb-28 sm:pt-12">
        <div className="mx-auto w-full max-w-[460px] space-y-6">
          <ProfileHeader />
          <QuickActions onNotify={showToast} />

          {/* Navegação por Abas */}
          <nav
            aria-label="Navegação principal"
            className="glass-card grid grid-cols-2 gap-2 rounded-2xl p-1.5"
          >
            <button
              type="button"
              onClick={() => setActiveTab('servicos')}
              className={`selector-pill flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold cursor-pointer sm:text-sm ${
                activeTab === 'servicos' ? 'is-active' : 'border-transparent'
              }`}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-cyan-300" />
              <span>Serviços</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sobre')}
              className={`selector-pill flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold cursor-pointer sm:text-sm ${
                activeTab === 'sobre' ? 'is-active' : 'border-transparent'
              }`}
            >
              <i className="fa-solid fa-user text-violet-300" />
              <span>Sobre Mim</span>
            </button>
          </nav>

          {activeTab === 'servicos' ? (
            <>
              <CharacterSimulator onNotify={showToast} />
              <ServicesGrid />
              <StoreSection key={storeRefreshKey} onNotify={showToast} />
              <AuthorityStrip />
            </>
          ) : (
            <AboutSection />
          )}
        </div>

        {activeTab === 'servicos' && (
          <ReviewsGrid
            refreshKey={reviewsRefreshKey}
            onOpenReviewForm={() => setReviewFormOpen(true)}
          />
        )}

        <Footer onShare={handleShare} />
      </main>

      <FloatingWhatsApp />

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
    </>
  );
}