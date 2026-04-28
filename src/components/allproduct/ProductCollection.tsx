// src/components/allproduct/ProductCollection.tsx
// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════
//  PRODUCT COLLECTION v4.1 — MOBILE FIX
//
//  MOBILE FIX:
//  ✦ Cards are true horizontal rows on mobile (flex-direction:row)
//  ✦ Image takes 42% width, fills full card height
//  ✦ Info panel (58%) shows: tag pill + name + price + mobile cart btn
//  ✦ Stars, "You save", overlay hidden on mobile (clean & fast)
//  ✦ Heart button repositioned for horizontal layout
//  ✦ Inline styles on the card element itself (not just CSS classes)
//    so React's style prop wins over any conflicting global CSS
//  ✦ All desktop behaviour unchanged
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
  bgSoft    : '#FAFAFA',
  border    : '#EBEBF0',
  body      : '#374151',
  muted     : '#6B7280',
  faint     : '#9CA3AF',
}

const FONT = "'DM Sans', sans-serif"

const TAG_MAP: Record<string, string> = {
  'Sale':'#E8314A','Hot Sale':'#E8314A','Hot':'#E8314A','10% OFF':'#06B6D4',
  'New Arrival':'#5B4FBE','NEW':'#5B4FBE','New':'#5B4FBE',
  'Bestseller':'#F97316','Premium':'#5B4FBE','Luxury':'#7C5C2A',
  'Handcrafted':'#06B6D4','Handpainted':'#EC4899',
  'Modern':'#22C55E','Vintage':'#78540A','Eco-Friendly':'#22C55E',
  'Original':'#5B4FBE','Print':'#06B6D4','Set of 3':'#F97316',
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
  return 'New'
}

