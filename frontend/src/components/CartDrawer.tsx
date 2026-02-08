import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../components/CartContext';

interface CartDrawerProps {
  onNavigate?: (page: string) => void;
}

export default function CartDrawer({ onNavigate }: CartDrawerProps) {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    shippingFee,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  const subtotal = getCartTotal();
  const total = subtotal + shippingFee;
  const itemCount = getCartCount();

  const handleClose = () => setIsCartOpen(false);

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (onNavigate) {
      onNavigate('checkout');
    } else {
      // Fallback
      window.location.href = '#checkout';
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 translate-x-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-6 h-6 text-gray-900" />
              <h2 className="text-xl font-light tracking-wide text-gray-900">
                Votre Panier
              </h2>
              {itemCount > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {itemCount} article{itemCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {itemCount === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Votre panier est vide</p>
                <button
                  onClick={handleClose}
                  className="text-sm text-black underline hover:text-gray-700"
                >
                  Continuer vos achats
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex space-x-4 group">
                    <div className="w-24 h-24 bg-stone-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-light text-gray-900 group-hover:text-rose-600 transition-colors">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {item.shade && (
                        <p className="text-xs text-gray-500 mt-1">Teinte: {item.shade}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-light w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <p className="text-sm font-light text-gray-900">
                          {item.price * item.quantity} FCFA
                        </p>
                      </div>
                      
                      {item.stock <= 5 && (
                        <p className="text-xs text-amber-600 mt-2">
                          Plus que {item.stock} disponible{item.stock > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {itemCount > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-light">{subtotal} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-light text-green-600 flex items-center gap-1">
                    Tarif flexible selon votre zone - Nous consulter
                  </span>
                </div>
                <div className="flex justify-between text-lg pt-4 border-t border-gray-200">
                  <span className="font-light">Total</span>
                  <span className="font-light">{total} FCFA</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 hover:bg-gray-900 transition-all duration-300 group"
              >
                <span className="text-sm font-light tracking-widest uppercase flex items-center justify-center space-x-2">
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Passer la commande</span>
                </span>
              </button>
              
              <button
                onClick={handleClose}
                className="w-full border border-gray-300 text-gray-700 py-4 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <span className="text-sm font-light tracking-wider">
                  Continuer mes achats
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}