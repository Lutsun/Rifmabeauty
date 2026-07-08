import { Instagram } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnapchat, faTiktok } from '@fortawesome/free-brands-svg-icons';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNavigation = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white">
      {/* Séparateur élégant en haut */}
      <div className="h-px bg-gradient-to-r from-transparent via-rose-200/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-light tracking-[0.2em] mb-3">RIFMA BEAUTY COSMETICS</h3>
            <p className="text-white/50 font-light text-sm leading-relaxed max-w-md">
              L'excellence cosmétique au service de votre beauté. Des produits haute couture
              pour sublimer vos lèvres avec élégance et sophistication.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-light tracking-wider uppercase mb-4 text-white/50">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('home')}
                  className="text-white/50 hover:text-rose-200 transition-colors duration-300 text-sm"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('shop')}
                  className="text-white/50 hover:text-rose-200 transition-colors duration-300 text-sm"
                >
                  Boutique
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('about')}
                  className="text-white/50 hover:text-rose-200 transition-colors duration-300 text-sm"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('contact')}
                  className="text-white/50 hover:text-rose-200 transition-colors duration-300 text-sm"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-light tracking-wider uppercase mb-4 text-white/50">Suivez-nous</h4>
            <div className="flex space-x-3">
              <a 
                href="https://www.instagram.com/rifma_beauty/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/50 hover:text-rose-200 transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.snapchat.com/add/rifma_beauty" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/50 hover:text-rose-200 transition-all duration-300 hover:scale-110"
              >
                <FontAwesomeIcon icon={faSnapchat} className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@rifma.beauty" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/50 hover:text-rose-200 transition-all duration-300 hover:scale-110"
              >
                <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright avec séparateur */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-white/30 text-xs font-light tracking-wide">
            © {new Date().getFullYear()} RIFMA BEAUTY COSMETICS. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}