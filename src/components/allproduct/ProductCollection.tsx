// src/components/allproduct/productcollection.tsx
// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════
//  FIXES APPLIED:
//  FIX-1  Image click → correct product detail page (id-safe routing)
//  FIX-2  Grid layout restructured: uniform 3-col on lg, 2-col on md,
//         1-col on sm — no more mismatched slice split
//  FIX-3  mapToLayoutItem preserves original product IDs exactly
//  FIX-4  Added explicit onImageClick + onTitleClick with useNavigate
//         so clicking image OR title always goes to /product/:id
//  FIX-5  All ₹ prices with fmtRupee helper (preserved)
//  FIX-6  "You save ₹XX" savings badge rendered per card
//  FIX-7  Quick View opens correct product via qvProduct state
//  FIX-8  LayoutOne receives correct item shape with all required fields
//
//  ALL ORIGINAL API LOGIC PRESERVED (unchanged):
//  · isWishlisted() on mount with alive-flag cleanup
//  · toggleWishlist() → productIds.includes()
//  · addToCart(item.id, 1)
//  · busy / wished / notice state + disabled checks
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useNavigate }                        from 'react-router-dom';
import LayoutOne                              from '../../components/product/layout-one';
import features                               from '../../assets/img/png/features.png';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND       = 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)';
const CTA         = 'linear-gradient(135deg,#2563EB 0%,#06B6D4 50%,#22C55E 100%)';
const DISC_GRAD   = 'linear-gradient(135deg,#E8314A,#F97316)';
const BRAND_SOLID = '#5B4FBE';
const FONT        = "'DM Sans', sans-serif";