// ─── Mobile detection hook ────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 767 : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const STYLE_ID = 'pc41-styles'
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

  @keyframes pc4Pop  { 0%{transform:scale(1)} 38%{transform:scale(1.52)} 65%{transform:scale(0.86)} 100%{transform:scale(1)} }
  @keyframes pc4Tin  { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pc4Tout { from{opacity:1} to{opacity:0} }
  @keyframes pc4Shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes pc4Spin { to{transform:rotate(360deg)} }

  .pc4-pop  { animation: pc4Pop  .36s cubic-bezier(.36,.07,.19,.97) both; }
  .pc4-tin  { animation: pc4Tin  .2s ease forwards; }
  .pc4-tout { animation: pc4Tout .45s ease 1.9s forwards; }

  /* ── Section ── */
  .pc4-section { background:#f7f7fa; padding:56px 0 72px; }

  /* ── Header ── */
  .pc4-header { text-align:center; margin-bottom:36px; }
  .pc4-eyebrow {
    display:inline-flex; align-items:center; gap:8px;
    font-family:${FONT}; font-size:10px; font-weight:700;
    letter-spacing:.18em; text-transform:uppercase;
    background:${B.brandGrad}; -webkit-background-clip:text;
    -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:10px;
  }
  .pc4-eyebrow::before,.pc4-eyebrow::after {
    content:''; display:block; width:20px; height:1.5px;
    background:${B.brandGrad}; border-radius:1px; opacity:.6;
  }
  .pc4-title {
    font-family:${FONT}; font-size:clamp(22px,3.5vw,36px); font-weight:800;
    color:#0f0f13; line-height:1.12; margin:0 0 10px; letter-spacing:-.02em;
  }
  .pc4-sub { font-family:${FONT}; font-size:14px; color:#8b8b9e; max-width:380px; margin:0 auto; }

  /* ── Grid — desktop/tablet vertical cards ── */
  .pc4-grid {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:16px;
  }
  @media (max-width:1199px) { .pc4-grid { grid-template-columns:repeat(3,1fr); } }
  @media (max-width:767px)  { .pc4-grid { grid-template-columns:1fr; gap:10px; } }

  /* ── Card base (desktop vertical) ── */
  .pc4-card {
    background:${B.bg}; border:1px solid ${B.border}; border-radius:8px;
    overflow:hidden; display:flex; flex-direction:column;
    position:relative; cursor:pointer;
    transition:box-shadow .28s ease, transform .28s ease, border-color .2s ease;
    box-shadow:0 1px 4px rgba(15,15,19,.05);
  }
  .pc4-card:hover {
    box-shadow:0 8px 32px rgba(91,79,190,.16);
    transform:translateY(-2px);
    border-color:rgba(91,79,190,.18) !important;
  }

  /* Image zoom */
  .pc4-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .65s cubic-bezier(0.25,0.46,0.45,0.94); }
  .pc4-card:hover .pc4-img { transform:scale(1.07); }

  /* Vignette */
  .pc4-vignette { position:absolute; inset-x:0; bottom:0; height:46%; background:linear-gradient(to top,rgba(0,0,0,.34),transparent); pointer-events:none; }

  /* Tag badge */
  .pc4-tag-badge {
    position:absolute; top:0; left:0; z-index:20;
    font-family:${FONT}; font-size:9px; font-weight:800;
    letter-spacing:.14em; text-transform:uppercase;
    color:#fff; padding:5px 10px; border-radius:8px 0 4px 0; line-height:1; user-select:none;
  }

  /* Discount badge */
  .pc4-disc-badge {
    position:absolute; z-index:20;
    font-family:${FONT}; font-size:8px; font-weight:800;
    letter-spacing:.1em; text-transform:uppercase;
    color:#fff; padding:4px 10px; border-radius:0 4px 4px 0;
    background:${B.discGrad}; line-height:1; user-select:none;
  }

  /* Low stock */
  .pc4-low {
    position:absolute; top:8px; right:42px; z-index:20;
    background:rgba(234,179,8,.9); color:#422006;
    font-family:${FONT}; font-size:8px; font-weight:700;
    padding:3px 6px; border-radius:4px; letter-spacing:.04em;
  }

  /* Heart */
  .pc4-heart {
    position:absolute; z-index:30;
    width:30px; height:30px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.12);
    border:1px solid ${B.border}; background:${B.bg}; transition:all .2s;
  }
  .pc4-heart.wl-active { background:${B.brandGrad}; border-color:transparent; }
  .pc4-heart:not(.wl-active):hover { transform:scale(1.1); border-color:${B.red}; }
  .pc4-heart:disabled { opacity:.5; cursor:not-allowed; }

  /* Hover overlay */
  .pc4-overlay {
    position:absolute; inset-x:0; bottom:0; z-index:20;
    transform:translateY(100%); opacity:0; pointer-events:none;
    transition:transform .34s cubic-bezier(0.22,1,0.36,1), opacity .26s ease;
  }
  .pc4-card:hover .pc4-overlay { transform:translateY(0); opacity:1; pointer-events:auto; }
  .pc4-ov-bg { position:absolute; inset:0; pointer-events:none; background:linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.42) 100%); }
  .pc4-ov-btns { position:relative; display:flex; align-items:stretch; }
  .pc4-ob {
    flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:4px; padding:11px 4px; background:none; border:none;
    border-right:1px solid rgba(255,255,255,.15); cursor:pointer;
    position:relative; overflow:hidden;
    opacity:0; transform:translateY(5px);
    transition:opacity .22s ease, transform .22s ease;
  }
  .pc4-ob:last-child { border-right:none; }
  .pc4-card:hover .pc4-ob               { opacity:1; transform:translateY(0); }
  .pc4-card:hover .pc4-ob:nth-child(1)  { transition-delay:0ms; }
  .pc4-card:hover .pc4-ob:nth-child(2)  { transition-delay:58ms; }
  .pc4-card:hover .pc4-ob:nth-child(3)  { transition-delay:116ms; }
  .pc4-ob::before { content:''; position:absolute; inset:0; background:${B.brandGrad}; opacity:0; transition:opacity .22s ease; z-index:0; }
  .pc4-ob:hover::before { opacity:1; }
  .pc4-ob > * { position:relative; z-index:1; }
  .pc4-ob:disabled { opacity:.5 !important; cursor:not-allowed; }
  .pc4-ob-lbl { font-family:${FONT}; font-size:8px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#fff; white-space:nowrap; }

  /* Toast */
  .pc4-toast { position:absolute; top:0; inset-x:0; z-index:50; font-family:${FONT}; font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; text-align:center; padding:6px; line-height:1; pointer-events:none; user-select:none; color:#fff; }

  /* Info zone */
  .pc4-info { padding:12px 12px 14px; display:flex; flex-direction:column; gap:0; }
  .pc4-cat { font-family:${FONT}; font-size:9px; font-weight:700; color:${B.purple}; text-transform:uppercase; letter-spacing:.1em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; }
  .pc4-name-link { display:block; margin-bottom:8px; text-decoration:none; }
  .pc4-name { font-family:${FONT}; font-size:14px; font-weight:500; line-height:1.45; color:${B.body}; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin:0; transition:color .18s ease; }
  .pc4-name:hover { color:${B.purple}; }
  .pc4-stars-row { display:flex; align-items:center; gap:3px; margin-bottom:10px; }
  .pc4-rev-count { font-family:${FONT}; font-size:11px; color:${B.faint}; line-height:1; }
  .pc4-price-row { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .pc4-price-group { display:flex; align-items:center; flex-wrap:wrap; gap:5px; flex:1; min-width:0; }
  .pc4-price { font-family:${FONT}; font-size:17px; font-weight:700; line-height:1; background:${B.brandGrad}; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .pc4-orig { text-decoration:line-through; color:${B.faint}; font-family:${FONT}; font-size:12px; font-weight:400; line-height:1; }
  .pc4-disc-pill { display:inline-flex; align-items:center; justify-content:center; padding:2px 7px; border-radius:20px; font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#fff; line-height:1; background:${B.discGrad}; flex-shrink:0; }
  .pc4-cart-icon { flex-shrink:0; width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; border:1px solid ${B.border}; background:transparent; cursor:pointer; transition:all .2s ease; }
  .pc4-cart-icon.added { background:${B.green}; border-color:${B.green}; }
  .pc4-cart-icon:disabled { opacity:.5; cursor:not-allowed; }
  .pc4-save { margin-top:5px; font-family:${FONT}; font-size:10px; font-weight:600; color:#16A34A; line-height:1; }
  .pc4-oos  { font-family:${FONT}; font-size:10px; color:#dc2626; font-weight:600; margin-top:4px; }

  /* Bottom accent bar */
  .pc4-accent-bar { position:absolute; inset-x:0; bottom:0; height:2px; background:${B.brandGrad}; border-radius:0 0 8px 8px; pointer-events:none; transform:scaleX(0); transform-origin:left; transition:transform .35s cubic-bezier(0.22,1,0.36,1); }
  .pc4-card:hover .pc4-accent-bar { transform:scaleX(1); }

  /* ── Skeleton ── */
  .pc4-skel { background:linear-gradient(90deg,#ececf0 25%,#e0e0e8 50%,#ececf0 75%); background-size:300% 100%; animation:pc4Shim 1.5s infinite linear; border-radius:5px; }

  /* Sentinel + spinner */
  .pc4-sentinel { height:1px; }
  .pc4-spinner-wrap { display:flex; align-items:center; justify-content:center; gap:10px; padding:28px 0; font-family:${FONT}; font-size:13px; color:#8b8b9e; }
  .pc4-spinner { width:20px; height:20px; border:2px solid rgba(91,79,190,.2); border-top-color:${B.purple}; border-radius:50%; animation:pc4Spin .7s linear infinite; }

  /* End of list */
  .pc4-end { text-align:center; padding:24px 0 0; font-family:${FONT}; font-size:13px; color:#8b8b9e; }
  .pc4-end-rule { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:8px; }
  .pc4-end-dash { flex:1; max-width:72px; height:1px; background:#e5e7eb; }

  /* Error */
  .pc4-err { background:#fff5f5; border:1px solid #fecaca; border-radius:10px; padding:20px 24px; text-align:center; font-family:${FONT}; color:#dc2626; font-size:14px; margin-bottom:16px; }
  .pc4-retry { margin-top:12px; padding:8px 20px; background:#dc2626; color:#fff; border:none; border-radius:7px; font-family:${FONT}; font-size:13px; font-weight:700; cursor:pointer; }

  /* QV modal */
  .pc4-qv-overlay { position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,.75); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:${FONT}; }
  .pc4-qv-modal { background:#fff; border-radius:16px; width:100%; max-width:920px; max-height:92vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,.3); display:flex; position:relative; }
  @media (max-width:600px) {
    .pc4-qv-modal { flex-direction:column; }
    .pc4-qv-left  { width:100% !important; min-width:unset !important; border-radius:16px 16px 0 0 !important; }
    .pc4-qv-right { padding:20px 16px !important; }
  }
  @media (prefers-reduced-motion:reduce) { .pc4-card,.pc4-img,.pc4-overlay { transition:none; } }
`

function ensureStyles() {
  if (!document.getElementById(STYLE_ID)) {
    const t = document.createElement('style')
    t.id = STYLE_ID; t.textContent = STYLES
    document.head.appendChild(t)
  }
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
  const f = Math.round(rating)
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s<=f ? B.yellow : '#D1D5DB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div style={{
        background: '#fff', border: `1px solid ${B.border}`, borderRadius: 10,
        overflow: 'hidden', display: 'flex', flexDirection: 'row', height: 140,
      }}>
        {/* image skeleton */}
        <div className="pc4-skel" style={{ width: '42%', flexShrink: 0, height: '100%', borderRadius: '10px 0 0 10px' }} />
        {/* info skeleton */}
        <div style={{ flex: 1, padding: '12px 11px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <div className="pc4-skel" style={{ height: 8,  width: '35%', borderRadius: 4 }} />
          <div className="pc4-skel" style={{ height: 12, width: '90%', borderRadius: 4 }} />
          <div className="pc4-skel" style={{ height: 11, width: '70%', borderRadius: 4 }} />
          <div className="pc4-skel" style={{ height: 15, width: '45%', borderRadius: 4 }} />
          <div className="pc4-skel" style={{ height: 30, width: '100%', borderRadius: 6 }} />
        </div>
      </div>
    )
  }
  return (
    <div style={{ background: '#fff', border: `1px solid ${B.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div className="pc4-skel" style={{ aspectRatio: '1/1', width: '100%' }} />
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div className="pc4-skel" style={{ height: 9,  width: '40%', borderRadius: 4 }} />
        <div className="pc4-skel" style={{ height: 13, width: '90%', borderRadius: 4 }} />
        <div className="pc4-skel" style={{ height: 12, width: '65%', borderRadius: 4 }} />
        <div className="pc4-skel" style={{ height: 16, width: '48%', borderRadius: 4 }} />
      </div>
    </div>
  )
}

// ─── Quick View Modal ─────────────────────────────────────────────────────────
function QuickViewModal({ product, wished, busy, cartAdded, onClose, onWish, onCart }: {
  product: ApiProduct; wished: boolean; busy: null|'cart'|'wishlist'
  cartAdded: boolean; onClose():void; onWish():void; onCart(qty?:number):void
}) {
  const [qty, setQty] = useState(1)
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
    const fn = (e: KeyboardEvent) => { if (e.key==='Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  const handleAdd = async () => {
    if (adding) return; setAdding(true)
    try { onCart(qty); setTimeout(onClose, 800) }
    catch(e){console.error(e)} finally { setAdding(false) }
  }

  return createPortal(
    <div className="pc4-qv-overlay" onClick={onClose}>
      <div className="pc4-qv-modal" onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" style={{
          position:'absolute',top:14,right:14,zIndex:10,width:32,height:32,
          borderRadius:'50%',background:'rgba(255,255,255,.96)',border:'1px solid #E5E7EB',
          display:'flex',alignItems:'center',justifyContent:'center',
          cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,.12)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="pc4-qv-left" style={{ width:'45%',minWidth:'45%',flexShrink:0,background:'#F9FAFB',overflow:'hidden',borderRadius:'16px 0 0 16px',position:'relative' }}>
          <img src={image} alt={product.name}
            onError={e=>{(e.currentTarget as HTMLImageElement).src='https://placehold.co/400x400/f3f3f7/c4c4d4?text=No+Image'}}
            style={{width:'100%',height:'100%',objectFit:'cover',aspectRatio:'1/1',display:'block'}}/>
          <span style={{position:'absolute',top:14,left:14,background:tc,color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',padding:'4px 10px',borderRadius:20}}>{tag}</span>
          {disc>0&&<span style={{position:'absolute',top:42,left:14,background:B.discGrad,color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',padding:'4px 10px',borderRadius:20}}>-{disc}% OFF</span>}
        </div>
        <div className="pc4-qv-right" style={{flex:1,padding:'36px 32px',display:'flex',flexDirection:'column',fontFamily:FONT}}>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',color:B.faint,marginBottom:8}}>{product.category}</div>
          <h3 style={{fontSize:22,fontWeight:400,color:'#111827',margin:'0 0 14px',lineHeight:1.3,fontFamily:'Georgia,serif'}}>{product.name}</h3>
          <div style={{display:'flex',alignItems:'center',gap:3,marginBottom:18}}>
            <Stars rating={product.average_rating||4}/>
            <span style={{fontSize:13,fontWeight:700,color:B.body,marginLeft:5}}>{(product.average_rating||4).toFixed(1)}</span>
            <span style={{fontSize:12,color:B.faint}}>({product.total_reviews||0} reviews)</span>
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
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:36,height:36,background:'none',border:'none',cursor:'pointer',fontSize:16,color:B.body}}>−</button>
              <span style={{width:36,textAlign:'center',fontSize:14,fontWeight:600}}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{width:36,height:36,background:'none',border:'none',cursor:'pointer',fontSize:16,color:B.body}}>+</button>
            </div>
          </div>
          <div style={{display:'flex',gap:12,marginBottom:16}}>
            <button onClick={handleAdd} disabled={adding||busy==='cart'||stock===0}
              style={{flex:1,height:48,background:cartAdded?B.green:B.brandGrad,border:'none',borderRadius:24,color:'#fff',fontSize:13,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',cursor:(adding||stock===0)?'not-allowed':'pointer',opacity:(adding||busy==='cart'||stock===0)?.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
              {cartAdded?'✓ Added':adding?'…':stock===0?'Out of Stock':'🛍 Add to Cart'}
            </button>
            <button onClick={onWish} disabled={busy==='wishlist'}
              style={{width:48,height:48,flexShrink:0,borderRadius:'50%',border:`1.5px solid ${wished?B.red:'#E5E7EB'}`,background:wished?'#FFF0F0':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:busy==='wishlist'?'not-allowed':'pointer',opacity:busy==='wishlist'?.6:1,transition:'all .2s'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wished?B.red:'none'} stroke={wished?B.red:B.faint} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
          <Link to={`/product-details/${product.product_id}`} onClick={onClose}
            style={{textAlign:'center',fontSize:12,color:B.faint,textDecoration:'underline',textUnderlineOffset:3}}>
            View full product details →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, isMobile }: { product: ApiProduct; isMobile: boolean }) {
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
    if (busy) return
    setBusy('wishlist'); setHeartKey(k => k + 1)
    const next = !wished
    try {
      await toggleWishlist(product.product_id)
      setWished(next); notifyWishlistChanged()
      toast(next ? '♥ Saved to wishlist' : 'Removed from wishlist')
    } catch { toast('Could not update wishlist') }
    finally { setBusy(null) }
  }, [busy, product.product_id, wished])

  const handleCart = useCallback(async (e?: React.MouseEvent, qty = 1) => {
    e?.stopPropagation(); e?.preventDefault()
    if (busy || stock === 0) return
    setBusy('cart')
    try {
      await addToCart(product.product_id, qty)
      setCartAdded(true); toast('✓ Added to cart')
      window.dispatchEvent(new Event('cart:changed'))
      setTimeout(() => setCartAdded(false), 1600)
    } catch { toast('Could not add to cart') }
    finally { setBusy(null) }
  }, [busy, product.product_id, stock])

  // ── MOBILE LAYOUT (horizontal row) ────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {qv && (
          <QuickViewModal product={product} wished={wished} busy={busy} cartAdded={cartAdded}
            onClose={() => setQv(false)} onWish={() => handleWish()} onCart={(q) => handleCart(undefined, q)} />
        )}

        <div
          style={{
            background: B.bg,
            border: `1px solid ${B.border}`,
            borderRadius: 12,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            height: 152,
            position: 'relative',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(15,15,19,.06)',
          }}
          onClick={e => {
            const t = e.target as HTMLElement
            if (t.closest('button') || t.closest('a')) return
            navigate(`/product-details/${product.product_id}`)
          }}
        >
          {/* Toast */}
          {notice && (
            <div className={`pc4-toast ${noticeOut ? 'pc4-tout' : 'pc4-tin'}`}
              style={{ background: notice.includes('ould') ? B.red : B.green }}>
              {notice}
            </div>
          )}

          {/* ── LEFT: Image (42% width, full height) ── */}
          <div style={{
            width: '42%',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            background: B.bgSoft,
          }}>
            <Link to={`/product-details/${product.product_id}`}
              style={{ display: 'block', width: '100%', height: '100%' }}
              onClick={e => e.stopPropagation()}>
              <img
                src={image}
                alt={product.name}
                loading="lazy"
                onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x400/f3f3f7/c4c4d4?text=No+Image' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Link>

            {/* Tag badge — top-left corner of image */}
            <span style={{
              position: 'absolute', top: 0, left: 0,
              background: tc, color: '#fff',
              fontSize: 8, fontWeight: 800, letterSpacing: '.12em',
              textTransform: 'uppercase', padding: '4px 7px',
              borderRadius: '0 0 6px 0', lineHeight: 1,
            }}>
              {tag}
            </span>

            {/* Discount badge */}
            {disc > 0 && (
              <span style={{
                position: 'absolute', bottom: 6, left: 0,
                background: B.discGrad, color: '#fff',
                fontSize: 7, fontWeight: 800, letterSpacing: '.08em',
                textTransform: 'uppercase', padding: '3px 7px',
                borderRadius: '0 4px 4px 0', lineHeight: 1,
              }}>
                -{disc}% OFF
              </span>
            )}
          </div>

          {/* ── RIGHT: Info (58% width) ── */}
          <div style={{
            flex: 1,
            padding: '10px 12px 10px 11px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
            position: 'relative',
          }}>
            {/* Heart button — top-right of info panel */}
            <button
              key={heartKey}
              type="button"
              className={`${heartKey > 0 ? 'pc4-pop' : ''}`}
              onClick={e => handleWish(e)}
              disabled={busy === 'wishlist'}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                position: 'absolute', top: 8, right: 8,
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${wished ? 'transparent' : B.border}`,
                background: wished ? B.brandGrad : B.bg,
                boxShadow: '0 1px 4px rgba(0,0,0,.1)',
                cursor: busy === 'wishlist' ? 'not-allowed' : 'pointer',
                opacity: busy === 'wishlist' ? 0.5 : 1,
                flexShrink: 0,
                zIndex: 10,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24"
                fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : B.muted} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Top section: category + name */}
            <div style={{ paddingRight: 30 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: B.purple,
                textTransform: 'uppercase', letterSpacing: '.08em',
                marginBottom: 3, fontFamily: FONT,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {product.category}
              </div>
              <Link to={`/product-details/${product.product_id}`} onClick={e => e.stopPropagation()}
                style={{ textDecoration: 'none', display: 'block' }}>
                <h5 style={{
                  fontFamily: FONT, fontSize: 13, fontWeight: 600,
                  color: B.body, lineHeight: 1.4, margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {product.name}
                </h5>
              </Link>
            </div>

            {/* Middle: price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: FONT, fontSize: 16, fontWeight: 800, lineHeight: 1,
                background: B.brandGrad, WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {fmtINR(price)}
              </span>
              {orig > price && (
                <span style={{ textDecoration: 'line-through', color: B.faint, fontSize: 11, fontFamily: FONT }}>
                  {fmtINR(orig)}
                </span>
              )}
              {disc > 0 && (
                <span style={{
                  background: B.discGrad, color: '#fff',
                  fontSize: 8, fontWeight: 800, padding: '2px 6px',
                  borderRadius: 12, letterSpacing: '.06em', textTransform: 'uppercase',
                }}>
                  -{disc}%
                </span>
              )}
            </div>

            {/* Bottom: Add to Cart button */}
            <button
              type="button"
              onClick={e => handleCart(e)}
              disabled={busy === 'cart' || stock === 0}
              style={{
                width: '100%', height: 32,
                background: cartAdded ? B.green : B.brandGrad,
                border: 'none', borderRadius: 7,
                color: '#fff', fontFamily: FONT,
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                cursor: (busy === 'cart' || stock === 0) ? 'not-allowed' : 'pointer',
                opacity: (busy === 'cart' || stock === 0) ? 0.6 : 1,
                transition: 'all .18s',
              }}
            >
              {cartAdded ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Added!
                </>
              ) : stock === 0 ? 'Out of Stock' : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Right-edge accent bar (vertical on mobile) */}
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 2, background: B.brandGrad, borderRadius: '0 12px 12px 0',
          }} />
        </div>
      </>
    )
  }

  // ── DESKTOP LAYOUT (vertical card — original) ──────────────────────────────
  return (
    <>
      {qv && (
        <QuickViewModal product={product} wished={wished} busy={busy} cartAdded={cartAdded}
          onClose={() => setQv(false)} onWish={() => handleWish()} onCart={(q) => handleCart(undefined, q)} />
      )}

      <div
        className="pc4-card"
        onClick={e => {
          const t = e.target as HTMLElement
          if (t.closest('button') || t.closest('a')) return
          navigate(`/product-details/${product.product_id}`)
        }}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/product-details/${product.product_id}`)}
        aria-label={product.name}
      >
        {notice && (
          <div className={`pc4-toast ${noticeOut ? 'pc4-tout' : 'pc4-tin'}`}
            style={{ background: notice.includes('ould') ? B.red : B.green }}>
            {notice}
          </div>
        )}

        {/* Image */}
        <div className="pc4-img-wrap" style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', background:B.bgSoft, flexShrink:0 }}>
          <Link to={`/product-details/${product.product_id}`}
            style={{ position:'absolute', inset:0, display:'block', background:B.bgSoft }}
            tabIndex={-1} onClick={e => e.stopPropagation()}>
            <img src={image} alt={product.name} className="pc4-img" loading="lazy"
              onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x400/f3f3f7/c4c4d4?text=No+Image' }} />
          </Link>
          <div className="pc4-vignette" />
          <span className="pc4-tag-badge" style={{ background: tc }}>{tag}</span>
          {disc > 0 && <span className="pc4-disc-badge" style={{ top: 26, left: 0 }}>-{disc}% OFF</span>}
          {stock > 0 && stock <= 10 && <div className="pc4-low">Only {stock} left</div>}

          <button key={heartKey} type="button"
            className={`pc4-heart${wished ? ' wl-active' : ''}${heartKey > 0 ? ' pc4-pop' : ''}`}
            style={{ top: 10, right: 10 }}
            onClick={e => handleWish(e)} disabled={busy === 'wishlist'}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}>
            <svg width="12" height="12" viewBox="0 0 24 24"
              fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : B.muted} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          <div className="pc4-overlay">
            <div className="pc4-ov-bg" />
            <div className="pc4-ov-btns">
              <button type="button" className="pc4-ob" onClick={e => handleWish(e)} disabled={busy === 'wishlist'} aria-label="Wishlist">
                <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? '#FCA5A5' : 'none'} stroke={wished ? '#FCA5A5' : '#fff'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className="pc4-ob-lbl">{wished ? 'Saved' : 'Wishlist'}</span>
              </button>
              <button type="button" className="pc4-ob" onClick={e => handleCart(e)} disabled={busy === 'cart' || stock === 0} aria-label="Add to cart">
                {cartAdded
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
                <span className="pc4-ob-lbl">{cartAdded ? 'Added!' : stock === 0 ? 'No Stock' : 'Add Cart'}</span>
              </button>
              <button type="button" className="pc4-ob" aria-label="Quick view"
                onClick={e => { e.stopPropagation(); e.preventDefault(); setQv(true) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <span className="pc4-ob-lbl">Quick View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pc4-info">
          <div className="pc4-cat">{product.category}</div>
          <Link to={`/product-details/${product.product_id}`} className="pc4-name-link" onClick={e => e.stopPropagation()}>
            <h5 className="pc4-name">{product.name}</h5>
          </Link>
          <div className="pc4-stars-row">
            <Stars rating={product.average_rating || 0} />
            <span style={{ fontSize: 12, fontWeight: 700, color: B.body, marginLeft: 3, fontFamily: FONT, lineHeight: 1 }}>
              {(product.average_rating || 0) > 0 ? (product.average_rating).toFixed(1) : '—'}
            </span>
            <span className="pc4-rev-count">( {product.total_reviews || 0} )</span>
          </div>
          <div className="pc4-price-row">
            <div className="pc4-price-group">
              <span className="pc4-price">{fmtINR(price)}</span>
              {orig > price && <span className="pc4-orig">{fmtINR(orig)}</span>}
              {disc > 0 && <span className="pc4-disc-pill">-{disc}%</span>}
            </div>
            <button type="button"
              className={`pc4-cart-icon${cartAdded ? ' added' : ''}`}
              onClick={e => handleCart(e)} disabled={busy === 'cart' || stock === 0} aria-label="Add to cart"
              onMouseEnter={e => { if (!cartAdded) { (e.currentTarget as HTMLButtonElement).style.background = B.brandGrad; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent' } }}
              onMouseLeave={e => { if (!cartAdded) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = B.border } }}>
              {cartAdded
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={B.muted} strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
            </button>
          </div>
          {saved > 0 && <p className="pc4-save">You save {fmtINR(saved)}</p>}
          {stock === 0 && <div className="pc4-oos">Out of Stock</div>}
        </div>

        <div className="pc4-accent-bar" />
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
      const res = await fetch(API_URL, { headers: { Accept: 'application/json' } })
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
    const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting) loadMore() }, { rootMargin: '200px' })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [loadMore])

  return (
    <section className="pc4-section" data-aos="fade-up">
      <div className="container-fluid">
        <div style={{ maxWidth: 1720, margin: '0 auto' }}>
          <div className="pc4-header">
            <div className="pc4-eyebrow">Our Products</div>
            <h2 className="pc4-title">Explore Our Collection</h2>
            <p className="pc4-sub">Handpicked items with the best quality and unbeatable prices.</p>
          </div>

          {error && (
            <div className="pc4-err">⚠ {error}<br/>
              <button className="pc4-retry" onClick={fetchProducts} type="button">Retry</button>
            </div>
          )}

          {!error && (
            <div className="pc4-grid">
              {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={`sk-${i}`} isMobile={isMobile} />
              ))}
              {!loading && displayed.map(p => (
                <ProductCard key={p.product_id} product={p} isMobile={isMobile} />
              ))}
              {loadingMore && Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={`skm-${i}`} isMobile={isMobile} />
              ))}
            </div>
          )}

          {!loading && !error && hasMore && (
            <div ref={sentinelRef} className="pc4-sentinel" aria-hidden="true" />
          )}
          {loadingMore && (
            <div className="pc4-spinner-wrap">
              <div className="pc4-spinner" />
              <span>Loading more products…</span>
            </div>
          )}
          {!loading && !error && !hasMore && displayed.length > 0 && (
            <div className="pc4-end">
              <div className="pc4-end-rule">
                <div className="pc4-end-dash" />
                <span>You've seen all {displayed.length} products</span>
                <div className="pc4-end-dash" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}