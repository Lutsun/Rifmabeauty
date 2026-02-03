import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

interface ShopProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Shop({ onNavigate }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Glosses', 'Lip Balms', 'Lip liners'];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen pt-20">
    <section className="relative py-32 overflow-hidden">
      {/* Div séparée pour le background avec fallback */}
      <div className="absolute inset-0 bg-stone-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/assets/images/lipbalm4.JPG)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
      {/* Dégradé pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
    </div>
  </div>

      {/* Contenu */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-light tracking-wider text-white">
          Notre Collection
        </h1>
        <p className="text-lg font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
          Explorez notre gamme exclusive de produits pour des lèvres sublimes
        </p>
      </div>
</section>

      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 text-sm font-light tracking-wider uppercase transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                }`}
              >
                {category === 'all' ? 'Tous les produits' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-light text-gray-600">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={(id) => onNavigate('product', id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
