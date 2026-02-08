import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../services/apiService';

interface CartItem extends Product {
  quantity: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
  additionalInfo?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  shippingFee: number;
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('rifma_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(() => {
    const savedAddress = localStorage.getItem('rifma_shipping_address');
    return savedAddress ? JSON.parse(savedAddress) : null;
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const shippingFee = 0; // Livraison gratuite ou calculée plus tard

  // Sauvegarder le panier dans localStorage
  useEffect(() => {
    localStorage.setItem('rifma_cart', JSON.stringify(items));
  }, [items]);

  // Sauvegarder l'adresse dans localStorage
  useEffect(() => {
    if (shippingAddress) {
      localStorage.setItem('rifma_shipping_address', JSON.stringify(shippingAddress));
    }
  }, [shippingAddress]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Vérifier le stock disponible
        if (existingItem.quantity + quantity > product.stock) {
          alert(`Stock limité! Il ne reste que ${product.stock} unité(s) disponible(s).`);
          return prevItems;
        }
        
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Vérifier le stock disponible
        if (quantity > product.stock) {
          alert(`Stock insuffisant! Il ne reste que ${product.stock} unité(s) disponible(s).`);
          return prevItems;
        }
        
        return [...prevItems, { ...product, quantity }];
      }
    });
    setIsCartOpen(true); // Ouvrir le panier après ajout
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item.id === productId);
      if (!itemToUpdate) return prevItems;

      // Trouver le produit original pour vérifier le stock
      const originalProduct = items.find(item => item.id === productId);
      if (originalProduct && quantity > originalProduct.stock) {
        alert(`Stock limité! Maximum ${originalProduct.stock} unité(s) disponible(s).`);
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: originalProduct.stock }
            : item
        );
      }

      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    shippingFee,
    shippingAddress,
    setShippingAddress,
    isCartOpen,
    setIsCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}