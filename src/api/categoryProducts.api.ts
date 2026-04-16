// src/api/categoryProducts.api.ts
// ══════════════════════════════════════════════════════════════════════════════
//  Two endpoints:
//
//  GET /api/categories/{id}/all-products   ← parent category (all children too)
//  GET /api/categories/{id}/products       ← child category (specific sub only)
//
//  Both return the same shape. This module normalises them into CategoryProduct[].
//  On any error → returns { ok: false, products: [], error } so the UI
//  can show a fallback/error state without crashing.
// ══════════════════════════════════════════════════════════════════════════════

import { apiClient } from "./client";   // your existing axios instance

// ── Public types ──────────────────────────────────────────────────────────────

export interface CategoryProduct {
  id:            number;
  name:          string;
  image:         string;
  price:         string;      // formatted, e.g. "₹1,299"
  tag:           string;      // category / badge label shown on card
  rating:        number;      // 1-5
  badge?:        string;      // "NEW" | "HOT" | "SALE" etc.
  originalPrice?: string;     // MRP (for strikethrough)
  discount?:     number;      // percent
}

export type FetchResult =
  | { ok: true;  products: CategoryProduct[] }
  | { ok: false; products: CategoryProduct[]; error: string };

// ── Raw API shape ─────────────────────────────────────────────────────────────

interface RawProduct {
  id:           number;
  name:         string;
  image_url?:   string | null;
  image?:       string | null;
  price?:       string | number | null;
  compare_price?: string | number | null;
  original_price?: string | number | null;
  discount?:    number | null;
  rating?:      number | null;
  badge?:       string | null;
  tag?:         string | null;
  category?:    { id: number; name: string } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseRows(payload: unknown): RawProduct[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    if (Array.isArray(p.data))     return p.data as RawProduct[];
    if (Array.isArray(p.products)) return p.products as RawProduct[];
  }
  return [];
}

function formatRupee(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '₹0';
  const raw = String(value).replace(/[^0-9.]/g, '');
  const num = parseFloat(raw);
  if (isNaN(num) || num === 0) return '₹0';
  return '₹' + num.toLocaleString('en-IN');
}

function normalise(raw: RawProduct, fallbackTag = ''): CategoryProduct {
  const price    = formatRupee(raw.price);
  const mrpRaw   = raw.compare_price ?? raw.original_price;
  const mrp      = mrpRaw ? formatRupee(mrpRaw) : undefined;
  const discount  = raw.discount ? Number(raw.discount) : undefined;

  return {
    id:            Number(raw.id),
    name:          String(raw.name ?? ''),
    image:         raw.image_url || raw.image || '',
    price,
    tag:           raw.tag ?? raw.category?.name ?? raw.badge ?? fallbackTag,
    rating:        Number(raw.rating ?? 4) || 4,
    badge:         raw.badge ?? undefined,
    originalPrice: mrp,
    discount,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * GET /api/categories/{parentId}/all-products
 * Used when the user clicks the PARENT dept name (e.g. "Portrait Frames").
 * Returns every product across all children.
 */
export async function getParentProducts(parentId: number): Promise<FetchResult> {
  if (!parentId || parentId <= 0) {
    return { ok: false, products: [], error: 'Invalid category id' };
  }
  try {
    const { data: payload } = await apiClient.get(
      `/api/categories/${parentId}/all-products`
    );
    const rows    = parseRows(payload);
    const products = rows.map(r => normalise(r));
    return { ok: true, products };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load products';
    console.error(`[categoryProducts] GET /api/categories/${parentId}/all-products →`, msg);
    return { ok: false, products: [], error: msg };
  }
}

/**
 * GET /api/categories/{subId}/products
 * Used when the user clicks a CHILD link (e.g. "Wooden Frames").
 * Returns only products in that specific sub-category.
 */
export async function getChildProducts(subId: number): Promise<FetchResult> {
  if (!subId || subId <= 0) {
    return { ok: false, products: [], error: 'Invalid sub-category id' };
  }
  try {
    const { data: payload } = await apiClient.get(
      `/api/categories/${subId}/products`
    );
    const rows    = parseRows(payload);
    const products = rows.map(r => normalise(r));
    return { ok: true, products };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load products';
    console.error(`[categoryProducts] GET /api/categories/${subId}/products →`, msg);
    return { ok: false, products: [], error: msg };
  }
}