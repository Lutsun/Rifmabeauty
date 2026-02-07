import { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingBag, Truck, Shield } from 'lucide-react';
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
            </div>

            {/* Section Paiement améliorée */}
            <div className="border-t border-gray-200 pt-8 space-y-6">
              <div className="flex items-start space-x-4">
                <Truck className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-light tracking-wider text-gray-900 mb-1">
                    Paiement à la livraison
                  </h3>
                  <p className="text-gray-600 text-sm font-light mb-4">
                    Payez directement à la réception de votre commande en toute sécurité
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Shield className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-light tracking-wide text-gray-900 mb-3">
                      Moyens de paiement acceptés
                    </h4>
                    <p className="text-gray-600 text-sm font-light mb-4">
                      Vous pouvez régler votre commande avec :
                    </p>
                    
                    {/* Icônes de paiement */}
                    <div className="flex flex-wrap gap-4 items-center mt-4">
                      {/* Wave */}
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-10 bg-[#00B2A9] rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                          <span className="text-white font-bold text-sm tracking-wide">WAVE</span>
                        </div>
                        <span className="text-xs text-gray-500 font-light">Mobile Money</span>
                      </div>
                      
                      {/* Orange Money */}
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-10 bg-[#FF6600] rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                          <span className="text-white font-bold text-xs tracking-wide">ORANGE</span>
                        </div>
                        <span className="text-xs text-gray-500 font-light">Mobile Money</span>
                      </div>
                      
                      {/* Visa */}
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-10 bg-gradient-to-r from-[#1A1F71] to-[#2A3284] rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                          <span className="text-white font-bold text-xl tracking-tighter">VISA</span>
                        </div>
                        <span className="text-xs text-gray-500 font-light">Carte bancaire</span>
                      </div>
                      
                      {/* Mastercard */}
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-10 bg-gradient-to-r from-[#EB001B] to-[#FF5F00] rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                          <span className="text-white font-bold text-sm tracking-wide">Mastercard</span>
                        </div>
                        <span className="text-xs text-gray-500 font-light">Carte bancaire</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message d'information */}
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-700 font-light">
                  <span className="font-medium text-rose-700">💡 Bon à savoir : </span>
                  Vous pouvez également payer en espèces si vous le souhaitez. 
                  Notre livreur vous apportera votre commande avec une machine de paiement mobile.
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