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
import { createPortal }          from 'react-dom';
import { Link }                  from 'react-router-dom';
import { LuHeart, LuEye, LuX }  from 'react-icons/lu';
import { RiShoppingBag2Line }    from 'react-icons/ri';
import { GoStarFill }            from 'react-icons/go';
import { BsCheckLg }             from 'react-icons/bs';
import { addToCart }             from '../../api/cart.api';
import { isWishlisted, toggleWishlist } from '../../api/wishlist.api';
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
function GradText({ grad, children }: { grad: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: grad, WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

// ── Quick View Modal — FIX-1/FIX-2 ──────────────────────────────────────────
function QuickViewModal({
  item, wished, busy, cartAdded, onClose, onCart, onWish,
}: {
  item: Product; wished: boolean; busy: null | 'cart' | 'wishlist';
  cartAdded: boolean; onClose(): void; onCart(): void; onWish(): void;
}) {
  const discPct   = item.discount ?? 0;
  const salePrice = fmtRupee(item.price);
  const mrpFmt    = item.oldPrice ? fmtRupee(item.oldPrice) : '';
  const saving    = item.oldPrice
    ? fmtRupee(Math.round(parseNum(item.oldPrice) - parseNum(item.price)))
    : '';

  // Escape key + body scroll lock
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, fontFamily: FONT,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
          display: 'flex', flexDirection: 'row',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', border: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'background 0.15s',
          }}
          aria-label="Close"
        >
          <LuX size={15} color="#374151" />
        </button>

        {/* Left: Image */}
        <div style={{
          width: '46%', minWidth: '46%', position: 'relative',
          background: '#F9FAFB', overflow: 'hidden', flexShrink: 0,
        }}>
          <img
            src={item.image} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: '1/1' }}
          />
          {/* Tag badge */}
          {item.badge && (
            <span style={{
              position: 'absolute', top: 14, left: 14,
              background: item.badge.grad, color: '#fff',
              fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}>
              {item.badge.label}
            </span>
          )}
          {discPct > 0 && (
            <span style={{
              position: 'absolute', top: item.badge ? 44 : 14, left: 14,
              background: DISC_GRAD, color: '#fff',
              fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20,
            }}>
              -{discPct}% OFF
            </span>
          )}
        </div>

        {/* Right: Details */}
        <div style={{ flex: 1, padding: '36px 32px', display: 'flex', flexDirection: 'column' }}>

          {/* Brand label */}
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
          }}>
            INFINITY PRINT &amp; SIGNAGE
          </div>

          {/* Product name */}
          <h3 style={{ fontSize: 24, fontWeight: 400, color: '#111827', margin: '0 0 12px', lineHeight: 1.3, fontFamily: 'Georgia, serif' }}>
            {item.name}
          </h3>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 20 }}>
            {[1,2,3,4,5].map(s => (
              <GoStarFill key={s} size={14} color={s <= 4 ? '#F59E0B' : '#E5E7EB'} />
            ))}
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginLeft: 4 }}>4.0</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>(1,230 reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 30, fontWeight: 800,
              background: BRAND, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {salePrice}
            </span>
            {mrpFmt && (
              <span style={{ fontSize: 16, color: '#9CA3AF', textDecoration: 'line-through', fontWeight: 400 }}>
                {mrpFmt}
              </span>
            )}
            {discPct > 0 && (
              <span style={{
                background: DISC_GRAD, color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                -{discPct}%
              </span>
            )}
          </div>
          {saving && (
            <p style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, marginBottom: 20 }}>
              🎉 You save {saving} on this order
            </p>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: '4px 0 20px' }} />

          {/* Meta */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 4 }}>Category</div>
              <span style={{
                background: item.badge?.grad ?? BRAND, color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              }}>
                {item.tag}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 4 }}>SKU</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>INF-{String(item.id).padStart(5, '0')}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 4 }}>Availability</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                In Stock
              </div>
            </div>
          </div>

          {/* Qty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF' }}>Qty</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 24, overflow: 'hidden' }}>
              <button style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#374151' }}>−</button>
              <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#111827' }}>1</span>
              <button style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#374151' }}>+</button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button
              onClick={onCart}
              disabled={busy === 'cart'}
              style={{
                flex: 1, height: 48,
                background: cartAdded ? '#22C55E' : BRAND,
                border: 'none', borderRadius: 24, color: '#fff',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase', cursor: busy === 'cart' ? 'not-allowed' : 'pointer',
                opacity: busy === 'cart' ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s ease', fontFamily: FONT,
              }}
            >
              {cartAdded
                ? <><BsCheckLg size={14} /> Added to Cart</>
                : <><RiShoppingBag2Line size={16} /> Add to Cart</>
              }
            </button>
            <button
              onClick={onWish}
              disabled={busy === 'wishlist'}
              style={{
                width: 48, height: 48,
                border: `1.5px solid ${wished ? '#E8314A' : '#E5E7EB'}`,
                borderRadius: '50%', background: wished ? '#FFF0F0' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: busy === 'wishlist' ? 'not-allowed' : 'pointer',
                opacity: busy === 'wishlist' ? 0.6 : 1, transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <LuHeart size={18} color={wished ? '#E8314A' : '#9CA3AF'} fill={wished ? '#E8314A' : 'none'} />
            </button>
          </div>

          {/* View full details */}
          <Link
            to={`/product-details/${item.id}`}
            onClick={onClose}
            style={{
              textAlign: 'center', fontSize: 12, color: '#9CA3AF',
              textDecoration: 'underline', textUnderlineOffset: 3,
              transition: 'color 0.15s', fontFamily: FONT,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = BRAND_SOLID)}
            onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
          >
            View full product details →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ item, tall }: { item: Product; tall?: boolean }) {

  // ── STATE — unchanged API logic ───────────────────────────────────────────
  const [wished,    setWished]    = useState(false);
  const [busy,      setBusy]      = useState<null | 'cart' | 'wishlist'>(null);
  const [notice,    setNotice]    = useState<string | null>(null);
  const [cartAdded, setCartAdded] = useState(false);
  const [qvOpen,    setQvOpen]    = useState(false);   // FIX-1: QV state

  // ── Wishlist init — unchanged ──────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    isWishlisted(item.id).then(v => { if (active) setWished(v); }).catch(() => {});
    return () => { active = false; };
  }, [item.id]);

  // ── Wishlist toggle — unchanged ────────────────────────────────────────────
  const onWishlist = async () => {
    if (busy) return;
    setBusy('wishlist'); setNotice(null);
    try {
      const next = await toggleWishlist(item.id);
      const inWL = next.productIds.includes(item.id);
      setWished(inWL);
      setNotice(inWL ? '♥ Added to wishlist' : 'Removed from wishlist');
    } catch { setNotice('Wishlist action failed'); }
    finally { setBusy(null); }
  };

  // ── Add to cart — unchanged ────────────────────────────────────────────────
  const onAddToCart = async () => {
    if (busy) return;
    setBusy('cart'); setNotice(null);
    try {
      await addToCart(item.id, 1);
      setCartAdded(true);
      setNotice('✓ Added to cart');
      setTimeout(() => setCartAdded(false), 1800);
    } catch { setNotice('Add to cart failed'); }
    finally { setBusy(null); }
  };

  const discPct   = item.discount ?? 0;
  const salePrice = fmtRupee(item.price);
  const mrpFmt    = item.oldPrice ? fmtRupee(item.oldPrice) : '';
  const saving    = item.oldPrice
    ? fmtRupee(Math.round(parseNum(item.oldPrice) - parseNum(item.price)))
    : '';

  return (
    <>
      {/* FIX-2: QV modal via createPortal */}
      {qvOpen && (
        <QuickViewModal
          item={item} wished={wished} busy={busy} cartAdded={cartAdded}
          onClose={() => setQvOpen(false)}
          onCart={onAddToCart}
          onWish={onWishlist}
        />
      )}

      <div className="group flex flex-col">

        {/* ── Image wrapper ── */}
        <div
          className={`relative overflow-hidden rounded-2xl ${tall ? 'flex-1' : ''}`}
          style={{ boxShadow: '0 4px 24px rgba(91,79,190,0.08)', minHeight: tall ? 200 : 'auto' }}
        >
          {/* Badge */}
          {item.badge && (
            <div
              className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-widest"
              style={{ background: item.badge.grad, boxShadow: '0 2px 8px rgba(0,0,0,0.18)', fontFamily: FONT }}
            >
              {item.badge.label}
            </div>
          )}

          {/* Discount pill */}
          {discPct > 0 && (
            <div
              className="absolute z-20 px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-widest"
              style={{ background: DISC_GRAD, top: item.badge ? 40 : 12, left: 12, fontFamily: FONT }}
            >
              -{discPct}%
            </div>
          )}

          {/* Image */}
          <Link to={`/product-details/${item.id}`}>
            <img
              className={`w-full ${tall ? 'h-full' : 'sm:max-h-[340px]'} object-cover transform group-hover:scale-105 duration-500 transition-transform`}
              src={item.image} alt={item.name}
            />
            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"
              style={{ background: BRAND }}
            />
          </Link>

          {/* ── Hover action strip — RIGHT SIDE ── */}
          <div
            className="absolute z-20 top-1/2 right-4 transform -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 flex flex-col items-end gap-2"
            style={{ pointerEvents: 'none' }}
          >
            {/* Wrapper restores pointer events on hover for buttons */}
            <div className="flex flex-col items-end gap-2" style={{ pointerEvents: 'auto' }}>

              {/* Wishlist */}
              <button
                type="button"
                onClick={onWishlist}
                disabled={busy === 'wishlist'}
                className={`flex items-center gap-2 px-4 py-[9px] text-[12px] rounded-full shadow-lg font-semibold transition-all ${busy === 'wishlist' ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
                style={{
                  background: wished ? BRAND : 'rgba(255,255,255,0.96)',
                  color: wished ? '#fff' : '#374151',
                  fontFamily: FONT, border: 'none', cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
                }}
              >
                <LuHeart size={14} color={wished ? '#fff' : BRAND_SOLID} fill={wished ? '#fff' : 'none'} />
                <span style={wished ? {} : {
                  background: BRAND, WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {wished ? 'Wishlisted' : 'Wishlist'}
                </span>
              </button>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={onAddToCart}
                disabled={busy === 'cart'}
                className={`flex items-center gap-2 px-4 py-[9px] text-[12px] rounded-full shadow-lg text-white font-semibold transition-all ${busy === 'cart' ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
                style={{
                  background: cartAdded ? '#22C55E' : CTA,
                  fontFamily: FONT, border: 'none', cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(37,99,235,0.25)',
                }}
              >
                {cartAdded
                  ? <><BsCheckLg size={13} /> Added!</>
                  : <><RiShoppingBag2Line size={14} /> Add to Cart</>
                }
              </button>

              {/* FIX-1: Quick View — now has onClick → setQvOpen(true) */}
              <button
                type="button"
                onClick={() => setQvOpen(true)}
                className="quick-view flex items-center gap-2 px-4 py-[9px] text-[12px] rounded-full shadow-lg font-semibold transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.96)', border: 'none',
                  cursor: 'pointer', fontFamily: FONT,
                  boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                }}
              >
                <LuEye size={14} color="#E8314A" />
                <span style={{
                  background: BRAND, WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Quick View
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* ── Info below card ── */}
        <div className="pt-4 flex flex-col gap-2">

          {/* Price row — FIX-4: ₹ */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <GradText grad={BRAND}>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{salePrice}</span>
            </GradText>
            {mrpFmt && (
              <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through', fontWeight: 400 }}>
                {mrpFmt}
              </span>
            )}
            {discPct > 0 && (
              <span style={{
                background: DISC_GRAD, color: '#fff',
                fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                -{discPct}%
              </span>
            )}
          </div>

          {/* FIX-5: Savings line */}
          {saving && (
            <p style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, margin: 0, fontFamily: FONT }}>
              🎉 You save {saving}
            </p>
          )}

          {/* Product name */}
          <h5 style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4, margin: 0, fontFamily: FONT }}>
            <Link
              to={`/product-details/${item.id}`}
              style={{ color: '#374151', textDecoration: 'none', transition: 'color 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.color = BRAND_SOLID)}
              onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
            >
              {item.name}
            </Link>
          </h5>

          {/* Notice */}
          {notice && (
            <p style={{
              fontSize: 11, fontWeight: 600, margin: 0,
              background: notice.includes('fail') ? '#E8314A' : CTA,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', display: 'inline-block', fontFamily: FONT,
            }}>
              {notice}
            </p>
          )}

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[...Array(4)].map((_, i) => (
              <GoStarFill key={i} size={13} color="#F59E0B" />
            ))}
            <GoStarFill size={13} color="#D1D5DB" />
            <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4, fontFamily: FONT }}>(1,230)</span>
          </div>

        </div>
      </div>
    </>
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
          <div style={{ width: 48, height: 3, borderRadius: 2, margin: '10px auto 0', background: BRAND }} />
          <p className="mt-4 text-gray-500 text-sm md:text-base" style={{ fontFamily: FONT }}>
            Discover our handpicked selection of standout products.
          </p>
        </div>

        {/* Products Grid — layout unchanged */}
        <div className="max-w-[1720px] mx-auto flex gap-5 sm:gap-8 flex-col lg:flex-row">
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:max-w-[766px] w-full">
            {products.slice(0, 4).map(item => (
              <ProductCard item={item} key={item.id} />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:max-w-[925px] w-full">
            {products.slice(4, 6).map(item => (
              <ProductCard item={item} key={item.id} tall />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}