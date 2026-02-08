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
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-amber-600 font-light">
            Plus que {product.stock} disponible{product.stock > 1 ? 's' : ''}
          </p>
        )}
        {!product.inStock && (
          <p className="text-xs text-red-600 font-light">Rupture de stock</p>
        )}
      </div>
      
      {product.inStock && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Empêche le clic sur la carte produit
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
      )}
    </div>
  );
}