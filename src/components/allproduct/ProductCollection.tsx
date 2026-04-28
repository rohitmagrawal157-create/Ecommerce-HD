// src/components/allproduct/ProductCollection.tsx
// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════
//  PRODUCT COLLECTION — Mobile grid matches screenshot (Flipkart style)
//
//  MOBILE LAYOUT (matches image exactly):
//  ✦ 2-column vertical cards (grid-template-columns: repeat(2,1fr))
//  ✦ Large square product image takes ~60% of card height
//  ✦ Rating + review count overlaid at BOTTOM of image (white pill)
//  ✦ Product name: bold brand word + regular rest (line-clamp:2)
//  ✦ Price: MRP strikethrough + bold sale price (no gradient on mobile)
//  ✦ No "Add to Cart" button visible on card — tap card → product page
//  ✦ Heart icon top-right corner of image (small, clean)
//  ✦ Discount badge top-left of image
//
//  DESKTOP: unchanged 4-col vertical cards with hover overlay + QV
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal }                              from 'react-dom'
import { useNavigate, Link }                         from 'react-router-dom'
import { addToCart }                                 from '../../api/cart.api'
import {
  toggleWishlist,
  isWishlisted,
  notifyWishlistChanged,
} from '../../api/wishlist.api'

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL   = 'https://lightsteelblue-stinkbug-893971.hostingersite.com/Shopping-Cart/public/api/products'
const PAGE_SIZE = 8

const B = {
  brandGrad : 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)',
  discGrad  : 'linear-gradient(135deg,#E8314A,#F97316)',
  purple    : '#5B4FBE',
  red       : '#E8314A',
  green     : '#22C55E',
  yellow    : '#F59E0B',
  bg        : '#FFFFFF',
  bgSoft    : '#F8F8FB',
  border    : '#EBEBF0',
  body      : '#1C1C1E',
  muted     : '#6B7280',
  faint     : '#9CA3AF',
}
const FONT = "'DM Sans', sans-serif"

