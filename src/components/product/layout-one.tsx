// src/components/product/layout-one.tsx  v3.0
// =============================================================================
//  ROOT CAUSE FIXES vs v2.0 screenshot:
//
//  BUG-A  Overlay ALWAYS visible — never hidden
//         OLD: overflow:hidden on image zone + translate-y-full
//         The overflow:hidden IS supposed to clip the translated overlay.
//         Real cause: `aspect-ratio` CSS wasn't applied — `paddingBottom:100%`
//         creates a zero-height element that makes the overlay position:absolute
//         compute incorrectly, collapsing it to visible.
//         FIX: use `style={{aspectRatio:'1/1'}}` directly on the image wrapper.
//         Now overflow:hidden reliably clips the overlay when it's off-screen.
//
//  BUG-B  Product name bleeding into image (card #2 in screenshot)
//         The info zone text was not contained. Now outer card gets
//         `overflow:hidden` and proper flex column structure.
//
//  BUG-C  Button text running together "WISHLISTADD TO CARTQUICK VIEW"
//         Fix: shorter labels + guaranteed flex layout per button.
//
//  ALL ORIGINAL API LOGIC PRESERVED:
//  isWishlisted / toggleWishlist / addToCart / busy / wished states
// =============================================================================

import { useEffect, useRef, useState } from 'react'
import { createPortal }                from 'react-dom'
import { GoStarFill }                  from 'react-icons/go'
import { LuEye, LuHeart, LuX }        from 'react-icons/lu'
import { RiShoppingBag2Line }          from 'react-icons/ri'
import { BsCheckLg }                   from 'react-icons/bs'
import { Link }                        from 'react-router-dom'
import { addToCart }                   from '../../api/cart.api'
import { isWishlisted, toggleWishlist } from '../../api/wishlist.api'

interface Item {
  id: number; image: string; tag: string; price: string; name: string
}

const TAGS: Record<string, string> = {
  'Hot Sale':'#1CB28E','NEW':'#9739E1','10% OFF':'#E13939','Bestseller':'#D4830A',
  'New Arrival':'#9739E1','Handcrafted':'#5B7FA6','Premium':'#6B5CE7','Modern':'#2E8B57',
  'Vintage':'#8B6914','Sale':'#E13939','Eco-Friendly':'#2E8B57','Luxury':'#BB976D',
  'Original':'#6B5CE7','Handpainted':'#C0647A','Print':'#5B7FA6','Set of 3':'#D4830A',
  'Original Oil':'#8B4513','Contemporary':'#374151','Spiritual':'#D4830A',
  'Folk Art':'#C0647A','Tanjore':'#D4830A','Zen':'#2E8B57','Kalamkari':'#8B6914',
  'Dreamy':'#6B5CE7','Urban':'#374151','Nature':'#2E8B57','Trendy':'#FF3CAC',
  'Kids':'#F59E0B','Custom':'#374151','Hot':'#E13939','New':'#9739E1',
  'Smart':'#00C9FF','Furniture':'#8B6914','Ambience':'#9739E1',
  'Educational':'#1CB28E','Wellness':'#2E8B57','RGB':'#6B5CE7',
}
const tc = (t: string) => TAGS[t] ?? '#374151'

// ── CSS (injected once) ───────────────────────────────────────────────────────
const CSS = `
@keyframes loPop { 0%{transform:scale(1)} 40%{transform:scale(1.5)} 70%{transform:scale(0.85)} 100%{transform:scale(1)} }
.lo-pop { animation:loPop .34s cubic-bezier(.36,.07,.19,.97) both }

/* THE FIX — overlay hidden by default via overflow:hidden on parent + translateY */
.lo-card .lo-ov {
  transform: translateY(100%);
  opacity: 0;
  transition: transform .32s cubic-bezier(0.22,1,0.36,1), opacity .25s ease;
}
.lo-card:hover .lo-ov {
  transform: translateY(0);
  opacity: 1;
}

/* Staggered buttons */
.lo-card .lo-b { opacity:0; transform:translateY(5px); transition:opacity .2s ease, transform .2s ease, background .16s ease; }
.lo-card:hover .lo-b { opacity:1; transform:translateY(0); }
.lo-card:hover .lo-b:nth-child(1){transition-delay:0ms}
.lo-card:hover .lo-b:nth-child(2){transition-delay:55ms}
.lo-card:hover .lo-b:nth-child(3){transition-delay:110ms}

/* Button shimmer */
.lo-b{position:relative;overflow:hidden}
.lo-b::before{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);transition:left .4s ease}
.lo-b:hover::before{left:150%}
.lo-b>*{position:relative;z-index:1}

/* Image zoom */
.lo-card .lo-img{transition:transform .65s cubic-bezier(0.25,0.46,0.45,0.94)}
.lo-card:hover .lo-img{transform:scale(1.07)}

/* Toast */
@keyframes loIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
@keyframes loOut{from{opacity:1}to{opacity:0}}
.lo-tin{animation:loIn .18s ease forwards}
.lo-tout{animation:loOut .4s ease 1.9s forwards}

/* QV modal */
@keyframes loFade{from{opacity:0}to{opacity:1}}
@keyframes loScale{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.lo-qvbg{animation:loFade .2s ease forwards}
.lo-qvm{animation:loScale .26s cubic-bezier(0.22,1,0.36,1) forwards}
`

