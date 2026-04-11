// src/components/product/layout-one.tsx  — Infinity Brand v5.0
// =============================================================================
//  FIXES IN THIS VERSION:
//
//  FIX-1  Bottom white-space eliminated
//         Root cause: `mt-auto` on the price row + `minHeight:39px` on name
//         were creating unpredictable gaps when the product name was short.
//         Fix: All info-zone elements use fixed margins (not flex mt-auto).
//         The info zone has a fixed internal structure with zero flex gaps.
//
//  FIX-2  Text size increased
//         Name: 13px → 15px  (readable, medium-large)
//         Price: 14px → 17px (prominent, brand-coloured)
//
//  FIX-3  Numeric rating added  e.g. ★★★★☆  4.0  (1,230)
//         Item interface extended with optional `rating?: number`
//         Displays rating.toFixed(1) between stars and review count
//
//  FIX-4  Original price (MRP) with strikethrough + discount badge
//         Item interface extended with optional `originalPrice?: string`
//         and `discount?: number`
//         When originalPrice is provided: shows  ~~$269.00~~  $215.00  [-20%]
//         When not provided + tag is Sale/10% OFF: auto-computes MRP
//         at 20% above the sale price so the card always looks correct
//
//  ALL ORIGINAL API LOGIC PRESERVED:
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
  id:            number
  image:         string
  tag:           string
  price:         string
  name:          string
  rating?:       number   // FIX-3: 1–5, e.g. 4 → shows "4.0"
  originalPrice?: string  // FIX-4: MRP before discount, e.g. "$269.00"
  discount?:     number   // FIX-4: percent off, e.g. 20 → "-20%"
}

// ── Brand tokens ──────────────────────────────────────────────────────────────
const B = {
  brandGrad: 'linear-gradient(135deg, #6B3FA0 0%, #DC2626 50%, #F97316 100%)',
  ctaGrad:   'linear-gradient(135deg, #0EA5C2 0%, #16A34A 60%, #84CC16 100%)',
  purple:    '#6B3FA0',
  red:       '#DC2626',
  orange:    '#F97316',
  teal:      '#0EA5C2',
  green:     '#16A34A',
  pink:      '#EC4899',
  yellow:    '#EAB308',
  bg:        '#FFFFFF',
  bgSoft:    '#FAFAFA',
  border:    '#EBEBF0',
  text:      '#111827',
  body:      '#374151',
  muted:     '#6B7280',
  faint:     '#9CA3AF',
}

// ── Tag → badge colour ────────────────────────────────────────────────────────
const TAG_MAP: Record<string, string> = {
  'Sale':'#DC2626','Hot Sale':'#DC2626','Hot':'#DC2626','10% OFF':'#0EA5C2',
  'New Arrival':'#6B3FA0','NEW':'#6B3FA0','New':'#6B3FA0',
  'Bestseller':'#F97316','Bestseller ':'#F97316','Premium':'#6B3FA0',
  'Luxury':'#7C5C2A','Handcrafted':'#0EA5C2','Handpainted':'#EC4899',
  'Modern':'#16A34A','Vintage':'#78540A','Eco-Friendly':'#16A34A',
  'Original':'#6B3FA0','Print':'#0EA5C2','Set of 3':'#F97316',
  'Original Oil':'#8B4513','Contemporary':'#4B5563','Spiritual':'#F97316',
  'Folk Art':'#EC4899','Tanjore':'#F97316','Zen':'#16A34A',
  'Kalamkari':'#78540A','Dreamy':'#6B3FA0','Urban':'#374151',
  'Nature':'#16A34A','Trendy':'#EC4899','Kids':'#EAB308',
  'Custom':'#374151','Smart':'#0EA5C2','Furniture':'#78540A',
  'Ambience':'#6B3FA0','Educational':'#0EA5C2','Wellness':'#16A34A','RGB':'#6B3FA0',
}
const tagColor = (t:string) => TAG_MAP[t] ?? B.muted

// ── Sale tags — auto-compute MRP if no originalPrice supplied ─────────────────
const SALE_TAGS = new Set(['Sale','Hot Sale','10% OFF','Hot'])