const TAG_MAP: Record<string, string> = {
  'Sale':'#E8314A','Hot Sale':'#E8314A','Hot':'#E8314A','10% OFF':'#06B6D4',
  'New Arrival':'#5B4FBE','NEW':'#5B4FBE','New':'#5B4FBE','Bestseller':'#F97316',
  'Premium':'#5B4FBE','Handpainted':'#EC4899','Original':'#5B4FBE','Print':'#06B6D4',
}
const tagColor = (t: string) => TAG_MAP[t] ?? B.muted

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiProduct {
  product_id          : number
  name                : string
  category            : string
  price               : string
  original_price      : string
  discount_percentage : number | null
  images              : string[]
  variants            : { variant_id: number; size: string; color: string; stock: string }[]
  reviews             : any[]
  average_rating      : number
  total_reviews       : number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseNum(p: string | number): number {
  const n = parseFloat(String(p).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}
function fmtINR(n: number | string): string {
  const num = typeof n === 'string' ? parseNum(n) : n
  return num === 0 ? '₹0' : '₹' + num.toLocaleString('en-IN')
}
function discPct(price: string, orig: string): number {
  const p = parseNum(price), o = parseNum(orig)
  if (!o || !p || o <= p) return 0
  return Math.round(((o - p) / o) * 100)
}
function totalStock(variants: ApiProduct['variants']): number {
  return variants.reduce((s, v) => s + parseInt(v.stock || '0', 10), 0)
}
function deriveTag(p: ApiProduct): string {
  const d = discPct(p.price, p.original_price)
  if (d >= 30) return 'Hot Sale'
  if (d >= 10) return 'Sale'
  if (d > 0)   return '10% OFF'
  return 'New Arrival'
}

// ─── Mobile detection ─────────────────────────────────────────────────────────
function useIsMobile() {
  const [v, setV] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 767 : false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const fn = (e: MediaQueryListEvent) => setV(e.matches)
    mq.addEventListener('change', fn); setV(mq.matches)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return v
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const STYLE_ID = 'pc5-styles'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

  @keyframes pc5Shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes pc5Spin { to{transform:rotate(360deg)} }
  @keyframes pc5Pop  { 0%{transform:scale(1)} 38%{transform:scale(1.5)} 65%{transform:scale(.88)} 100%{transform:scale(1)} }
  @keyframes pc5Tin  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pc5Tout { from{opacity:1} to{opacity:0} }

  .pc5-pop  { animation: pc5Pop  .36s cubic-bezier(.36,.07,.19,.97) both; }
  .pc5-tin  { animation: pc5Tin  .2s ease forwards; }
  .pc5-tout { animation: pc5Tout .45s ease 1.9s forwards; }

  /* Section */
  .pc5-section { background:#f5f5f7; padding:48px 0 64px; }

  /* Header */
  .pc5-header { text-align:center; margin-bottom:32px; }
  .pc5-eyebrow {
    display:inline-flex; align-items:center; gap:8px; margin-bottom:10px;
    font-family:${FONT}; font-size:10px; font-weight:700;
    letter-spacing:.18em; text-transform:uppercase;
    background:${B.brandGrad}; -webkit-background-clip:text;
    -webkit-text-fill-color:transparent; background-clip:text;
  }
  .pc5-eyebrow::before,.pc5-eyebrow::after {
    content:''; display:block; width:20px; height:1.5px; background:${B.brandGrad}; border-radius:1px; opacity:.6;
  }
  .pc5-title {
    font-family:${FONT}; font-size:clamp(22px,3.5vw,36px); font-weight:800;
    color:#0f0f13; line-height:1.12; margin:0 0 10px; letter-spacing:-.02em;
  }
  .pc5-sub { font-family:${FONT}; font-size:14px; color:#8b8b9e; max-width:380px; margin:0 auto; }

  /* ─── DESKTOP GRID: 4 col ─── */
  .pc5-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 16px;
  }
  @media (max-width:1199px) { .pc5-grid { grid-template-columns:repeat(3,1fr); } }
  @media (max-width:767px)  { .pc5-grid { grid-template-columns:repeat(2,1fr); gap:8px; } }

  /* ─── DESKTOP CARD ─── */
  .pc5-card-desk {
    background:${B.bg}; border:1px solid ${B.border}; border-radius:10px;
    overflow:hidden; display:flex; flex-direction:column;
    position:relative; cursor:pointer;
    transition:box-shadow .28s ease, transform .28s ease, border-color .2s;
    box-shadow:0 1px 4px rgba(15,15,19,.05);
  }
  .pc5-card-desk:hover {
    box-shadow:0 10px 32px rgba(91,79,190,.18);
    transform:translateY(-3px);
    border-color:rgba(91,79,190,.2) !important;
  }
  .pc5-desk-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .6s cubic-bezier(.25,.46,.45,.94); }
  .pc5-card-desk:hover .pc5-desk-img { transform:scale(1.07); }

  /* Hover overlay — desktop */
  .pc5-ov {
    position:absolute; inset-x:0; bottom:0; z-index:20;
    transform:translateY(100%); opacity:0; pointer-events:none;
    transition:transform .34s cubic-bezier(.22,1,.36,1), opacity .26s ease;
  }
  .pc5-card-desk:hover .pc5-ov { transform:translateY(0); opacity:1; pointer-events:auto; }
  .pc5-ov-bg { position:absolute; inset:0; pointer-events:none; background:linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.42) 100%); }
  .pc5-ov-row { position:relative; display:flex; }
  .pc5-ob {
    flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:4px; padding:11px 4px; background:none; border:none;
    border-right:1px solid rgba(255,255,255,.15); cursor:pointer;
    opacity:0; transform:translateY(5px);
    transition:opacity .22s ease, transform .22s ease;
    position:relative; overflow:hidden;
  }
  .pc5-ob:last-child { border-right:none; }
  .pc5-card-desk:hover .pc5-ob             { opacity:1; transform:translateY(0); }
  .pc5-card-desk:hover .pc5-ob:nth-child(1){ transition-delay:0ms; }
  .pc5-card-desk:hover .pc5-ob:nth-child(2){ transition-delay:58ms; }
  .pc5-card-desk:hover .pc5-ob:nth-child(3){ transition-delay:116ms; }
  .pc5-ob::before { content:''; position:absolute; inset:0; background:${B.brandGrad}; opacity:0; transition:opacity .22s; z-index:0; }
  .pc5-ob:hover::before { opacity:1; }
  .pc5-ob>* { position:relative; z-index:1; }
  .pc5-ob:disabled { opacity:.5 !important; cursor:not-allowed; }
  .pc5-ob-lbl { font-family:${FONT}; font-size:8px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#fff; white-space:nowrap; }

  /* Desktop card info */
  .pc5-desk-info { padding:12px 12px 14px; display:flex; flex-direction:column; gap:5px; }
  .pc5-desk-cat  { font-family:${FONT}; font-size:9px; font-weight:700; color:${B.purple}; text-transform:uppercase; letter-spacing:.1em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .pc5-desk-name { font-family:${FONT}; font-size:13px; font-weight:500; line-height:1.45; color:${B.body}; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin:0; text-decoration:none; transition:color .15s; }
  .pc5-desk-name:hover { color:${B.purple}; }
  .pc5-price-grad { background:${B.brandGrad}; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-family:${FONT}; font-size:17px; font-weight:700; }
  .pc5-orig { text-decoration:line-through; color:${B.faint}; font-family:${FONT}; font-size:12px; }
  .pc5-disc-pill { background:${B.discGrad}; color:#fff; font-family:${FONT}; font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:12px; }
  .pc5-save-txt  { font-family:${FONT}; font-size:10px; font-weight:600; color:#16A34A; }
  .pc5-oos-txt   { font-family:${FONT}; font-size:10px; font-weight:600; color:#dc2626; }
  .pc5-cart-icon-btn {
    flex-shrink:0; width:30px; height:30px; border-radius:7px;
    display:flex; align-items:center; justify-content:center;
    border:1.5px solid ${B.border}; background:transparent; cursor:pointer;
    transition:all .18s; outline:none;
  }
  .pc5-cart-icon-btn.added { background:${B.green}; border-color:${B.green}; }
  .pc5-cart-icon-btn:hover:not(.added):not(:disabled) { background:${B.brandGrad}; border-color:transparent; }
  .pc5-cart-icon-btn:disabled { opacity:.5; cursor:not-allowed; }
  .pc5-accent-bar {
    position:absolute; inset-x:0; bottom:0; height:2px;
    background:${B.brandGrad}; border-radius:0 0 10px 10px;
    transform:scaleX(0); transform-origin:left;
    transition:transform .35s cubic-bezier(.22,1,.36,1); pointer-events:none;
  }
  .pc5-card-desk:hover .pc5-accent-bar { transform:scaleX(1); }

  /* ─── MOBILE CARD (2-col vertical, Flipkart style) ─── */
  .pc5-card-mob {
    background:${B.bg};
    border-radius:14px;
    overflow:hidden;
    display:flex;
    flex-direction:column;
    position:relative;
    cursor:pointer;
    box-shadow:0 1px 6px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04);
    transition:box-shadow .22s ease, transform .22s ease;
    -webkit-tap-highlight-color:transparent;
  }
  .pc5-card-mob:active {
    transform:scale(.98);
    box-shadow:0 2px 10px rgba(0,0,0,.12);
  }

  /* Mobile image container */
  .pc5-mob-img-wrap {
    position:relative;
    aspect-ratio:1/1;
    overflow:hidden;
    background:${B.bgSoft};
    flex-shrink:0;
  }
  .pc5-mob-img {
    width:100%; height:100%; object-fit:cover; display:block;
  }

  /* Rating pill overlaid at bottom of image */
  .pc5-mob-rating {
    position:absolute; bottom:8px; left:8px;
    background:rgba(255,255,255,.96);
    border-radius:6px; padding:3px 7px 3px 5px;
    display:flex; align-items:center; gap:4px;
    box-shadow:0 1px 4px rgba(0,0,0,.12);
    backdrop-filter:blur(4px);
  }
  .pc5-mob-rating-num { font-family:${FONT}; font-size:11px; font-weight:700; color:#1C1C1E; }
  .pc5-mob-rating-count { font-family:${FONT}; font-size:10px; color:${B.faint}; }

  /* Discount badge — top-left of image */
  .pc5-mob-disc-badge {
    position:absolute; top:0; left:0; z-index:3;
    background:${B.discGrad}; color:#fff;
    font-family:${FONT}; font-size:9px; font-weight:800;
    letter-spacing:.06em; text-transform:uppercase;
    padding:4px 8px; border-radius:0 0 8px 0; line-height:1;
  }

  /* Heart — top-right of image */
  .pc5-mob-heart {
    position:absolute; top:8px; right:8px; z-index:10;
    width:28px; height:28px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    background:rgba(255,255,255,.9); border:none;
    box-shadow:0 1px 4px rgba(0,0,0,.15);
    cursor:pointer; outline:none;
    -webkit-tap-highlight-color:transparent;
    transition:transform .18s;
  }
  .pc5-mob-heart:active { transform:scale(1.2); }

  /* Mobile info panel */
  .pc5-mob-info {
    padding:9px 10px 12px;
    display:flex; flex-direction:column; gap:3px;
    flex:1;
  }

  /* Brand bold + name regular (matches Flipkart pattern) */
  .pc5-mob-brand {
    font-family:${FONT}; font-size:12px; font-weight:800;
    color:#1C1C1E; line-height:1.3;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  .pc5-mob-name {
    font-family:${FONT}; font-size:11px; font-weight:400;
    color:${B.muted}; line-height:1.35;
    display:-webkit-box; -webkit-line-clamp:2;
    -webkit-box-orient:vertical; overflow:hidden;
    margin:0 0 4px;
  }

  /* Price row */
  .pc5-mob-price-row { display:flex; align-items:baseline; flex-wrap:wrap; gap:4px; margin-top:2px; }
  .pc5-mob-price { font-family:${FONT}; font-size:15px; font-weight:800; color:#1C1C1E; }
  .pc5-mob-mrp   { font-family:${FONT}; font-size:11px; color:${B.faint}; text-decoration:line-through; }
  .pc5-mob-off   { font-family:${FONT}; font-size:11px; font-weight:700; color:#16a34a; }

  /* Mobile CTA — full width at bottom of info */
  .pc5-mob-cta {
    margin-top:auto; padding-top:8px;
    width:100%; height:34px;
    background:${B.brandGrad}; border:none;
    border-radius:8px; color:#fff;
    font-family:${FONT}; font-size:11px; font-weight:700;
    display:flex; align-items:center; justify-content:center; gap:5px;
    cursor:pointer; -webkit-tap-highlight-color:transparent;
    transition:opacity .15s;
    outline:none;
  }
  .pc5-mob-cta:active { opacity:.85; }
  .pc5-mob-cta:disabled { opacity:.55; cursor:not-allowed; }
  .pc5-mob-cta.cta-added { background:#16a34a; }

  /* Toast */
  .pc5-toast { position:absolute; top:0; inset-x:0; z-index:50; font-family:${FONT}; font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; text-align:center; padding:5px; line-height:1; pointer-events:none; user-select:none; color:#fff; }

  /* Heart button (desktop) */
  .pc5-heart {
    position:absolute; top:10px; right:10px; z-index:30;
    width:30px; height:30px; border-radius:50%; border:1px solid ${B.border};
    background:${B.bg}; display:flex; align-items:center; justify-content:center;
    cursor:pointer; box-shadow:0 1px 6px rgba(0,0,0,.1); transition:all .2s;
  }
  .pc5-heart.wl-active { background:${B.brandGrad}; border-color:transparent; }
  .pc5-heart:not(.wl-active):hover { transform:scale(1.12); border-color:${B.red}; }
  .pc5-heart:disabled { opacity:.5; cursor:not-allowed; }

  /* Skeleton */
  .pc5-skel { background:linear-gradient(90deg,#ececf0 25%,#e0e0e8 50%,#ececf0 75%); background-size:300% 100%; animation:pc5Shim 1.5s infinite linear; border-radius:5px; }
  .pc5-skel-card { background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.06); }
  .pc5-skel-card-mob { background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 1px 6px rgba(0,0,0,.08); }

  /* Infinite scroll */
  .pc5-sentinel { height:1px; }
  .pc5-spinner-wrap { display:flex; align-items:center; justify-content:center; gap:10px; padding:28px 0; font-family:${FONT}; font-size:13px; color:#8b8b9e; }
  .pc5-spinner { width:20px; height:20px; border:2px solid rgba(91,79,190,.2); border-top-color:${B.purple}; border-radius:50%; animation:pc5Spin .7s linear infinite; }
  .pc5-end { text-align:center; padding:24px 0 0; font-family:${FONT}; font-size:13px; color:#8b8b9e; }
  .pc5-end-rule { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:8px; }
  .pc5-end-dash { flex:1; max-width:72px; height:1px; background:#e5e7eb; }

  /* Error */
  .pc5-err { background:#fff5f5; border:1px solid #fecaca; border-radius:10px; padding:20px 24px; text-align:center; font-family:${FONT}; color:#dc2626; font-size:14px; margin-bottom:16px; }
  .pc5-retry { margin-top:12px; padding:8px 20px; background:#dc2626; color:#fff; border:none; border-radius:7px; font-family:${FONT}; font-size:13px; font-weight:700; cursor:pointer; }

  /* QV modal */
  .pc5-qv-bg { position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,.75); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:${FONT}; }
  .pc5-qv-modal { background:#fff; border-radius:16px; width:100%; max-width:920px; max-height:92vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,.3); display:flex; position:relative; }
  @media (max-width:600px) {
    .pc5-qv-modal { flex-direction:column; }
    .pc5-qv-left  { width:100% !important; min-width:unset !important; border-radius:16px 16px 0 0 !important; }
    .pc5-qv-right { padding:20px 16px !important; }
  }
  @media (prefers-reduced-motion:reduce) { .pc5-card-desk,.pc5-desk-img,.pc5-ov { transition:none; } }
`

function ensureStyles() {
  if (!document.getElementById(STYLE_ID)) {
    const t = document.createElement('style')
    t.id = STYLE_ID; t.textContent = STYLES
    document.head.appendChild(t)
  }
}

// ─── Stars component ──────────────────────────────────────────────────────────
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={filled ? B.yellow : '#D1D5DB'}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}

// ─── Skeleton Cards ───────────────────────────────────────────────────────────
function SkeletonMob() {
  return (
    <div className="pc5-skel-card-mob">
      <div className="pc5-skel" style={{ aspectRatio: '1/1', width: '100%' }} />
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div className="pc5-skel" style={{ height: 12, width: '65%' }} />
        <div className="pc5-skel" style={{ height: 10, width: '90%' }} />
        <div className="pc5-skel" style={{ height: 10, width: '70%' }} />
        <div className="pc5-skel" style={{ height: 14, width: '50%', marginTop: 2 }} />
        <div className="pc5-skel" style={{ height: 32, width: '100%', borderRadius: 8, marginTop: 4 }} />
      </div>
    </div>
  )
}

function SkeletonDesk() {
  return (
    <div className="pc5-skel-card">
      <div className="pc5-skel" style={{ aspectRatio: '1/1', width: '100%' }} />
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div className="pc5-skel" style={{ height: 9,  width: '40%' }} />
        <div className="pc5-skel" style={{ height: 13, width: '90%' }} />
        <div className="pc5-skel" style={{ height: 12, width: '70%' }} />
        <div className="pc5-skel" style={{ height: 16, width: '48%' }} />
      </div>
    </div>
  )
}

// ─── Quick View Modal ─────────────────────────────────────────────────────────
function QuickViewModal({ product, wished, busy, cartAdded, onClose, onWish, onCart }: {
  product: ApiProduct; wished: boolean; busy: null|'cart'|'wishlist'
  cartAdded: boolean; onClose():void; onWish():void; onCart(qty?:number):void
}) {
  const [qty, setQty]     = useState(1)
  const [adding, setAdding] = useState(false)

  const price = parseNum(product.price)
  const orig  = parseNum(product.original_price)
  const disc  = discPct(product.price, product.original_price)
  const saved = orig > price ? orig - price : 0
  const stock = totalStock(product.variants)
  const image = product.images?.[0] ?? ''
  const tag   = deriveTag(product)
  const tc    = tagColor(tag)

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [onClose])

  const handleAdd = async () => {
    if (adding) return; setAdding(true)
    try { onCart(qty); setTimeout(onClose, 800) }
    finally { setAdding(false) }
  }

  return createPortal(
    <div className="pc5-qv-bg" onClick={onClose}>
      <div className="pc5-qv-modal" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" style={{ position:'absolute',top:14,right:14,zIndex:10,width:32,height:32,borderRadius:'50%',background:'white',border:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,.12)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="pc5-qv-left" style={{ width:'45%',minWidth:'45%',flexShrink:0,background:'#F9FAFB',overflow:'hidden',borderRadius:'16px 0 0 16px',position:'relative' }}>
          <img src={image} alt={product.name}
            onError={e=>{(e.currentTarget as HTMLImageElement).src='https://placehold.co/400x400/f3f3f7/c4c4d4?text=No+Image'}}
            style={{width:'100%',height:'100%',objectFit:'cover',aspectRatio:'1/1',display:'block'}}/>
          <span style={{position:'absolute',top:14,left:14,background:tc,color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',padding:'4px 10px',borderRadius:20}}>{tag}</span>
          {disc>0&&<span style={{position:'absolute',top:42,left:14,background:B.discGrad,color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',padding:'4px 10px',borderRadius:20}}>-{disc}% OFF</span>}
        </div>
        <div className="pc5-qv-right" style={{flex:1,padding:'36px 32px',display:'flex',flexDirection:'column',fontFamily:FONT}}>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',color:B.faint,marginBottom:8}}>{product.category}</div>
          <h3 style={{fontSize:22,fontWeight:400,color:'#111827',margin:'0 0 14px',lineHeight:1.3,fontFamily:'Georgia,serif'}}>{product.name}</h3>
          <div style={{display:'flex',alignItems:'center',gap:3,marginBottom:18}}>
            {[1,2,3,4,5].map(s=><StarIcon key={s} filled={s<=Math.round(product.average_rating||4)}/>)}
            <span style={{fontSize:13,fontWeight:700,color:B.body,marginLeft:5}}>{(product.average_rating||4).toFixed(1)}</span>
            <span style={{fontSize:12,color:B.faint}}>({product.total_reviews||0})</span>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap',marginBottom:6}}>
            <span style={{fontSize:30,fontWeight:800,background:B.brandGrad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{fmtINR(price)}</span>
            {orig>price&&<span style={{textDecoration:'line-through',color:B.faint,fontSize:16}}>{fmtINR(orig)}</span>}
            {disc>0&&<span style={{background:B.discGrad,color:'#fff',fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:20,letterSpacing:'.08em'}}>-{disc}%</span>}
          </div>
          {saved>0&&<p style={{fontSize:12,color:'#16A34A',fontWeight:600,marginBottom:20}}>🎉 You save {fmtINR(saved)}</p>}
          <hr style={{border:'none',borderTop:'1px solid #F3F4F6',margin:'4px 0 20px'}}/>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}>
            <span style={{fontSize:9,fontWeight:800,letterSpacing:'.14em',textTransform:'uppercase',color:B.faint}}>Qty</span>
            <div style={{display:'flex',alignItems:'center',border:'1px solid #E5E7EB',borderRadius:24}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:36,height:36,background:'none',border:'none',cursor:'pointer',fontSize:16}}>−</button>
              <span style={{width:36,textAlign:'center',fontSize:14,fontWeight:600}}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{width:36,height:36,background:'none',border:'none',cursor:'pointer',fontSize:16}}>+</button>
            </div>
          </div>
          <div style={{display:'flex',gap:12,marginBottom:16}}>
            <button onClick={handleAdd} disabled={adding||busy==='cart'||stock===0}
              style={{flex:1,height:48,background:cartAdded?B.green:B.brandGrad,border:'none',borderRadius:24,color:'#fff',fontSize:13,fontWeight:700,cursor:stock===0?'not-allowed':'pointer',opacity:(adding||stock===0)?.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
              {cartAdded?'✓ Added':adding?'…':stock===0?'Out of Stock':'🛍 Add to Cart'}
            </button>
            <button onClick={onWish} disabled={busy==='wishlist'}
              style={{width:48,height:48,flexShrink:0,borderRadius:'50%',border:`1.5px solid ${wished?B.red:'#E5E7EB'}`,background:wished?'#FFF0F0':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wished?B.red:'none'} stroke={wished?B.red:B.faint} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
          <Link to={`/product-details/${product.product_id}`} onClick={onClose}
            style={{textAlign:'center',fontSize:12,color:B.faint,textDecoration:'underline'}}>
            View full product details →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── MOBILE CARD (matches screenshot exactly) ──────────────────────────────────
function MobileCard({ product }: { product: ApiProduct }) {
  const navigate = useNavigate()

  const [wished,    setWished]    = useState(() => isWishlisted(product.product_id))
  const [busy,      setBusy]      = useState<null|'cart'|'wishlist'>(null)
  const [cartAdded, setCartAdded] = useState(false)
  const [heartKey,  setHeartKey]  = useState(0)
  const timer = useRef<any>(null)

  const price  = parseNum(product.price)
  const orig   = parseNum(product.original_price)
  const disc   = discPct(product.price, product.original_price)
  const stock  = totalStock(product.variants)
  const image  = product.images?.[0] ?? ''
  const rating = product.average_rating || 0
  const count  = product.total_reviews  || 0

  // Split name: first word = "brand", rest = description
  const nameParts = product.name.trim().split(/\s+/)
  const brand     = nameParts[0] ?? ''
  const rest      = nameParts.slice(1).join(' ')

  useEffect(() => {
    const sync = () => setWished(isWishlisted(product.product_id))
    window.addEventListener('wishlist:changed', sync)
    return () => window.removeEventListener('wishlist:changed', sync)
  }, [product.product_id])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (busy === 'wishlist') return
    setBusy('wishlist'); setHeartKey(k => k + 1)
    const next = !wished
    toggleWishlist(product.product_id)
      .then(() => { setWished(next); notifyWishlistChanged() })
      .catch(() => setWished(!next))
      .finally(() => setBusy(null))
  }

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (busy === 'cart' || stock === 0) return
    setBusy('cart')
    addToCart(product.product_id, 1)
      .then(() => {
        setCartAdded(true)
        window.dispatchEvent(new Event('cart:changed'))
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCartAdded(false), 2000)
      })
      .catch(() => {})
      .finally(() => setBusy(null))
  }

  return (
    <div
      className="pc5-card-mob"
      onClick={() => navigate(`/product-details/${product.product_id}`)}
    >
      {/* ── Image zone ─────────────────────────────────────── */}
      <div className="pc5-mob-img-wrap">
        <img
          src={image}
          alt={product.name}
          className="pc5-mob-img"
          loading="lazy"
          onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x400/f5f5f7/c4c4d4?text=No+Image' }}
        />

        {/* Discount badge — top left */}
        {disc > 0 && (
          <div className="pc5-mob-disc-badge">{disc}% off</div>
        )}

        {/* Heart — top right */}
        <button
          key={heartKey}
          type="button"
          className={`pc5-mob-heart${heartKey > 0 ? ' pc5-pop' : ''}`}
          onClick={handleWish}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={wished ? B.red : 'none'}
            stroke={wished ? B.red : '#9ca3af'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Rating pill — bottom left of image */}
        {rating > 0 && (
          <div className="pc5-mob-rating">
            <span className="pc5-mob-rating-num">{rating.toFixed(1)}</span>
            <StarIcon filled={true} />
            {count > 0 && (
              <span className="pc5-mob-rating-count">({count.toLocaleString('en-IN')})</span>
            )}
          </div>
        )}
      </div>

      {/* ── Info zone ──────────────────────────────────────── */}
      <div className="pc5-mob-info">
        {/* Brand (bold) + rest of name */}
        <div className="pc5-mob-brand">{brand}</div>
        {rest && <div className="pc5-mob-name">{rest}</div>}

        {/* Price row */}
        <div className="pc5-mob-price-row">
          <span className="pc5-mob-price">{fmtINR(price)}</span>
          {orig > price && <span className="pc5-mob-mrp">{fmtINR(orig)}</span>}
          {disc > 0 && <span className="pc5-mob-off">{disc}% off</span>}
        </div>

        {/* Add to Cart CTA */}
        <button
          type="button"
          className={`pc5-mob-cta${cartAdded ? ' cta-added' : ''}`}
          onClick={handleCart}
          disabled={busy === 'cart' || stock === 0}
        >
          {cartAdded ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Added!
            </>
          ) : stock === 0 ? 'Out of Stock' : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── DESKTOP CARD (unchanged) ──────────────────────────────────────────────────
function DesktopCard({ product }: { product: ApiProduct }) {
  const navigate = useNavigate()

  const [wished,    setWished]    = useState(() => isWishlisted(product.product_id))
  const [busy,      setBusy]      = useState<null|'cart'|'wishlist'>(null)
  const [cartAdded, setCartAdded] = useState(false)
  const [notice,    setNotice]    = useState<string|null>(null)
  const [noticeOut, setNoticeOut] = useState(false)
  const [heartKey,  setHeartKey]  = useState(0)
  const [qv,        setQv]        = useState(false)
  const timer = useRef<any>(null)

  const price = parseNum(product.price)
  const orig  = parseNum(product.original_price)
  const disc  = discPct(product.price, product.original_price)
  const saved = orig > price ? orig - price : 0
  const stock = totalStock(product.variants)
  const image = product.images?.[0] ?? ''
  const tag   = deriveTag(product)
  const tc    = tagColor(tag)

  useEffect(() => {
    const sync = () => setWished(isWishlisted(product.product_id))
    window.addEventListener('wishlist:changed', sync)
    return () => window.removeEventListener('wishlist:changed', sync)
  }, [product.product_id])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const toast = (msg: string) => {
    setNotice(msg); setNoticeOut(false)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => { setNoticeOut(true); setTimeout(() => setNotice(null), 480) }, 2000)
  }

  const handleWish = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation(); e?.preventDefault()
    if (busy) return; setBusy('wishlist'); setHeartKey(k => k + 1)
    const next = !wished
    try { await toggleWishlist(product.product_id); setWished(next); notifyWishlistChanged(); toast(next ? '♥ Saved' : 'Removed') }
    catch { toast('Could not update') } finally { setBusy(null) }
  }, [busy, product.product_id, wished])

  const handleCart = useCallback(async (e?: React.MouseEvent, qty = 1) => {
    e?.stopPropagation(); e?.preventDefault()
    if (busy || stock === 0) return; setBusy('cart')
    try {
      await addToCart(product.product_id, qty)
      setCartAdded(true); toast('✓ Added to cart')
      window.dispatchEvent(new Event('cart:changed'))
      setTimeout(() => setCartAdded(false), 1600)
    } catch { toast('Could not add') } finally { setBusy(null) }
  }, [busy, product.product_id, stock])

  return (
    <>
      {qv && (
        <QuickViewModal product={product} wished={wished} busy={busy} cartAdded={cartAdded}
          onClose={() => setQv(false)} onWish={() => handleWish()} onCart={q => handleCart(undefined, q)} />
      )}
      <div
        className="pc5-card-desk"
        onClick={e => { const t = e.target as HTMLElement; if (t.closest('button') || t.closest('a')) return; navigate(`/product-details/${product.product_id}`) }}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/product-details/${product.product_id}`)}
      >
        {notice && (
          <div className={`pc5-toast ${noticeOut ? 'pc5-tout' : 'pc5-tin'}`}
            style={{ background: notice.includes('ould') ? B.red : B.green }}>{notice}</div>
        )}

        {/* Image */}
        <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', background:B.bgSoft, flexShrink:0 }}>
          <Link to={`/product-details/${product.product_id}`} tabIndex={-1}
            style={{ position:'absolute', inset:0, display:'block' }}
            onClick={e => e.stopPropagation()}>
            <img src={image} alt={product.name} className="pc5-desk-img" loading="lazy"
              onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x400/f3f3f7/c4c4d4?text=No+Image' }} />
          </Link>
          <div style={{ position:'absolute', inset:'54% 0 0', background:'linear-gradient(to top,rgba(0,0,0,.34),transparent)', pointerEvents:'none' }} />
          <span style={{ position:'absolute', top:0, left:0, zIndex:20, background:tc, color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'.14em', textTransform:'uppercase', padding:'5px 10px', borderRadius:'10px 0 4px 0', lineHeight:1 }}>{tag}</span>
          {disc > 0 && <span style={{ position:'absolute', top:26, left:0, zIndex:20, background:B.discGrad, color:'#fff', fontSize:8, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', padding:'4px 10px', borderRadius:'0 4px 4px 0', lineHeight:1 }}>-{disc}% OFF</span>}
          {stock > 0 && stock <= 10 && <div style={{ position:'absolute', top:8, right:42, zIndex:20, background:'rgba(234,179,8,.9)', color:'#422006', fontFamily:FONT, fontSize:8, fontWeight:700, padding:'3px 6px', borderRadius:4 }}>Only {stock} left</div>}

          <button key={heartKey} type="button"
            className={`pc5-heart${wished ? ' wl-active' : ''}${heartKey > 0 ? ' pc5-pop' : ''}`}
            onClick={e => handleWish(e)} disabled={busy === 'wishlist'} aria-label="Wishlist">
            <svg width="12" height="12" viewBox="0 0 24 24" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : B.muted} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          <div className="pc5-ov">
            <div className="pc5-ov-bg" />
            <div className="pc5-ov-row">
              <button type="button" className="pc5-ob" onClick={e => handleWish(e)} disabled={busy === 'wishlist'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={wished?'#FCA5A5':'none'} stroke={wished?'#FCA5A5':'#fff'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span className="pc5-ob-lbl">{wished ? 'Saved' : 'Wishlist'}</span>
              </button>
              <button type="button" className="pc5-ob" onClick={e => handleCart(e)} disabled={busy === 'cart' || stock === 0}>
                {cartAdded
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
                <span className="pc5-ob-lbl">{cartAdded ? 'Added!' : stock === 0 ? 'No Stock' : 'Add Cart'}</span>
              </button>
              <button type="button" className="pc5-ob" onClick={e => { e.stopPropagation(); e.preventDefault(); setQv(true) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span className="pc5-ob-lbl">Quick View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pc5-desk-info">
          <div className="pc5-desk-cat">{product.category}</div>
          <Link to={`/product-details/${product.product_id}`} className="pc5-desk-name"
            onClick={e => e.stopPropagation()}>{product.name}</Link>
          <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:2 }}>
            {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(product.average_rating || 0)} />)}
            <span style={{ fontSize:11, fontWeight:700, color:B.body, marginLeft:2, fontFamily:FONT }}>{product.average_rating > 0 ? product.average_rating.toFixed(1) : '—'}</span>
            <span style={{ fontSize:11, color:B.faint, fontFamily:FONT }}>({product.total_reviews || 0})</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:5, flex:1 }}>
              <span className="pc5-price-grad">{fmtINR(price)}</span>
              {orig > price && <span className="pc5-orig">{fmtINR(orig)}</span>}
              {disc > 0 && <span className="pc5-disc-pill">-{disc}%</span>}
            </div>
            <button type="button"
              className={`pc5-cart-icon-btn${cartAdded ? ' added' : ''}`}
              onClick={e => handleCart(e)} disabled={busy === 'cart' || stock === 0}>
              {cartAdded
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={B.muted} strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
            </button>
          </div>
          {saved > 0 && <p className="pc5-save-txt">You save {fmtINR(saved)}</p>}
          {stock === 0 && <div className="pc5-oos-txt">Out of Stock</div>}
        </div>

        <div className="pc5-accent-bar" />
      </div>
    </>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ProductCollection() {
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([])
  const [displayed,   setDisplayed]   = useState<ApiProduct[]>([])
  const [page,        setPage]         = useState(0)
  const [hasMore,     setHasMore]      = useState(true)
  const [loading,     setLoading]      = useState(true)
  const [loadingMore, setLoadingMore]  = useState(false)
  const [error,       setError]        = useState<string|null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const alive       = useRef(true)
  const isMobile    = useIsMobile()

  useEffect(() => { ensureStyles() }, [])

  const fetchProducts = useCallback(async () => {
    alive.current = true; setLoading(true); setError(null)
    try {
      const res  = await fetch(API_URL, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const list: ApiProduct[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
      if (!alive.current) return
      setAllProducts(list); setDisplayed(list.slice(0, PAGE_SIZE)); setPage(1); setHasMore(list.length > PAGE_SIZE)
    } catch (e: any) {
      if (alive.current) setError(e?.message ?? 'Failed to load products.')
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts(); return () => { alive.current = false } }, [fetchProducts])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    setTimeout(() => {
      if (!alive.current) return
      const next = allProducts.slice(0, (page + 1) * PAGE_SIZE)
      setDisplayed(next); setPage(p => p + 1); setHasMore(next.length < allProducts.length); setLoadingMore(false)
    }, 380)
  }, [loadingMore, hasMore, allProducts, page])

  useEffect(() => {
    if (!sentinelRef.current) return
    const obs = new IntersectionObserver(es => { if (es[0].isIntersecting) loadMore() }, { rootMargin: '200px' })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [loadMore])

  return (
    <section className="pc5-section" data-aos="fade-up">
      <div className="container-fluid">
        <div style={{ maxWidth: 1720, margin: '0 auto' }}>
          <div className="pc5-header">
            <div className="pc5-eyebrow">Our Products</div>
            <h2 className="pc5-title">Explore Our Collection</h2>
            <p className="pc5-sub">Handpicked items with the best quality and unbeatable prices.</p>
          </div>

          {error && (
            <div className="pc5-err">⚠ {error}<br/>
              <button className="pc5-retry" onClick={fetchProducts}>Retry</button>
            </div>
          )}

          {!error && (
            <div className="pc5-grid">
              {/* Skeletons */}
              {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => (
                isMobile ? <SkeletonMob key={i} /> : <SkeletonDesk key={i} />
              ))}

              {/* Real cards — separate component per breakpoint */}
              {!loading && displayed.map(p => (
                isMobile
                  ? <MobileCard  key={p.product_id} product={p} />
                  : <DesktopCard key={p.product_id} product={p} />
              ))}

              {loadingMore && Array.from({ length: 4 }).map((_, i) => (
                isMobile ? <SkeletonMob key={`m${i}`} /> : <SkeletonDesk key={`m${i}`} />
              ))}
            </div>
          )}

          {!loading && !error && hasMore && (
            <div ref={sentinelRef} className="pc5-sentinel" aria-hidden />
          )}
          {loadingMore && (
            <div className="pc5-spinner-wrap">
              <div className="pc5-spinner" />
              <span>Loading more…</span>
            </div>
          )}
          {!loading && !error && !hasMore && displayed.length > 0 && (
            <div className="pc5-end">
              <div className="pc5-end-rule">
                <div className="pc5-end-dash" />
                <span>You've seen all {displayed.length} products</span>
                <div className="pc5-end-dash" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}