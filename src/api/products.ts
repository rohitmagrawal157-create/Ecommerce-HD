import { apiClient } from './client';
import { productList } from '../data/data';
import { CATEGORIES } from '../data/categoryData';

export interface Product {
  color: string;
  id: number;
  image: string;
  tag: string;
  price: string;
  name: string;
}

async function getProductsFromApi(): Promise<Product[]> {
  const res = await apiClient.get<unknown>('/products');
  const payload = res.data;
  return Array.isArray(payload) ? (payload as Product[]) : [];
}

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await getProductsFromApi();
    if (products.length) return products;
  } catch {
    // fall back to the current mock data if API isn't running yet
  }

  return productList as unknown as Product[];
}

export async function getProductById(id: number): Promise<Product | null> {
  if (!Number.isFinite(id)) return null;

  try {
    const products = await getProductsFromApi();
    const match = products.find((p) => p.id === id);
    if (match) return match;
  } catch {
    // fall back below
  }

  const fallback = (productList as unknown as Product[]).find((p) => p.id === id);
  if (fallback) return fallback;

  // Search category products as a final fallback (category items use different dataset)
  for (const key of Object.keys(CATEGORIES)) {
    const cat = CATEGORIES[key as keyof typeof CATEGORIES];
    if (!cat?.products) continue;
    const found = cat.products.find((p: any) => p.id === id);
    if (found) {
      // Map CategoryProduct shape to Product where possible
      return {
        id: found.id,
        name: found.name,
        price: found.price,
        image: found.image,
        tag: found.tag ?? found.badge ?? '',
        color: '',
      } as Product;
    }
  }

  return null;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return getProducts();

  const products = await getProducts();
  return products.filter((p) => p.name.toLowerCase().includes(q) || (p.tag ?? '').toLowerCase().includes(q));
}