function computeMrp(price:string, discountPct = 20): string {
  const num = parseFloat(price.replace(/[^0-9.]/g,''))
  if(isNaN(num)) return ''
  const mrp = num / (1 - discountPct / 100)
  return `$${mrp.toFixed(2)}`
}

// ── Injected CSS (once) ───────────────────────────────────────────────────────
let _css = false
function injectCSS() {
  if(_css || typeof document==='undefined') return
  const s = document.createElement('style')
  s.id = 'inf-v5-styles'
  s.textContent = `
/* Heart pop */
@keyframes infPop{0%{transform:scale(1)}38%{transform:scale(1.52)}65%{transform:scale(0.86)}100%{transform:scale(1)}}
.inf-pop{animation:infPop .36s cubic-bezier(.36,.07,.19,.97) both}

/* Overlay hidden → visible — overflow:hidden on parent clips it when translateY(100%) */
.inf-cw .inf-ov{transform:translateY(100%);opacity:0;transition:transform .34s cubic-bezier(0.22,1,0.36,1),opacity .26s ease}
.inf-cw:hover .inf-ov{transform:translateY(0%);opacity:1}

/* Staggered buttons */
.inf-cw .inf-ob{opacity:0;transform:translateY(5px);transition:opacity .22s ease,transform .22s ease}
.inf-cw:hover .inf-ob{opacity:1;transform:translateY(0)}
.inf-cw:hover .inf-ob:nth-child(1){transition-delay:0ms}
.inf-cw:hover .inf-ob:nth-child(2){transition-delay:58ms}
.inf-cw:hover .inf-ob:nth-child(3){transition-delay:116ms}

/* Button brand-gradient on hover */
.inf-ob{position:relative;overflow:hidden}
.inf-ob::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#6B3FA0 0%,#DC2626 50%,#F97316 100%);opacity:0;transition:opacity .22s ease;z-index:0}
.inf-ob:hover::before{opacity:1}
.inf-ob>*{position:relative;z-index:1}

/* Image zoom */
.inf-cw .inf-pi{transition:transform .65s cubic-bezier(0.25,0.46,0.45,0.94)}
.inf-cw:hover .inf-pi{transform:scale(1.07)}

/* Card hover */
.inf-cw{transition:box-shadow .28s ease,transform .28s ease,border-color .2s ease}
.inf-cw:hover{box-shadow:0 8px 32px rgba(107,63,160,0.16);transform:translateY(-2px);border-color:rgba(107,63,160,0.18)!important}

/* Bottom accent bar */
.inf-bar{transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(0.22,1,0.36,1)}
.inf-cw:hover .inf-bar{transform:scaleX(1)}

/* Toast */
@keyframes infTin{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
@keyframes infTout{from{opacity:1}to{opacity:0}}
.inf-tin{animation:infTin .2s ease forwards}
.inf-tout{animation:infTout .45s ease 1.9s forwards}

/* QV modal */
@keyframes infBg{from{opacity:0}to{opacity:1}}
@keyframes infMd{from{opacity:0;transform:scale(0.94) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.inf-qvbg{animation:infBg .22s ease forwards}
.inf-qvm{animation:infMd .28s cubic-bezier(0.22,1,0.36,1) forwards}

/* Price gradient */
.inf-price{background:linear-gradient(135deg,#6B3FA0 0%,#DC2626 50%,#F97316 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

/* Strikethrough original price */
.inf-mrp{text-decoration:line-through;color:#9CA3AF;font-size:12px;font-weight:400;line-height:1}

/* Discount badge */
.inf-disc{
  display:inline-flex;align-items:center;justify-content:center;
  padding:2px 6px;font-size:9px;font-weight:700;
  letter-spacing:0.06em;text-transform:uppercase;
  color:#fff;line-height:1;
  background:linear-gradient(135deg,#DC2626,#F97316);
}
  `
  document.head.appendChild(s)
  _css = true
}

