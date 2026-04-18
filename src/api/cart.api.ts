// src/api/cart.api.ts
// ══════════════════════════════════════════════════════════════════════
//  FIXES vs previous version
//  FIX-1  Session header key: server expects "SessionId" (capital S+I)
//  FIX-2  normaliseApiCartItem: reads product.original_price for real MRP
//  FIX-3  Image URL already absolute from API — handled cleanly
//  FIX-4  getCart: keyed by cart_id, not product_id
//  FIX-5  addToCart: variant_id only sent when resolved
//  FIX-6  updateCartItem / removeFromCartItem: single clean path
//  FIX-7  clearCart: server deletes only, then local wipe
//  FIX-8  getCheckout: handles all API array shapes
//
//  GHOST CART FIXES (this revision):
//  FIX-9  NEVER use a hardcoded/shared session ID ('test1') — every
//         browser gets its own unique sid generated once and persisted.
//         The old 'test1' fallback caused ALL users to share one cart.
//  FIX-10 Auth-aware cart: when a Bearer token exists the server
//         identifies the user by token, NOT by SessionId.  Authenticated
//         requests send both so the server can merge the guest cart.
//  FIX-11 clearGuestSession(): wipes the session ID from localStorage
//         so a logged-out user starts with a clean empty guest cart,
//         not the previous user's leftovers.
//  FIX-12 getCart() returns empty immediately when neither a stored
//         session ID nor a token is present (brand-new visitor before
//         any session is written) — no ghost items flash.
// ══════════════════════════════════════════════════════════════════════

import { apiClient } from './client';
import axios from 'axios';
import { getProductDetailsById, type Product } from './products';
import { productList } from '../data/data';
import { CATEGORIES } from '../data/categoryData';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CartLine {
  /** Server cart_id. For local fallback lines this equals productId. */
  id: number;
  product: Product;
  quantity: number;
  variantId?: number;
  /** Parsed MRP (original_price) from the API — used by Cart UI. */
  originalPrice?: number;
  /** Variant details when present */
  variantMeta?: { size?: string; color?: string; stock?: number };
}

