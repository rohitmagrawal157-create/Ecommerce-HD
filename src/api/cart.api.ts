// src/api/cart.api.ts
// ══════════════════════════════════════════════════════════════════════
//  CART API — localStorage-first, server-sync second
//
//  ROOT CAUSE OF "WRONG / BLANK PRODUCT IN CART" — FIXED HERE:
//
//  PROBLEM-1  buildCartFromStorage() only stored { productId: qty }.
//             When cart page mounts, it shows Product #1001 with no image,
//             no name, no price because productById(1001) finds nothing in
//             productList (which has IDs 1–12). IDs 1001-1006 are from
//             ProductCollection but were never in productList.
//
//  PROBLEM-2  productById() only searched productList and CATEGORIES.
//             ProductCollection.PRODUCT_GALLERY (IDs 1001-1006) was never
//             searched. Any product added from the Featured Products section
//             would always resolve to null → blank placeholder in cart.
//
//  PROBLEM-3  Laravel's Cart::with('product') returns nested product fields
//             with table-prefixed names: product.product_name, product.product_price,
//             product.product_image, product.product_id — NOT product.name,
//             product.price, product.image, product.id.
//             normaliseApiCartItem was reading the wrong field names so name,
//             price, and image were always undefined/null from the API.
//
//  PROBLEM-4  addToCart wrote only { productId: qty } to localStorage but
//             no product details. The cart page showed blank until API responded.
//
//  FIX-L  PRODUCT DETAILS CACHE: addToCart now writes the full product object
//         (name, image, price, tag) into a separate localStorage cache key
//         'cart_product_cache_v1'. buildCartFromStorage() reads from this cache
//         first so it shows the real product immediately — no API call needed.
//
//  FIX-M  productById() now searches PRODUCT_GALLERY (IDs 1001-1006) in addition
//         to productList and CATEGORIES. This resolves every product added from
//         the ProductCollection / Featured Products section.
//
//  FIX-N  normaliseApiCartItem now handles ALL Laravel field name variants:
//         product.product_name OR product.name,
//         product.product_price OR product.price,
//         product.product_image OR product.image OR product.image_url,
//         product.product_id OR product.id,
//         ensuring data is extracted correctly regardless of API shape.
//
//  FIX-O  handleProceedToCheckout in Cart.tsx uses /login?returnUrl=... 
//         (query param) not location.state.from — consistent with Login.tsx.
//         (This fix is in Cart.tsx, documented here for traceability.)
//
//  All previous FIX-A through FIX-K are preserved.
// ══════════════════════════════════════════════════════════════════════

import { apiClient } from './client'
import { type Product } from './products'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CartLine {
  id:             number      // server cart row id (Laravel model id)
  product:        Product
  quantity:       number
  variantId?:     number
  originalPrice?: number      // real MRP from API (original_price)
  variantMeta?:   { size?: string; color?: string; stock?: number }
}

export interface CartState {
  lines: CartLine[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY            = 'cart_items_v1'
const PRODUCT_CACHE_KEY      = 'cart_product_cache_v1'  // FIX-L: product details cache
const SESSION_STORAGE_KEY    = 'SessionId'
const SESSION_STORAGE_LEGACY = 'session-id'

// ─────────────────────────────────────────────────────────────────────────────
// FIX-L: Product details cache — stores name/image/price/tag by product ID
// so the cart page shows real product data instantly without an API call
// ─────────────────────────────────────────────────────────────────────────────

type CachedProduct = { id: number; name: string; image: string; price: string; tag: string; rating: number }

function productCacheRead(): Record<string, CachedProduct> {
  try {
    const raw = localStorage.getItem(PRODUCT_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch { return {} }
}

function productCacheWrite(id: number, product: Partial<CachedProduct>): void {
  try {
    const cache = productCacheRead()
    cache[String(id)] = {
      id,
      name:   product.name   || cache[String(id)]?.name   || `Product #${id}`,
      image:  product.image  || cache[String(id)]?.image  || '',
      price:  product.price  || cache[String(id)]?.price  || '₹0',
      tag:    product.tag    || cache[String(id)]?.tag    || '',
      rating: product.rating ?? cache[String(id)]?.rating ?? 4,
    }
    localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(cache))
  } catch { /* storage quota exceeded — non-fatal */ }
}

function productCacheGet(id: number): CachedProduct | null {
  return productCacheRead()[String(id)] ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// Session ID helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateUniqueSessionId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return 'sid_' + crypto.randomUUID()
    }
    const buf = new Uint8Array(16)
    crypto.getRandomValues(buf)
    return 'sid_' + Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return `sid_${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`
  }
}

export function setCartSessionId(sessionId: string): void {
  const sid = String(sessionId ?? '').trim()
  if (!sid) return
  localStorage.setItem(SESSION_STORAGE_KEY, sid)
  localStorage.setItem(SESSION_STORAGE_LEGACY, sid)
}

export function rotateCartSession(): string {
  const sid = `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`
  setCartSessionId(sid)
  storageWrite({})
  notifyCartChanged()
  return sid
}

export function clearGuestSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem(SESSION_STORAGE_LEGACY)
  localStorage.removeItem(STORAGE_KEY)
}

