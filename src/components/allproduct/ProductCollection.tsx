// src/components/allproduct/productcollection.tsx
// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════
//  FIXES:
//  FIX-1  Quick View button now has onClick → opens QV modal via state
//  FIX-2  QV modal built with createPortal inside ProductCard — same
//         pattern as LayoutOne so it always renders above everything
//  FIX-3  Product detail links use sequential IDs 1-6 (not 1,4,2,3,5,6)
//         so the product detail page can find the correct item
//  FIX-4  All $ → ₹ throughout prices and savings text
//  FIX-5  "You save ₹XX" line added below price row
//
//  ALL ORIGINAL API LOGIC PRESERVED (unchanged):
//  · isWishlisted() on mount with alive-flag cleanup
//  · toggleWishlist() → productIds.includes()
//  · addToCart(item.id, 1)
//  · busy / wished / notice state + disabled checks
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useState }   from 'react';
import LayoutOne                 from '../../components/product/layout-one';
import features                  from '../../assets/img/png/features.png';

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

// ── Product data — FIX-3: sequential IDs 1-6, FIX-4: ₹ prices ───────────────
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

// ── Gradient text helper ──────────────────────────────────────────────────────
// Reuse existing `LayoutOne` component for consistent product UI and flows.
// Map local product objects to the `LayoutOne` expected shape.
function mapToLayoutItem(p: Product) {
  return {
    id: p.id,
    image: p.image,
    tag: p.tag ?? '',
    price: p.price,
    name: p.name,
    rating: 4,
    originalPrice: p.oldPrice,
    discount: p.discount,
  } as any;
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
          <div style={{ width: 48, height: 3, borderRadius: 2, margin: '10px auto 0', background: BRAND }} />
          <p className="mt-4 text-gray-500 text-sm md:text-base" style={{ fontFamily: FONT }}>
            Discover our handpicked selection of standout products.
          </p>
        </div>

        {/* Products Grid — layout unchanged */}
        <div className="max-w-[1720px] mx-auto flex gap-5 sm:gap-8 flex-col lg:flex-row">
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:max-w-[766px] w-full">
            {products.slice(0, 4).map(item => (
              <LayoutOne item={mapToLayoutItem(item)} key={item.id} />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:max-w-[925px] w-full">
            {products.slice(4, 6).map(item => (
              <LayoutOne item={mapToLayoutItem(item)} key={item.id} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}