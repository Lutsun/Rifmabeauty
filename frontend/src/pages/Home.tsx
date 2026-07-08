import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, Clock, Gem, Heart, Star } from 'lucide-react';
import { apiService, Product } from '../services/apiService';

interface HomeProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [, setFeaturedProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  

  const newCollections = [
    {
      id: 'Khairyatou',
      name: 'Khairyatou',
      description: 'L\'élégance et la douceur pour des lèvres sublimes',
      image: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image7.JPG',
      icon: Heart,
      tag: 'Nouvelle Collection'
    },
    {
      id: 'Koursoumel',
      name: 'Koursoumel',
      description: 'Des teintes intenses et vibrantes pour un regard captivant',
      image: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image5.JPG',
      icon: Star,
      tag: 'Nouvelle Collection'
    },
    {
      id: 'Our Regulars',
      name: 'Our Regulars',
      description: 'Les incontournables pour une routine beauté parfaite',
      image: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image8.JPG',
      icon: Sparkles,
      tag: 'Collection Iconique'
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const prods = await apiService.getAllProducts(undefined, true);
      const limitedProds = prods.slice(0, 3);
      setFeaturedProducts(limitedProds);
      setError(null);
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('Impossible de charger les produits vedettes');
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image2.JPG)',
            backgroundPosition: 'center 20%',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide leading-[1.2] mb-6">
              <span className="block text-white drop-shadow-lg">L'Art de la</span>
              <span className="block text-white drop-shadow-2xl">
                Beauté <span className="text-rose-200">Sublime</span>
              </span>
            </h1>

            <p className="text-base md:text-lg font-light text-white/90 leading-relaxed max-w-lg mb-10 drop-shadow-md">
              Découvrez notre collection exclusive de produits pour les lèvres.
              L'excellence cosmétique au service de votre élégance.
            </p>

            <button
              onClick={() => onNavigate('shop')}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/15 backdrop-blur-md border border-white/40 px-8 py-4 transition-all duration-300 hover:bg-white hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative text-sm font-medium tracking-widest uppercase text-white group-hover:text-black transition-colors duration-300">
                Découvrir la collection
              </span>
              <ChevronRight className="relative w-4 h-4 ml-2 text-white group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-7 h-11 border border-white/40 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-black/20">
            <div className="w-1 h-3 bg-white/80 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Nouvelles Collections Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-light tracking-[0.2em] uppercase text-rose-400">
              Découvrez nos
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-wider text-gray-900">
              Nouvelles Collections
            </h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Des créations exclusives pour sublimer vos lèvres avec élégance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newCollections.map((collection) => {
              const Icon = collection.icon;
              return (
                <div
                  key={collection.id}
                  className="group cursor-pointer"
                  onClick={() => onNavigate('shop')}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-light tracking-wider text-gray-800">
                        {collection.tag}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white">
                        <Icon className="w-4 h-4 text-rose-300" />
                        <span className="text-sm font-light tracking-wide">{collection.name}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-light tracking-wide text-gray-900 mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    {collection.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center space-x-2 border-2 border-black text-black px-8 py-3 hover:bg-black hover:text-white transition-all duration-300"
            >
              <span className="text-sm font-light tracking-widest uppercase">
                Découvrir toutes nos collections
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Excellence Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image2.JPG)',
              backgroundSize: 'cover',
              backgroundPosition: 'center ',
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </div>

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

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-rose-100 transition-all duration-300">
                <Sparkles className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-xl font-light tracking-wide text-gray-900">
                Formules Haute Couture
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Des ingrédients d'exception sélectionnés pour leur qualité incomparable
              </p>
            </div>

            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-rose-100 transition-all duration-300">
                <Clock className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-xl font-light tracking-wide text-gray-900">
                Tenue Longue Durée
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Une pigmentation intense qui sublime vos lèvres toute la journée
              </p>
            </div>

            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-rose-100 transition-all duration-300">
                <Gem className="w-7 h-7 text-rose-400" />
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