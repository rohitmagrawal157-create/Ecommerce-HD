// wishlist.api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Wishlist API — API-first with localStorage cache fallback
//
// ENDPOINTS (authenticated Bearer token required):
// - POST   /api/wishlist          { product_id: number }     → Add product to wishlist
// - GET    /api/wishlist                                    → Get all wishlist items
// - DELETE /api/wishlist          { product_id: number }     → Remove from wishlist
//
// Response structure:
// GET: { status: true, data: [{ id, wishlist_id, product_id, product: { ... }, createdAt }] }
// ─────────────────────────────────────────────────────────────────────────────

import { apiClient } from './client'
import type { Product } from './products'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistState {
  productIds: number[]
  products: Product[]
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function notifyWishlistChanged(): void {
  window.dispatchEvent(new Event('wishlist:changed'))
}

// Normalize images returned by API into absolute URLs when possible
function normalizeImageUrl(raw: unknown): string {
  if (raw === null || raw === undefined) return ''
  let s = String(raw)
  s = s.replace(/\\/g, '')
  s = s.trim().replace(/^"|"$/g, '')
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  if (/^\/\//.test(s)) return window.location.protocol + s
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined
  if (apiBase && apiBase.trim()) return apiBase.replace(/\/$/, '') + '/' + s.replace(/^\//, '')
  return window.location.origin.replace(/\/$/, '') + '/' + s.replace(/^\//, '')
}

// Get auth headers with Bearer token
function authHeaders(): Record<string, string> {
  const token = window.localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get all items in user's wishlist
 * GET /api/wishlist
 * Returns: { status: true, data: [...] }
 */
export async function getWishlist(): Promise<WishlistState> {
  const hasToken = Boolean(window.localStorage.getItem('access_token'))
  if (!hasToken) return { productIds: [], products: [] }

  try {
    const res = await apiClient.get<any>('/api/wishlist', {
      headers: authHeaders(),
    } as any)

    const data = res.data
    if (!data?.status) throw new Error('Invalid response')

    const items = Array.isArray(data?.data) ? data.data : []
    const productIds: number[] = items
      .map((item: any) => Number(item?.product_id ?? item?.productId ?? item?.id))
      .filter((id: number) => Number.isFinite(id) && id > 0)

    // Build product objects from API data and normalize images
    const products: Product[] = items
      .map((item: any) => {
        const prodObj = item?.product ?? {}
        const rawImage = prodObj?.image ?? prodObj?.product_image ?? prodObj?.image_url ?? ''
        return {
          id: Number(prodObj?.product_id ?? prodObj?.id ?? item?.product_id),
          name: prodObj?.name ?? prodObj?.product_name ?? `Product #${item?.product_id}`,
          price: prodObj?.price ?? '₹0',
          image: normalizeImageUrl(rawImage),
          tag: prodObj?.tag ?? prodObj?.tag_name ?? '',
          rating: prodObj?.rating ?? 4,
        } as Product
      })
      .filter((p: any): p is Product => !!p.id)

    return { productIds, products }
  } catch (error) {
    console.error('getWishlist failed:', error)
    return { productIds: [], products: [] }
  }
}

/** Returns true if productId is in the wishlist. */
export async function isWishlisted(productId: number): Promise<boolean> {
  try {
    const state = await getWishlist()
    return state.productIds.includes(productId)
  } catch {
    return false
  }
}

/**
 * Add a product to wishlist
 * POST /api/wishlist
 * Body: { product_id: number }
 */
export async function addToWishlist(productId: number): Promise<WishlistState> {
  try {
    await apiClient.post('/api/wishlist', { product_id: productId }, { headers: authHeaders() } as any)
    notifyWishlistChanged()
    return await getWishlist()
  } catch (error) {
    console.error('addToWishlist API failed:', error)
    throw error
  }
}

/**
 * Remove a product from wishlist
 * DELETE /api/wishlist
 * Body: { product_id: number }
 */
export async function removeFromWishlist(productId: number): Promise<WishlistState> {
  try {
    await apiClient.delete('/api/wishlist', { data: { product_id: productId }, headers: authHeaders() } as any)
    notifyWishlistChanged()
    return await getWishlist()
  } catch (error) {
    console.error('removeFromWishlist API failed:', error)
    throw error
  }
}

/**
 * Toggle wishlist status for a product
 * Adds if not present, removes if already present
 */
export async function toggleWishlist(productOrId: number | { id: number }): Promise<WishlistState> {
  const productId = typeof productOrId === 'number' ? productOrId : productOrId.id
  const state = await getWishlist()
  const isAlreadyIn = state.productIds.includes(productId)
  if (isAlreadyIn) return removeFromWishlist(productId)
  return addToWishlist(productId)
}

/**
 * Clear the entire wishlist
 * DELETE /api/wishlist (without body removes all)
 */
export async function clearWishlist(): Promise<WishlistState> {
  try {
    await apiClient.delete('/api/wishlist', { headers: authHeaders() } as any)
    notifyWishlistChanged()
    return { productIds: [], products: [] }
  } catch (error) {
    console.error('clearWishlist API failed:', error)
    throw error
  }
}