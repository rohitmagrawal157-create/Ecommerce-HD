// wishlist.api.ts
import { apiClient } from './client'
import type { Product } from './products'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistItem {
  wishlist_id: number
  product_id:  number
  product_name: string
  product_image: string
  price: string
}

export interface WishlistState {
  productIds: number[]
  products:   Product[]
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Dispatch custom event so any component can react to wishlist changes */
function notifyWishlistChanged(): void {
  window.dispatchEvent(new Event('wishlist:changed'))
}

/** Build Authorization + Accept headers from stored token */
function authHeaders(): Record<string, string> {
  const token = window.localStorage.getItem('access_token') ?? ''
  return {
    'Content-Type':  'application/json',
    'Accept':        'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * Map a raw API wishlist item → Product shape used by UI.
 * Preserves the image URL and formats the price.
 */
function mapItemToProduct(item: WishlistItem): Product {
  return {
    id:    item.product_id,
    name:  item.product_name,
    // Backend returns price like "90.00". We append currency if needed, 
    // or keep as string if backend sends currency.
    // Assuming backend sends just number:
    price: `₹${parseFloat(item.price).toFixed(2)}`, 
    image: item.product_image ?? '',
    tag:   '',       // API doesn't return tag — set default
    rating: 4,       // API doesn't return rating — set default
  } as Product
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Explicit Hostinger URL to ensure API works
const BASE_API_URL = 'https://lightsteelblue-stinkbug-893971.hostingersite.com/Shopping-Cart/public/api';

/**
 * GET /api/wishlist
 * Returns full wishlist state (productIds + mapped Product[])
 */
export async function getWishlist(): Promise<WishlistState> {
  const token = window.localStorage.getItem('access_token')
  if (!token) return { productIds: [], products: [] }

  try {
    // Using absolute URL
    const res = await apiClient.get<{
      status: boolean
      data: WishlistItem[]
    }>(`${BASE_API_URL}/wishlist`, { headers: authHeaders() } as any)

    const { status, data } = res.data

    if (!status || !Array.isArray(data)) {
      console.warn('getWishlist: unexpected response', res.data)
      return { productIds: [], products: [] }
    }

    const productIds = data.map((item) => item.product_id)
    const products   = data.map(mapItemToProduct)

    return { productIds, products }
  } catch (error: any) {
    console.error('getWishlist failed:', error?.response?.data ?? error.message)
    return { productIds: [], products: [] }
  }
}

/**
 * Returns true if the given productId is currently wishlisted.
 */
export async function isWishlisted(productId: number): Promise<boolean> {
  const { productIds } = await getWishlist()
  return productIds.includes(productId)
}

/**
 * POST /api/wishlist
 * Body: { product_id: number }
 * Adds product to wishlist, then returns refreshed state.
 */
export async function addToWishlist(productId: number): Promise<WishlistState> {
  try {
    await apiClient.post(
      `${BASE_API_URL}/wishlist`,
      { product_id: productId },
      { headers: authHeaders() } as any,
    )
    notifyWishlistChanged()
    return await getWishlist()
  } catch (error: any) {
    console.error('addToWishlist failed:', error?.response?.data ?? error.message)
    throw error
  }
}

/**
 * DELETE /api/wishlist
 * Body: { product_id: number }
 * Removes product from wishlist, then returns refreshed state.
 * Matches Axios config: delete(url, { data: payload })
 */
export async function removeFromWishlist(productId: number): Promise<WishlistState> {
  try {
    await apiClient.delete(`${BASE_API_URL}/wishlist`, {
      data:    { product_id: productId },
      headers: authHeaders(),
    } as any)
    
    notifyWishlistChanged()
    return await getWishlist()
  } catch (error: any) {
    console.error('removeFromWishlist failed:', error?.response?.data ?? error.message)
    throw error
  }
}

/**
 * Toggle: adds if not present, removes if already present.
 */
export async function toggleWishlist(
  productOrId: number | { id: number },
): Promise<WishlistState> {
  const productId = typeof productOrId === 'number' ? productOrId : productOrId.id
  const { productIds } = await getWishlist()
  return productIds.includes(productId)
    ? removeFromWishlist(productId)
    : addToWishlist(productId)
}