export interface CartState {
  lines: CartLine[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants / storage keys
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY            = 'cart_items_v1';
const SESSION_STORAGE_KEY    = 'SessionId';    // canonical — server reads this
const SESSION_STORAGE_LEGACY = 'session-id';   // kept for old builds

// ─────────────────────────────────────────────────────────────────────────────
// FIX-9 — Session ID helpers
//
// RULE: every browser/device gets exactly ONE unique session ID that is
// generated on first visit and persisted.  We NEVER fall back to a shared
// constant like 'test1' — that caused all users to share a single cart.
//
// Generation strategy:
//   crypto.randomUUID()  → best, available in all modern browsers + Node 19+
//   crypto.getRandomValues() fallback → works everywhere
// ─────────────────────────────────────────────────────────────────────────────

function generateUniqueSessionId(): string {
  try {
    // crypto.randomUUID is available in browsers (Chrome 92+, Firefox 95+, Safari 15.4+)
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return 'sid_' + crypto.randomUUID();
    }
    // Fallback: build a UUID-like string from random bytes
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    return (
      'sid_' +
      Array.from(buf)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    // Last resort: timestamp + Math.random (still unique per browser)
    return `sid_${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
  }
}

export function setCartSessionId(sessionId: string): void {
  const sid = String(sessionId ?? '').trim();
  if (!sid) return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, sid);
  window.localStorage.setItem(SESSION_STORAGE_LEGACY, sid);
}

/**
 * Rotate to a new session id and clear local-storage fallback cart.
 * Call on logout so the next guest starts with a fresh session/cart.
 */
export function rotateCartSession(): string {
  const sid = `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  setCartSessionId(sid);
  // clear local storage fallback cart for the new session
  storageWrite({});
  notifyCartChanged();
  return sid;
}

/**
 * FIX-11: Call this on logout to wipe the guest session so the next
 * visitor (or the same user after logout) gets a fresh empty cart.
 */
export function clearGuestSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_STORAGE_LEGACY);
  window.localStorage.removeItem(STORAGE_KEY);       // also clear local cart
}

function getOrCreateSessionId(): string {
  // 1. Use whatever is already stored (from a previous visit or login flow)
  const stored =
    window.localStorage.getItem(SESSION_STORAGE_KEY) ||
    window.localStorage.getItem(SESSION_STORAGE_LEGACY);
  if (stored?.trim()) return stored.trim();

  // 2. Honour an explicit env override (useful for integration tests only —
  //    never set VITE_CART_SESSION_ID in development or production).
  const envSid = (import.meta as any)?.env?.VITE_CART_SESSION_ID as string | undefined;
  if (envSid?.trim()) return envSid.trim();

  // FIX-9: Generate a new unique ID — NEVER fall back to 'test1' or any
  // shared constant.  Each browser gets its own cart.
  const sid = generateUniqueSessionId();
  setCartSessionId(sid);
  return sid;
}

/** Returns true when the user has a valid auth token stored. */
function isAuthenticated(): boolean {
  const token = window.localStorage.getItem('access_token');
  return Boolean(token?.trim());
}

/**
 * FIX-10 — Auth-aware headers.
 * Guest  → SessionId only (unique per browser, never shared)
 * Authed → Bearer token + SessionId so server can merge guest cart
 */
function cartHeaders(): Record<string, string> {
  const sid   = getOrCreateSessionId();
  const token = window.localStorage.getItem('access_token');

  const headers: Record<string, string> = {
    Accept:         'application/json',
    SessionId:      sid,
    'session-id':   sid,
    'x-session-id': sid,
  };

  if (token?.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  return headers;
}

// ─────────────────────────────────────────────────────────────────────────────
// Money helpers
// ─────────────────────────────────────────────────────────────────────────────

function toNumber(value: unknown): number {
  const n =
    typeof value === 'number'
      ? value
      : parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatINR(value: unknown): string {
  const n = toNumber(value);
  if (n <= 0) return '₹0';
  return '₹' + n.toLocaleString('en-IN');
}

// ─────────────────────────────────────────────────────────────────────────────
// Local cart (storage fallback)
// ─────────────────────────────────────────────────────────────────────────────

function notifyCartChanged(): void {
  window.dispatchEvent(new Event('cart:changed'));
}

function storageRead(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function storageWrite(next: Record<string, number>): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function productById(id: number): Product | null {
  const fromList = (productList as unknown as Product[]).find((p) => p.id === id);
  if (fromList) return fromList;
  const categoryProducts = Object.values(CATEGORIES).flatMap(
    (c) => c.products as unknown as Product[],
  );
  return categoryProducts.find((p) => p.id === id) ?? null;
}

function buildCartFromStorage(): CartState {
  const map = storageRead();
  const lines: CartLine[] = [];
  for (const [idStr, qty] of Object.entries(map)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0) continue;
    const product = productById(id);
    if (!product) continue;
    lines.push({ id, product, quantity: Math.floor(qty) });
  }
  return { lines };
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX-2 + FIX-3 — Normalise a single API cart row into CartLine
//
// Real API shape (confirmed from live GET /api/cart with SessionId: test1):
// {
//   cart_id:  71,
//   quantity: 1,
//   price:    "100.00",          ← selling price
//   product: {
//     product_id:          8,
//     name:                "Shadow Box Display Frame",
//     original_price:      "200.00",   ← MRP  (FIX-2: use this, not fake 1.4×)
//     discount_percentage: null,
//     image:               "https://...full-url..."   (FIX-3: already absolute)
//   },
//   variant: {
//     variant_id: 5,
//     size:       "S,M,L,XL,XXL",
//     color:      "BLACK,YELLOW,GREEN,ORANGE",
//     stock:      "20"
//   }
// }
// ─────────────────────────────────────────────────────────────────────────────

type ApiCartItem = {
  cart_id:  number;
  quantity: number | string;
  price?:   number | string | null;
  product?: {
    product_id:          number;
    name?:               string | null;
    original_price?:     number | string | null;  // FIX-2
    discount_percentage?:number | string | null;
    image?:              string | null;            // FIX-3
    image_url?:          string | null;
    product_image?:      string | null;
  } | null;
  variant?: {
    variant_id: number;
    size?:      string | null;
    color?:     string | null;
    stock?:     number | string | null;
  } | null;
};

function normalizeImageUrl(raw: unknown): string | null {
  if (!raw) return null;
  let s = String(raw).replace(/\\/g, '').trim().replace(/^"|"$/g, '');
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/\//.test(s)) return window.location.protocol + s;
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
  const base = apiBase?.trim()
    ? apiBase.replace(/\/$/, '')
    : window.location.origin.replace(/\/$/, '');
  return base + '/' + s.replace(/^\//, '');
}

function normaliseApiCartItem(item: ApiCartItem): CartLine | null {
  const cartId    = Number(item?.cart_id);
  const productId = Number(item?.product?.product_id);
  const quantity  = Math.max(1, Math.floor(toNumber(item?.quantity)));

  if (!Number.isFinite(cartId)    || cartId    <= 0) return null;
  if (!Number.isFinite(productId) || productId <= 0) return null;

  // FIX-2: use original_price from API as MRP, not a fabricated multiplier
  const sellingPrice  = toNumber(item?.price ?? 0);
  const originalPrice = toNumber(item?.product?.original_price ?? sellingPrice);

  // Build product object — prefer API fields, fall back to local data
  const fallback = productById(productId);
  const product: Product = fallback
    ? { ...fallback, id: productId }
    : {
        id:     productId,
        name:   String(item?.product?.name ?? `Product #${productId}`),
        price:  '₹0',
        image:  '',
        tag:    '',
        rating: 4,
      };

  if (item?.product?.name)   product.name  = String(item.product.name);
  if (sellingPrice > 0)      product.price = formatINR(sellingPrice);

  // FIX-3: image is already a full URL from the API
  const rawImage =
    item?.product?.image ??
    item?.product?.image_url ??
    item?.product?.product_image;
  const resolvedImage = normalizeImageUrl(rawImage);
  if (resolvedImage) product.image = resolvedImage;

  const variantId  = Number(item?.variant?.variant_id);
  const variantMeta = item?.variant
    ? {
        size:  item.variant.size  ?? undefined,
        color: item.variant.color ?? undefined,
        stock: toNumber(item.variant.stock),
      }
    : undefined;

  return {
    id:            cartId,
    product,
    quantity,
    originalPrice, // FIX-2: real MRP for Cart UI savings calc
    variantId:     Number.isFinite(variantId) && variantId > 0 ? variantId : undefined,
    variantMeta,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX-4 + FIX-12 — getCart
// ─────────────────────────────────────────────────────────────────────────────
// FIX-12: If this is a brand-new visitor (no session ID stored AND no auth
// token), we skip the API call entirely and return empty immediately.
// This prevents the server's global test/demo carts from leaking into a
// fresh browser session before the user has interacted at all.
// ─────────────────────────────────────────────────────────────────────────────

type ApiCartResp = { status?: boolean; data?: ApiCartItem[]; message?: string };

export async function getCart(): Promise<CartState> {
  // FIX-12: check whether this browser already has a session or auth token.
  // We look in storage WITHOUT calling getOrCreateSessionId() (which would
  // generate+save a new ID as a side effect — we want lazy generation).
  const hasStoredSession =
    Boolean(window.localStorage.getItem(SESSION_STORAGE_KEY)?.trim()) ||
    Boolean(window.localStorage.getItem(SESSION_STORAGE_LEGACY)?.trim());
  const hasAuthToken = isAuthenticated();

  // Brand-new visitor: no stored session, no token → definitely empty cart.
  // Return immediately — do NOT hit the server (would create a new session
  // using test/shared data on some backends).
  if (!hasStoredSession && !hasAuthToken) {
    return { lines: [] };
  }

  try {
    const res   = await apiClient.get<ApiCartResp>('/api/cart', {
      headers: cartHeaders(),
    } as any);

    const rows  = Array.isArray(res.data?.data) ? res.data.data : [];
    // FIX-4: key by cart_id — preserves multiple lines for same product
    const lines = rows
      .map(normaliseApiCartItem)
      .filter((l): l is CartLine => l !== null);

    // Only fall back to localStorage if API returned nothing AND we have
    // local items — don't pull ghost items from another user's session.
    if (lines.length === 0) {
      const stored = buildCartFromStorage();
      if (stored.lines.length > 0) return stored;
    }

    return { lines };
  } catch {
    // API error — use local storage as offline fallback only
    return buildCartFromStorage();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX-5 — addToCart
// ─────────────────────────────────────────────────────────────────────────────

export async function addToCart(
  productOrId: number | { id: number },
  quantity    = 1,
  variantId?: number,
): Promise<CartState> {
  const productId = typeof productOrId === 'number' ? productOrId : productOrId.id;
  const qty       = Math.max(1, Math.floor(quantity));

  // Resolve variant id when caller doesn't supply one
  let resolvedVariantId =
    Number.isFinite(Number(variantId)) && Number(variantId) > 0
      ? Number(variantId)
      : 0;

  if (!resolvedVariantId) {
    try {
      const details = await getProductDetailsById(productId);
      const first   = details?.variants?.[0]?.variantId;
      if (Number.isFinite(Number(first)) && Number(first) > 0)
        resolvedVariantId = Number(first);
    } catch {
      // ignore — proceed without variant_id
    }
  }

  try {
    const payload: Record<string, unknown> = { product_id: productId, quantity: qty };
    if (resolvedVariantId) payload.variant_id = resolvedVariantId;

    await apiClient.post('/api/cart', payload, {
      headers: { ...cartHeaders(), 'Content-Type': 'application/json' },
    } as any);

    const next = await getCart();
    notifyCartChanged();
    return next;
  } catch (e) {
    console.error('addToCart: server request failed, using local fallback', e);
    const map = storageRead();
    map[String(productId)] = (map[String(productId)] ?? 0) + qty;
    storageWrite(map);
    const next = buildCartFromStorage();
    notifyCartChanged();
    return next;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX-6 — updateCartItem: PUT first, PATCH fallback, then local
// ─────────────────────────────────────────────────────────────────────────────

export async function updateCartItem(
  cartLineId: number,
  quantity:   number,
): Promise<CartState> {
  const qty = Math.max(1, Math.floor(quantity));

  // Try PUT
  try {
    await apiClient.put(
      `/api/cart/${cartLineId}`,
      { quantity: qty },
      { headers: { ...cartHeaders(), 'Content-Type': 'application/json' } } as any,
    );
    const next = await getCart();
    notifyCartChanged();
    return next;
  } catch { /* fall through to PATCH */ }

  // Try PATCH
  try {
    await apiClient.patch(
      `/api/cart/${cartLineId}`,
      { quantity: qty },
      { headers: { ...cartHeaders(), 'Content-Type': 'application/json' } } as any,
    );
    const next = await getCart();
    notifyCartChanged();
    return next;
  } catch { /* fall through to local */ }

  // Local fallback (cartLineId === productId for storage-only carts)
  const map = storageRead();
  map[String(cartLineId)] = qty;
  storageWrite(map);
  const next = buildCartFromStorage();
  notifyCartChanged();
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX-6 — removeFromCartItem: DELETE, then local
// ─────────────────────────────────────────────────────────────────────────────

export async function removeFromCartItem(cartLineId: number): Promise<CartState> {
  try {
    await apiClient.delete(`/api/cart/${cartLineId}`, {
      headers: cartHeaders(),
    } as any);
    const next = await getCart();
    notifyCartChanged();
    return next;
  } catch {
    // local fallback
    const map = storageRead();
    delete map[String(cartLineId)];
    storageWrite(map);
    const next = buildCartFromStorage();
    notifyCartChanged();
    return next;
  }
}

// Backwards-compatible alias
export { removeFromCartItem as removeFromCart };

// ─────────────────────────────────────────────────────────────────────────────
// FIX-7 — clearCart
// ─────────────────────────────────────────────────────────────────────────────

export async function clearCart(): Promise<CartState> {
  let current: CartState;
  try {
    current = await getCart();
  } catch {
    current = buildCartFromStorage();
  }

  // Only server-side lines (cart_id !== product_id heuristic)
  const serverLines = current.lines.filter(
    (l) => Number.isFinite(l.id) && l.id > 0 && l.id !== l.product.id,
  );

  for (const line of serverLines) {
    try {
      await apiClient.delete(`/api/cart/${line.id}`, { headers: cartHeaders() } as any);
    } catch (e) {
      console.error('clearCart: failed to delete cart_id', line.id, e);
    }
  }

  storageWrite({});
  notifyCartChanged();
  return { lines: [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkout types + helper
// ─────────────────────────────────────────────────────────────────────────────

export type CheckoutItem = {
  product_id: number;
  name:       string;
  image?:     string | null;
  price:      number | string;
  quantity:   number;
  total?:     number | string;
  cart_id?:   number;
};

// FIX-8 — getCheckout: handles all real array shapes the API might return
export async function getCheckout(): Promise<{ lines: CartLine[]; cart_total: number }> {
  try {
    const token   = window.localStorage.getItem('access_token');
    const headers: Record<string, string> = { ...cartHeaders() };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res     = await apiClient.get<any>('/api/checkout', { headers } as any);
    const payload = res.data;

    // Support common response shapes
    let items: any[] = [];
    if      (Array.isArray(payload?.data))             items = payload.data;
    else if (Array.isArray(payload?.data?.items))      items = payload.data.items;
    else if (Array.isArray(payload?.items))            items = payload.items;
    else if (Array.isArray(payload?.cart_items))       items = payload.cart_items;

    const lines = items
      .map((it: any) => {
        const prodObj   = it?.product ?? {};
        const productId = Number(prodObj?.product_id ?? it?.product_id ?? prodObj?.id ?? it?.id);
        const cartId    = Number(it?.cart_id ?? 0) || 0;
        const qty       = Math.max(1, Math.floor(toNumber(it?.quantity ?? it?.qty ?? 1)));
        const priceVal  = it?.price ?? it?.selling_price ?? prodObj?.price ?? 0;
        const origVal   = prodObj?.original_price ?? it?.original_price ?? priceVal;

        const fallback  = productById(productId);
        const product: any = fallback
          ? { ...fallback, id: productId }
          : { id: productId, name: `Product #${productId}`, price: '₹0', image: '', tag: '', rating: 4 };

        if (prodObj?.name)   product.name  = String(prodObj.name);
        else if (it?.name)   product.name  = String(it.name);
        if (priceVal != null) product.price = formatINR(priceVal);

        const rawImg   = prodObj?.image ?? it?.image ?? prodObj?.image_url ?? prodObj?.product_image;
        const resolved = normalizeImageUrl(rawImg);
        if (resolved)  product.image = resolved;

        return {
          id:            Number.isFinite(cartId) && cartId > 0 ? cartId : productId,
          product,
          quantity:      qty,
          originalPrice: toNumber(origVal),
          variantId:     Number(it?.variant_id ?? it?.variant?.variant_id) || undefined,
        } as CartLine;
      })
      .filter((l): l is CartLine => !!l);

    const cart_total = toNumber(
      payload?.data?.cart_total ??
      payload?.cart_total ??
      payload?.data?.total ??
      payload?.total ??
      payload?.total_amount ??
      items.reduce(
        (s: number, it: any) =>
          s + toNumber(it?.total ?? (it?.price ?? 0) * (it?.quantity ?? it?.qty ?? 1)),
        0,
      ),
    );

    if (lines.length === 0) {
      const stored = buildCartFromStorage();
      if (stored.lines.length > 0) return { lines: stored.lines, cart_total: 0 };
    }

    return { lines, cart_total };
  } catch {
    const stored = buildCartFromStorage();
    const total  = stored.lines.reduce(
      (s, l) => s + toNumber(l.product.price) * l.quantity,
      0,
    );
    return { lines: stored.lines, cart_total: total };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Merge guest cart into authenticated user (client-side fallback)
// This is a best-effort merge used when the backend doesn't automatically
// merge guest sessions. It:
// 1. Fetches the guest cart using the SessionId (without Authorization).
// 2. Reads any local-storage-only cart lines.
// 3. Adds all guest/local items to the authenticated user's cart using
//    the normal authenticated `POST /api/cart` endpoint.
// 4. Deletes server-side guest lines (those with cart_id !== product_id).
// 5. Clears local-storage fallback and notifies listeners.
// Note: Call this AFTER storing the `access_token` and `auth_user` so
// `apiClient` sends the Bearer header while adding items to the user cart.
export async function mergeGuestCartIntoUser(): Promise<void> {
  try {
    const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
    const base = apiBase?.trim() ? apiBase.replace(/\/$/, '') : window.location.origin.replace(/\/$/, '');

    // Guest-only client: do NOT attach Authorization header.
    const guestClient = axios.create({ baseURL: base, timeout: 15000, headers: { 'Content-Type': 'application/json' } });

    // 1) Fetch server-side guest cart using SessionId headers
    let guestLines: CartLine[] = [];
    try {
      const guestResp = await guestClient.get<any>('/api/cart', { headers: cartHeaders() } as any);
      const rows = Array.isArray(guestResp.data?.data) ? guestResp.data.data : [];
      guestLines = (rows as ApiCartItem[])
        .map(normaliseApiCartItem)
        .filter((l: CartLine | null): l is CartLine => l !== null);
    } catch (e) {
      // Ignore guest fetch failures — we'll still attempt to merge local storage
      guestLines = [];
    }

    // 2) Read local-storage fallback cart
    const stored = buildCartFromStorage();

    // 3) Consolidate quantities by product id
    const map = new Map<number, { quantity: number; variantId?: number }>();
    for (const l of guestLines) {
      const pid = l.product.id;
      const existing = map.get(pid);
      map.set(pid, { quantity: (existing?.quantity ?? 0) + l.quantity, variantId: existing?.variantId ?? l.variantId });
    }
    for (const l of stored.lines) {
      const pid = l.product.id;
      const existing = map.get(pid);
      map.set(pid, { quantity: (existing?.quantity ?? 0) + l.quantity, variantId: existing?.variantId ?? l.variantId });
    }

    // 4) Add consolidated items to authenticated user's cart
    for (const [productId, info] of map.entries()) {
      try {
        const payload: Record<string, unknown> = { product_id: productId, quantity: Math.max(1, Math.floor(info.quantity)) };
        if (info.variantId) payload.variant_id = info.variantId;
        await apiClient.post('/api/cart', payload, { headers: { ...cartHeaders(), 'Content-Type': 'application/json' } } as any);
      } catch (e) {
        // Continue on errors — best effort merge
        console.error('mergeGuestCartIntoUser: failed to add product', productId, e);
      }
    }

    // 5) Delete server-side guest lines (only those that look like server lines)
    for (const l of guestLines) {
      try {
        if (Number.isFinite(l.id) && l.id > 0 && l.id !== l.product.id) {
          await guestClient.delete(`/api/cart/${l.id}`, { headers: cartHeaders() } as any);
        }
      } catch (e) {
        console.warn('mergeGuestCartIntoUser: failed to delete guest line', l.id, e);
      }
    }

    // 6) Clear local storage fallback and notify
    storageWrite({});
    notifyCartChanged();
  } catch (e) {
    console.error('mergeGuestCartIntoUser: unexpected error', e);
    // swallow errors — merge is best-effort
  }
}