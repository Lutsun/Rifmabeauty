const API_URL = ''

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
      console.log('Fetching products from:', API_URL);
      
      let url = `${API_URL}/api/products`;
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
      
      console.log('Full URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('API response:', data);
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`);
      
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
      const response = await fetch(`${API_URL}/api/categories`);
      
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
      const response = await fetch(`${API_URL}/api/products/search/${query}`);
      
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