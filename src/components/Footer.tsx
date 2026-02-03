import { Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-light tracking-[0.3em] mb-4">RIFMA BEAUTY</h3>
            <p className="text-white/60 font-light leading-relaxed max-w-md">
              L'excellence cosmétique au service de votre beauté. Des produits haute couture
              pour sublimer vos lèvres avec élégance et sophistication.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-light tracking-wider uppercase mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/60 hover:text-rose-200 transition-colors text-sm">Accueil</a></li>
              <li><a href="#" className="text-white/60 hover:text-rose-200 transition-colors text-sm">Boutique</a></li>
              <li><a href="#" className="text-white/60 hover:text-rose-200 transition-colors text-sm">À propos</a></li>
              <li><a href="#" className="text-white/60 hover:text-rose-200 transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-light tracking-wider uppercase mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-rose-200 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-rose-200 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-rose-200 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-white/40 text-sm font-light">
            © 2024 RIFMA BEAUTY. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
