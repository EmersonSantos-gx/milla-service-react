import { useCallback, useRef, useState } from 'react';
import { CONFIG } from './data/config';
import BackgroundLayers from './components/BackgroundLayers';
import ProfileHeader from './components/ProfileHeader';
import QuickActions from './components/QuickActions';
import CharacterSimulator from './components/CharacterSimulator';
import ServicesGrid from './components/ServicesGrid';
import AuthorityStrip from './components/AuthorityStrip';
import ReviewsGrid from './components/ReviewsGrid';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ShareModal from './components/ShareModal';
import Toast from './components/Toast';

function getShareUrl() {
  if (typeof window !== 'undefined' && window.location.href?.startsWith('http')) {
    return window.location.href;
  }
  return CONFIG.githubPagesUrl;
}

export default function App() {
  const [toast, setToast] = useState({ message: '', visible: false });
  const [shareOpen, setShareOpen] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
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

      <main className="relative z-10 w-full px-4 pt-8 pb-28 sm:pt-12">
        <div className="mx-auto w-full max-w-[460px] space-y-6">
          <ProfileHeader />
          <QuickActions onNotify={showToast} />
          <CharacterSimulator onNotify={showToast} />
          <ServicesGrid />
          <AuthorityStrip />
        </div>

        <ReviewsGrid />
        <Footer onShare={handleShare} />
      </main>

      <FloatingWhatsApp />

      <ShareModal
        isOpen={shareOpen}
        shareUrl={getShareUrl()}
        onClose={() => setShareOpen(false)}
        onNotify={showToast}
      />

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
