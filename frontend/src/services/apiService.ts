// CORRECTION : Ne pas mettre /api à la fin de l'URL de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Product {
  id: string;
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
}

export const apiService = {
  async getAllProducts(category?: string, featured?: boolean): Promise<Product[]> {
    try {
      console.log('🌍 Environnement:', import.meta.env.MODE);
      console.log('📡 URL de base:', API_BASE_URL);
      
      // CORRECT : ${API_BASE_URL}/api/products (pas /api/api/products)
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
        return data.data || [];
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
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
        return data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};