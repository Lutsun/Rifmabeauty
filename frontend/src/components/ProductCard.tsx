import { Product } from '../services/apiService'; 

interface ProductCardProps {
  product: Product;
  onProductClick: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onProductClick, onAddToCart }: ProductCardProps) {
  return (
    <div
      className="group cursor-pointer"
      onClick={() => onProductClick(product.id)}
    >
      <div className="relative overflow-hidden bg-stone-100 aspect-square mb-4">
        {/* Badge de stock */}
        <div className="absolute top-3 left-3 z-10">
          {product.inStock ? (
            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              ✓ En stock
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              ✕ Sold out
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
        <p className="text-lg font-light text-gray-900">{product.price} FCFA</p>
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