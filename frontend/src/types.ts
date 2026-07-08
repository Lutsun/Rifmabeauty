export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  shade?: string;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
