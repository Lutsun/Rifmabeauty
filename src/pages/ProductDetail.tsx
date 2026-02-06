import { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingBag, Heart } from 'lucide-react';
import { apiService, Product } from '../services/apiService'; 
import { useCart } from '../components/CartContext';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string, id?: string) => void;
}

export default function ProductDetail({ productId, onNavigate }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const prod = await apiService.getProductById(productId);
      setProduct(prod);
      setError(null);
      
      // Récupérer les produits similaires
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">{error || 'Produit non trouvé'}</p>
          <button
            onClick={() => onNavigate('shop')}
            className="text-rose-600 hover:text-rose-700 underline"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-light tracking-wide">Retour à la boutique</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-4">
            <div className="aspect-square bg-white overflow-hidden">
              <img
                src={product.detailImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/placeholder.jpg';
                }}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-3">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-wide text-gray-900 mb-4">
                {product.name}
              </h1>
              {product.shade && (
                <p className="text-lg text-gray-600 font-light mb-6">
                  Teinte: {product.shade}
                </p>
              )}
              <p className="text-3xl font-light text-gray-900">{product.price} FCFA</p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-light tracking-wide text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-600 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <button 
              onClick={() => addToCart(product)}
              className="w-full bg-black text-white py-4 px-8 hover:bg-gray-900 transition-all duration-300 flex items-center justify-center space-x-3 group"
              disabled={!product.inStock}
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-light tracking-widest uppercase">
                {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
              </span>
            </button>

              <button className="w-full border-2 border-gray-300 text-gray-700 py-4 px-8 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-3 group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-light tracking-widest uppercase">
                  Ajouter aux favoris
                </span>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-8 space-y-6">
              <div>
                <h3 className="text-sm font-light tracking-wider uppercase text-gray-900 mb-2">
                  Livraison
                </h3>
                <p className="text-gray-600 text-sm font-light">
                  Livraison offerte à partir de 50€ d'achat
                </p>
              </div>

              <div>
                <h3 className="text-sm font-light tracking-wider uppercase text-gray-900 mb-2">
                  Retours
                </h3>
                <p className="text-gray-600 text-sm font-light">
                  Retours gratuits sous 30 jours
                </p>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-light tracking-wide text-gray-900 mb-12 text-center">
              Produits Similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="cursor-pointer group"
                  onClick={() => onNavigate('product', relatedProduct.id)}
                >
                  <div className="relative overflow-hidden bg-stone-100 aspect-square mb-4">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-light text-gray-900 group-hover:text-rose-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-light text-gray-900">
                      {relatedProduct.price} FCFA
                    </p>
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