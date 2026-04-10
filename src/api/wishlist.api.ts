// wishlist.api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Wishlist API — localStorage-first with optional backend sync
// Mirrors the cart pattern so both work identically without a live API.
// ─────────────────────────────────────────────────────────────────────────────

import { apiClient } from './client'
import type { Product } from './products'
import { productList } from '../data/data'
import { CATEGORIES } from '../data/categoryData'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistState {
  productIds: number[]
  products: Product[]
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'wishlist_items_v1'

function notifyWishlistChanged(): void {
  // Use a plain Event so listeners don't need to rely on CustomEvent
  window.dispatchEvent(new Event('wishlist:changed'));
}

function storageRead(): number[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return (parsed as unknown[])
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)
  } catch {
    return []
  }
}

function storageWrite(ids: number[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

function productById(id: number): Product | null {
  const fallback = (productList as unknown as Product[]).find((p) => p.id === id)
  if (fallback) return fallback

  const categoryProducts = Object.values(CATEGORIES).flatMap((c) => c.products as unknown as Product[])
  const fromCategory = categoryProducts.find((p) => p.id === id)
  return fromCategory ?? null
}

function buildWishlistFromStorage(): WishlistState {
  const ids = storageRead()
  const products: Product[] = ids
    .map((id) => productById(id))
    .filter((p): p is Product => p !== null)
  return { productIds: ids, products }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Get current wishlist. Falls back to localStorage when API is unavailable. */
export async function getWishlist(): Promise<WishlistState> {
  const hasToken = Boolean(window.localStorage.getItem('access_token'))
  if (!hasToken) return buildWishlistFromStorage()

  try {
    const res = await apiClient.get<unknown>('/wishlist')
    const data = res.data as any

    const incoming: unknown[] = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.productIds)
      ? data.productIds
      : Array.isArray(data)
      ? data
      : []

    if (incoming.length > 0) {
      // Items may be product objects or plain IDs
      const ids: number[] = incoming.map((item) =>
        typeof item === 'object' && item !== null
          ? Number((item as any).productId ?? (item as any).id)
          : Number(item)
      ).filter((n) => Number.isFinite(n) && n > 0)

      const products: Product[] = ids
        .map((id) => productById(id))
        .filter((p): p is Product => p !== null)

      return { productIds: ids, products }
    }
  } catch {
    // fall through to localStorage
  }

  return buildWishlistFromStorage()
}

/** Returns true if productId is in the wishlist. */
export async function isWishlisted(productId: number): Promise<boolean> {
  const ids = storageRead()
  return ids.includes(productId)
}

/** Adds productId to wishlist if not present; removes it if already present. Returns new state. */
// Accept either a numeric id or a product-like object { id }
export async function toggleWishlist(productOrId: number | { id: number }): Promise<WishlistState> {
  const productId = typeof productOrId === 'number' ? productOrId : productOrId.id
  const ids = storageRead()
  const alreadyIn = ids.includes(productId)
  const next = alreadyIn ? ids.filter((id) => id !== productId) : [...ids, productId]

  storageWrite(next)

  try {
    if (alreadyIn) {
      await apiClient.delete(`/wishlist/items/${productId}`)
    } else {
      await apiClient.post('/wishlist/items', { productId })
    }
  } catch {
    // Ignore — localStorage already updated
  }

  const state = buildWishlistFromStorage()
  notifyWishlistChanged()
  return state
}

/** Remove a specific product from wishlist. Returns new state. */
export async function removeFromWishlist(productId: number): Promise<WishlistState> {
  const ids = storageRead().filter((id) => id !== productId)
  storageWrite(ids)

  try {
    await apiClient.delete(`/wishlist/items/${productId}`)
  } catch {
    // ignore
  }

  const state = buildWishlistFromStorage()
  notifyWishlistChanged()
  return state
}

/** Add a specific product to wishlist. Returns new state. */
export async function addToWishlist(productId: number): Promise<WishlistState> {
  const ids = storageRead()
  if (!ids.includes(productId)) {
    storageWrite([...ids, productId])
    try {
      await apiClient.post('/wishlist/items', { productId })
    } catch {
      // ignore
    }
  }

  const state = buildWishlistFromStorage()
  notifyWishlistChanged()
  return state
}

/** Clear the entire wishlist. */
export async function clearWishlist(): Promise<WishlistState> {
  storageWrite([])
  try {
    await apiClient.delete('/wishlist/items')
  } catch {
    // ignore
  }
  notifyWishlistChanged()
  return { productIds: [], products: [] }
}