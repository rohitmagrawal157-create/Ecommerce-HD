// src/components/product/layout-one.tsx  — Infinity Brand v5.1
// =============================================================================
//  FIXES IN v5.1 (vs v5.0):
//
//  FIX-A  Info zone now has proper horizontal padding (12px left/right)
//         Text and price row no longer touch the card edges.
//         The info block feels "breathable" and professional.
//
//  FIX-B  Currency symbol changed from $ → ₹ throughout:
//         · Item price display
//         · computeMrp() output
//         · Quick View modal prices
//         · All fallback MRP calculations
//
//  FIX-C  Price row fully redesigned:
//         ₹165 (gradient, large, bold)  ₹206 (grey strikethrough, smaller)
//         -20% badge (red→orange pill, right-aligned)
//         Cart icon always right-aligned, never overlapping price
//
//  FIX-D  Card bottom border-radius added (8px) so the accent bar
//         at the bottom respects the card shape
//
//  ALL ORIGINAL API LOGIC PRESERVED (unchanged):
//  · isWishlisted() + toggleWishlist() + addToCart(item.id, 1)
//  · busy / wished / notice state + disabled checks
//  · Quick View modal via createPortal (Escape, click-outside, body scroll lock)
// =============================================================================

import { useEffect, useRef, useState }  from 'react'
import { createPortal }                  from 'react-dom'
import { GoStarFill }                    from 'react-icons/go'
import { LuEye, LuHeart, LuX }          from 'react-icons/lu'
import { RiShoppingBag2Line }            from 'react-icons/ri'
import { BsCheckLg }                     from 'react-icons/bs'
import { Link }                          from 'react-router-dom'
import { addToCart }                     from '../../api/cart.api'
import { isWishlisted, toggleWishlist }  from '../../api/wishlist.api'

// ── Extended Item type ────────────────────────────────────────────────────────
interface Item {
  id:             number
  image:          string
  tag:            string
  price:          string        // e.g. "₹165" or "165" or "$165"
  name:           string
  rating?:        number        // 1–5, e.g. 4 → shows "4.0"
  originalPrice?: string        // MRP e.g. "₹206" or "206"
  discount?:      number        // percent off, e.g. 20
}

// ── Brand tokens ──────────────────────────────────────────────────────────────
const B = {
  brandGrad: 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)',
  ctaGrad:   'linear-gradient(135deg,#2563EB 0%,#06B6D4 50%,#22C55E 100%)',
  discGrad:  'linear-gradient(135deg,#E8314A,#F97316)',
  purple:    '#5B4FBE',
  red:       '#E8314A',
  orange:    '#F97316',
  teal:      '#06B6D4',
  green:     '#22C55E',
  bg:        '#FFFFFF',
  bgSoft:    '#FAFAFA',
  border:    '#EBEBF0',
  text:      '#111827',
  body:      '#374151',
  muted:     '#6B7280',
  faint:     '#9CA3AF',
  yellow:    '#F59E0B',
}

// ── Tag → badge colour ────────────────────────────────────────────────────────
const TAG_MAP: Record<string, string> = {
  'Sale':'#E8314A','Hot Sale':'#E8314A','Hot':'#E8314A','10% OFF':'#06B6D4',
  'New Arrival':'#5B4FBE','NEW':'#5B4FBE','New':'#5B4FBE',
  'Bestseller':'#F97316','Premium':'#5B4FBE','Luxury':'#7C5C2A',
  'Handcrafted':'#06B6D4','Handpainted':'#EC4899',
  'Modern':'#22C55E','Vintage':'#78540A','Eco-Friendly':'#22C55E',
  'Original':'#5B4FBE','Print':'#06B6D4','Set of 3':'#F97316',
  'Original Oil':'#8B4513','Contemporary':'#4B5563','Spiritual':'#F97316',
  'Folk Art':'#EC4899','Tanjore':'#F97316','Zen':'#22C55E',
  'Kalamkari':'#78540A','Dreamy':'#5B4FBE','Urban':'#374151',
  'Nature':'#22C55E','Trendy':'#EC4899','Kids':'#F59E0B',
  'Custom':'#374151','Smart':'#06B6D4','Furniture':'#78540A',
  'Ambience':'#5B4FBE','Educational':'#06B6D4','Wellness':'#22C55E',
  'RGB':'#5B4FBE','Office':'#374151','Commercial':'#4B5563','Décor':'#78540A',
}
const tagColor = (t: string) => TAG_MAP[t] ?? B.muted

