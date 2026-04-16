// src/api/product.api.ts
import { apiClient } from './client';
import { productList } from '../data/data';
import { CATEGORIES } from '../data/categoryData';

export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  tag: string;
  rating?: number;
  originalPrice?: string;
  discount?: number;
  color?: string;
}

// Helper to safely parse API response (supports direct array or { data: [...] })
async function fetchApiProducts(): Promise<Product[]> {
  const res = await apiClient.get<unknown>('/products');
  const payload = res.data;
  let products: any[] = [];
  if (Array.isArray(payload)) products = payload;
  else if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
    products = (payload as any).data;
  }
  // Map API fields to our Product interface (adjust field names if needed)
  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price || '$0',
    image: p.image || p.image_url || '',
    tag: p.tag || p.category?.name || '',
    rating: p.rating ?? 4,
    originalPrice: p.originalPrice || p.compare_price,
    discount: p.discount,
    color: p.color,
  }));
}

// Main product fetcher with fallback to local data
export async function getProducts(): Promise<Product[]> {
  try {
    const apiProducts = await fetchApiProducts();
    if (apiProducts.length) return apiProducts;
  } catch (err) {
    console.error('[product.api] Failed to fetch from API, using local fallback', err);
  }
  // Fallback: local productList
  return productList as unknown as Product[];
}

// Get single product by ID
export async function getProductById(id: number): Promise<Product | null> {
  if (!Number.isFinite(id) || id <= 0) return null;

  // 1. Try API
  try {
    const all = await fetchApiProducts();
    const found = all.find(p => p.id === id);
    if (found) return found;
  } catch (err) {
    console.error(`[product.api] API fetch for product ${id} failed`, err);
  }

  // 2. Try productList (local mock)
  const fromProductList = (productList as unknown as Product[]).find(p => p.id === id);
  if (fromProductList) return fromProductList;

  // 3. Try CATEGORIES products (final fallback)
  for (const key of Object.keys(CATEGORIES)) {
    const cat = CATEGORIES[key as keyof typeof CATEGORIES];
    if (!cat?.products) continue;
    const found = cat.products.find((p: any) => p.id === id);
    if (found) {
      // Provide safe defaults for missing fields
      return {
        id: found.id,
        name: found.name,
        price: found.price || '$0',
        image: found.image || '',
        tag: found.tag || found.badge || '',
        rating: found.rating ?? 4,
        // originalPrice: found.originalPrice || '',
        // discount: found.discount || 0,
        // color: found.color || '',
      };
    }
  }

  return null;
}

// Search products by name or tag
export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return getProducts();

  const products = await getProducts();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.tag && p.tag.toLowerCase().includes(q))
  );
}