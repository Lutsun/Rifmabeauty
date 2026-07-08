import { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingBag, Truck, Shield, ChevronRight, Sparkles, Droplet, Leaf, Clock, Check, Star } from 'lucide-react';
import { apiService, Product } from '../services/apiService';
import { useCart } from '../components/CartContext';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string, id?: string) => void;
}

// Configuration des ingrédients et bénéfices par catégorie
const productContent = {
  'Body Care': {
    ingredients: [
      { icon: Droplet, title: 'Huile de Sésame Bio', text: 'Riche en acides gras essentiels, elle nourrit et protège la peau' },
      { icon: Leaf, title: 'Vitamine E', text: 'Antioxydant puissant qui prévient le vieillissement cutané' },
      { icon: Sparkles, title: 'Mica doré', text: 'Pigments naturels pour un éclat lumineux et scintillant' },
      { icon: Droplet, title: 'Huile d\'Amande Douce', text: 'Adoucit et apaise les peaux sensibles' }
    ],
    benefits: [
      'Révèle un éclat doré et lumineux sur toute la peau',
      'Hydrate et adoucit en profondeur',
      'Texture legere et non grasse ',
      'Laisse la peau douce lisse et lumineuse',
      'Convient à toutes les carnations et types de peau'
    ]
  },
  'Glosses': {
    ingredients: [
      { icon: Droplet, title: 'Acide hyaluronique', text: 'Effet repulpe et volume instantané' },
      { icon: Leaf, title: 'Beurre de Karité', text: 'Réparation et protection de la peau' },
      { icon: Sparkles, title: 'Vitamine E', text: 'Antioxydant puissant' }
    ],
    benefits: [
      'Brillance intense pendant 6h',
      'Effet repulpe immédiat',
      'Texture non collante'
    ]
  },
  'Lip Balms': {
    ingredients: [
      { icon: Leaf, title: 'Beurre de karité', text: 'Réparation et protection des lèvres sèches' },
      { icon: Droplet, title: 'Vitamine E', text: 'Antioxydant naturel' }
    ],
    benefits: [
      '100% Vegan',
      'Moisturizes & Soothes',
      'Silky Texture',
      'Sweet Sugar Scent'
    ]
  },
  'Lip liners': {
    ingredients: [
      { icon: Sparkles, title: 'Cires naturelles', text: 'Tenue longue durée et confort' },
      { icon: Leaf, title: 'Vitamine E', text: 'Protection et soin' }
    ],
    benefits: [
      'Tenue waterproof 12h',
      'Ne dessèche pas les lèvres',
      'Pigmentation intense'
    ]
  },
  'default': {
    ingredients: [
      { icon: Droplet, title: 'Formule enrichie', text: 'Acide hyaluronique, beurre de karité, vitamine E' },
      { icon: Leaf, title: 'Ingrédients naturels', text: '98% d\'ingrédients d\'origine naturelle' },
      { icon: Sparkles, title: 'Sans cruauté', text: 'Non testé sur les animaux' }
    ],
    benefits: [
      'Hydratation intense',
      'Texture légère',
      'Tenue longue durée'
    ]
  }
};

