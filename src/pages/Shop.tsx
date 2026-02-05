import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { apiService, Product } from '../services/apiService';
import { useCart } from '../components/CartContext';

interface ShopProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Shop({ onNavigate }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const cats = await apiService.getCategories();
      setCategories(['all', ...cats]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories(['all', 'Glosses', 'Lip Balms', 'Lip liners']); // Fallback
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const prods = await apiService.getAllProducts(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setProducts(prods);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Impossible de charger les produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-black text-white hover:bg-gray-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="relative py-32 overflow-hidden">
        {/* Background avec fallback */}
        <div className="absolute inset-0 bg-stone-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/assets/images/lipbalm4.JPG)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
          </div>
        </div>

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
              {products.length} produit{products.length > 1 ? 's' : ''}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun produit trouvé dans cette catégorie</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 text-black underline hover:text-gray-700"
              >
                Voir tous les produits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
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
    </div>
  );
}