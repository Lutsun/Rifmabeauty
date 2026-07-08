import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import CartIcon from '../components/CartIcon';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'shop', label: 'Boutique' },
    { id: 'about', label: 'Our Story' },
    { id: 'contact', label: 'Contact' }
  ];

  // Déterminer si on est sur la page d'accueil
  const isHomePage = currentPage === 'home';

  return (
    <>
      <header 
        className={`
          fixed top-0 w-full z-50 transition-all duration-500 ease-out
          ${isHomePage 
            ? // Comportement sur la page d'accueil
              isScrolled 
                ? 'bg-black/80 backdrop-blur-md shadow-xl border-b border-white/10' 
                : 'bg-transparent'
            : // Comportement sur les autres pages (toujours sombre)
              'bg-black/90 backdrop-blur-md shadow-xl border-b border-white/10'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="group cursor-pointer" onClick={() => onNavigate("home")}>
              <img
                src="https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/RB_logo2.JPG"
                alt="RIFMA Beauty"
                className="
                  h-14
                  w-auto
                  object-contain
                  transition-all
                  duration-500
                  group-hover:scale-105
                  group-hover:brightness-110
                  drop-shadow-lg
                "
              />
            </div>

            {/* Navigation Desktop - Liens espacés */}
            <nav className="hidden md:flex items-center space-x-12">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    relative text-sm font-light tracking-wider uppercase 
                    transition-all duration-300 pb-1
                    ${currentPage === item.id
                      ? 'text-rose-200'
                      : 'text-white/80 hover:text-white'
                    }
                    after:absolute after:bottom-0 after:left-0 after:w-full after:h-px 
                    after:bg-rose-200 after:transform after:scale-x-0 
                    after:transition-transform after:duration-300
                    hover:after:scale-x-100
                    ${currentPage === item.id ? 'after:scale-x-100' : ''}
                  `}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions à droite */}
            <div className="flex items-center space-x-6">
              <CartIcon />
              
              {/* Mobile menu button */}
              <button
                className="md:hidden text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden transition-all duration-500 ease-out
          ${isMenuOpen ? 'visible' : 'invisible'}
        `}
      >
        {/* Overlay */}
        <div 
          className={`
            absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500
            ${isMenuOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu panel */}
        <div
          className={`
            absolute top-0 right-0 h-full w-72 bg-black/95 backdrop-blur-xl 
            shadow-2xl transform transition-transform duration-500 ease-out
            border-l border-white/10
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="p-8 pt-24">
            <nav className="space-y-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`
                    block w-full text-left text-lg font-light tracking-wider 
                    uppercase transition-all duration-200 pb-2 border-b border-white/10
                    ${currentPage === item.id
                      ? 'text-rose-200 border-rose-200/30'
                      : 'text-white/70 hover:text-white border-white/5'
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}