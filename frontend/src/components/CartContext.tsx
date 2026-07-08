import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../services/apiService';

interface CartItem extends Product {
  quantity: number;
  // Propriétés pour suivre la promotion appliquée
  appliedPromotion?: {
    type: 'quantity' | 'percentage' | 'flash' | null;
    originalPrice?: number;
    discountPercent?: number;
    promotionMessage?: string;
    // Prix promo spécifique pour les offres quantité
    promotionalPrice?: number;
    // Type d'offre quantité (2=10000 ou 3=15000)
    quantityOfferType?: '2for10000' | '3for15000';
  };
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
  getItemPrice: (item: CartItem) => number;
  getItemUnitPrice: (item: CartItem) => string;
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
  const shippingFee = 0;

  useEffect(() => {
    localStorage.setItem('rifma_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (shippingAddress) {
      localStorage.setItem('rifma_shipping_address', JSON.stringify(shippingAddress));
    }
  }, [shippingAddress]);

  const isPromotionValid = (product: Product) => {
    if (!product.promotion_end_date) return true;
    const now = new Date();
    const endDate = new Date(product.promotion_end_date);
    return now <= endDate;
  };

  // Fonction: Calcul du prix avec promotion
  const getItemPrice = (item: CartItem): number => {
    // Promotion pourcentage (le prix est déjà réduit dans item.price)
    if (item.appliedPromotion?.type === 'percentage') {
      return item.price * item.quantity;
    }

    // Pas de promotion
    return item.price * item.quantity;
  };

  // Fonction: Pour afficher le prix unitaire avec le contexte de la promo
  const getItemUnitPrice = (item: CartItem): string => {
    if (item.appliedPromotion?.type === 'percentage') {
      return `${item.price.toLocaleString()} FCFA/un (promo)`;
    }
    
    return `${item.price.toLocaleString()} FCFA/un`;
  };

  // Fonction: Récupérer les infos de promotion
  const getProductPromotionInfo = (product: Product) => {
    if (!isPromotionValid(product)) return null;

    // Promotion pourcentage
    if (product.discount_percent && product.discount_percent > 0) {
      return {
        type: 'percentage' as const,
        message: product.promotion_message || `-${product.discount_percent}%`,
        originalPrice: product.original_price || product.price,
        discountPercent: product.discount_percent,
        promotionMessage: product.promotion_message
      };
    }

    // Prix barré simple
    if (product.original_price && product.original_price > product.price) {
      const discountValue = Math.round((1 - product.price / product.original_price) * 100);
      return {
        type: 'percentage' as const,
        message: product.promotion_message || `-${discountValue}%`,
        originalPrice: product.original_price,
        discountPercent: discountValue,
        promotionMessage: product.promotion_message
      };
    }

    return null;
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      // Récupérer les infos de promotion
      const promotionInfo = getProductPromotionInfo(product);
      
      const cartItem: CartItem = {
        ...product,
        quantity,
        appliedPromotion: promotionInfo ? {
          type: promotionInfo.type,
          originalPrice: promotionInfo.originalPrice,
          discountPercent: promotionInfo.discountPercent,
          promotionMessage: promotionInfo.message,
          promotionalPrice: undefined
        } : undefined
      };
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          alert(`Stock limité! Il ne reste que ${product.stock} unité(s) disponible(s).`);
          return prevItems;
        }
        
        return prevItems.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: newQuantity,
                appliedPromotion: promotionInfo ? {
                  type: promotionInfo.type,
                  originalPrice: promotionInfo.originalPrice,
                  discountPercent: promotionInfo.discountPercent,
                  promotionMessage: promotionInfo.message,
                  promotionalPrice: undefined
                } : undefined
              }
            : item
        );
      } else {
        if (quantity > product.stock) {
          alert(`Stock insuffisant! Il ne reste que ${product.stock} unité(s) disponible(s).`);
          return prevItems;
        }
        return [...prevItems, cartItem];
      }
    });
    setIsCartOpen(true);
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

      if (quantity > itemToUpdate.stock) {
        alert(`Stock limité! Maximum ${itemToUpdate.stock} unité(s) disponible(s).`);
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: itemToUpdate.stock }
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
    return items.reduce((total, item) => total + getItemPrice(item), 0);
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
    getItemPrice,
    getItemUnitPrice,
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