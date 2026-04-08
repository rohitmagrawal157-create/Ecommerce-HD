import { apiClient } from './client';
import type { Product } from './products';
import { productList } from '../data/data';

export interface WishlistState {
  productIds: number[];
  products: Product[];
}

const STORAGE_KEY = 'wishlist_items_v1';

function notifyWishlistChanged(): void {
  window.dispatchEvent(new CustomEvent('wishlist:changed'));
}

function storageRead(): number[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

function storageWrite(ids: number[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function productById(id: number): Product | null {
  const fallback = (productList as unknown as Product[]).find((p) => p.id === id);
  return fallback ?? null;
}

export async function getWishlist(): Promise<WishlistState> {
  try {
    const res = await apiClient.get<unknown>('/wishlist');
    const data = res.data as any;

    const incomingIds: number[] | null = Array.isArray(data?.productIds)
      ? data.productIds.map((x: any) => Number(x)).filter((n: number) => Number.isFinite(n))
      : Array.isArray(data?.items)
        ? data.items.map((it: any) => Number(it?.productId ?? it?.id)).filter((n: number) => Number.isFinite(n))
        : null;

    if (incomingIds) {
      const products = incomingIds.map((id) => productById(id)).filter(Boolean) as Product[];
      return { productIds: incomingIds, products };
    }
  } catch {
    // ignore: fall back to storage
  }

  const ids = storageRead();
  const products = ids.map((id) => productById(id)).filter(Boolean) as Product[];
  return { productIds: ids, products };
}

export async function isWishlisted(productId: number): Promise<boolean> {
  const ids = storageRead();
  if (ids.includes(productId)) return true;
  try {
    const res = await apiClient.get<unknown>(`/wishlist/${productId}`);
    const data = res.data as any;
    if (typeof data?.wishlisted === 'boolean') return data.wishlisted;
  } catch {
    // ignore
  }
  return false;
}

export async function addToWishlist(productId: number): Promise<WishlistState> {
  const ids = storageRead();
  const next = Array.from(new Set([...ids, productId]));
  storageWrite(next);

  try {
    await apiClient.post('/wishlist/items', { productId });
  } catch {
    // ignore fallback
  }

  const products = next.map((id) => productById(id)).filter(Boolean) as Product[];
  notifyWishlistChanged();
  return { productIds: next, products };
}

export async function removeFromWishlist(productId: number): Promise<WishlistState> {
  const ids = storageRead();
  const next = ids.filter((id) => id !== productId);
  storageWrite(next);

  try {
    await apiClient.delete(`/wishlist/items/${productId}`);
  } catch {
    // ignore fallback
  }

  const products = next.map((id) => productById(id)).filter(Boolean) as Product[];
  notifyWishlistChanged();
  return { productIds: next, products };
}

export async function toggleWishlist(productId: number): Promise<WishlistState> {
  const wished = await isWishlisted(productId);
  return wished ? removeFromWishlist(productId) : addToWishlist(productId);
}