// ── SALE TAGS that auto-get a 20% MRP if no originalPrice supplied ────────────
const SALE_TAGS = new Set(['Sale','Hot Sale','10% OFF','Hot','Bestseller'])

// ── FIX-B: Parse price → strip any currency prefix, return plain number ───────
function parseNum(p: string): number {
  const n = parseFloat(p.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

// ── FIX-B: Format rupee price → ₹1,65,000 or ₹165 ───────────────────────────
function fmtRupee(p: string | number): string {
  const num = typeof p === 'number' ? p : parseNum(String(p))
  if (num === 0) return typeof p === 'string' ? p : '₹0'
  // Indian comma format: xx,xx,xxx
  return '₹' + num.toLocaleString('en-IN')
}

// ── FIX-B: Compute MRP from sale price + discount % ──────────────────────────
function computeMrp(price: string, discountPct = 20): string {
  const num = parseNum(price)
  if (num === 0) return ''
  const mrp = num / (1 - discountPct / 100)
  return fmtRupee(Math.round(mrp))
}

// ── Injected CSS (once) ───────────────────────────────────────────────────────
let _css = false
function injectCSS() {
  if (_css || typeof document === 'undefined') return
  const s = document.createElement('style')
  s.id = 'inf-v51-styles'
  s.textContent = `
/* Heart pop */
@keyframes infPop{0%{transform:scale(1)}38%{transform:scale(1.52)}65%{transform:scale(0.86)}100%{transform:scale(1)}}
.inf-pop{animation:infPop .36s cubic-bezier(.36,.07,.19,.97) both}

/* Overlay slide-up */
.inf-cw .inf-ov{transform:translateY(100%);opacity:0;transition:transform .34s cubic-bezier(0.22,1,0.36,1),opacity .26s ease}
.inf-cw:hover .inf-ov{transform:translateY(0%);opacity:1}

/* Staggered buttons */
.inf-cw .inf-ob{opacity:0;transform:translateY(5px);transition:opacity .22s ease,transform .22s ease}
.inf-cw:hover .inf-ob{opacity:1;transform:translateY(0)}
.inf-cw:hover .inf-ob:nth-child(1){transition-delay:0ms}
.inf-cw:hover .inf-ob:nth-child(2){transition-delay:58ms}
.inf-cw:hover .inf-ob:nth-child(3){transition-delay:116ms}

/* Button brand-gradient fill on hover */
.inf-ob{position:relative;overflow:hidden}
.inf-ob::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%);opacity:0;transition:opacity .22s ease;z-index:0}
.inf-ob:hover::before{opacity:1}
.inf-ob>*{position:relative;z-index:1}

/* Image zoom */
.inf-cw .inf-pi{transition:transform .65s cubic-bezier(0.25,0.46,0.45,0.94)}
.inf-cw:hover .inf-pi{transform:scale(1.07)}

/* Card hover lift */
.inf-cw{transition:box-shadow .28s ease,transform .28s ease,border-color .2s ease}
.inf-cw:hover{box-shadow:0 8px 32px rgba(91,79,190,0.16);transform:translateY(-2px);border-color:rgba(91,79,190,0.18)!important}

/* Bottom accent bar */
.inf-bar{transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(0.22,1,0.36,1)}
.inf-cw:hover .inf-bar{transform:scaleX(1)}

/* Toast */
@keyframes infTin{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
@keyframes infTout{from{opacity:1}to{opacity:0}}
.inf-tin{animation:infTin .2s ease forwards}
.inf-tout{animation:infTout .45s ease 1.9s forwards}

/* Gradient price text */
.inf-price{
  background:linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  color:transparent;
}

/* Strikethrough MRP */
.inf-mrp{
  text-decoration:line-through;
  color:#9CA3AF;
  font-size:12px;
  font-weight:400;
  line-height:1;
}

/* Discount badge pill */
.inf-disc{
  display:inline-flex;align-items:center;justify-content:center;
  padding:2px 7px;border-radius:20px;
  font-size:9px;font-weight:700;letter-spacing:0.08em;
  text-transform:uppercase;color:#fff;line-height:1;
  background:linear-gradient(135deg,#E8314A,#F97316);
  flex-shrink:0;
}
  `
  document.head.appendChild(s)
  _css = true
}

// ── Quick View Modal ──────────────────────────────────────────────────────────
function QV({ item, wished, busy, cartAdded, onClose, onCart, onWish }: {
  item: Item; wished: boolean; busy: null | 'cart' | 'wishlist'
  cartAdded: boolean; onClose(): void; onCart(): void; onWish(): void
}) {
  const tc = tagColor(item.tag)
  const isSaleTag = SALE_TAGS.has(item.tag)
  const discPct   = item.discount ?? (isSaleTag ? 20 : 0)
  const mrp       = item.originalPrice ?? (discPct > 0 ? computeMrp(item.price, discPct) : '')
  const salePrice = fmtRupee(item.price)    // FIX-B: always ₹
  const mrpFmt    = mrp ? fmtRupee(mrp) : ''
  const ratingNum = item.rating ?? 4

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-gray-100 transition shadow-sm" aria-label="Close">
          <LuX size={16} className="text-gray-600" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-1/2 bg-gray-50 overflow-hidden flex-shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" style={{ aspectRatio: '1/1' }} />
            <span className="absolute top-4 left-4 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full" style={{ background: tc }}>{item.tag}</span>
            {discPct > 0 && (
              <span className="absolute top-4 left-24 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full" style={{ background: B.discGrad }}>-{discPct}% OFF</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 p-6 md:p-8 flex flex-col">
            <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">INFINITY PRINT &amp; SIGNAGE</div>
            <h3 className="text-2xl md:text-3xl font-normal text-gray-900 mb-3" style={{ fontFamily: 'serif' }}>{item.name}</h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              {[1,2,3,4,5].map(s => (
                <GoStarFill key={s} size={14} color={s <= ratingNum ? B.yellow : '#E5E7EB'} />
              ))}
              <span className="text-sm font-bold text-gray-700">{ratingNum.toFixed(1)}</span>
              <span className="text-xs text-gray-400">(1,230 reviews)</span>
            </div>

            {/* Price block */}
            <div className="flex items-center gap-3 mb-2">
              <span className="inf-price text-3xl font-bold">{salePrice}</span>
              {mrpFmt && <span className="inf-mrp text-base">{mrpFmt}</span>}
              {discPct > 0 && <span className="inf-disc">-{discPct}% OFF</span>}
            </div>
            {discPct > 0 && mrpFmt && (
              <p className="text-xs text-green-600 font-semibold mb-5">
                You save {fmtRupee(parseNum(mrpFmt) - parseNum(item.price))} on this order
              </p>
            )}

            <hr className="my-4 border-gray-100" />

            {/* Meta */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1">Category</div>
                <span className="text-[10px] font-bold text-white px-2 py-1 rounded-full" style={{ background: tc }}>{item.tag}</span>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1">SKU</div>
                <div className="text-sm font-medium text-gray-700">INF-{String(item.id).padStart(5, '0')}</div>
              </div>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Qty</div>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">−</button>
                <span className="w-10 text-center text-sm font-semibold text-gray-800">1</span>
                <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">+</button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-auto">
              <button onClick={onCart} disabled={busy === 'cart'}
                className="flex-1 h-12 flex items-center justify-center gap-2 text-sm font-bold tracking-wide uppercase text-white rounded-full transition-all duration-300 disabled:opacity-60"
                style={{ background: cartAdded ? B.green : B.brandGrad }}>
                {cartAdded ? <><BsCheckLg size={14} /> Added</> : <><RiShoppingBag2Line size={15} /> Add to Cart</>}
              </button>
              <button onClick={onWish} disabled={busy === 'wishlist'}
                className="w-12 h-12 flex items-center justify-center rounded-full border transition-all disabled:opacity-60"
                style={{ borderColor: wished ? B.red : '#e5e7eb', background: wished ? '#FFF0F0' : 'transparent' }}>
                <LuHeart size={18} color={wished ? B.red : '#9ca3af'} fill={wished ? B.red : 'none'} />
              </button>
            </div>

            <Link to={`/product-details/${item.id}`} onClick={onClose}
              className="mt-5 text-center text-xs text-gray-400 hover:text-purple-600 underline underline-offset-2 transition">
              View full product details →
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Main Card ─────────────────────────────────────────────────────────────────
export default function LayoutOne({ item }: { item: Item }) {
  injectCSS()

  // ── STATE (unchanged) ───────────────────────────────────────────────────────
  const [wished,    setWished]    = useState(false)
  const [busy,      setBusy]      = useState<null | 'cart' | 'wishlist'>(null)
  const [notice,    setNotice]    = useState<string | null>(null)
  const [cartAdded, setCartAdded] = useState(false)
  const [heartKey,  setHeartKey]  = useState(0)
  const [qv,        setQv]        = useState(false)
  const [noticeOut, setNoticeOut] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Wishlist init (unchanged) ───────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    isWishlisted(item.id).then(v => { if (alive) setWished(v) }).catch(() => {})
    return () => { alive = false }
  }, [item.id])

  const toast = (msg: string) => {
    setNotice(msg); setNoticeOut(false)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => { setNoticeOut(true); setTimeout(() => setNotice(null), 480) }, 2000)
  }

  // ── Wishlist toggle (unchanged) ─────────────────────────────────────────────
  const handleWish = async () => {
    if (busy) return
    setBusy('wishlist'); setHeartKey(k => k + 1)
    try {
      const r = await toggleWishlist(item.id)
      const w = r.productIds.includes(item.id)
      setWished(w); toast(w ? '♥ Saved to wishlist' : 'Removed from wishlist')
    } catch { toast('Could not update wishlist') }
    finally { setBusy(null) }
  }

  // ── Add to cart (unchanged) ─────────────────────────────────────────────────
  const handleCart = async () => {
    if (busy) return
    setBusy('cart')
    try {
      await addToCart(item.id, 1)
      setCartAdded(true); toast('✓ Added to cart')
      setTimeout(() => setCartAdded(false), 1600)
    } catch { toast('Could not add to cart') }
    finally { setBusy(null) }
  }

  // ── Price / discount logic ──────────────────────────────────────────────────
  const isSaleTag  = SALE_TAGS.has(item.tag)
  const discPct    = item.discount ?? (isSaleTag ? 20 : 0)
  const mrpRaw     = item.originalPrice ?? (discPct > 0 ? computeMrp(item.price, discPct) : '')
  const salePrice  = fmtRupee(item.price)         // FIX-B: ₹ formatted
  const mrpPrice   = mrpRaw ? fmtRupee(mrpRaw) : ''
  const showPricing = discPct > 0 && mrpPrice !== ''

  // ── Rating ──────────────────────────────────────────────────────────────────
  const ratingNum   = item.rating ?? 4
  const ratingLabel = ratingNum.toFixed(1)

  const tc = tagColor(item.tag)

  return (
    <>
      {qv && (
        <QV item={item} wished={wished} busy={busy} cartAdded={cartAdded}
          onClose={() => setQv(false)} onCart={handleCart} onWish={handleWish} />
      )}

      {/* ══ CARD ══════════════════════════════════════════════════════════════ */}
      <div
        className="inf-cw relative flex flex-col overflow-hidden"
        style={{
          background: B.bg,
          border: `1px solid ${B.border}`,
          borderRadius: 8,                  /* FIX-D: card has rounded corners */
        }}
      >

        {/* Toast */}
        {notice && (
          <div
            className={`absolute top-0 inset-x-0 z-50 text-white text-[9px] font-bold tracking-[0.12em] uppercase text-center py-[6px] leading-none pointer-events-none select-none ${noticeOut ? 'inf-tout' : 'inf-tin'}`}
            style={{ background: notice.includes('ould') ? B.red : B.green }}
          >
            {notice}
          </div>
        )}

        {/* ── IMAGE ZONE ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', borderRadius: '8px 8px 0 0' }}>

          <Link to={`/product-details/${item.id}`} className="absolute inset-0 block" style={{ background: B.bgSoft }}>
            <img src={item.image} alt={item.name} loading="lazy"
              className="inf-pi w-full h-full object-cover" />
          </Link>

          {/* Bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: '46%', background: 'linear-gradient(to top,rgba(0,0,0,0.34),transparent)' }} />

          {/* Tag badge */}
          <span
            className="absolute top-0 left-0 z-20 text-white text-[9px] font-bold tracking-[0.14em] uppercase px-[10px] py-[5px] leading-none select-none"
            style={{ background: tc, borderRadius: '8px 0 4px 0' }}
          >
            {item.tag}
          </span>

          {/* Discount badge — stacked below tag */}
          {showPricing && (
            <span
              className="absolute z-20 text-white text-[8px] font-bold tracking-[0.1em] uppercase px-[10px] py-[4px] leading-none select-none"
              style={{ background: B.discGrad, top: 26, left: 0, borderRadius: '0 4px 4px 0' }}
            >
              -{discPct}% OFF
            </span>
          )}

          {/* Wishlist heart — top right */}
          <button
            key={heartKey} type="button" onClick={handleWish}
            disabled={busy === 'wishlist'}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-[10px] right-[10px] z-30 w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all duration-200 ${heartKey > 0 ? 'inf-pop' : ''} ${busy === 'wishlist' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
            style={{
              background: wished ? B.brandGrad : B.bg,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: `1px solid ${wished ? 'transparent' : B.border}`,
            }}
          >
            <LuHeart style={{ width: 12, height: 12 }} color={wished ? '#fff' : B.muted} fill={wished ? '#fff' : 'none'} />
          </button>

          {/* ── HOVER OVERLAY ── */}
          <div className="inf-ov absolute inset-x-0 bottom-0 z-20">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.42) 100%)' }} />
            <div className="relative flex items-stretch">

              {/* Wishlist */}
              <button type="button" onClick={handleWish} disabled={busy === 'wishlist'} aria-label="Wishlist"
                className={`inf-ob flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] border-r ${busy === 'wishlist' ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <LuHeart style={{ width: 14, height: 14, flexShrink: 0 }} color={wished ? '#FCA5A5' : '#fff'} fill={wished ? '#FCA5A5' : 'none'} />
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>
                  {wished ? 'Saved' : 'Wishlist'}
                </span>
              </button>

              {/* Add Cart */}
              <button type="button" onClick={handleCart} disabled={busy === 'cart'} aria-label="Add to cart"
                className={`inf-ob flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] border-r ${busy === 'cart' ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                {cartAdded
                  ? <BsCheckLg style={{ width: 14, height: 14, flexShrink: 0, color: '#86EFAC' }} />
                  : <RiShoppingBag2Line style={{ width: 14, height: 14, flexShrink: 0, color: '#fff' }} />}
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>
                  {cartAdded ? 'Added!' : 'Add Cart'}
                </span>
              </button>

              {/* Quick View */}
              <button type="button" onClick={() => setQv(true)} aria-label="Quick view"
                className="inf-ob flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] cursor-pointer">
                <LuEye style={{ width: 14, height: 14, flexShrink: 0, color: '#fff' }} />
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>
                  Quick View
                </span>
              </button>

            </div>
          </div>
          {/* ── END HOVER OVERLAY ── */}

        </div>
        {/* ── END IMAGE ZONE ── */}

        {/* ══════════════════════════════════════════════════════════════════
            INFO ZONE
            FIX-A: padding 12px left/right so text never touches the border
            FIX-B: rupee symbol via fmtRupee()
            FIX-C: clean price row — sale price | MRP strikethrough | -XX% pill
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          padding: '12px 12px 14px',    /* FIX-A: 12px horizontal padding */
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}>

          {/* Product name */}
          <Link to={`/product-details/${item.id}`} className="block" style={{ marginBottom: 8 }}>
            <h5
              style={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.45,
                color: B.body,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'color .18s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = B.purple)}
              onMouseLeave={e => (e.currentTarget.style.color = B.body)}
            >
              {item.name}
            </h5>
          </Link>

          {/* Stars + rating + review count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <GoStarFill key={s} style={{ width: 11, height: 11, color: s <= ratingNum ? B.yellow : '#D1D5DB' }} />
            ))}
            <span style={{ fontSize: 12, fontWeight: 700, color: B.body, marginLeft: 3, lineHeight: 1 }}>
              {ratingLabel}
            </span>
            <span style={{ fontSize: 11, color: B.faint, lineHeight: 1 }}>
              ( 1,230 )
            </span>
          </div>

          {/* ── FIX-C: Professional price row ───────────────────────────── */}
          {/*
            Layout:
            [LEFT]  ₹165   ₹206   -20%
            [RIGHT] cart icon button
          */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>

            {/* Price group */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, flex: 1, minWidth: 0 }}>

              {/* FIX-B: Sale price in gradient + ₹ */}
              <span className="inf-price" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1 }}>
                {salePrice}
              </span>

              {/* FIX-C: MRP with strikethrough */}
              {showPricing && (
                <span className="inf-mrp" style={{ fontSize: 12 }}>
                  {mrpPrice}
                </span>
              )}

              {/* FIX-C: Discount pill */}
              {showPricing && (
                <span className="inf-disc">
                  -{discPct}%
                </span>
              )}

            </div>

            {/* Cart icon button — right aligned, never overlaps price */}
            <button
              type="button"
              onClick={handleCart}
              disabled={busy === 'cart'}
              aria-label="Add to cart"
              style={{
                flexShrink: 0,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${B.border}`,
                borderRadius: 6,
                background: cartAdded ? B.green : 'transparent',
                cursor: busy === 'cart' ? 'not-allowed' : 'pointer',
                opacity: busy === 'cart' ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!cartAdded) {
                  (e.currentTarget as HTMLButtonElement).style.background = B.brandGrad
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'
                }
              }}
              onMouseLeave={e => {
                if (!cartAdded) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = B.border
                }
              }}
            >
              {cartAdded
                ? <BsCheckLg style={{ width: 11, height: 11, color: '#fff' }} />
                : <RiShoppingBag2Line style={{ width: 13, height: 13, color: B.muted }} />}
            </button>

          </div>
          {/* ── END PRICE ROW ── */}

          {/* FIX-C: "You save ₹XX" savings line — only when discount exists */}
          {showPricing && (
            <p style={{
              marginTop: 5,
              fontSize: 10,
              fontWeight: 600,
              color: '#16A34A',
              lineHeight: 1,
            }}>
              You save {fmtRupee(
                Math.round(parseNum(mrpRaw || computeMrp(item.price, discPct)) - parseNum(item.price))
              )}
            </p>
          )}

        </div>
        {/* ── END INFO ZONE ── */}

        {/* Bottom brand accent bar — draws in on hover */}
        <div
          className="inf-bar absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: 2, background: B.brandGrad, borderRadius: '0 0 8px 8px' }}
        />

      </div>
      {/* ── END CARD ── */}
    </>
  )
}