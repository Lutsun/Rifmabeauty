import { ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

interface HomeProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const featuredProducts = products.filter(p => p.featured);

  return (
    <div className="min-h-screen">
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(public/assets/images/RBHome.JPG)',
          backgroundPosition: 'center 15%', // Ajuste le cadrage vertical pour centrer les lèvres
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-2xl space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-light tracking-wider leading-tight">
            L'Art de la
            <span className="block text-rose-300">Beauté Sublime</span>
          </h1>
          <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed max-w-xl">
            Découvrez notre collection exclusive de produits pour les lèvres.
            L'excellence cosmétique au service de votre élégance.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="group inline-flex items-center space-x-3 bg-white text-black px-8 py-4 hover:bg-rose-100 transition-all duration-300 transform hover:scale-105"
          >
            <span className="text-sm font-light tracking-widest uppercase">
              Découvrir la collection
            </span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>

      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-light tracking-wider text-gray-900">
              Collection Signature
            </h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Des formules haute couture pour sublimer vos lèvres avec sophistication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={(id) => onNavigate('product', id)}
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center space-x-2 border-2 border-black text-black px-8 py-3 hover:bg-black hover:text-white transition-all duration-300"
            >
              <span className="text-sm font-light tracking-widest uppercase">
                Voir tous les produits
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    <section className="relative py-32 overflow-hidden">
        {/* Background avec fallback */}
        <div className="absolute inset-0 bg-stone-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/assets/images/lipbalm4.JPG)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay pour lisibilité */}
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
          <h2 className="text-4xl md:text-5xl font-light tracking-wider leading-tight">
            L'Excellence en Héritage
          </h2>
          <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed max-w-2xl mx-auto">
            RIFMA BEAUTY incarne le raffinement absolu dans l'univers de la beauté.
            Chaque produit est une œuvre d'art créée pour révéler votre éclat naturel.
          </p>
          <button
            onClick={() => onNavigate('about')}
            className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-black transition-all duration-300"
          >
          <span className="text-sm font-light tracking-widest uppercase">
            Notre histoire
          </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-8 h-8 bg-rose-300 rounded-full" />
              </div>
              <h3 className="text-xl font-light tracking-wide text-gray-900">
                Formules Haute Couture
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Des ingrédients d'exception sélectionnés pour leur qualité incomparable
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-8 h-8 bg-rose-300 rounded-full" />
              </div>
              <h3 className="text-xl font-light tracking-wide text-gray-900">
                Tenue Longue Durée
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Une pigmentation intense qui sublime vos lèvres toute la journée
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-8 h-8 bg-rose-300 rounded-full" />
              </div>
              <h3 className="text-xl font-light tracking-wide text-gray-900">
                Luxe & Élégance
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Un design raffiné qui reflète l'excellence de nos produits
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
