import { Product } from '../services/apiService';

interface ProductCardProps {
  product: Product;
  onProductClick: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onProductClick, onAddToCart }: ProductCardProps) {
  
  // Vérifier si la promotion est encore valide (date)
  const isPromotionValid = () => {
    if (!product.promotion_end_date) return true;
    
    const now = new Date();
    const endDate = new Date(product.promotion_end_date);
    return now <= endDate;
  };

  // Fonction 100% dynamique basée sur les colonnes de la DB
  const getPromotionalInfo = () => {
    // Si pas de promotion ou promotion expirée
    if (!isPromotionValid()) return null;
    
    const hasPromotion = 
      product.discount_percent || 
      product.original_price || 
      product.promotion_type || 
      product.promotion_message;

    if (!hasPromotion) return null;

    // Cas 1: Promotion avec message personnalisé (prioritaire)
    if (product.promotion_message) {
      return {
        originalPrice: product.original_price || product.price,
        promotionalPrice: product.price,
        discount: product.discount_percent,
        message: product.promotion_message,
        type: product.promotion_type
      };
    }

    // Cas 2: Promotion avec pourcentage de réduction
    if (product.discount_percent && product.discount_percent > 0) {
      return {
        originalPrice: product.price,
        promotionalPrice: product.price * (1 - product.discount_percent / 100),
        discount: product.discount_percent,
        message: `-${product.discount_percent}%`,
        type: 'percentage'
      };
    }

    // Cas 3: Prix barré (original_price plus élevé)
    if (product.original_price && product.original_price > product.price) {
      const discountValue = Math.round((1 - product.price / product.original_price) * 100);
      return {
        originalPrice: product.original_price,
        promotionalPrice: product.price,
        discount: discountValue,
        message: product.promotion_message || `-${discountValue}%`,
        type: product.promotion_type || 'percentage'
      };
    }

    return null;
  };

  const promotion = getPromotionalInfo();
  const hasPromotion = promotion !== null;

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onProductClick(product.id)}
    >
      <div className="relative overflow-hidden bg-stone-100 aspect-square mb-4">
        {/* Badges de promotion et stock - 100% dynamique */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.inStock ? (
            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              ✓ En stock
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              ✕ Sold out
            </span>
          )}
          {hasPromotion && promotion.discount && promotion.discount > 0 && (
            <span className="px-3 py-1 text-xs font-medium bg-rose-500 text-white rounded-full">
              -{promotion.discount}%
            </span>
          )}
        </div>
        
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
            !product.inStock ? 'opacity-50' : ''
          }`}
          onError={(e) => {
            e.currentTarget.src = '/assets/images/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-light text-gray-500 uppercase tracking-wider">
          {product.category}
        </p>
        <h3 className="text-lg font-light text-gray-900 group-hover:text-rose-600 transition-colors">
          {product.name}
        </h3>
        {product.shade && (
          <p className="text-sm text-gray-400 font-light">{product.shade}</p>
        )}
        
        {/* Affichage du prix  */}
        <div className="space-y-1">
          {hasPromotion ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-lg font-light text-gray-900">
                  {Math.round(promotion.promotionalPrice).toLocaleString()} FCFA
                </p>
                <p className="text-sm text-gray-400 line-through">
                  {Math.round(promotion.originalPrice).toLocaleString()} FCFA
                </p>
              </div>
              
              {/* Message de promotion dynamique */}
              {promotion.message && promotion.message !== `-${promotion.discount}%` && (
                <p className="text-xs font-medium text-rose-600 bg-rose-50 inline-block px-2 py-1 rounded">
                  {promotion.message}
                </p>
              )}

              {/* Badge de type de promotion */}
              {promotion.type === 'flash' && (
                <p className="text-xs font-medium text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded">
                  ⚡ Offre Flash
                </p>
              )}
              {promotion.type === 'quantity' && (
                <p className="text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                  📦 Offre Quantité
                </p>
              )}
            </>
          ) : (
            <p className="text-lg font-light text-gray-900">
              {product.price.toLocaleString()} FCFA
            </p>
          )}
        </div>
      </div>
      
      {product.inStock ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) {
              onAddToCart(product);
            }
          }}
          className="w-full mt-4 py-3 border border-gray-300 text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all duration-300"
        >
          <span className="text-sm font-light tracking-wider">
            Ajouter au panier
          </span>
        </button>
      ) : (
        <button
          disabled
          className="w-full mt-4 py-3 border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
        >
          <span className="text-sm font-light tracking-wider">
            Sold out
          </span>
        </button>
      )}
    </div>
  );
}