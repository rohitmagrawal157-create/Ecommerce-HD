// src/api/product.api.ts
import { apiClient } from './client';

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

export interface ProductVariant {
  variantId: number;
  sizes: string[];
  colors: string[];
  stock: number;
}

export interface ProductDetails {
  id: number;
  name: string;
  tag?: string;
  description?: string;
  details?: string;
  features?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  date?: string;
  category?: { id: number; name: string };
  images: string[];
  variants: ProductVariant[];
}

function formatINR(value: unknown): string {
  if (value === null || value === undefined || value === '') return '₹0';
  const num = typeof value === 'number'
    ? value
    : parseFloat(String(value).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(num) || num <= 0) return '₹0';
  return '₹' + num.toLocaleString('en-IN');
}

function toNumber(value: unknown): number {
  const num = typeof value === 'number'
    ? value
    : parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

function normalizeImageUrl(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  let s = String(raw);
  s = s.replace(/\\/g, '');
  s = s.trim().replace(/^"|"$/g, '');
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/\//.test(s)) return window.location.protocol + s;
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
  if (apiBase && apiBase.trim()) return apiBase.replace(/\/$/, '') + '/' + s.replace(/^\//, '');
  return window.location.origin.replace(/\/$/, '') + '/' + s.replace(/^\//, '');
}

// Helper to safely parse API response (supports direct array or { data: [...] })
async function fetchApiProducts(): Promise<Product[]> {
  // Prefer real API route used elsewhere in the app.
  // Fallback to legacy '/products' if a backend is serving that.
  let payload: unknown;
  try {
    const res = await apiClient.get<unknown>('/api/products');
    payload = res.data;
  } catch {
    const res = await apiClient.get<unknown>('/products');
    payload = res.data;
  }

  let products: any[] = [];
  if (Array.isArray(payload)) products = payload as any[];
  else if (payload && typeof payload === 'object') {
    const p = payload as any;
    if (Array.isArray(p.data)) products = p.data;
    else if (p.data && typeof p.data === 'object' && Array.isArray(p.data.data)) products = p.data.data;
  }

  // Map API fields to our Product interface (supports both old + new keys)
  return products.map((p: any) => {
    const id = Number(p.id ?? p.product_id);
    const priceRaw = p.product_price ?? p.price;
    const originalRaw = p.original_price ?? p.compare_price ?? p.originalPrice;

    // Try several common image fields, including arrays and nested media
    let rawImage: unknown = p.image ?? p.image_url ?? p.product_image ?? p.imageUrl ?? p.thumbnail ?? p.thumb;
    if ((!rawImage || String(rawImage).trim() === '') && Array.isArray(p.images) && p.images.length > 0) rawImage = p.images[0];
    if ((!rawImage || String(rawImage).trim() === '') && Array.isArray(p.media) && p.media.length > 0) rawImage = p.media[0]?.url ?? p.media[0];

    const img = normalizeImageUrl(rawImage ?? '');

    return {
      id,
      name: String(p.name ?? p.title ?? p.product_name ?? ''),
      price: formatINR(priceRaw),
      image: img,
      tag: String(p.tag_name ?? p.tag ?? p.category?.name ?? ''),
      rating: p.rating ?? 4,
      originalPrice: originalRaw !== undefined && originalRaw !== null ? formatINR(originalRaw) : undefined,
      discount: p.discount ?? undefined,
      color: p.color ?? undefined,
    } as Product;
  });
}

type ApiProductDetailsResp = {
  status?: boolean;
  data?: {
    product_id: number;
    name: string;
    tag_name?: string | null;
    description?: string | null;
    details?: string | null;
    features?: string | null;
    price?: string | number | null;
    original_price?: string | number | null;
    discount_percentage?: number | string | null;
    date?: string | null;
    category?: { id: number; name: string } | null;
    images?: Array<string | null> | null;
    variants?: Array<{
      variant_id: number;
      size?: string | null;
      color?: string | null;
      stock?: string | number | null;
    }> | null;
  };
};

export async function getProductDetailsById(id: number): Promise<ProductDetails | null> {
  if (!Number.isFinite(id) || id <= 0) return null;

  try {
    const res = await apiClient.get<ApiProductDetailsResp>(`/api/products/${id}/details`);
    const payload = res.data;
    const d = payload?.data;
    if (!d) return null;

    const images = (d.images ?? []).filter(Boolean).map((i: any) => normalizeImageUrl(i));
    const variants: ProductVariant[] = (d.variants ?? []).map((v) => ({
      variantId: Number(v.variant_id),
      sizes: String(v.size ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      colors: String(v.color ?? '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      stock: Math.max(0, Math.trunc(toNumber(v.stock))),
    }));

    const price = toNumber(d.price);
    const originalPrice = d.original_price !== null && d.original_price !== undefined
      ? toNumber(d.original_price)
      : undefined;
    const discountPercentage = d.discount_percentage !== null && d.discount_percentage !== undefined && d.discount_percentage !== ''
      ? toNumber(d.discount_percentage)
      : undefined;

    return {
      id: Number(d.product_id),
      name: String(d.name ?? ''),
      tag: d.tag_name ?? undefined,
      description: d.description ?? undefined,
      details: d.details ?? undefined,
      features: d.features ?? undefined,
      price,
      originalPrice,
      discountPercentage,
      date: d.date ?? undefined,
      category: d.category ?? undefined,
      images,
      variants,
    };
  } catch (err) {
    console.error(`[product.api] Failed to fetch product details for ${id}`, err);
    return null;
  }
}

// Main product fetcher with fallback to local data
export async function getProducts(): Promise<Product[]> {
  try {
    const apiProducts = await fetchApiProducts();
    return apiProducts
  } catch (err) {
    console.error('[product.api] Failed to fetch from API', err);
    return []
  }
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

  // No local fallbacks — only API-backed lookup allowed
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