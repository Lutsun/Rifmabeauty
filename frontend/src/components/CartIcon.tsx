import { ShoppingBag } from 'lucide-react';
import { useCart } from '../components/CartContext';

export default function CartIcon() {
  const { getCartCount, setIsCartOpen } = useCart();
  const itemCount = getCartCount();

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="text-white/80 hover:text-white transition-colors relative"
    >
      <ShoppingBag className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-rose-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}