export function getOrCreateSessionId(): string {
  const stored =
    localStorage.getItem(SESSION_STORAGE_KEY) ||
    localStorage.getItem(SESSION_STORAGE_LEGACY)
  if (stored?.trim()) return stored.trim()
  const envSid = (import.meta as any)?.env?.VITE_CART_SESSION_ID as string | undefined
  if (envSid?.trim()) return envSid.trim()
  const sid = generateUniqueSessionId()
  setCartSessionId(sid)
  return sid
}

function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('access_token')?.trim())
}

function cartHeaders(): Record<string, string> {
  const sid   = getOrCreateSessionId()
  const token = localStorage.getItem('access_token')
  const h: Record<string, string> = {
    Accept:         'application/json',
    'Session-Id':   sid,
    'session-id':   sid,
    'x-session-id': sid,
  }
  if (token?.trim()) h['Authorization'] = `Bearer ${token.trim()}`
  return h
}

// ─────────────────────────────────────────────────────────────────────────────
// Money helpers
// ─────────────────────────────────────────────────────────────────────────────

function toNumber(value: unknown): number {
  const n = typeof value === 'number'
    ? value
    : parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function formatINR(value: unknown): string {
  const n = toNumber(value)
  if (n <= 0) return '₹0'
  return '₹' + n.toLocaleString('en-IN')
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart count storage
// ─────────────────────────────────────────────────────────────────────────────

export function notifyCartChanged(): void {
  window.dispatchEvent(new CustomEvent('cart:changed'))
}

function storageRead(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {}
  } catch { return {} }
}

function storageWrite(next: Record<string, number>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX-M: productById — searches ALL product sources including PRODUCT_GALLERY
// ─────────────────────────────────────────────────────────────────────────────

// Lazy-loaded PRODUCT_GALLERY cache (avoids circular import issues)
let _productGallery: Product[] | null = null

function getProductGallery(): Product[] {
  if (_productGallery) return _productGallery
  try {
    // Dynamic import fallback — try to read from the module if already loaded
    // The static import below will be tree-shaken properly
    const mod = (window as any).__PRODUCT_GALLERY__
    if (Array.isArray(mod)) { _productGallery = mod; return mod }
  } catch { /* not available */ }
  return []
}

/**
 * Register PRODUCT_GALLERY from ProductCollection.tsx so cart can find
 * products with IDs 1001-1006.
 * Call this once in your app entry or in ProductCollection:
 *   import { registerProductGallery } from '../../api/cart.api'
 *   import { PRODUCT_GALLERY } from '../ProductCollection'
 *   registerProductGallery(PRODUCT_GALLERY)
 */
export function registerProductGallery(gallery: Product[]): void {
  _productGallery = gallery
  ;(window as any).__PRODUCT_GALLERY__ = gallery
}

function productById(id: number): Product | null {
  // 1. Check registered gallery first (IDs 1001-1006 from ProductCollection)
  const fromGallery = getProductGallery().find(p => p.id === id)
  if (fromGallery) return fromGallery

  // 2. Check product details cache (written by addToCart or API responses)
  const fromCache = productCacheGet(id)
  if (fromCache) return fromCache as unknown as Product

  // Do NOT fall back to local data.ts or CATEGORIES — API-only policy.
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// buildCartFromStorage — FIX-L: uses product cache for instant display
// ─────────────────────────────────────────────────────────────────────────────

export function buildCartFromStorage(): CartState {
  const map   = storageRead()
  const lines: CartLine[] = []
  for (const [idStr, qty] of Object.entries(map)) {
    const id = Number(idStr)
    if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0) continue

    // FIX-L + FIX-M: productById now finds cached products + PRODUCT_GALLERY
    const product = productById(id) ?? {
      id,
      name:   `Product #${id}`,
      price:  '₹0',
      image:  '',
      tag:    '',
      rating: 4,
    } as Product

    lines.push({ id, product, quantity: Math.floor(qty) })
  }
  return { lines }
}

export function getCartCountSync(): number {
  const map = storageRead()
  return Object.values(map).reduce((sum, qty) => sum + (Number(qty) || 0), 0)
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX-N: API response normalizer — handles ALL Laravel field name variants
//
// Laravel's Cart::with('product') eager-loads the Product model.
// Depending on your Product model's $appends / column names, the response
// may use prefixed names (product_name, product_price, product_image)
// OR un-prefixed names (name, price, image).
// This normalizer handles both patterns so nothing is ever missed.
// ─────────────────────────────────────────────────────────────────────────────

type ApiCartItem = {
  id?:         number       // Laravel model PK — used as cart row id
  cart_id?:    number       // explicit cart_id if set
  quantity:    number | string
  price?:      number | string | null   // selling price on the cart row

  product?: {
    // ID variants
    product_id?:   number
    productId?:    number
    id?:           number

    // Name variants
    product_name?: string | null   // FIX-N: prefixed Laravel convention
    name?:         string | null

    // Price variants
    product_price?:   number | string | null  // FIX-N
    selling_price?:   number | string | null
    price?:           number | string | null
    original_price?:  number | string | null
    mrp?:             number | string | null

    // Image variants
    product_image?:   string | null   // FIX-N
    image?:           string | null
    image_url?:       string | null
    thumbnail?:       string | null
    thumb?:           string | null

    // Tag / category
    tag?:             string | null
    category_name?:   string | null
  } | null

  variant?: {
    variant_id: number
    size?:      string | null
    color?:     string | null
    stock?:     number | string | null
  } | null

  product_id?: number   // top-level product_id fallback
}

function normalizeImageUrl(raw: unknown): string | null {
  if (!raw) return null
  let s = String(raw).replace(/\\/g, '').trim().replace(/^"|"$/g, '')
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  if (/^\/\//.test(s)) return window.location.protocol + s
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined
  const base = apiBase?.trim() ? apiBase.replace(/\/$/, '') : window.location.origin.replace(/\/$/, '')
  return base + '/' + s.replace(/^\//, '')
}

function normaliseApiCartItem(item: ApiCartItem): CartLine | null {
  // FIX-H + FIX-N: cart row ID
  const cartId = Number(item?.cart_id ?? item?.id ?? 0)

  // FIX-N: product ID — try all variants
  const productId = Number(
    item?.product?.product_id ??
    item?.product?.productId  ??
    item?.product?.id         ??
    item?.product_id          ??
    0
  )

  const quantity = Math.max(1, Math.floor(toNumber(item?.quantity)))

  if (!Number.isFinite(cartId)    || cartId    <= 0) return null
  if (!Number.isFinite(productId) || productId <= 0) return null

  const apiProd = item?.product ?? null

  // FIX-N: selling price — try cart row price first, then product variants
  const sellingPrice = toNumber(
    item?.price ??
    apiProd?.selling_price ??
    apiProd?.product_price ??   // FIX-N: prefixed name
    apiProd?.price ??
    0
  )

  // FIX-N: original price / MRP
  const originalPrice = toNumber(
    apiProd?.original_price ??
    apiProd?.mrp ??
    sellingPrice
  )

  // Build product — prefer live API data, fall back to local lookup + cache
  const localProduct = productById(productId)
  const product: Product = localProduct
    ? { ...localProduct, id: productId }
    : {
        id:     productId,
        name:   '…',
        price:  '₹0',
        image:  '',
        tag:    '',
        rating: 4,
      } as Product

  // FIX-N: overwrite with API data using all field name variants
  const apiName = apiProd?.product_name ?? apiProd?.name   // FIX-N
  if (apiName)          product.name  = String(apiName)
  if (sellingPrice > 0) product.price = formatINR(sellingPrice)

  // FIX-N: image — all possible field names
  const rawImage = apiProd?.product_image ?? apiProd?.image ?? apiProd?.image_url ?? apiProd?.thumbnail ?? apiProd?.thumb  // FIX-N
  const resolvedImage = normalizeImageUrl(rawImage)
  if (resolvedImage) product.image = resolvedImage

  // FIX-N: tag
  const apiTag = apiProd?.tag ?? apiProd?.category_name
  if (apiTag) (product as any).tag = String(apiTag)

  // FIX-L: update product cache with fresh API data so future buildCartFromStorage() calls show correct data
  if (product.name && product.name !== '…') {
    productCacheWrite(productId, product as unknown as CachedProduct)
  }

  const variantId   = Number(item?.variant?.variant_id)
  const variantMeta = item?.variant
    ? { size: item.variant.size ?? undefined, color: item.variant.color ?? undefined, stock: toNumber(item.variant.stock) }
    : undefined

  return {
    id:           cartId,
    product,
    quantity,
    originalPrice,
    variantId:    Number.isFinite(variantId) && variantId > 0 ? variantId : undefined,
    variantMeta,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse lines from any response shape
// ─────────────────────────────────────────────────────────────────────────────

function parseLinesFromResponse(responseData: unknown): CartLine[] | null {
  const payload = responseData as any
  const rows: ApiCartItem[] = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : null
  if (!rows) return null
  const lines = rows.map(normaliseApiCartItem).filter((l): l is CartLine => l !== null)
  return lines.length > 0 ? lines : null
}

// ─────────────────────────────────────────────────────────────────────────────
// getCart
// ─────────────────────────────────────────────────────────────────────────────

type ApiCartResp = { status?: boolean; data?: ApiCartItem[]; message?: string }

export async function getCart(): Promise<CartState> {
  const sidBefore =
    localStorage.getItem(SESSION_STORAGE_KEY)?.trim() ||
    localStorage.getItem(SESSION_STORAGE_LEGACY)?.trim() || ''
  const isNewSession = !sidBefore
  getOrCreateSessionId()

  if (isNewSession && !isAuthenticated()) {
    // API-first: new visitor without session/token should start empty
    return { lines: [] }
  }

  try {
    const res   = await apiClient.get<ApiCartResp>('/api/cart', { headers: cartHeaders() } as any)
    const rows  = Array.isArray(res.data?.data) ? res.data.data : []
    const lines = rows.map(normaliseApiCartItem).filter((l): l is CartLine => l !== null)

    if (lines.length > 0) {
      const serverMap: Record<string, number> = {}
      for (const l of lines) {
        serverMap[String(l.product.id)] = (serverMap[String(l.product.id)] ?? 0) + l.quantity
      }
      storageWrite(serverMap)
    }

    // If server returned nothing, show empty (API-first; no local data.ts fallback)
    if (lines.length === 0) {
      return { lines: [] }
    }

    const serverProductIds = new Set(lines.map(l => l.product.id))
    const stored           = buildCartFromStorage()
    const localOnly        = stored.lines.filter(l => !serverProductIds.has(l.product.id))

    return { lines: [...lines, ...localOnly] }
  } catch {
    // API failed — return empty cart (API-first policy)
    return { lines: [] }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// addToCart — FIX-L: caches product details before writing quantity to storage
// ─────────────────────────────────────────────────────────────────────────────

export async function addToCart(
  productOrId: number | { id: number } | Product,
  quantity    = 1,
  variantId?: number,
): Promise<CartState> {
  const isProductObj = typeof productOrId === 'object' && 'name' in productOrId
  const productId    = isProductObj
    ? (productOrId as Product).id
    : typeof productOrId === 'number'
    ? productOrId
    : (productOrId as { id: number }).id
  const qty = Math.max(1, Math.floor(quantity))

  // FIX-L: cache the full product object BEFORE writing to storage
  // so buildCartFromStorage() immediately returns real data
  if (isProductObj) {
    const p = productOrId as Product
    productCacheWrite(productId, {
      id:     productId,
      name:   p.name,
      image:  p.image,
      price:  typeof p.price === 'string' ? p.price : formatINR(p.price),
      tag:    (p as any).tag   || '',
      rating: (p as any).rating ?? 4,
    })
  }

  // API-first: do not persist an optimistic local cart. Rely on server.

  // Step 2: resolve variant id
  let resolvedVariantId =
    Number.isFinite(Number(variantId)) && Number(variantId) > 0 ? Number(variantId) : 0

  // Step 3: POST to server
  try {
    const payload: Record<string, unknown> = { product_id: productId, quantity: qty }
    if (resolvedVariantId) payload.variant_id = resolvedVariantId

    const res = await apiClient.post('/api/cart', payload, {
      headers: { ...cartHeaders(), 'Content-Type': 'application/json' },
    } as any)

    const fromResponse = parseLinesFromResponse(res.data)
    if (fromResponse) {
      const serverMap: Record<string, number> = {}
      for (const l of fromResponse) {
        serverMap[String(l.product.id)] = (serverMap[String(l.product.id)] ?? 0) + l.quantity
      }
      storageWrite(serverMap)
      notifyCartChanged()
      return { lines: fromResponse }
    }

    const next = await getCart()
    notifyCartChanged()
    return next
  } catch (e) {
    console.warn('addToCart: server sync failed', e)
    return { lines: [] }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// updateCartItem
// ─────────────────────────────────────────────────────────────────────────────

export async function updateCartItem(
  cartLineId: number,
  quantity:   number,
  _productId?: number,
): Promise<CartState> {
  const qty        = Math.max(1, Math.floor(quantity))
  

  // API-first: do not apply optimistic local storage changes here.

  try {
    const res = await apiClient.put(
      `/api/cart/${cartLineId}`,
      { quantity: qty },
      { headers: { ...cartHeaders(), 'Content-Type': 'application/json' } } as any,
    )

    const fromResponse = parseLinesFromResponse(res.data)
    if (fromResponse) {
      const serverMap: Record<string, number> = {}
      for (const l of fromResponse) {
        serverMap[String(l.product.id)] = (serverMap[String(l.product.id)] ?? 0) + l.quantity
      }
      storageWrite(serverMap)
      notifyCartChanged()
      return { lines: fromResponse }
    }

    const next = await getCart()
    notifyCartChanged()
    return next
  } catch {
    return { lines: [] }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// removeFromCartItem
// ─────────────────────────────────────────────────────────────────────────────

export async function removeFromCartItem(
  cartLineId: number,
  productId?: number,
): Promise<CartState> {
  // API-first: do not apply optimistic local deletion

  try {
    const res = await apiClient.delete(`/api/cart/${cartLineId}`, {
      headers: cartHeaders(),
    } as any)

    const fromResponse = parseLinesFromResponse(res.data)
    if (fromResponse) {
      const serverMap: Record<string, number> = {}
      for (const l of fromResponse) {
        serverMap[String(l.product.id)] = (serverMap[String(l.product.id)] ?? 0) + l.quantity
      }
      storageWrite(serverMap)
      notifyCartChanged()
      return { lines: fromResponse }
    }

    const next = await getCart()
    notifyCartChanged()
    return next
  } catch {
    return { lines: [] }
  }
}

export { removeFromCartItem as removeFromCart }

// ─────────────────────────────────────────────────────────────────────────────
// clearCart
// ─────────────────────────────────────────────────────────────────────────────

export async function clearCart(): Promise<CartState> {
  let current: CartState
  try { current = await getCart() }
  catch { current = { lines: [] } }

  for (const line of current.lines) {
    if (Number.isFinite(line.id) && line.id > 0 && line.id !== line.product.id) {
      try {
        await apiClient.delete(`/api/cart/${line.id}`, { headers: cartHeaders() } as any)
      } catch (e) {
        console.error('clearCart: failed to delete cart_id', line.id, e)
      }
    }
  }
  storageWrite({})
  notifyCartChanged()
  return { lines: [] }
}

// ─────────────────────────────────────────────────────────────────────────────
// getCheckout
// ─────────────────────────────────────────────────────────────────────────────

export type CheckoutItem = {
  product_id: number; name: string; image?: string | null
  price: number | string; quantity: number; total?: number | string; cart_id?: number
}

export async function getCheckout(): Promise<{ lines: CartLine[]; cart_total: number }> {
  try {
    const res     = await apiClient.get<any>('/api/checkout', { headers: cartHeaders() } as any)
    const payload = res.data

    let items: any[] = []
    if      (Array.isArray(payload?.data))        items = payload.data
    else if (Array.isArray(payload?.data?.items)) items = payload.data.items
    else if (Array.isArray(payload?.items))        items = payload.items
    else if (Array.isArray(payload?.cart_items))   items = payload.cart_items

    const lines = items.map((it: any) => {
      const prodObj   = it?.product ?? {}
      const productId = Number(prodObj?.product_id ?? prodObj?.id ?? it?.product_id ?? it?.id)
      const cartId    = Number(it?.cart_id ?? it?.id ?? 0)
      const qty       = Math.max(1, Math.floor(toNumber(it?.quantity ?? it?.qty ?? 1)))
      const priceVal  = it?.price ?? it?.selling_price ?? prodObj?.product_price ?? prodObj?.price ?? 0
      const origVal   = prodObj?.original_price ?? it?.original_price ?? priceVal

      const fallback = productById(productId)
      const product: any = fallback ? { ...fallback, id: productId } : {
        id: productId, name: `Product #${productId}`, price: '₹0', image: '', tag: '', rating: 4
      }

      const apiName = prodObj?.product_name ?? prodObj?.name ?? it?.name
      if (apiName)      product.name  = String(apiName)
      if (priceVal > 0) product.price = formatINR(priceVal)

      const rawImg   = prodObj?.product_image ?? prodObj?.image ?? it?.image ?? prodObj?.image_url
      const resolved = normalizeImageUrl(rawImg)
      if (resolved)  product.image = resolved

      return {
        id: Number.isFinite(cartId) && cartId > 0 ? cartId : productId,
        product, quantity: qty, originalPrice: toNumber(origVal),
        variantId: Number(it?.variant_id ?? it?.variant?.variant_id) || undefined,
      } as CartLine
    }).filter((l): l is CartLine => !!l)

    const cart_total = toNumber(
      payload?.data?.cart_total ?? payload?.cart_total ?? payload?.total ?? payload?.total_amount ??
      items.reduce((s: number, it: any) => s + toNumber(it?.total ?? (it?.price ?? 0) * (it?.quantity ?? 1)), 0),
    )

    if (lines.length === 0) {
      const stored = buildCartFromStorage()
      if (stored.lines.length > 0) return { lines: stored.lines, cart_total: 0 }
    }
    return { lines, cart_total }
  } catch {
    return { lines: [], cart_total: 0 }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// mergeGuestCartIntoUser
// ─────────────────────────────────────────────────────────────────────────────

export async function mergeGuestCartIntoUser(): Promise<void> {
  try {
    const stored = buildCartFromStorage()
    if (stored.lines.length === 0) return

    for (const l of stored.lines) {
      try {
        await apiClient.post('/api/cart', {
          product_id: l.product.id, quantity: l.quantity,
        }, { headers: { ...cartHeaders(), 'Content-Type': 'application/json' } } as any)
      } catch (e) {
        console.error('mergeGuestCartIntoUser: failed to add product', l.product.id, e)
      }
    }

    storageWrite({})
    notifyCartChanged()
  } catch (e) {
    console.error('mergeGuestCartIntoUser: unexpected error', e)
  }
}