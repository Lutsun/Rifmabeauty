import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onProductClick: (productId: string) => void;
}

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
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
    </div>
  );
}
