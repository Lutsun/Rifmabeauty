import { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import { apiService, Product } from '../services/apiService';
import { useCart } from '../components/CartContext';
import { ArrowRight } from 'lucide-react';

interface ShopProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Shop({ onNavigate }: ShopProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [lipLiners, setLipLiners] = useState<Product[]>([]);
  const [lipBalms, setLipBalms] = useState<Product[]>([]);
  const [bodyCareProducts, setBodyCareProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const lipLinersSectionRef = useRef<HTMLDivElement>(null);
  const bodyCareSectionRef = useRef<HTMLDivElement>(null);

  const collections = [
    { 
      id: 'Khairyatou', 
      name: 'Khairyatou', 
      subtitle: 'Collection Signature',
      description: 'L\'élégance et la douceur pour des lèvres sublimes. Des formules enrichies en ingrédients naturels pour une hydratation intense.',
      image: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image7.JPG',
      tag: 'Nouveauté'
    },
    { 
      id: 'Koursoumel', 
      name: 'Koursoumel', 
      subtitle: 'Collection Premium',
      description: 'Des teintes intenses et vibrantes pour un regard captivant. Une pigmentation exceptionnelle pour un résultat longue tenue.',
      image: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image5.JPG',
      tag: 'Nouveauté'
    },
    { 
      id: 'Our Regulars', 
      name: 'Our Regulars', 
      subtitle: 'Collection Essentielle',
      description: 'Les incontournables pour une routine beauté parfaite. Des produits du quotidien qui deviendront vos indispensables.',
      image: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image8.JPG',
      tag: 'Iconique'
    }
  ];

  // Informations pour la section Body Care hero (à personnaliser)
  const bodyCareHero = {
    title: 'Body Care',
    subtitle: 'Nouvelle Collection',
    description: 'Une huile scintillante qui sublime votre peau et révèle son éclat naturel',
    image: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image10.JPG',
    tag: 'Nouveauté Exclusive'
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    filterProductsByCollection();
  }, [selectedCollection, allProducts]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const prods = await apiService.getAllProducts();
      setAllProducts(prods);
      
      const liners = prods.filter(p => p.category === 'Lip liners');
      setLipLiners(liners);

      const lipBalmsFiltered = prods.filter(p => p.category === 'Lip Balms');
      setLipBalms(lipBalmsFiltered);
      
      const bodyCare = prods.filter(p => p.category === 'Body Care');
      setBodyCareProducts(bodyCare);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const filterProductsByCollection = () => {
    if (selectedCollection === 'all') {
      const nonLinersAndBodyCare = allProducts.filter(
        p => p.category !== 'Lip liners' && p.category !== 'Body Care' && p.category !== 'Lip Balms'
      );
      setProducts(nonLinersAndBodyCare);
    } else {
      const filtered = allProducts.filter(
        (product) => product.collection === selectedCollection && 
        product.category !== 'Lip liners' && 
        product.category !== 'Body Care' &&
        product.category !== 'Lip Balms'
      );
      setProducts(filtered);
    }
  };

  const handleCollectionClick = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setTimeout(() => {
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const scrollToBodyCare = () => {
    // Réinitialiser la sélection de collection pour afficher toutes les sections
    setSelectedCollection('all');
    // Attendre que le state soit mis à jour et que le DOM soit rendu
    setTimeout(() => {
      bodyCareSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-light">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - CORRIGÉ POUR MOBILE */}
      <section className="relative h-[70vh] min-h-[500px] md:min-h-[600px] overflow-hidden">
        {/* Image de fond - sans bg-fixed pour mobile */}
        <div className="absolute inset-0">
          <img
            src="https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image9.JPG"
            alt="RIFMA Beauty Boutique"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-light tracking-wide text-white mb-4 drop-shadow-2xl">
              Notre Boutique
            </h1>
            <div className="w-16 h-px bg-rose-300 mx-auto mb-6" />
            <p className="text-sm md:text-base lg:text-lg font-light text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Découvrez une sélection unique de produits pensés pour révéler votre beauté naturelle
            </p>
          </div>
        </div>

        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Collections */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-light tracking-[0.2em] uppercase text-rose-400">
              Nos Collections
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mt-2">
              L'Art de la Beauté
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="group relative bg-stone-50 rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => handleCollectionClick(collection.id)}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-light tracking-wider text-gray-800">
                      {collection.tag}
                    </span>
                  </div>
                  
                  <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors duration-500" />
                </div>
                
                <div className="p-6 text-center">
                  <h3 className="text-xl font-light tracking-wide text-gray-900 mb-1">
                    {collection.name}
                  </h3>
                  <p className="text-xs font-light tracking-[0.2em] uppercase text-rose-400 mb-3">
                    {collection.subtitle}
                  </p>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">
                    {collection.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-light text-gray-600 group-hover:text-rose-500 transition-colors">
                    Découvrir
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}

            {/* Carte Body Care */}
            {bodyCareProducts.length > 0 && (
              <div
                className="group relative bg-stone-50 rounded-2xl overflow-hidden cursor-pointer"
                onClick={scrollToBodyCare}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={bodyCareHero.image}
                    alt="Body Care"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-light tracking-wider animate-pulse">
                      {bodyCareHero.tag}
                    </span>
                  </div>
                  
                  <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors duration-500" />
                </div>
                
                <div className="p-6 text-center">
                  <h3 className="text-xl font-light tracking-wide text-gray-900 mb-1">
                    {bodyCareHero.title}
                  </h3>
                  <p className="text-xs font-light tracking-[0.2em] uppercase text-rose-400 mb-3">
                    {bodyCareHero.subtitle}
                  </p>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">
                    {bodyCareHero.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-light text-gray-600 group-hover:text-rose-500 transition-colors">
                    Découvrir la nouveauté
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section produits (Glosses + Lip Balms) */}
      <div ref={productsSectionRef}>
        {selectedCollection !== 'all' && (
          <section className="py-16 bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <div>
                  <button
                    onClick={() => setSelectedCollection('all')}
                    className="text-sm font-light text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                  >
                    ← Tous les produits
                  </button>
                  <h3 className="text-2xl font-light tracking-wide text-gray-900 mt-2">
                    {selectedCollection}
                  </h3>
                  <p className="text-gray-500 text-sm font-light mt-1">
                    {products.length} produit{products.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <p className="text-gray-500">Aucun produit trouvé dans cette collection</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={(id) => onNavigate('product', id)}
                      onAddToCart={() => addToCart(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Section Glosses & Lip Balms - toujours visible */}
      {selectedCollection === 'all' && (
        <section className="py-16 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-light tracking-wide text-gray-900">
                Nos Soins & Glosses
              </h3>
              <p className="text-gray-500 text-sm font-light mt-1">
                {products.length} produits
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={(id) => onNavigate('product', id)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Lip Balms - toujours visible */}
      {lipBalms.length > 0 && (
        <section className="py-16 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-light tracking-[0.2em] uppercase text-rose-400">
                Douceur & Hydratation
              </span>
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mt-2">
                Lip Balms
              </h2>
              <div className="w-16 h-px bg-rose-300 mx-auto mt-4 mb-4" />
              <p className="text-gray-500 font-light max-w-2xl mx-auto">
                Des baumes nourrissants pour des lèvres douces et parfaitement hydratées
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {lipBalms.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={(id) => onNavigate('product', id)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Body Care - toujours visible avec ref */}
      {bodyCareProducts.length > 0 && (
        <section ref={bodyCareSectionRef} className="py-20 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-light tracking-[0.2em] uppercase text-rose-400">
                Éclat & Hydratation
              </span>
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mt-2">
                Notre Huile Scintillante
              </h2>
              <div className="w-16 h-px bg-rose-300 mx-auto mt-4 mb-4" />
              <p className="text-gray-500 font-light max-w-2xl mx-auto">
                Une formule unique qui enveloppe votre corps d'un voile lumineux et d'une hydratation intense
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {bodyCareProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={(id) => onNavigate('product', id)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Lips Liners - toujours visible */}
      {lipLiners.length > 0 && (
        <section ref={lipLinersSectionRef} className="py-16 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-light tracking-[0.2em] uppercase text-rose-400">
                Précision & Élégance
              </span>
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mt-2">
                Lips Liners
              </h2>
              <div className="w-16 h-px bg-rose-300 mx-auto mt-4 mb-4" />
              <p className="text-gray-500 font-light max-w-2xl mx-auto">
                Des contours précis pour des lèvres parfaitement définies
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {lipLiners.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={(id) => onNavigate('product', id)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}