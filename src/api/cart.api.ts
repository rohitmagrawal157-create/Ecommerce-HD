import { apiClient } from './client';
import { getProductDetailsById, type Product } from './products';
import { productList } from '../data/data';
import { CATEGORIES } from '../data/categoryData'

export interface CartLine {
  /** Server cart line id (cart_id). For local fallback carts, this equals productId. */
  id: number;
  product: Product;
  quantity: number;
  variantId?: number;
  image?: string; 
}

export interface CartState {
  lines: CartLine[];
}

const STORAGE_KEY = 'cart_items_v1';

const SESSION_ID_STORAGE_KEY = 'session_id';
const SESSION_HEADER = 'session-id';

export function setCartSessionId(sessionId: string): void {
  const sid = String(sessionId ?? '').trim();
  if (!sid) return;
  window.localStorage.setItem(SESSION_ID_STORAGE_KEY, sid);
  // Also set the header key for compatibility with earlier builds.
  window.localStorage.setItem(SESSION_HEADER, sid);
}

function getOrCreateSessionId(): string {
  const fromStorage = window.localStorage.getItem(SESSION_ID_STORAGE_KEY)
    || window.localStorage.getItem(SESSION_HEADER);
  if (fromStorage && fromStorage.trim()) return fromStorage.trim();

  const envSid = (import.meta as any)?.env?.VITE_CART_SESSION_ID as string | undefined;
  if (envSid && envSid.trim()) return envSid.trim();

  // Default to a stable dev session id so API is easy to test.
  const sid = ((import.meta as any)?.env?.DEV ? 'test111' : `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`);
  setCartSessionId(sid);
  return sid;
}

function cartHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
    [SESSION_HEADER]: getOrCreateSessionId(),
  };
}

function toNumber(value: unknown): number {
  const num = typeof value === 'number'
    ? value
    : parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

function formatINR(value: unknown): string {
  const n = toNumber(value);
  if (n <= 0) return '₹0';
  return '₹' + n.toLocaleString('en-IN');
}

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
    // Local fallback line id = product id
    lines.push({ id, product, quantity: Math.floor(qty) });
  }

  return { lines };
}

type ApiCartItem = {
  cart_id: number;
  quantity: number | string;
  price?: number | string | null;
  status?: string | null;
  product?: {
    product_id: number;
    name?: string | null;
  } | null;
  variant?: {
    variant_id: number;
    size?: string | null;
    color?: string | null;
    stock?: number | string | null;
  } | null;
};

type ApiCartResp = {
  status?: boolean;
  data?: ApiCartItem[];
  message?: string;
};

function normaliseApiCartItem(item: ApiCartItem): CartLine | null {
  const cartId = Number(item?.cart_id);
  const productId = Number(item?.product?.product_id);
  const quantity = Math.max(1, Math.floor(toNumber(item?.quantity)));
  if (!Number.isFinite(cartId) || cartId <= 0) return null;
  if (!Number.isFinite(productId) || productId <= 0) return null;

  const fallback = productById(productId);
  const product: Product = fallback
    ? { ...fallback, id: productId }
    : {
        id: productId,
        name: String(item?.product?.name ?? `Product #${productId}`),
        price: '₹0',
        image: '',
        tag: '',
        rating: 4,
      };

  if (item?.product?.name) product.name = String(item.product.name);
  if (item?.price !== null && item?.price !== undefined) product.price = formatINR(item.price);

  // Populate image from API when available (support common field names),
  // otherwise keep fallback image from local product data.
  const apiImage = (item as any)?.product?.image
    ?? (item as any)?.product?.image_url
    ?? (item as any)?.product?.product_image
    ?? (item as any)?.product?.imageUrl
    ?? (item as any)?.variant?.image;
  if (apiImage) {
    product.image = String(apiImage);
  }

  const variantId = item?.variant?.variant_id;
  return {
    id: cartId,
    product,
    quantity,
    variantId: Number.isFinite(Number(variantId)) ? Number(variantId) : undefined,
  };
}