export default function ProductDetail({ productId, onNavigate }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'benefits'>('description');
  const { addToCart } = useCart();

  // Récupérer le contenu dynamique basé sur la catégorie
  const getContentForProduct = () => {
    if (!product) return productContent.default;
    return productContent[product.category as keyof typeof productContent] || productContent.default;
  };

  const dynamicContent = getContentForProduct();

  const isPromotionValid = () => {
    if (!product?.promotion_end_date) return true;
    const now = new Date();
    const endDate = new Date(product.promotion_end_date);
    return now <= endDate;
  };

  const getPromotionInfo = () => {
    if (!product || !isPromotionValid()) return null;
    if (product.promotion_type === 'quantity' && product.promotion_message) {
      return {
        type: 'quantity',
        message: product.promotion_message,
        originalPrice: product.original_price,
        currentPrice: product.price,
        discount: product.discount_percent
      };
    }
    if (product.promotion_message || (product.discount_percent && product.discount_percent > 0)) {
      return {
        type: product.promotion_type || 'percentage',
        message: product.promotion_message || `-${product.discount_percent}%`,
        originalPrice: product.original_price || product.price,
        currentPrice: product.price,
        discount: product.discount_percent
      };
    }
    if (product.original_price && product.original_price > product.price) {
      const discountValue = Math.round((1 - product.price / product.original_price) * 100);
      return {
        type: 'percentage',
        message: `-${discountValue}%`,
        originalPrice: product.original_price,
        currentPrice: product.price,
        discount: discountValue
      };
    }
    return null;
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const prod = await apiService.getProductById(productId);
      setProduct(prod);
      setError(null);
      
      if (prod) {
        const allProducts = await apiService.getAllProducts();
        const filteredRelated = allProducts
          .filter(p => p.id !== productId && p.category === prod.category)
          .slice(0, 4);
        setRelatedProducts(filteredRelated);
      } else {
        setError('Produit non trouvé');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Impossible de charger le produit');
    } finally {
      setLoading(false);
    }
  };

  const getProductImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(product.image);
    if (product.detailImage) images.push(product.detailImage);
    return images;
  };

  const productImages = getProductImages();
  const promotion = getPromotionInfo();
  const hasPromotion = promotion !== null;

  const nextImage = () => {
    if (productImages.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (productImages.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
      );
    }
  };

  const nextProduct = () => {
    const currentIndex = relatedProducts.findIndex(p => p.id === productId);
    if (currentIndex < relatedProducts.length - 1) {
      onNavigate('product', relatedProducts[currentIndex + 1].id);
    }
  };

  const prevProduct = () => {
    const currentIndex = relatedProducts.findIndex(p => p.id === productId);
    if (currentIndex > 0) {
      onNavigate('product', relatedProducts[currentIndex - 1].id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-light">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <p className="text-gray-500">{error || 'Produit non trouvé'}</p>
          <button
            onClick={() => onNavigate('shop')}
            className="text-rose-500 hover:text-rose-600 underline text-sm font-light"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero simplifié */}
      <div className="bg-stone-50 py-8 border-b border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-light">Retour</span>
            </button>
            
            {/* Navigation entre produits */}
            {relatedProducts.length > 0 && (
              <div className="flex gap-4">
                <button
                  onClick={prevProduct}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextProduct}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Section Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden">
              <img
                src={productImages[currentImageIndex] || product.image || '/assets/images/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasPromotion && promotion?.discount && promotion.discount > 0 && (
                  <span className="px-3 py-1 text-xs font-medium bg-rose-500 text-white rounded-full shadow-lg">
                    -{promotion.discount}%
                  </span>
                )}
                {product.inStock ? (
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full shadow-lg">
                    En stock
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full shadow-lg">
                    Rupture
                  </span>
                )}
              </div>
              
              {/* Navigation images */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentImageIndex 
                            ? 'w-6 h-1.5 bg-rose-500' 
                            : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Miniatures */}
            {productImages.length > 1 && (
              <div className="flex gap-3 justify-center">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      index === currentImageIndex ? 'border-rose-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`Vue ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div>
            {/* Catégorie + actions */}
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-light tracking-[0.2em] uppercase text-rose-400">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mb-3">
              {product.name}
            </h1>
            
            {product.shade && (
              <p className="text-gray-500 text-sm font-light mb-4">
                Teinte: <span className="text-gray-700">{product.shade}</span>
              </p>
            )}

            {/* Prix */}
            <div className="mb-8 pb-6 border-b border-gray-100">
              {hasPromotion ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-light text-gray-900">
                      {Math.round(promotion.currentPrice).toLocaleString()} FCFA
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {Math.round(promotion.originalPrice || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                  {promotion.message && (
                    <div className="inline-block bg-rose-50 px-3 py-1 rounded-full">
                      <span className="text-xs text-rose-600 font-medium">{promotion.message}</span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-4xl font-light text-gray-900">
                  {product.price.toLocaleString()} FCFA
                </span>
              )}
            </div>

            {/* Bouton Ajouter au panier */}
            <button 
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
              className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-3 group mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-light tracking-widest uppercase">
                {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
              </span>
            </button>

            {/* Points forts */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-stone-50 rounded-xl">
              <div className="text-center">
                <Truck className="w-5 h-5 text-rose-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-light">Livraison rapide</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 text-rose-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-light">Paiement sécurisé</p>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 text-rose-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-light">24h/24 7j/7</p>
              </div>
            </div>

            {/* Tabs dynamiques */}
            <div className="border-b border-gray-200">
              <div className="flex gap-6">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'ingredients', label: 'Ingrédients' },
                  { id: 'benefits', label: 'Bénéfices' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`pb-3 text-sm font-light tracking-wide transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'text-rose-500 border-b-2 border-rose-500'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 pb-8">
              {activeTab === 'description' && (
                <p className="text-gray-600 font-light leading-relaxed">
                  {product.description}
                </p>
              )}
              
              {activeTab === 'ingredients' && (
                <div className="space-y-4">
                  {dynamicContent.ingredients.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-rose-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-gray-600 text-sm font-light">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {activeTab === 'benefits' && (
                <div className="space-y-3">
                  {dynamicContent.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600 font-light">{benefit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info livraison */}
            <div className="bg-rose-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 font-light">
                <span className="font-medium text-rose-700">💡 Livraison :</span> Paiement à la livraison disponible
                partout au Sénégal. Livraison sous 24h-48h à Dakar.
              </p>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-light tracking-wide text-gray-900">
                Vous aimerez aussi
              </h2>
              <div className="w-12 h-px bg-rose-300 mx-auto mt-3" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(0);
                    onNavigate('product', relatedProduct.id);
                  }}
                >
                  <div className="relative bg-stone-100 rounded-xl overflow-hidden aspect-square mb-3">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {relatedProduct.discount_percent && relatedProduct.discount_percent > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-rose-500 text-white rounded-full">
                        -{relatedProduct.discount_percent}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-light text-gray-800 group-hover:text-rose-500 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-light text-gray-900">
                      {relatedProduct.price.toLocaleString()} FCFA
                    </span>
                    {relatedProduct.original_price && relatedProduct.original_price > relatedProduct.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {relatedProduct.original_price.toLocaleString()} FCFA
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}