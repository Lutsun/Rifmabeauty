import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import CheckoutPage from './pages/CheckoutPage'; 
import CartDrawer from './components/CartDrawer'; 
import { CartProvider } from './components/CartContext'; 
import ComingSoon from './pages/ComingSoon';
import WelcomeScreen from './pages/WelcomeScreen';

type Page = 'home' | 'shop' | 'product' | 'about' | 'contact' | 'checkout';

function App() {
  const Maintenance = false;

  // ========== TOUS LES HOOKS ICI (AVANT TOUT RETURN) ==========
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // Welcome Screen
  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem('rifma_welcome_seen');
  });

  // ==========  useEffect    ==========
  // Observer pour les animations au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [currentPage]);


  const handleWelcomeComplete = () => {
    console.log('✅ WelcomeScreen terminé, affichage du site');
    sessionStorage.setItem('rifma_welcome_seen', 'true');
    setShowWelcome(false);
  };

  // AFFICHER LE WELCOME SCREEN 
  if (showWelcome) {
    return <WelcomeScreen onEnter={handleWelcomeComplete} />;
  }
  if (Maintenance) {
    return <ComingSoon />;
  } 

  const handleNavigate = (page: string, productId?: string) => {
    setIsPageTransitioning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setCurrentPage(page as Page);
      if (productId) {
        setSelectedProductId(productId);
      }
      setIsPageTransitioning(false);
    }, 300);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'shop':
        return <Shop onNavigate={handleNavigate} />;
      case 'product':
        return <ProductDetail productId={selectedProductId} onNavigate={handleNavigate} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />; 
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        
        <CartDrawer onNavigate={handleNavigate} />
        
        <main
          className={`transition-opacity duration-300 ${
            isPageTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {renderPage()}
        </main>

        <Footer onNavigate={handleNavigate}/>
      </div>
    </CartProvider>
  );
}

export default App;