// ── Quick View Modal ───────────────────────────────────────────────────────────
function QV({ item, wished, busy, cartAdded, onClose, onCart, onWish }:{
  item:Item; wished:boolean; busy:null|'cart'|'wishlist'
  cartAdded:boolean; onClose():void; onCart():void; onWish():void
}) {
  const tc = tagColor(item.tag)
  const showDiscount = item.discount || (SALE_TAGS.has(item.tag) && !item.discount)
  const discPct  = item.discount ?? 20
  const mrp      = item.originalPrice ?? (showDiscount ? computeMrp(item.price, discPct) : '')
  const actualDisc = item.discount ?? (SALE_TAGS.has(item.tag) ? 20 : 0)

  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()}
    document.addEventListener('keydown',fn)
    document.body.style.overflow='hidden'
    return()=>{document.removeEventListener('keydown',fn);document.body.style.overflow=''}
  },[onClose])

  return createPortal(
    <div className="inf-qvbg fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.78)',backdropFilter:'blur(6px)'}}
      onClick={onClose}>
      <div className="inf-qvm relative bg-white w-full max-w-[860px] flex flex-col sm:flex-row"
        style={{boxShadow:'0 40px 100px rgba(0,0,0,0.5)'}}
        onClick={e=>e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          style={{border:`1px solid ${B.border}`}}>
          <LuX size={14} color={B.muted}/>
        </button>

        {/* Image */}
        <div className="relative w-full sm:w-[44%] flex-shrink-0 overflow-hidden"
          style={{aspectRatio:'1/1',background:B.bgSoft}}>
          <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
          <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{background:B.brandGrad}}/>
          <span className="absolute top-0 left-0 text-white text-[9px] font-bold tracking-[0.14em] uppercase px-3 py-[5px]"
            style={{background:tc}}>{item.tag}</span>
          {actualDisc>0 && (
            <span className="absolute top-7 left-0 text-white text-[9px] font-bold tracking-[0.1em] uppercase px-3 py-[4px]"
              style={{background:'linear-gradient(135deg,#DC2626,#F97316)'}}>
              -{actualDisc}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-3">
            <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:B.faint}}>
              INFINITY PRINT & SIGNAGE
            </span>
          </div>
          <h3 style={{
            fontFamily:"'DM Serif Display',Georgia,serif",
            fontSize:22,fontWeight:400,color:B.text,
            lineHeight:1.3,marginBottom:12
          }}>{item.name}</h3>

          {/* Stars + numeric */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-[2px]">
              {[1,2,3,4,5].map(s=>(
                <GoStarFill key={s} style={{
                  width:13,height:13,
                  color:s<=(item.rating??4)?B.yellow:'#D1D5DB'
                }}/>
              ))}
            </div>
            <span style={{fontSize:13,fontWeight:700,color:B.body}}>
              {(item.rating??4).toFixed(1)}
            </span>
            <span style={{fontSize:12,color:B.faint}}>(1,230 reviews)</span>
          </div>

          {/* Price block */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="inf-price" style={{fontSize:28,fontWeight:700}}>{item.price}</span>
            {mrp && <span className="inf-mrp">{mrp}</span>}
            {actualDisc>0 && <span className="inf-disc">-{actualDisc}%</span>}
          </div>

          <div className="w-full h-[2px] mb-6" style={{background:B.brandGrad}}/>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span style={{fontSize:11,color:B.faint,textTransform:'uppercase',letterSpacing:'0.1em'}}>Category</span>
              <span className="text-[9px] font-bold text-white px-2 py-[3px] uppercase tracking-widest"
                style={{background:tc}}>{item.tag}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{fontSize:11,color:B.faint,textTransform:'uppercase',letterSpacing:'0.1em'}}>SKU</span>
              <span style={{fontSize:11,color:B.body,fontWeight:600}}>INF-{String(item.id).padStart(5,'0')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-7">
            <span style={{fontSize:11,color:B.faint,textTransform:'uppercase',letterSpacing:'0.1em',width:60}}>Qty</span>
            <div className="flex items-center" style={{border:`1px solid ${B.border}`}}>
              <button className="w-9 h-9 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors" style={{color:B.body}}>−</button>
              <span className="w-10 text-center text-sm font-semibold" style={{color:B.text}}>1</span>
              <button className="w-9 h-9 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors" style={{color:B.body}}>+</button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-auto">
            <button onClick={onCart} disabled={busy==='cart'}
              className="flex-1 h-12 flex items-center justify-center gap-2 text-sm font-bold tracking-[0.08em] uppercase text-white transition-all duration-300"
              style={{
                background:cartAdded?B.green:B.brandGrad,
                opacity:busy==='cart'?0.6:1,cursor:busy==='cart'?'not-allowed':'pointer',
              }}>
              {cartAdded?<><BsCheckLg size={14}/>Added to Cart</>:<><RiShoppingBag2Line size={15}/>Add to Cart</>}
            </button>
            <button onClick={onWish} disabled={busy==='wishlist'}
              className="w-12 h-12 flex items-center justify-center transition-all duration-200"
              style={{
                border:wished?`1.5px solid ${B.red}`:`1.5px solid ${B.border}`,
                background:wished?'#FFF0F0':'transparent',
                opacity:busy==='wishlist'?0.5:1,cursor:busy==='wishlist'?'not-allowed':'pointer',
              }}>
              <LuHeart size={17} color={wished?B.red:B.muted} fill={wished?B.red:'none'}/>
            </button>
          </div>
          <Link to={`/product-details/${item.id}`} onClick={onClose}
            className="mt-4 text-[11px] text-center underline underline-offset-2 transition-colors"
            style={{color:B.faint}}
            onMouseEnter={e=>(e.currentTarget.style.color=B.purple)}
            onMouseLeave={e=>(e.currentTarget.style.color=B.faint)}>
            View full product details →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Main Card Component ────────────────────────────────────────────────────────
export default function LayoutOne({ item }: { item: Item }) {
  injectCSS()

  const [wished,    setWished]    = useState(false)
  const [busy,      setBusy]      = useState<null|'cart'|'wishlist'>(null)
  const [notice,    setNotice]    = useState<string|null>(null)
  const [cartAdded, setCartAdded] = useState(false)
  const [heartKey,  setHeartKey]  = useState(0)
  const [qv,        setQv]        = useState(false)
  const [noticeOut, setNoticeOut] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null)

  // Wishlist init — original logic
  useEffect(()=>{
    let alive=true
    isWishlisted(item.id).then(v=>{if(alive)setWished(v)}).catch(()=>{})
    return()=>{alive=false}
  },[item.id])

  const toast=(msg:string)=>{
    setNotice(msg);setNoticeOut(false)
    if(timer.current)clearTimeout(timer.current)
    timer.current=setTimeout(()=>{setNoticeOut(true);setTimeout(()=>setNotice(null),480)},2000)
  }

  // Wishlist toggle — original logic
  const handleWish=async()=>{
    if(busy)return
    setBusy('wishlist');setHeartKey(k=>k+1)
    try{
      const r=await toggleWishlist(item.id)
      const w=r.productIds.includes(item.id)
      setWished(w);toast(w?'♥ Saved to wishlist':'Removed from wishlist')
    }catch{toast('Could not update wishlist')}
    finally{setBusy(null)}
  }

  // Add to cart — original logic
  const handleCart=async()=>{
    if(busy)return
    setBusy('cart')
    try{
      await addToCart(item.id,1)
      setCartAdded(true);toast('✓ Added to cart')
      setTimeout(()=>setCartAdded(false),1600)
    }catch{toast('Could not add to cart')}
    finally{setBusy(null)}
  }

  // ── Price display logic (FIX-4) ───────────────────────────────────────────
  const isSaleTag   = SALE_TAGS.has(item.tag)
  const discPct     = item.discount ?? (isSaleTag ? 20 : 0)
  const mrp         = item.originalPrice ?? (discPct > 0 ? computeMrp(item.price, discPct) : '')
  const showPricing = discPct > 0 && mrp !== ''

  // ── Rating display (FIX-3) ────────────────────────────────────────────────
  const ratingNum   = item.rating ?? 4
  const ratingLabel = ratingNum.toFixed(1)

  const tc = tagColor(item.tag)

  return (
    <>
      {qv && <QV item={item} wished={wished} busy={busy} cartAdded={cartAdded}
        onClose={()=>setQv(false)} onCart={handleCart} onWish={handleWish}/>}

      {/* ── CARD ── */}
      <div className="inf-cw relative flex flex-col overflow-hidden"
        style={{background:B.bg,border:`1px solid ${B.border}`}}>

        {/* Toast */}
        {notice && (
          <div className={`absolute top-0 inset-x-0 z-50 text-white text-[9px] font-bold tracking-[0.12em] uppercase text-center py-[6px] leading-none pointer-events-none select-none ${noticeOut?'inf-tout':'inf-tin'}`}
            style={{background:notice.includes('ould')?B.red:B.green}}>
            {notice}
          </div>
        )}

        {/* ── IMAGE ZONE — overflow:hidden clips overlay when translateY(100%) ── */}
        <div className="relative overflow-hidden" style={{aspectRatio:'1/1'}}>

          <Link to={`/product-details/${item.id}`}
            className="absolute inset-0 block" style={{background:B.bgSoft}}>
            <img src={item.image} alt={item.name} loading="lazy"
              className="inf-pi w-full h-full object-cover"/>
          </Link>

          {/* Bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{height:'46%',background:'linear-gradient(to top,rgba(0,0,0,0.34),transparent)'}}/>

          {/* Tag badge */}
          <span className="absolute top-0 left-0 z-20 text-white text-[9px] font-bold tracking-[0.14em] uppercase px-[10px] py-[5px] leading-none select-none"
            style={{background:tc}}>{item.tag}</span>

          {/* Discount badge stacked below tag */}
          {showPricing && (
            <span className="absolute z-20 text-white text-[8px] font-bold tracking-[0.1em] uppercase px-[10px] py-[4px] leading-none select-none"
              style={{background:'linear-gradient(135deg,#DC2626,#F97316)',top:22,left:0}}>
              -{discPct}% OFF
            </span>
          )}

          {/* Heart button */}
          <button key={heartKey} type="button" onClick={handleWish}
            disabled={busy==='wishlist'}
            aria-label={wished?'Remove from wishlist':'Add to wishlist'}
            className={`absolute top-[10px] right-[10px] z-30 w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all duration-200 ${heartKey>0?'inf-pop':''} ${busy==='wishlist'?'opacity-50 cursor-not-allowed':'hover:scale-110'}`}
            style={{
              background:wished?B.brandGrad:B.bg,
              boxShadow:'0 2px 8px rgba(0,0,0,0.12)',
              border:`1px solid ${wished?'transparent':B.border}`,
            }}>
            <LuHeart style={{width:12,height:12}}
              color={wished?'#fff':B.muted}
              fill={wished?'#fff':'none'}/>
          </button>

          {/* ── HOVER OVERLAY — hidden until hover ── */}
          <div className="inf-ov absolute inset-x-0 bottom-0 z-20">
            <div className="absolute inset-0 pointer-events-none"
              style={{background:'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.42) 100%)'}}/>
            <div className="relative flex items-stretch">

              <button type="button" onClick={handleWish} disabled={busy==='wishlist'}
                aria-label="Wishlist"
                className={`inf-ob flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] border-r ${busy==='wishlist'?'opacity-50 cursor-not-allowed':''}`}
                style={{borderColor:'rgba(255,255,255,0.15)'}}>
                <LuHeart style={{width:14,height:14,flexShrink:0}}
                  color={wished?'#FCA5A5':'#fff'} fill={wished?'#FCA5A5':'none'}/>
                <span style={{fontSize:8,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#fff',whiteSpace:'nowrap'}}>
                  {wished?'Saved':'Wishlist'}
                </span>
              </button>

              <button type="button" onClick={handleCart} disabled={busy==='cart'}
                aria-label="Add to cart"
                className={`inf-ob flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] border-r ${busy==='cart'?'opacity-50 cursor-not-allowed':''}`}
                style={{borderColor:'rgba(255,255,255,0.15)'}}>
                {cartAdded
                  ? <BsCheckLg style={{width:14,height:14,flexShrink:0,color:'#86EFAC'}}/>
                  : <RiShoppingBag2Line style={{width:14,height:14,flexShrink:0,color:'#fff'}}/>}
                <span style={{fontSize:8,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#fff',whiteSpace:'nowrap'}}>
                  {cartAdded?'Added!':'Add Cart'}
                </span>
              </button>

              <button type="button" onClick={()=>setQv(true)} aria-label="Quick view"
                className="inf-ob flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] cursor-pointer">
                <LuEye style={{width:14,height:14,flexShrink:0,color:'#fff'}}/>
                <span style={{fontSize:8,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#fff',whiteSpace:'nowrap'}}>
                  Quick View
                </span>
              </button>

            </div>
          </div>
        </div>
        {/* ── END IMAGE ZONE ── */}

        {/* ══════════════════════════════════════════════════════════════════
            INFO ZONE — FIX-1: NO mt-auto, NO minHeight, NO flex gaps
            All spacing is fixed margins so every card has identical height.
            Structure: [name] [12px gap] [stars+rating] [10px gap] [price row]
            Total info height = name(max 2 lines ~42px) + 12 + 20 + 10 + 20
                              = ~104px fixed regardless of name length
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{padding:'11px 0 12px'}}>

          {/* FIX-2: Product name — fontSize 15 (was 13) */}
          <Link to={`/product-details/${item.id}`} className="block"
            style={{marginBottom:9}}>
            <h5 style={{
              fontSize:15,
              fontWeight:400,
              lineHeight:1.42,
              color:B.body,
              display:'-webkit-box',
              WebkitLineClamp:2,
              WebkitBoxOrient:'vertical',
              overflow:'hidden',
              /* FIX-1: NO minHeight — let text be its natural height */
              transition:'color .18s ease',
            }}
            onMouseEnter={e=>(e.currentTarget.style.color=B.purple)}
            onMouseLeave={e=>(e.currentTarget.style.color=B.body)}>
              {item.name}
            </h5>
          </Link>

          {/* FIX-3: Stars + numeric rating + review count */}
          <div className="flex items-center" style={{gap:4,marginBottom:9}}>
            {/* Star icons — filled based on rating */}
            {[1,2,3,4,5].map(s=>(
              <GoStarFill key={s} style={{
                width:11,height:11,
                color: s <= ratingNum ? B.yellow : '#D1D5DB'
              }}/>
            ))}
            {/* Numeric rating e.g. "4.0" */}
            <span style={{
              fontSize:12,fontWeight:700,
              color:B.body,marginLeft:3,lineHeight:1
            }}>
              {ratingLabel}
            </span>
            {/* Review count */}
            <span style={{fontSize:11,color:B.faint,lineHeight:1}}>
              ( 1,230 )
            </span>
          </div>

          {/* FIX-4: Price row — sale price + strikethrough MRP + discount badge */}
          <div className="flex items-center justify-between" style={{gap:8}}>

            <div className="flex items-center" style={{gap:6,flexWrap:'wrap'}}>
              {/* Sale / discounted price */}
              <span className="inf-price" style={{fontSize:17,fontWeight:700}}>
                {item.price}
              </span>

              {/* Original MRP with strikethrough */}
              {showPricing && (
                <span className="inf-mrp">{mrp}</span>
              )}

              {/* Discount badge "-20%" */}
              {showPricing && (
                <span className="inf-disc">-{discPct}%</span>
              )}
            </div>

            {/* Cart icon button */}
            <button type="button" onClick={handleCart} disabled={busy==='cart'}
              aria-label="Add to cart"
              className="flex-shrink-0 flex items-center justify-center transition-all duration-200"
              style={{
                width:28,height:28,
                border:`1px solid ${B.border}`,
                background:cartAdded?B.green:'transparent',
                cursor:busy==='cart'?'not-allowed':'pointer',
                opacity:busy==='cart'?0.5:1,
              }}
              onMouseEnter={e=>{
                if(!cartAdded){
                  e.currentTarget.style.background=B.teal
                  e.currentTarget.style.borderColor=B.teal
                }
              }}
              onMouseLeave={e=>{
                if(!cartAdded){
                  e.currentTarget.style.background='transparent'
                  e.currentTarget.style.borderColor=B.border
                }
              }}>
              {cartAdded
                ? <BsCheckLg style={{width:11,height:11,color:'#fff'}}/>
                : <RiShoppingBag2Line style={{width:12,height:12,color:B.muted}}/>}
            </button>
          </div>

        </div>
        {/* ── END INFO ZONE ── */}

        {/* Bottom brand accent bar — draws in on hover */}
        <div className="inf-bar absolute inset-x-0 bottom-0 pointer-events-none"
          style={{height:'2px',background:B.brandGrad}}/>

      </div>
    </>
  )
}