let _css = false
const ensureCSS = () => {
  if (_css || typeof document === 'undefined') return
  const s = document.createElement('style')
  s.textContent = CSS
  document.head.appendChild(s)
  _css = true
}

// ── Quick View Modal ──────────────────────────────────────────────────────────
function QV({ item, wished, busy, cartAdded, onClose, onCart, onWish }:{
  item:Item; wished:boolean; busy:null|'cart'|'wishlist'
  cartAdded:boolean; onClose:()=>void; onCart:()=>void; onWish:()=>void
}) {
  useEffect(() => {
    const fn = (e:KeyboardEvent) => { if(e.key==='Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow='' }
  }, [onClose])

  const color = tc(item.tag)
  return createPortal(
    <div className="lo-qvbg fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.76)',backdropFilter:'blur(5px)'}}
      onClick={onClose}>
      <div className="lo-qvm relative bg-white dark:bg-dark-secondary w-full max-w-[820px] flex flex-col sm:flex-row"
        style={{boxShadow:'0 40px 100px rgba(0,0,0,0.45)'}}
        onClick={e=>e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Close">
          <LuX size={15} className="text-title dark:text-white"/>
        </button>
        <div className="relative w-full sm:w-[44%] flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800"
          style={{aspectRatio:'1/1'}}>
          <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
          <span className="absolute top-0 left-0 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-[5px]"
            style={{background:color}}>{item.tag}</span>
        </div>
        <div className="flex flex-col flex-1 p-8 sm:p-10">
          <h3 className="text-title dark:text-white font-medium text-xl sm:text-[22px] leading-snug mb-3">{item.name}</h3>
          <div className="flex items-center gap-[3px] mb-5">
            {[1,2,3,4].map(i=><GoStarFill key={i} className="text-yellow-400" style={{width:13,height:13}}/>)}
            <GoStarFill className="text-slate-300" style={{width:13,height:13}}/>
            <span className="text-gray-400 text-xs ml-2">(1,230 reviews)</span>
          </div>
          <p className="text-[28px] font-semibold text-title dark:text-white mb-6" style={{letterSpacing:'-0.02em'}}>{item.price}</p>
          <div className="border-t border-gray-100 dark:border-gray-700 mb-6"/>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-gray-400 uppercase tracking-widest">Category</span>
            <span className="text-[10px] font-bold text-white px-2 py-[3px] uppercase tracking-widest" style={{background:color}}>{item.tag}</span>
          </div>
          <div className="flex items-center gap-3 mb-7">
            <span className="text-xs text-gray-400 uppercase tracking-widest w-16">Qty</span>
            <div className="flex items-center border border-gray-200 dark:border-gray-600">
              <button className="w-9 h-9 flex items-center justify-center text-title dark:text-white hover:bg-gray-50 transition-colors text-lg">−</button>
              <span className="w-10 text-center text-sm font-medium text-title dark:text-white">1</span>
              <button className="w-9 h-9 flex items-center justify-center text-title dark:text-white hover:bg-gray-50 transition-colors text-lg">+</button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-auto">
            <button onClick={onCart} disabled={busy==='cart'}
              className={`flex-1 h-11 flex items-center justify-center gap-2 text-sm font-bold tracking-wider uppercase transition-all duration-300 ${cartAdded?'bg-green-500 text-white':'bg-title dark:bg-white text-white dark:text-title hover:opacity-80'} ${busy==='cart'?'opacity-60 cursor-not-allowed':''}`}>
              {cartAdded?<><BsCheckLg size={14}/>Added!</>:<><RiShoppingBag2Line size={15}/>Add to Cart</>}
            </button>
            <button onClick={onWish} disabled={busy==='wishlist'}
              className={`w-11 h-11 flex items-center justify-center border transition-all duration-200 ${wished?'border-red-400 bg-red-50 dark:bg-red-900/20':'border-gray-200 dark:border-gray-600 hover:border-red-400'} ${busy==='wishlist'?'opacity-50 cursor-not-allowed':''}`}
              aria-label="Wishlist">
              <LuHeart size={16} className={wished?'fill-red-500 text-red-500':'text-gray-500 dark:text-gray-300'}/>
            </button>
          </div>
          <Link to={`/product-details/${item.id}`} onClick={onClose}
            className="mt-4 text-[11px] text-gray-400 hover:text-title dark:hover:text-white underline underline-offset-2 transition-colors text-center">
            View full product details →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Card Component ────────────────────────────────────────────────────────────
export default function LayoutOne({ item }: { item: Item }) {
  ensureCSS()

  const [wished,    setWished]    = useState(false)
  const [busy,      setBusy]      = useState<null|'cart'|'wishlist'>(null)
  const [notice,    setNotice]    = useState<string|null>(null)
  const [cartAdded, setCartAdded] = useState(false)
  const [heartKey,  setHeartKey]  = useState(0)
  const [qv,        setQv]        = useState(false)
  const [noticeOut, setNoticeOut] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => {
    let alive = true
    isWishlisted(item.id).then(v=>{if(alive)setWished(v)}).catch(()=>{})
    return () => { alive = false }
  }, [item.id])

  const toast = (msg:string) => {
    setNotice(msg); setNoticeOut(false)
    if(timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(()=>{ setNoticeOut(true); setTimeout(()=>setNotice(null),500) }, 2000)
  }

  const handleWish = async () => {
    if(busy) return
    setBusy('wishlist'); setHeartKey(k=>k+1)
    try {
      const r = await toggleWishlist(item.id)
      const w = r.productIds.includes(item.id)
      setWished(w); toast(w?'♥ Added to wishlist':'Removed from wishlist')
    } catch { toast('Wishlist failed') }
    finally { setBusy(null) }
  }

  const handleCart = async () => {
    if(busy) return
    setBusy('cart')
    try {
      await addToCart(item.id, 1)
      setCartAdded(true); toast('✓ Added to cart')
      setTimeout(()=>setCartAdded(false), 1600)
    } catch { toast('Add to cart failed') }
    finally { setBusy(null) }
  }

  const color = tc(item.tag)

  return (
    <>
      {qv && <QV item={item} wished={wished} busy={busy} cartAdded={cartAdded}
        onClose={()=>setQv(false)} onCart={handleCart} onWish={handleWish}/>}

      {/* ═══════════════════════════════════════════════════════════════════
          CARD — lo-card drives all CSS hover selectors above
          overflow:hidden on the outer card keeps everything contained
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="lo-card relative flex flex-col bg-white dark:bg-dark-secondary overflow-hidden"
        style={{border:'1px solid transparent',transition:'border-color .2s'}}
        onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(0,0,0,0.08)')}
        onMouseLeave={e=>(e.currentTarget.style.borderColor='transparent')}>

        {/* Toast */}
        {notice && (
          <div className={`absolute top-0 inset-x-0 z-40 text-white text-[9px] font-bold tracking-wider text-center py-[5px] leading-none pointer-events-none select-none ${noticeOut?'lo-tout':'lo-tin'}`}
            style={{background:notice.includes('ailed')?'#ef4444':'#1CB28E'}}>
            {notice}
          </div>
        )}

        {/* ── IMAGE ZONE ──────────────────────────────────────────────────
            KEY FIX: aspectRatio:'1/1' (not paddingBottom:'100%')
            + overflow:hidden on THIS div clips the lo-ov when translated
        ─────────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{aspectRatio:'1/1'}}>

          {/* Image */}
          <Link to={`/product-details/${item.id}`}
            className="absolute inset-0 block bg-gray-100 dark:bg-gray-800">
            <img src={item.image} alt={item.name} loading="lazy"
              className="lo-img w-full h-full object-cover"/>
          </Link>

          {/* Permanent bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{height:'45%',background:'linear-gradient(to top,rgba(0,0,0,0.35),transparent)'}}/>

          {/* Tag */}
          <span className="absolute top-0 left-0 z-20 text-white text-[9px] font-bold tracking-widest uppercase px-[9px] py-[5px] leading-none select-none"
            style={{background:color}}>{item.tag}</span>

          {/* Heart — always visible */}
          <button key={heartKey} type="button" onClick={handleWish}
            disabled={busy==='wishlist'} aria-label="Wishlist"
            className={`absolute top-[9px] right-[9px] z-30 w-[28px] h-[28px] rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center ${heartKey>0?'lo-pop':''} ${busy==='wishlist'?'opacity-50 cursor-not-allowed':'hover:scale-110 transition-transform duration-150'}`}>
            <LuHeart style={{width:12,height:12}}
              className={wished?'fill-red-500 text-red-500':'text-gray-400 dark:text-gray-300'}/>
          </button>

          {/* ── HOVER OVERLAY ─────────────────────────────────────────────
              lo-ov: translateY(100%) opacity:0 by default
              .lo-card:hover → translateY(0) opacity:1
              The overflow:hidden on parent image div clips it when off-screen
              so absolutely NOTHING is visible before hover.
          ─────────────────────────────────────────────────────────────── */}
          <div className="lo-ov absolute inset-x-0 bottom-0 z-20">
            {/* Dark gradient behind buttons */}
            <div className="absolute inset-0 pointer-events-none"
              style={{background:'linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.4) 100%)'}}/>

            <div className="relative flex items-stretch">

              {/* Wishlist btn */}
              <button type="button" onClick={handleWish} disabled={busy==='wishlist'}
                aria-label="Wishlist"
                className={`lo-b flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] border-r border-white/15 ${busy==='wishlist'?'opacity-50 cursor-not-allowed':''}`}>
                <LuHeart style={{width:14,height:14,flexShrink:0}}
                  className={wished?'fill-rose-400 text-rose-400':'text-white'}/>
                <span className="text-[8px] font-bold tracking-[0.1em] uppercase leading-none text-white whitespace-nowrap">
                  {wished?'Saved':'Wishlist'}
                </span>
              </button>

              {/* Cart btn */}
              <button type="button" onClick={handleCart} disabled={busy==='cart'}
                aria-label="Add to cart"
                className={`lo-b flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] border-r border-white/15 ${busy==='cart'?'opacity-50 cursor-not-allowed':''}`}>
                {cartAdded
                  ? <BsCheckLg style={{width:14,height:14,flexShrink:0}} className="text-emerald-400"/>
                  : <RiShoppingBag2Line style={{width:14,height:14,flexShrink:0}} className="text-white"/>}
                <span className="text-[8px] font-bold tracking-[0.1em] uppercase leading-none text-white whitespace-nowrap">
                  {cartAdded?'Added!':'Add Cart'}
                </span>
              </button>

              {/* Quick View btn */}
              <button type="button" onClick={()=>setQv(true)} aria-label="Quick view"
                className="lo-b flex-1 flex flex-col items-center justify-center gap-[4px] py-[11px] cursor-pointer">
                <LuEye style={{width:14,height:14,flexShrink:0}} className="text-white"/>
                <span className="text-[8px] font-bold tracking-[0.1em] uppercase leading-none text-white whitespace-nowrap">
                  Quick View
                </span>
              </button>

            </div>
          </div>

        </div>
        {/* ── END IMAGE ZONE ── */}

        {/* ── INFO ZONE ── */}
        <div className="flex flex-col flex-1 pt-[10px] pb-[11px]">
          <Link to={`/product-details/${item.id}`} className="block mb-[5px]">
            <h5 className="text-title dark:text-white font-normal leading-[1.42] hover:text-[#00C9FF] transition-colors duration-200"
              style={{fontSize:'13px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',minHeight:'37px'}}>
              {item.name}
            </h5>
          </Link>

          <ul className="flex items-center gap-[2px] mb-[8px]">
            {[1,2,3,4].map(i=><li key={i}><GoStarFill className="text-yellow-400" style={{width:10,height:10}}/></li>)}
            <li><GoStarFill className="text-slate-300" style={{width:10,height:10}}/></li>
            <li className="text-gray-400 ml-[3px]" style={{fontSize:9}}>( 1,230 )</li>
          </ul>

          <div className="flex items-center justify-between gap-2 mt-auto">
            <h4 className="text-title dark:text-white font-semibold leading-none" style={{fontSize:'14px'}}>
              {item.price}
            </h4>
            <button type="button" onClick={handleCart} disabled={busy==='cart'}
              aria-label="Add to cart"
              className={`flex-shrink-0 w-[26px] h-[26px] border flex items-center justify-center transition-all duration-200 ${cartAdded?'bg-green-500 border-green-500 text-white':'border-gray-200 dark:border-gray-600 text-gray-400 hover:bg-[#00C9FF] hover:border-[#00C9FF] hover:text-white'} ${busy==='cart'?'opacity-50 cursor-not-allowed':''}`}>
              {cartAdded
                ? <BsCheckLg style={{width:11,height:11}}/>
                : <RiShoppingBag2Line style={{width:12,height:12}}/>}
            </button>
          </div>
        </div>

      </div>
    </>
  )
}