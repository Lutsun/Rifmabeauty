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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-light tracking-[0.3em] mb-4">RIFMA BEAUTY COSMETICS</h3>
            <p className="text-white/60 font-light leading-relaxed max-w-md">
              L'excellence cosmétique au service de votre beauté. Des produits haute couture
              pour sublimer vos lèvres avec élégance et sophistication.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-light tracking-wider uppercase mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('home')}
                  className="text-white/60 hover:text-rose-200 transition-colors text-sm text-left"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('shop')}
                  className="text-white/60 hover:text-rose-200 transition-colors text-sm text-left"
                >
                  Boutique
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('about')}
                  className="text-white/60 hover:text-rose-200 transition-colors text-sm text-left"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('contact')}
                  className="text-white/60 hover:text-rose-200 transition-colors text-sm text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-light tracking-wider uppercase mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/rifma_beauty/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-rose-200 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.snapchat.com/add/rifma_beauty" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-rose-200 transition-colors"
              >
                <FontAwesomeIcon icon={faSnapchat} className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@rifma.beauty" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-rose-200 transition-colors"
              >
                <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-white/40 text-sm font-light">
            © {new Date().getFullYear()} RIFMA BEAUTY COSMETICS. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}