function normalizeImageUrl(raw: unknown): string | null {
  if (!raw && raw !== 0) return null;
  let s = String(raw);
  // Remove escaped backslashes leftover from double-encoding
  s = s.replace(/\\/g, '');
  // Trim whitespace and surrounding quotes
  s = s.trim().replace(/^"|"$/g, '');
  if (!s) return null;
  // If already absolute URL, return as-is
  if (/^https?:\/\//i.test(s)) return s;
  // If it's a protocol-relative URL
  if (/^\/\//.test(s)) return window.location.protocol + s;
  // If relative path, prefix with API base if configured, else origin
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
  if (apiBase && apiBase.trim()) {
    return apiBase.replace(/\/$/, '') + '/' + s.replace(/^\//, '');
  }
  return window.location.origin.replace(/\/$/, '') + '/' + s.replace(/^\//, '');
}

export async function getCart(): Promise<CartState> {
  try {
    const res = await apiClient.get<ApiCartResp>('/api/cart', { headers: cartHeaders() } as any);
    const rows = Array.isArray(res.data?.data) ? res.data.data : [];
    const lines = rows.map(normaliseApiCartItem).filter(Boolean) as CartLine[];

    // If API returns empty but local storage has items (old guest cart), show local so user doesn't lose cart.
    if (lines.length === 0) {
      const stored = buildCartFromStorage();
      if (stored.lines.length > 0) return stored;
    }

    return { lines };
  } catch {
    // ignore and fall back to local
  }

  return buildCartFromStorage();
}

// Flexible addToCart API:
// - addToCart(product: Product) -> adds 1
// - addToCart(productId: number, quantity?: number) -> adds specified quantity
export async function addToCart(
  productOrId: number | { id: number },
  quantity = 1,
  variantId?: number,
): Promise<CartState> {
  const productId = typeof productOrId === 'number' ? productOrId : productOrId.id;
  const qty = Math.max(1, Math.floor(quantity));

  // Resolve a usable variant id when caller doesn't have it.
  let resolvedVariantId = Number.isFinite(Number(variantId)) ? Number(variantId) : 0;
  if (!resolvedVariantId) {
    const details = await getProductDetailsById(productId);
    const first = details?.variants?.[0]?.variantId;
    resolvedVariantId = Number.isFinite(Number(first)) ? Number(first) : 0;
  }

  // Prefer server cart (session-based). If it fails, fall back to local storage.
  try {
    if (!resolvedVariantId) throw new Error('Variant not found');
    await apiClient.post(
      '/api/cart',
      { product_id: productId, variant_id: resolvedVariantId, quantity: qty },
      { headers: { ...cartHeaders(), 'Content-Type': 'application/json' } } as any,
    );
    const next = await getCart();
    notifyCartChanged();
    return next;
  } catch {
    const map = storageRead();
    map[String(productId)] = (map[String(productId)] ?? 0) + qty;
    storageWrite(map);
    const next = buildCartFromStorage();
    notifyCartChanged();
    return next;
  }
}

export async function updateCartItem(cartLineId: number, quantity: number): Promise<CartState> {
  const qty = Math.max(1, Math.floor(quantity));

  try {
    // Backend expects PUT /api/cart/:cart_id with JSON body: { quantity }
    await apiClient.put(
      `/api/cart/${cartLineId}`,
      { quantity: qty },
      { headers: { ...cartHeaders(), 'Content-Type': 'application/json' } } as any,
    );
    const next = await getCart();
    notifyCartChanged();
    return next;
  } catch {
    // Some backends accept PATCH instead of PUT; try it before local fallback.
    try {
      await apiClient.patch(
        `/api/cart/${cartLineId}`,
        { quantity: qty },
        { headers: { ...cartHeaders(), 'Content-Type': 'application/json' } } as any,
      );
      const next = await getCart();
      notifyCartChanged();
      return next;
    } catch {
      // local fallback: treat cartLineId as productId
      const map = storageRead();
      map[String(cartLineId)] = qty;
      storageWrite(map);
      const next = buildCartFromStorage();
      notifyCartChanged();
      return next;
    }
  }
}

export async function removeFromCartItem(cartLineId: number): Promise<CartState> {
  try {
    await apiClient.delete(`/api/cart/${cartLineId}`, { headers: cartHeaders() } as any);
    const next = await getCart();
    notifyCartChanged();
    return next;
  } catch {
    // local fallback: treat cartLineId as productId
    const map = storageRead();
    delete map[String(cartLineId)];
    storageWrite(map);
    const next = buildCartFromStorage();
    notifyCartChanged();
    return next;
  }
}

// Backwards/consumer-friendly name required by the project
export { removeFromCartItem as removeFromCart }

export async function clearCart(): Promise<CartState> {
  storageWrite({});

  // Best-effort server clear (no bulk endpoint confirmed).
  try {
    const current = await getCart();
    await Promise.all(
      current.lines
        .filter((l) => Number.isFinite(l.id) && l.id > 0)
        .map((l) => apiClient.delete(`/api/cart/${l.id}`, { headers: cartHeaders() } as any)),
    );
  } catch {
    // ignore
  }

  notifyCartChanged();
  return { lines: [] };
}

// --- Checkout helper: fetch server-side checkout summary (session + auth aware)
export type CheckoutItem = {
  product_id: number;
  name: string;
  image?: string | null;
  price: number | string;
  quantity: number;
  total?: number | string;
  cart_id?: number;
};

export async function getCheckout(): Promise<{ lines: CartLine[]; cart_total: number }> {
  try {
    const token = window.localStorage.getItem('access_token');
    const headers: Record<string, string> = { ...cartHeaders() };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await apiClient.get<any>('/api/checkout', { headers } as any);
    const payload = res.data;

    // Determine items array in several common shapes (support legacy and variants)
    let items: any[] = [];
    if (Array.isArray(payload?.data)) items = payload.data;
    else if (Array.isArray(payload?.data?.items)) items = payload.data.items;
    else if (Array.isArray(payload?.items)) items = payload.items;
    else if (Array.isArray(payload?.cart_items)) items = payload.cart_items; // some APIs use cart_items

    const lines = (items || []).map((it: any) => {
      const prodObj = it?.product ?? {};
      const productId = Number(prodObj?.product_id ?? it?.product_id ?? prodObj?.id ?? it?.id);
      const cartId = Number(it?.cart_id ?? 0) || 0;
      const qty = Math.max(1, Math.floor(toNumber(it?.quantity ?? it?.qty ?? 1)));
      const priceVal = it?.price ?? it?.selling_price ?? prodObj?.price ?? 0;

      // Start from local fallback when available, but ALWAYS override with API product fields when present
      const fallback = productById(productId);
      const product: any = fallback ? { ...fallback, id: productId } : { id: productId, name: `Product #${productId}`, price: '₹0', image: '', tag: '', rating: 4 };

      // Prefer API-provided product fields
      if (prodObj?.name) product.name = String(prodObj.name);
      else if (it?.name) product.name = String(it.name);

      if (priceVal !== null && priceVal !== undefined) product.price = formatINR(priceVal);

      const apiImage = prodObj?.image ?? it?.image ?? prodObj?.image_url ?? prodObj?.product_image ?? it?.product_image ?? it?.imageUrl ?? it?.variant?.image;
      const normalized = normalizeImageUrl(apiImage);
      if (normalized) product.image = normalized;

      return {
        id: Number.isFinite(cartId) && cartId > 0 ? cartId : productId,
        product,
        quantity: qty,
        variantId: Number(it?.variant_id ?? it?.variant?.variant_id) || undefined,
      } as CartLine;
    }) as CartLine[];

    // cart_total may appear in different places
    const cart_total = toNumber(
      payload?.data?.cart_total ?? payload?.cart_total ?? payload?.data?.total ?? payload?.total ?? payload?.total_amount ?? payload?.totalAmount ?? items.reduce((s: number, it: any) => s + toNumber(it?.total ?? (it?.price ?? 0) * (it?.quantity ?? it?.qty ?? 1)), 0)
    );

    // If server returned no items but local storage has items, fall back to local cart
    if (lines.length === 0) {
      const stored = buildCartFromStorage();
      if (stored.lines.length > 0) return { lines: stored.lines, cart_total: 0 };
    }

    return { lines, cart_total };
  } catch (err) {
    // On error, return local fallback
    const stored = buildCartFromStorage();
    const total = stored.lines.reduce((s, l) => s + toNumber(l.product.price) * l.quantity, 0);
    return { lines: stored.lines, cart_total: total };
  }
}

