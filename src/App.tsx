import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import CheckoutPage from './pages/CheckoutPage'; 
import CartDrawer from './components/CartDrawer'; // À créer
import { CartProvider } from './components/CartContext'; // À créer

type Page = 'home' | 'shop' | 'product' | 'about' | 'contact' | 'checkout';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

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
        
        <CartDrawer onNavigate={handleNavigate} /> {/* Panier latéral */}
        
        <main
          className={`transition-opacity duration-300 ${
            isPageTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {renderPage()}
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
