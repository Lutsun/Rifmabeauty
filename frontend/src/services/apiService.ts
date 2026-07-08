const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

export interface Product {
  id: string;
  productId?: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  shade?: string;
  featured: boolean;
  stock: number;
  inStock: boolean;
  detailImage?: string;
  
  // NOUVEAU : Collection du produit (Khairyatou, Koursoumel, Our Regulars)
  collection?: string;
  
  // Propriétés de promotion (100% dynamiques)
  discount_percent?: number;
  original_price?: number;
  promotion_type?: 'percentage' | 'flash' | 'quantity' | null;
  promotion_message?: string;
  promotion_end_date?: string;
}

export const apiService = {
  async getAllProducts(category?: string, featured?: boolean): Promise<Product[]> {
    try {
      console.log('🌍 Environnement:', import.meta.env.MODE);
      console.log('📡 URL de base:', API_BASE_URL);
      
      let url = `${API_BASE_URL}/api/products`;
      const params = new URLSearchParams();
      
      if (category && category !== 'all') {
        params.append('category', category);
      }
      
      if (featured) {
        params.append('featured', 'true');
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log('🔗 URL complète:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: Impossible de charger les produits`);
      }
      
      const data = await response.json();
      
      console.log('✅ Réponse API:', data);
      
      if (data.success) {
        console.log(`📦 ${data.data?.length || 0} produits récupérés`);
        return data.data.map((p: any) => ({
          id: p.id,
          productId: p.productId,
          name: p.name,
          category: p.category,
          price: p.price,
          image: p.image_url || p.image,
          description: p.description,
          shade: p.shade,
          featured: p.featured,
          stock: p.stock,
          inStock: p.in_stock !== undefined ? p.in_stock : p.stock > 0,
          detailImage: p.detail_image_url || p.detailImage,
          
          // NOUVEAU : Collection du produit
          collection: p.collection,
          
          // Propriétés de promotion (directement depuis la DB)
          discount_percent: p.discount_percent,
          original_price: p.original_price,
          promotion_type: p.promotion_type,
          promotion_message: p.promotion_message,
          promotion_end_date: p.promotion_end_date
        })) || [];
      } else {
        throw new Error(data.message || 'Échec de récupération des produits');
      }
    } catch (error) {
      console.error('🔥 Erreur fetch produits:', error);
      throw error;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        console.error('❌ Erreur détaillée:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const p = data.data;
        return {
          id: p.id,
          productId: p.productId,
          name: p.name,
          category: p.category,
          price: p.price,
          image: p.image_url || p.image,
          description: p.description,
          shade: p.shade,
          featured: p.featured,
          stock: p.stock,
          inStock: p.in_stock !== undefined ? p.in_stock : p.stock > 0,
          detailImage: p.detail_image_url || p.detailImage,
          
          // NOUVEAU : Collection du produit
          collection: p.collection,
          
          // Propriétés de promotion
          discount_percent: p.discount_percent,
          original_price: p.original_price,
          promotion_type: p.promotion_type,
          promotion_message: p.promotion_message,
          promotion_end_date: p.promotion_end_date
        };
      } else {
        console.error('❌ API returned success: false:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/search/${query}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.data.map((p: any) => ({
          id: p.id,
          productId: p.productId,
          name: p.name,
          category: p.category,
          price: p.price,
          image: p.image_url || p.image,
          description: p.description,
          shade: p.shade,
          featured: p.featured,
          stock: p.stock,
          inStock: p.in_stock !== undefined ? p.in_stock : p.stock > 0,
          detailImage: p.detail_image_url || p.detailImage,
          
          // NOUVEAU : Collection du produit
          collection: p.collection,
          
          // Propriétés de promotion
          discount_percent: p.discount_percent,
          original_price: p.original_price,
          promotion_type: p.promotion_type,
          promotion_message: p.promotion_message,
          promotion_end_date: p.promotion_end_date
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};