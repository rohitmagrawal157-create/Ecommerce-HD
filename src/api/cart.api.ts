import { apiClient } from './client';
import type { Product } from './products';
import { productList } from '../data/data';
import { CATEGORIES } from '../data/categoryData'

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CartState {
  lines: CartLine[];
}

const STORAGE_KEY = 'cart_items_v1';

function notifyCartChanged(): void {
  // Use a plain Event so listeners don't need to rely on CustomEvent
  window.dispatchEvent(new Event('cart:changed'));
}

function storageRead(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function storageWrite(next: Record<string, number>): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function productById(id: number): Product | null {
  const fallback = (productList as unknown as Product[]).find((p) => p.id === id);
  if (fallback) return fallback

  // Also search category products for ids defined in `src/data/categoryData.ts`
  const categoryProducts = Object.values(CATEGORIES).flatMap((c) => c.products as unknown as Product[])
  const fromCategory = categoryProducts.find((p) => p.id === id)
  return fromCategory ?? null
}

function buildCartFromStorage(): CartState {
  const map = storageRead();
  const ids = Object.keys(map);
  const lines: CartLine[] = [];

  for (const idStr of ids) {
    const id = Number(idStr);
    const qty = map[idStr];
    if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0) continue;
    const product = productById(id);
    if (!product) continue;
    lines.push({ product, quantity: Math.floor(qty) });
  }

  return { lines };
}

export async function getCart(): Promise<CartState> {
  // If user is not authenticated prefer localStorage (guest cart).
  const hasToken = Boolean(window.localStorage.getItem('access_token'));
  if (!hasToken) return buildCartFromStorage();

  // For authenticated users, try backend but fall back to storage when needed.
  try {
    const res = await apiClient.get<unknown>('/cart');
    const data = res.data as any;

    const incomingLines = Array.isArray(data?.items) ? data.items : Array.isArray(data?.lines) ? data.lines : null;
    if (Array.isArray(incomingLines)) {
      // If backend returns an empty set but local storage has items, prefer local storage
      const stored = buildCartFromStorage();
      if (incomingLines.length === 0 && stored.lines.length > 0) return stored;

      const lines: CartLine[] = incomingLines
        .map((it: any) => {
          const productId = Number(it?.productId ?? it?.product?.id ?? it?.id);
          const quantity = Number(it?.quantity ?? 1);
          const product = productById(productId);
          if (!product) return null;
          if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity <= 0) return null;
          return { product, quantity: Math.floor(quantity) };
        })
        .filter(Boolean) as CartLine[];
      return { lines };
    }
  } catch {
    // ignore and fall back
  }

  return buildCartFromStorage();
}

// Flexible addToCart API:
// - addToCart(product: Product) -> adds 1
// - addToCart(productId: number, quantity?: number) -> adds specified quantity
export async function addToCart(productOrId: number | { id: number }, quantity = 1): Promise<CartState> {
  const productId = typeof productOrId === 'number' ? productOrId : productOrId.id
  const qty = Math.max(1, Math.floor(quantity))
  const map = storageRead()
  map[String(productId)] = (map[String(productId)] ?? 0) + qty
  storageWrite(map)

  try {
    await apiClient.post('/cart/items', { productId, quantity: qty })
  } catch {
    // ignore: localStorage fallback is already updated
  }

  const next = buildCartFromStorage()
  notifyCartChanged()
  return next
}

export async function updateCartItem(productId: number, quantity: number): Promise<CartState> {
  const qty = Math.max(1, Math.floor(quantity));
  const map = storageRead();
  map[String(productId)] = qty;
  storageWrite(map);

  try {
    await apiClient.patch(`/cart/items/${productId}`, { quantity: qty });
  } catch {
    // ignore: localStorage fallback is already updated
  }

  const next = buildCartFromStorage();
  notifyCartChanged();
  return next;
}

export async function removeFromCartItem(productId: number): Promise<CartState> {
  const map = storageRead()
  delete map[String(productId)]
  storageWrite(map)

  try {
    await apiClient.delete(`/cart/items/${productId}`)
  } catch {
    // ignore: localStorage fallback is already updated
  }

  const next = buildCartFromStorage()
  notifyCartChanged()
  return next
}

// Backwards/consumer-friendly name required by the project
export { removeFromCartItem as removeFromCart }

export async function clearCart(): Promise<CartState> {
  storageWrite({});

  try {
    await apiClient.delete('/cart/items');
  } catch {
    // ignore
  }

  notifyCartChanged();
  return { lines: [] };
}