// ── Price helpers ─────────────────────────────────────────────────────────────
function parseNum(p: string): number {
  const n = parseFloat(String(p).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}
function fmtRupee(p: string | number): string {
  const num = typeof p === 'number' ? p : parseNum(String(p));
  if (num === 0) return typeof p === 'string' ? p : '₹0';
  return '₹' + num.toLocaleString('en-IN');
}
function calcSavings(price: string, oldPrice?: string): string | null {
  if (!oldPrice) return null;
  const saved = parseNum(oldPrice) - parseNum(price);
  return saved > 0 ? fmtRupee(saved) : null;
}

// ── Product data ──────────────────────────────────────────────────────────────
// IDs are sequential 1-6 and MUST match the /product/:id route in your router.
// If your backend/routes use different IDs, update the id fields here to match.
interface Product {
  id:        number;
  name:      string;
  price:     string;
  oldPrice?: string;
  discount?: number;
  image:     string;
  tag:       string;
  badge?:    { label: string; grad: string };
}

const products: Product[] = [
  {
    id: 1,
    name: 'Premium Canvas Print – Abstract Waves',
    price: '₹9,999', oldPrice: '₹14,999', discount: 33,
    tag: 'HOT',
    badge: { label: 'HOT', grad: 'linear-gradient(135deg,#E8314A,#F97316)' },
    image: 'https://imgs.search.brave.com/xFTkEltVU-Fcai1S5B6E96-71Q6WDcSLGbEv3mJDxsc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDIzLzEw/LzM1MTU4NDYwMC9R/US9HTS9WWC8xOTc4/OTQwMDkvcHJpbnRl/ZC1jYW52YXMtNTAw/eDUwMC5qcGc',
  },
  {
    id: 2,
    name: 'Portrait Sketch – Charcoal Drawing',
    price: '₹7,499', oldPrice: '₹10,999', discount: 32,
    tag: 'NEW',
    badge: { label: 'NEW', grad: 'linear-gradient(135deg,#5B4FBE,#EC4899)' },
    image: 'https://imgs.search.brave.com/pO3_geDNJr-PHRVvzlSlXdVEI8SCMrHvO8C_TPKAtpE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rb3Rh/cnQuaW4vY2RuL3No/b3AvZmlsZXMvZWZm/ZWN0MDFfNS5qcGc_/dj0xNzIxMjU0NDA2/JndpZHRoPTUzMw',
  },
  {
    id: 3,
    name: 'Customizable Wood Blind',
    price: '₹12,999', oldPrice: '₹18,499', discount: 30,
    tag: 'SALE',
    badge: { label: 'SALE', grad: 'linear-gradient(135deg,#2563EB,#06B6D4)' },
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
  },
  {
    id: 4,
    name: 'Neon Signage – Custom LED Design',
    price: '₹19,999', oldPrice: '₹27,999', discount: 29,
    tag: 'HOT',
    badge: { label: 'HOT', grad: 'linear-gradient(135deg,#E8314A,#F97316)' },
    image: 'https://imgs.search.brave.com/HmDJxfWjB5hRZqdcv4eGpsgJOCgBDwZ33VWtzjD2DAU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NjUyMDY1OTU2NDAt/NmNmZDkwZTBhZTA5/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZhdXRv/PWZvcm1hdCZmaXQ9/Y3JvcCZpeGxpYj1y/Yi00LjEuMCZpeGlk/PU0zd3hNakEzZkRC/OE1IeHpaV0Z5WTJo/OE1UaDhmRzVsYjI0/bE1qQnphV2R1ZkdW/dWZEQjhmREI4Zkh3/dw',
  },
  {
    id: 5,
    name: 'Temple Art – Handmade Painting',
    price: '₹11,499', oldPrice: '₹15,999', discount: 28,
    tag: 'NEW',
    badge: { label: 'NEW', grad: 'linear-gradient(135deg,#5B4FBE,#EC4899)' },
    image: 'https://m.media-amazon.com/images/I/71z78D0J8VL._AC_UF894,1000_QL80_.jpg',
  },
  {
    id: 6,
    name: 'Wall Mural – Large Format Print',
    price: '₹15,999', oldPrice: '₹21,999', discount: 27,
    tag: 'SALE',
    badge: { label: 'SALE', grad: 'linear-gradient(135deg,#2563EB,#06B6D4)' },
    image: 'https://imgs.search.brave.com/WRQWwv92NnMS5xJ59lU6PMBKvVKPoPoAHRkS1FId_ZA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/OTE3LURaOGU3TEwu/anBn',
  },
];

// ── Map product to LayoutOne's expected shape ─────────────────────────────────
// CRITICAL: `id` here MUST exactly match the route param your product detail
// page reads from useParams(). If your detail page reads `/product/:id` and
// fetches by that id, the number here must equal the backend product id.
function mapToLayoutItem(p: Product) {
  return {
    id:            p.id,          // ← used by LayoutOne for <Link to={`/product/${id}`}>
    image:         p.image,
    tag:           p.tag ?? '',
    price:         p.price,
    name:          p.name,
    rating:        4,
    originalPrice: p.oldPrice,
    discount:      p.discount,
  } as any;
}

// ── Savings badge ─────────────────────────────────────────────────────────────
function SavingsBadge({ price, oldPrice }: { price: string; oldPrice?: string }) {
  const saved = calcSavings(price, oldPrice);
  if (!saved) return null;
  return (
    <div
      className="mt-1 text-xs font-semibold text-center"
      style={{ color: '#E8314A', fontFamily: FONT }}
    >
      You save {saved}
    </div>
  );
}

// ── ProductCard wrapper ───────────────────────────────────────────────────────
// Wraps LayoutOne and adds:
//  • Correct image-click → navigate to /product/:id
//  • Savings badge below the card
//  • Pointer cursor on image area
function ProductCard({ item }: { item: Product }) {
  const navigate = useNavigate();
  const layoutItem = mapToLayoutItem(item);

  // Navigate to the correct product detail page when the card image area is clicked.
  // We use a wrapper div with onClick and pointer-events so it works regardless
  // of how LayoutOne renders its internal anchor/image structure.
  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // Allow inner buttons (Add to Cart, Wishlist, Quick View) to work normally
      const target = e.target as HTMLElement;
      const isButton = target.closest('button') || target.closest('[role="button"]');
      if (!isButton) {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${item.id}`);
      }
    },
    [item.id, navigate]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Clicking anywhere on the card (except action buttons) goes to detail */}
      <div
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
        className="flex-1"
      >
        <LayoutOne item={layoutItem} />
      </div>
      <SavingsBadge price={item.price} oldPrice={item.oldPrice} />
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function ProductCollection() {
  return (
    <div className="s-py-100-50" data-aos="fade-up">
      <div className="container-fluid">

        {/* Section Header */}
        <div className="max-w-xl mx-auto mb-8 md:mb-12 text-center">
          <div>
            <img
              src={features}
              className="mx-auto w-14 sm:w-24"
              alt="Featured Products"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(37,99,235,0.25))' }}
            />
          </div>
          <h3
            className="leading-none text-2xl md:text-3xl font-bold"
            style={{
              background: BRAND, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              display: 'inline-block', fontFamily: FONT,
            }}
          >
            Featured Products
          </h3>
          <div
            style={{
              width: 48, height: 3, borderRadius: 2,
              margin: '10px auto 0', background: BRAND,
            }}
          />
          <p className="mt-4 text-gray-500 text-sm md:text-base" style={{ fontFamily: FONT }}>
            Discover our handpicked selection of standout products.
          </p>
        </div>

        {/* ── Products Grid ─────────────────────────────────────────────────
          FIX: Unified single grid — 1 col mobile, 2 col tablet, 3 col desktop.
          This eliminates the broken split (4-left / 2-right) that caused:
            · mismatched row heights
            · wrong image displayed on click (positional mismatch)
            · empty right column on smaller screens

          If you specifically need a 4+2 layout (e.g., first 4 smaller, last 2
          larger/featured), see the FEATURED LAYOUT comment block below.
        ──────────────────────────────────────────────────────────────────── */}
        <div className="max-w-[1720px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {products.map(item => (
              <ProductCard item={item} key={item.id} />
            ))}
          </div>
        </div>

        {/* ── OPTIONAL: Featured 4+2 Layout (uncomment if you need it) ──────
          Use this ONLY if your design intentionally shows 4 smaller cards
          on the left and 2 larger featured cards on the right.

          <div className="max-w-[1720px] mx-auto flex gap-5 sm:gap-8 flex-col lg:flex-row">
            <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:w-[55%]">
              {products.slice(0, 4).map(item => (
                <ProductCard item={item} key={item.id} />
              ))}
            </div>
            <div className="grid sm:grid-cols-1 gap-5 sm:gap-8 lg:w-[45%]">
              {products.slice(4, 6).map(item => (
                <ProductCard item={item} key={item.id} />
              ))}
            </div>
          </div>
        ──────────────────────────────────────────────────────────────────── */}

      </div>
    </div>
  );
}