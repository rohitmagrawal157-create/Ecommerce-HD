/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ProductDetails.tsx — v6 Gallery Edition
 * ─────────────────────────────────────────────────────────────────────────
 * GALLERY CHANGES:
 *  ① Main image sits at the top — large, full-width, prominent
 *  ② Thumbnails in a horizontal row BELOW the main image
 *  ③ Left ‹ and Right › arrow buttons navigate through thumbnails
 *  ④ Clicking any thumbnail sets it as the main image
 *  ⑤ Hovering the main image shows a CSS magnifier lens (true zoom)
 *  ⑥ Clicking the main image opens a fullscreen lightbox
 *  ⑦ Lightbox: keyboard Escape / arrow keys / click backdrop to close
 *  ⑧ Active thumbnail highlighted with gold border
 *  ⑨ Thumbnails scroll horizontally so any number of images work
 *  ⑩ Video thumbnail shows a play-button overlay
 *  All other product detail sections preserved exactly as before
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useParams }                           from 'react-router-dom';

import AOS from 'aos';
import product1 from '../../assets/img/gallery/product-detls/product-01.jpg';
import product2 from '../../assets/img/gallery/product-detls/product-02.jpg';
import product3 from '../../assets/img/gallery/product-detls/product-03.jpg';
import product4 from '../../assets/img/gallery/product-detls/product-04.jpg';

import IncreDre    from '../../components/incre-dre';
import NavbarOne   from '../../components/navbar/navbar-one';
import FooterOne   from '../../components/footer/footer-one';
import DetailTab   from '../../components/product/detail-tab';
import LayoutOne   from '../../components/product/layout-one';
import ScrollToTop from '../../components/scroll-to-top';

import { productList, productTag } from '../../data/data';
import { getProductById } from '../../api/products';
import { addToCart } from '../../api/cart.api';
import { isWishlisted, toggleWishlist } from '../../api/wishlist.api';
import {
  FaFacebookF, FaTwitter, FaPinterestP, FaWhatsapp,
} from 'react-icons/fa';
import {
  LuTruck, LuShieldCheck, LuRefreshCcw, LuPackage, LuStar,
  LuPencilLine, LuHeart, LuMapPin, LuClock, LuInfo, LuX,
  LuChevronLeft, LuChevronRight,
} from 'react-icons/lu';

// ═══════════════════════════════════════════════════════════════════════════
// BRAND TOKENS
// ═══════════════════════════════════════════════════════════════════════════

const GOLD             = '#96865d';
const RED              = '#c24352';
const DARK             = '#1a1a1a';
const LIGHT            = '#f7f4ed';
const WHATSAPP_NUMBER  = '919903504754';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Offer            { info: string; code: string; }
interface Review           { id: number; name: string; avatar: string; rating: number; date: string; title: string; body: string; verified: boolean; }
interface DeliveryFeature  { icon: React.ReactNode; label: string; sub: string; }
interface ColorOption      { hex: string; defaultChecked: boolean; }
interface RatingBreakdown  { s: number; p: number; }
interface MediaItem        { type: 'image' | 'video'; url: string; thumbnail: string; alt?: string; poster?: string; embedUrl?: string; }
interface CountdownTime    { days: string; hours: string; minutes: string; seconds: string; }

// ═══════════════════════════════════════════════════════════════════════════
// STATIC DATA
// ═══════════════════════════════════════════════════════════════════════════

const OFFERS: Offer[] = [
  { info: 'Get 5% off sitewide — No minimum spend',                        code: 'MAKEHOMESPECIAL' },
  { info: 'Get Rs.150 off on your first order — Min. purchase of Rs.1500', code: 'NESTTRY'         },
];
// Ensure this is typed as a general `number` so TS doesn't treat comparisons like `STOCK_QTY === 0` as always-false.
const STOCK_QTY: number = 7;

const REVIEWS: Review[] = [
  { id:1, name:'Priya M.',  avatar:'PM', rating:5, date:'March 12, 2026',    title:'Absolutely love it!',         body:'The quality is exceptional. The finish is gorgeous and it fits perfectly in my living room. Very sturdy and worth every rupee.',                                                        verified:true },
  { id:2, name:'Rohan S.',  avatar:'RS', rating:5, date:'February 28, 2026', title:'Great product, fast delivery', body:'Ordered this for our new home. Packaging was excellent — no damage at all. Assembly was straightforward. Highly recommend!',                                                       verified:true },
  { id:3, name:'Ananya K.', avatar:'AK', rating:4, date:'February 15, 2026', title:'Beautiful design',             body:'Looks even better in person than in photos. Minor feedback — delivery took a day longer than expected, but totally worth the wait.',                                               verified:true },
];
const RATING_SUMMARY   = { average: 4.8, total: 128 };
const AVATAR_COLORS    = [GOLD, RED, '#0891b2'];
const DELIVERY_FEATURES: DeliveryFeature[] = [
  { icon:<LuTruck       size={16}/>, label:'Free Shipping',    sub:'On orders above ₹999'   },
  { icon:<LuRefreshCcw  size={16}/>, label:'7-Day Returns',    sub:'Hassle-free returns'    },
  { icon:<LuShieldCheck size={16}/>, label:'Secure Payments',  sub:'100% safe & encrypted'  },
  { icon:<LuPackage     size={16}/>, label:'Cash on Delivery', sub:'Available on all orders' },
];
const RATING_BREAKDOWN: RatingBreakdown[] = [
  {s:5,p:76},{s:4,p:16},{s:3,p:5},{s:2,p:2},{s:1,p:1},
];
const SIZE_GUIDE_DATA = [
  {size:'S',  width:'45cm', depth:'50cm', height:'80cm'},
  {size:'M',  width:'50cm', depth:'55cm', height:'85cm'},
  {size:'L',  width:'55cm', depth:'60cm', height:'90cm'},
  {size:'XL', width:'60cm', depth:'65cm', height:'95cm'},
];
const SALE_TARGET = new Date(2026, 3, 30, 23, 59, 59);

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getDeliveryDateRange(): string {
  const now = new Date();
  const add = (d: Date, days: number) => { const r=new Date(d); r.setDate(r.getDate()+days); return r; };
  const fmt = (d: Date) => d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  return `${fmt(add(now,3))} – ${fmt(add(now,7))}`;
}
function stockState(qty: number): 'out'|'critical'|'low'|'in' {
  if (qty===0)   return 'out';
  if (qty<=5)    return 'critical';
  if (qty<=20)   return 'low';
  return 'in';
}

// ═══════════════════════════════════════════════════════════════════════════
// useCountdown
// ═══════════════════════════════════════════════════════════════════════════

function useCountdown(target: Date): CountdownTime {
  const pad = (n:number) => String(n).padStart(2,'0');
  const calc = (): CountdownTime => {
    const diff = Math.max(0, target.getTime()-Date.now());
    return { days:pad(Math.floor(diff/86400000)), hours:pad(Math.floor((diff%86400000)/3600000)), minutes:pad(Math.floor((diff%3600000)/60000)), seconds:pad(Math.floor((diff%60000)/1000)) };
  };
  const [time,setTime] = useState<CountdownTime>(calc);
  useEffect(() => { const id=setInterval(()=>setTime(calc()),1000); return ()=>clearInterval(id); }, []);
  return time;
}

// ═══════════════════════════════════════════════════════════════════════════
// StarRating
// ═══════════════════════════════════════════════════════════════════════════

function StarRating({ rating, size=14, color='#f5a623' }: { rating:number; size?:number; color?:string }) {
  return (
    <div className="flex items-center" style={{gap:1}}>
      {[1,2,3,4,5].map(star => {
        const filled  = rating>=star;
        const partial = !filled && rating>star-1;
        const pct     = partial ? Math.round((rating-(star-1))*100) : 0;
        const gradId  = `sg-${star}-${Math.round(rating*10)}`;
        return (
          <svg key={star} width={size} height={size} viewBox="0 0 24 24" style={{flexShrink:0}}>
            {partial && (<defs><linearGradient id={gradId}><stop offset={`${pct}%`} stopColor={color}/><stop offset={`${pct}%`} stopColor="#d1d5db"/></linearGradient></defs>)}
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={filled?color:partial?`url(#${gradId})`:'#e5e7eb'}/>
          </svg>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════
//  PRODUCT GALLERY — complete rewrite
//  Layout: [main image] on top, [thumbnail strip] below with ‹ › arrows
// ════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════

interface ProductGalleryProps {
  media:       MediaItem[];
  productName: string;
  discountPct?: string;
}

function ProductGallery({ media, productName, discountPct }: ProductGalleryProps) {
  const [activeIdx,    setActiveIdx]    = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ── Magnifier zoom state ────────────────────────────────────────────────
  const [zoom,      setZoom]      = useState(false);
  const [zoomPos,   setZoomPos]   = useState({ x: 50, y: 50 }); // percent
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // ── Thumbnail strip scroll ──────────────────────────────────────────────
  const stripRef       = useRef<HTMLDivElement>(null);
  const activeItem = media[activeIdx];
  const isEmbedVideo = activeItem.type === 'video' && !!activeItem.embedUrl;

  // Previous / Next
  const prev = useCallback(() => setActiveIdx(i => (i - 1 + media.length) % media.length), [media.length]);
  const next = useCallback(() => setActiveIdx(i => (i + 1) % media.length),                [media.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightboxOpen(false); }
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  // Auto-scroll thumbnail strip to keep active thumb visible
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const thumbEl = strip.children[activeIdx] as HTMLElement | undefined;
    if (thumbEl) thumbEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIdx]);

  // ── Magnifier mouse move ───────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setZoomPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────
          LIGHTBOX — fullscreen overlay
      ───────────────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/25 rounded-full w-10 h-10 flex items-center justify-center border border-white/20 transition-all cursor-pointer"
            aria-label="Close lightbox"
          >
            <LuX size={18} />
          </button>

          {/* Prev arrow */}
          {media.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center border border-white/20 transition-all cursor-pointer"
              aria-label="Previous image"
            >
              <LuChevronLeft size={20} />
            </button>
          )}

          {/* Main lightbox image */}
          <div onClick={e => e.stopPropagation()} className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            {activeItem.type === 'image' ? (
              <img
                src={activeItem.url}
                alt={activeItem.alt ?? productName}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                style={{ userSelect: 'none' }}
              />
            ) : isEmbedVideo ? (
              <div className="w-[90vw] max-w-[1100px] aspect-video rounded-lg overflow-hidden shadow-2xl bg-black">
                <iframe
                  src={activeItem.embedUrl}
                  title={`${productName} video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <video
                src={activeItem.url}
                poster={activeItem.poster}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              />
            )}
          </div>

          {/* Next arrow */}
          {media.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center border border-white/20 transition-all cursor-pointer"
              aria-label="Next image"
            >
              <LuChevronRight size={20} />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-semibold">
            {activeIdx + 1} / {media.length}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          GALLERY BODY
      ───────────────────────────────────────────────────────────────── */}
      <div className="w-full select-none">

        {/* ── MAIN IMAGE ─────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-50" style={{ border: '1px solid #ebebeb' }}>

          {/* Discount badge */}
          {discountPct && (
            <div className="absolute top-3 left-3 z-20 bg-[#E13939] text-white text-sm font-bold px-3 py-1.5 rounded-sm shadow">
              {discountPct}
            </div>
          )}

          {/* Image count badge */}
          <div className="absolute top-3 right-3 z-20 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {activeIdx + 1} / {media.length}
          </div>

          {/* Main image / video with zoom */}
          <div
            ref={imgContainerRef}
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: '4/3' }}
            onMouseEnter={() => activeItem.type === 'image' && setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
          >
            {activeItem.type === 'image' ? (
              <>
                {/* Base image */}
                <img
                  src={activeItem.url}
                  alt={activeItem.alt ?? `${productName} view ${activeIdx + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  draggable={false}
                />

                {/* ── CSS MAGNIFIER ZOOM LENS ──────────────────────────
                    When hovering, a 200×200px lens appears at cursor position.
                    Inside it we render the SAME image scaled 2.5× and
                    offset so the area under the cursor is centred.
                    This creates a true product zoom without any library. */}
                {zoom && (
                  <div
                    className="pointer-events-none absolute rounded-full overflow-hidden shadow-2xl"
                    style={{
                      width:   180,
                      height:  180,
                      top:     `calc(${zoomPos.y}% - 90px)`,
                      left:    `calc(${zoomPos.x}% - 90px)`,
                      border:  '2px solid rgba(255,255,255,0.8)',
                      zIndex:  30,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                    }}
                  >
                    <img
                      src={activeItem.url}
                      alt="zoom"
                      draggable={false}
                      style={{
                        width:      '250%',
                        height:     '250%',
                        maxWidth:   'none',
                        position:   'absolute',
                        top:        `${-zoomPos.y * 2.5 + 50}%`,
                        left:       `${-zoomPos.x * 2.5 + 50}%`,
                        objectFit:  'cover',
                      }}
                    />
                  </div>
                )}

                {/* Click-to-zoom instruction */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none transition-opacity duration-200"
                  style={{ opacity: zoom ? 0 : 0.75 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    <path d="M11 8v6M8 11h6"/>
                  </svg>
                  Click to zoom
                </div>
              </>
            ) : (
              /* Video item */
              isEmbedVideo ? (
                <div className="w-full h-full bg-black" onClick={e => e.stopPropagation()}>
                  <iframe
                    src={activeItem.embedUrl}
                    title={`${productName} video`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                <video
                  src={activeItem.url}
                  poster={activeItem.poster}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  onClick={e => e.stopPropagation()}
                />
              )
            )}
          </div>

          {/* ── PREV / NEXT arrows on main image ─────────────────────── */}
          {media.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 transition-all duration-150 cursor-pointer"
                aria-label="Previous"
              >
                <LuChevronLeft size={18} color="#374151" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 transition-all duration-150 cursor-pointer"
                aria-label="Next"
              >
                <LuChevronRight size={18} color="#374151" />
              </button>
            </>
          )}
        </div>

        {/* ── THUMBNAIL STRIP ────────────────────────────────────────── */}
        {media.length > 1 && (
          <div className="mt-3 flex items-center gap-2">

            {/* Strip prev arrow */}
            <button
              onClick={prev}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
              aria-label="Previous thumbnail"
            >
              <LuChevronLeft size={15} color="#555" />
            </button>

            {/* Scrollable thumbnail row */}
            <div
              ref={stripRef}
              className="flex-1 flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {media.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`View ${item.type === 'video' ? 'video' : `image ${idx + 1}`}`}
                  className="flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-transparent p-0"
                  style={{
                    width:       80,
                    height:      80,
                    borderColor: activeIdx === idx ? GOLD : 'transparent',
                    outline:     activeIdx === idx ? `3px solid ${GOLD}22` : 'none',
                    boxShadow:   activeIdx === idx ? `0 0 0 2px ${GOLD}` : '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      filter:     activeIdx === idx ? 'brightness(1)' : 'brightness(0.88)',
                      transition: 'filter 0.2s',
                    }}
                  />
                  {/* Video play overlay */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
                        <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-gray-700 ml-0.5" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Strip next arrow */}
            <button
              onClick={next}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
              aria-label="Next thumbnail"
            >
              <LuChevronRight size={15} color="#555" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RatingSummary
// ═══════════════════════════════════════════════════════════════════════════

function RatingSummary({ rating, total }: { rating: number; total: number }) {
  const scroll = () => document.getElementById('customer-reviews')?.scrollIntoView({ behavior:'smooth', block:'start' });
  return (
    <button onClick={scroll} className="flex items-center gap-2 mt-2 p-0 bg-transparent border-none cursor-pointer">
      <StarRating rating={rating} size={16} />
      <span className="text-sm font-bold" style={{color:DARK}}>{rating}</span>
      <span className="text-xs text-gray-500 underline">({total} reviews)</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// StockIndicator
// ═══════════════════════════════════════════════════════════════════════════

function StockIndicator({ qty }: { qty: number }) {
  const state = stockState(qty);
  const MAX_D = 50;
  const barColor   = state==='in' ? '#22c55e' : state==='low' ? '#f97316' : '#ef4444';
  const barWidth   = state==='out' ? 0 : Math.min(100, Math.round((qty/MAX_D)*100));
  const label      = state==='out' ? 'Out of Stock' : state==='critical' ? `Only ${qty} left!` : state==='low' ? `${qty} items available` : 'In Stock';
  const labelColor = state==='in' ? '#16a34a' : state==='low' ? '#ea580c' : '#ef4444';
  return (
    <div className="mt-3 mb-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold" style={{color:labelColor}}>{label}</span>
        {state==='critical' && <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse" style={{background:'#fef2f2',color:'#b91c1c',border:'1px solid #fecaca'}}>Selling fast!</span>}
        {state==='in'       && <span className="text-xs font-semibold" style={{color:'#16a34a'}}>✓ Ready to ship</span>}
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'#e5e7eb'}}>
        <div className="h-full rounded-full transition-all duration-500" style={{width:`${barWidth}%`,background:barColor}} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DeliveryInfo
// ═══════════════════════════════════════════════════════════════════════════

function DeliveryInfo() {
  const [pincode,setPincode]       = useState('');
  const [msg,setMsg]               = useState<string|null>(null);
  const [checking,setChecking]     = useState(false);
  const check = () => {
    if (pincode.length!==6) { setMsg('Enter a valid 6-digit pincode.'); return; }
    setChecking(true);
    setTimeout(() => {
      const ok = parseInt(pincode[0],10)>2;
      setMsg(ok ? `✓ Delivery available by ${getDeliveryDateRange()}` : '✗ Delivery not available at this pincode.');
      setChecking(false);
    }, 800);
  };
  const msgOk = msg?.startsWith('✓');
  return (
    <div className="rounded-xl border border-gray-200 p-4 mb-4" style={{background:'#fafafa'}}>
      <div className="flex items-start gap-3 mb-3">
        <LuClock size={15} className="mt-0.5 flex-shrink-0" style={{color:GOLD}}/>
        <div>
          <span className="text-xs font-bold text-gray-700">Estimated Delivery: </span>
          <span className="text-xs font-semibold" style={{color:GOLD}}>{getDeliveryDateRange()}</span>
          <p className="text-[11px] text-gray-400 mt-0.5">For orders placed before 2 PM today</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LuMapPin size={14} className="flex-shrink-0 text-gray-400"/>
        <input type="text" maxLength={6} placeholder="Enter pincode" value={pincode}
          onChange={e=>{setPincode(e.target.value.replace(/\D/g,'')); setMsg(null);}} onKeyDown={e=>e.key==='Enter'&&check()}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-yellow-600" style={{minWidth:0}}/>
        <button onClick={check} disabled={checking}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
          style={{background:GOLD,color:'#fff',border:`1px solid ${GOLD}`,cursor:checking?'not-allowed':'pointer',opacity:checking?0.7:1}}>
          {checking?'...':'Check'}
        </button>
      </div>
      {msg && <p className="text-xs mt-2 font-medium" style={{color:msgOk?'#16a34a':'#dc2626'}}>{msg}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WishlistButton
// ═══════════════════════════════════════════════════════════════════════════

function WishlistButton({ productId }: { productId: number }) {
  const [wished, setWished] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!Number.isFinite(productId) || productId <= 0) return;

    isWishlisted(productId)
      .then((v) => {
        if (!alive) return;
        setWished(v);
      })
      .catch(() => {
        // ignore: keep existing state
      });

    return () => {
      alive = false;
    };
  }, [productId]);

  const toggle = async () => {
    if (busy) return;
    if (!Number.isFinite(productId) || productId <= 0) return;
    setBusy(true);
    try {
      const next = await toggleWishlist(productId);
      setWished(next.productIds.includes(productId));
    } catch {
      // ignore: localStorage fallback may still apply
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-200 select-none"
      style={{
        border: `1.5px solid ${wished ? RED : '#d1d5db'}`,
        color: wished ? RED : '#374151',
        background: wished ? '#fef2f2' : '#fff',
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.85 : 1,
      }}
    >
      <LuHeart
        size={16}
        style={{
          fill: wished ? RED : 'none',
          stroke: RED,
          transition: 'fill 0.2s, transform 0.15s',
          transform: wished ? 'scale(1.2)' : 'scale(1)',
        }}
      />
      {wished ? 'Wishlisted' : 'Wishlist'}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CustomizationBadge
// ═══════════════════════════════════════════════════════════════════════════

function CustomizationBadge() {
  const [tip,setTip] = useState(false);
  return (
    <div className="flex items-center gap-2 mt-3 relative">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border" style={{background:'#f0fdf4',border:'1px solid #86efac'}}>
        <LuPencilLine size={12} color="#16a34a"/>
        <span className="text-xs font-bold tracking-wider uppercase" style={{color:'#16a34a'}}>Customization Available</span>
      </div>
      <button onMouseEnter={()=>setTip(true)} onMouseLeave={()=>setTip(false)} aria-label="Customization info"
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-700 cursor-pointer border-none">?</button>
      {tip && (
        <div className="absolute bottom-full left-0 mb-2 p-3 rounded-lg z-20 text-xs leading-relaxed text-white w-64" style={{background:DARK,boxShadow:'0 4px 20px rgba(0,0,0,0.22)'}}>
          Add a personal touch! Contact us via WhatsApp for custom engravings, monograms, or colour variations.
          <div className="absolute top-full left-5 border-4 border-transparent" style={{borderTopColor:DARK}}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SizeGuideModal
// ═══════════════════════════════════════════════════════════════════════════

function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key==='Escape') onClose(); };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[open,onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}} onClick={onClose} role="dialog" aria-modal="true" aria-label="Size Guide">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{color:DARK}}>Size Guide</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none" aria-label="Close"><LuX size={18}/></button>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{background:'#f9fafb'}}>{['Size','Width','Depth','Height'].map(h=><th key={h} className="px-3 py-2 text-left font-bold text-xs border border-gray-200">{h}</th>)}</tr></thead>
          <tbody>{SIZE_GUIDE_DATA.map((r,i)=><tr key={r.size} style={{background:i%2===0?'#fff':'#f9fafb'}}><td className="px-3 py-2 border border-gray-200 font-bold" style={{color:GOLD}}>{r.size}</td><td className="px-3 py-2 border border-gray-200">{r.width}</td><td className="px-3 py-2 border border-gray-200">{r.depth}</td><td className="px-3 py-2 border border-gray-200">{r.height}</td></tr>)}</tbody>
        </table>
        <p className="text-xs text-gray-400 mt-3">All measurements are approximate. ±2cm tolerance.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DeliveryStrip
// ═══════════════════════════════════════════════════════════════════════════

function DeliveryStrip() {
  return (
    <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden mb-4" style={{background:'#e5e7eb',border:'1px solid #e5e7eb'}}>
      {DELIVERY_FEATURES.map(({icon,label,sub})=>(
        <div key={label} className="flex items-center gap-2.5 bg-white px-3 py-3">
          <span style={{color:GOLD,flexShrink:0}}>{icon}</span>
          <div><div className="text-xs font-bold leading-tight" style={{color:DARK}}>{label}</div><div className="text-[11px] text-gray-400 mt-0.5">{sub}</div></div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OfferCode
// ═══════════════════════════════════════════════════════════════════════════

function OfferCode({ code }: { code: string }) {
  const [copied,setCopied] = useState(false);
  const copy = () => {
    const done = () => { setCopied(true); setTimeout(()=>setCopied(false),1500); };
    const fb = () => { const el=Object.assign(document.createElement('textarea'),{value:code}); el.style.cssText='position:fixed;opacity:0;pointer-events:none'; document.body.appendChild(el); el.focus(); el.select(); try{document.execCommand('copy');}catch(_){} document.body.removeChild(el); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(code).then(done).catch(()=>{fb();done();}); } else { fb(); done(); }
  };
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <span className="text-xs text-gray-400">Use Code:</span>
      <div className="relative">
        {copied && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded text-xs font-bold text-white whitespace-nowrap z-10" style={{background:'#16a34a'}}>✓ Copied!<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{borderTopColor:'#16a34a'}}/></div>}
        <button onClick={copy} className="text-xs font-bold px-4 py-1.5 cursor-pointer rounded-sm tracking-wide border-dashed border" style={{color:GOLD,background:LIGHT,borderColor:GOLD}}>{code}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BestOffersBox
// ═══════════════════════════════════════════════════════════════════════════

function OfferText({ info }: { info: string }) {
  const idx = info.indexOf('—');
  if (idx===-1) return <span>{info}</span>;
  return <><strong>{info.slice(0,idx).trim()}</strong>{' — '}{info.slice(idx+1).trim()}</>;
}

function BestOffersBox({ offers }: { offers: Offer[] }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 mb-4" style={{background:'#fffdf7'}}>
      <div className="flex items-center gap-2 mb-3"><span className="text-base">🏷️</span><h4 className="text-xs font-bold tracking-widest uppercase m-0" style={{color:RED}}>Best Offers for You!</h4></div>
      {offers.map((offer,i)=>(
        <div key={offer.code} className={i>0?'border-t border-gray-200 pt-3 mt-3':''}>
          <p className="text-xs leading-relaxed mb-0" style={{color:DARK}}><OfferText info={offer.info}/></p>
          <OfferCode code={offer.code}/>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QuantitySelector
// ═══════════════════════════════════════════════════════════════════════════

interface QuantitySelectorProps { quantity:number; onDecrement:()=>void; onIncrement:()=>void; onChange:(val:number)=>void; maxQty:number; disabled:boolean; }

function QuantitySelector({ quantity, onDecrement, onIncrement, onChange, maxQty, disabled }: QuantitySelectorProps) {
  const [err,setErr] = useState(false);
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const val=parseInt(e.target.value,10); setErr(false);
    if(isNaN(val)||val<1){onChange(1);return;} if(val>maxQty){setErr(true);onChange(maxQty);return;} onChange(val);
  };
  const btnCls = ['w-10 h-10 flex items-center justify-center border border-gray-300 text-xl font-semibold transition-all duration-150 select-none',
    disabled?'bg-gray-100 text-gray-400 cursor-not-allowed':'bg-white hover:bg-yellow-600 hover:text-white hover:border-yellow-600 cursor-pointer'].join(' ');
  return (
    <div className="relative inline-flex mb-4">
      {err && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded text-xs font-bold text-white whitespace-nowrap" style={{background:'#dc2626'}}>Only {maxQty} left!</div>}
      <button onClick={onDecrement} disabled={disabled||quantity<=1} className={btnCls} style={{color:DARK}}>−</button>
      <input type="number" min={1} max={maxQty} value={quantity} onChange={handleChange} disabled={disabled}
        className="w-14 h-10 border-t border-b border-gray-300 text-center font-bold text-sm outline-none"
        style={{color:disabled?'#9ca3af':DARK,background:disabled?'#f3f4f6':'#fff',borderLeft:'none',borderRight:'none'}}/>
      <button onClick={onIncrement} disabled={disabled||quantity>=maxQty} className={btnCls} style={{color:DARK}}>+</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OutOfStockPanel
// ═══════════════════════════════════════════════════════════════════════════

function OutOfStockPanel() {
  const [email,setEmail]     = useState('');
  const [submitted,setSubmit]= useState(false);
  const [error,setError]     = useState('');
  const submit = () => {
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError('Please enter a valid email address.');return;}
    setError(''); setSubmit(true);
  };
  return (
    <div className="rounded-xl border p-4 mb-4" style={{background:'#fef2f2',borderColor:'#fecaca'}}>
      <div className="flex items-center gap-2.5 mb-3"><span className="text-xl">😔</span><div><div className="text-sm font-bold" style={{color:'#b91c1c'}}>Currently Out of Stock</div><div className="text-xs text-gray-500 mt-0.5">We're restocking soon — get notified!</div></div></div>
      {submitted ? <div className="text-xs font-bold" style={{color:'#16a34a'}}>✓ You're on the list! We'll email you when it's back.</div> : (
        <div>
          <div className="flex gap-2">
            <input type="email" placeholder="Enter your email" value={email} onChange={e=>{setEmail(e.target.value);setError('');}} onKeyDown={e=>e.key==='Enter'&&submit()} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-yellow-600"/>
            <button onClick={submit} className="text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer whitespace-nowrap" style={{background:GOLD}}>Notify Me</button>
          </div>
          {error&&<p className="text-xs mt-1.5 font-medium" style={{color:'#dc2626'}}>{error}</p>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AddToCartButtons
// ═══════════════════════════════════════════════════════════════════════════

interface AddToCartButtonsProps { onAddToCart:()=>void; isAdding:boolean; outOfStock:boolean; }

function AddToCartButtons({ onAddToCart, isAdding, outOfStock }: AddToCartButtonsProps) {
  return (
    <div className="flex gap-3 mb-4">
      <button onClick={!outOfStock&&!isAdding?onAddToCart:undefined} disabled={isAdding||outOfStock}
        className="flex-1 h-12 text-sm font-semibold tracking-wide border-none transition-all duration-200 rounded-xl"
        style={{background:outOfStock?'#d1d5db':isAdding?'#786b4a':GOLD,color:outOfStock?'#9ca3af':'#fff',cursor:outOfStock||isAdding?'not-allowed':'pointer'}}>
        {outOfStock?'Out of Stock':isAdding?'Adding...':'Add to Cart'}
      </button>
      <button disabled={outOfStock}
        className="flex-1 h-12 text-sm font-semibold tracking-wide rounded-xl transition-all duration-200"
        style={{background:'#fff',color:outOfStock?'#9ca3af':GOLD,border:`1.5px solid ${outOfStock?'#d1d5db':GOLD}`,cursor:outOfStock?'not-allowed':'pointer'}}
        onMouseEnter={e=>{if(!outOfStock)Object.assign((e.currentTarget as HTMLButtonElement).style,{background:GOLD,color:'#fff',borderColor:GOLD});}}
        onMouseLeave={e=>{if(!outOfStock)Object.assign((e.currentTarget as HTMLButtonElement).style,{background:'#fff',color:GOLD,borderColor:GOLD});}}>
        Buy Now
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BulkOrderLink
// ═══════════════════════════════════════════════════════════════════════════

function BulkOrderLink({ productName, sku }: { productName: string; sku: string }) {
  const msg = encodeURIComponent(`I want to buy ${productName} - ${sku} in bulk. Can you please help me for the same?`);
  return (
    <p className="text-xs font-medium flex items-center gap-1.5 mb-3" style={{color:DARK}}>
      <FaWhatsapp size={14} color="#25d366"/>Want to buy in bulk?{' '}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`} target="_blank" rel="noreferrer" className="font-bold underline" style={{color:GOLD}}>Chat with us</a>
    </p>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SocialShare
// ═══════════════════════════════════════════════════════════════════════════

function SocialShare({ productName }: { productName: string }) {
  const url=encodeURIComponent(window.location.href); const title=encodeURIComponent(productName);
  const socials=[
    {icon:<FaFacebookF size={13}/>,  label:'Facebook',  href:`https://www.facebook.com/sharer/sharer.php?u=${url}`, bg:'#1877f2'},
    {icon:<FaTwitter   size={13}/>,  label:'Twitter',   href:`https://twitter.com/intent/tweet?text=${title}&url=${url}`, bg:'#1da1f2'},
    {icon:<FaPinterestP size={13}/>, label:'Pinterest', href:`https://pinterest.com/pin/create/button/?url=${url}&description=${title}`, bg:'#e60023'},
    {icon:<FaWhatsapp  size={13}/>,  label:'WhatsApp',  href:`https://wa.me/?text=${title}%20${url}`, bg:'#25d366'},
  ];
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="text-xs font-semibold text-gray-600">Share:</span>
      {socials.map(({icon,label,href,bg})=>(
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Share on ${label}`}
          className="w-8 h-8 rounded-full flex items-center justify-center no-underline transition-all duration-150 hover:scale-110 hover:opacity-90"
          style={{background:bg,color:'#fff'}}>{icon}</a>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AccordionItem
// ═══════════════════════════════════════════════════════════════════════════

function AccordionItem({ title, content, defaultOpen=false }: { title:string; content:React.ReactNode; defaultOpen?:boolean }) {
  const [open,setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} className="flex justify-between items-center w-full bg-transparent border-none cursor-pointer p-0 text-left">
        <span className="text-sm font-bold tracking-wide" style={{color:DARK}}>{title}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{flexShrink:0,transition:'transform 0.2s',transform:open?'rotate(45deg)':'rotate(0deg)'}}>
          <path d="M9 5.5H5.5V9H4.5V5.5H1V4.5H4.5V1H5.5V4.5H9V5.5Z" fill="#171717"/>
        </svg>
      </button>
      {open && <div className="mt-3 text-xs leading-relaxed text-gray-600">{content}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DescriptionAccordion
// ═══════════════════════════════════════════════════════════════════════════

function DescriptionAccordion() {
  // Controls whether the Description section is expanded/collapsed.
  const [isOpen, setIsOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button onClick={()=>setIsOpen((o:boolean)=>!o)} aria-expanded={isOpen} className="flex justify-between items-center w-full bg-transparent border-none cursor-pointer p-0 text-left">
        <span className="text-sm font-bold" style={{color:DARK}}>Description</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{flexShrink:0,transition:'transform 0.2s',transform:isOpen?'rotate(45deg)':'rotate(0deg)'}}><path d="M9 5.5H5.5V9H4.5V5.5H1V4.5H4.5V1H5.5V4.5H9V5.5Z" fill="#171717"/></svg>
      </button>
      {isOpen && (
        <div className="mt-3">
          <div className="overflow-hidden text-xs text-gray-600 leading-relaxed transition-all" style={{maxHeight:expanded?'none':96}}>
            <p className="mb-2">From morning eggs to gourmet stir-fries, this tri-ply hammered stainless steel frying pan is your go-to for effortless cooking.</p>
            <p className="mb-2"><strong>Design:</strong> With a 2.5mm tri-ply stainless steel construction, this frying pan offers durability and even heat distribution.</p>
            <p className="mb-2"><strong>Benefits:</strong> Extra-thick tri-ply design enhances heat retention. Its food-safe, non-reactive surface keeps flavours pure.</p>
            <p className="mb-2"><strong>Nestip:</strong> Always season with a light oil coat after washing.</p>
            <p>Style: VM107NSI19</p>
          </div>
          <button onClick={()=>setExpanded(e=>!e)} className="text-xs font-semibold underline mt-2 bg-transparent border-none cursor-pointer p-0" style={{color:GOLD}}>
            {expanded?'Read Less':'Read More'}
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ProductAccordions
// ═══════════════════════════════════════════════════════════════════════════

function ProductAccordions() {
  const bullets = (items:string[]) => (
    <ul className="list-none p-0 m-0">
      {items.map(f=><li key={f} className="flex gap-2 items-start mb-1"><span className="mt-0.5 flex-shrink-0" style={{color:GOLD}}>•</span><span>{f}</span></li>)}
    </ul>
  );
  const SHIP_ROWS:[string,string,string][]=[['Prepaid','Rs. 50','Free'],['Cash on Delivery','Rs. 90','Rs. 40']];
  const INFO_ROWS:[string,string][]=[['Size','20cm D × 40cm L × 8cm H | 1000ml'],['Colour','Silver'],['Material','Stainless steel, aluminium core']];
  return (
    <div className="mt-2">
      <DescriptionAccordion/>
      <AccordionItem title="Features" content={bullets(['Extra-thick 2.5mm tri-ply construction','100% food-safe and non-reactive','Stovetop and induction-safe','Scratch and rust-resistant','Dishwasher-safe','Sturdy riveted stainless steel handle','Inner 304-grade stainless steel'])}/>
      <AccordionItem title="Size & Detail" content={<div className="flex flex-col gap-1.5">{INFO_ROWS.map(([k,v])=><div key={k} className="flex gap-2"><span className="font-bold w-16 shrink-0" style={{color:DARK}}>{k}:</span><span className="text-gray-600">{v}</span></div>)}</div>}/>
      <AccordionItem title="Returns" content={<p>Free 7-day returns. Visit our <a href="/return-policy" className="underline" style={{color:GOLD}}>Return Policy</a> page.</p>}/>
      <AccordionItem title="Care Instructions" content={bullets(['Wash with mild dish soap and a soft sponge.','Do not use steel wool.','Wipe dry after washing.'])}/>
      <AccordionItem title="Shipping" content={
        <table className="w-full border-collapse text-xs">
          <thead><tr style={{background:'#f9fafb'}}>{['Mode','< ₹500','> ₹500'].map(h=><th key={h} className="px-2.5 py-2 text-left font-bold border border-gray-200">{h}</th>)}</tr></thead>
          <tbody>{SHIP_ROWS.map(([m,lt,gt],i)=><tr key={m} style={{background:i%2===0?'#fff':'#f9fafb'}}><td className="px-2.5 py-2 border border-gray-200">{m}</td><td className="px-2.5 py-2 border border-gray-200 text-center">{lt}</td><td className="px-2.5 py-2 border border-gray-200 text-center font-bold" style={{color:gt==='Free'?'#16a34a':undefined}}>{gt}</td></tr>)}</tbody>
        </table>}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CustomerReviews
// ═══════════════════════════════════════════════════════════════════════════

function CustomerReviews({ rating, total }: { rating:number; total:number }) {
  return (
    <div id="customer-reviews" className="py-12">
      <div className="max-w-[1720px] mx-auto px-5">
        <div className="flex items-start justify-between flex-wrap gap-6 mb-9">
          <div>
            <h3 className="text-2xl font-bold mb-2.5" style={{color:DARK}}>Customer Reviews</h3>
            <div className="flex items-center gap-3"><StarRating rating={rating} size={22}/><span className="text-3xl font-extrabold leading-none" style={{color:DARK}}>{rating}</span><span className="text-xs text-gray-500">out of 5 · {total} reviews</span></div>
            <div className="mt-4 flex flex-col gap-1.5">
              {RATING_BREAKDOWN.map(({s,p})=>(
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 text-right font-semibold text-gray-700">{s}</span>
                  <LuStar size={11} color="#f5a623"/>
                  <div className="w-40 h-1.5 rounded-full overflow-hidden bg-gray-200"><div className="h-full rounded-full" style={{width:`${p}%`,background:'#f5a623'}}/></div>
                  <span className="text-gray-400 w-7">{p}%</span>
                </div>
              ))}
            </div>
          </div>
          <a href="#write-review" className="inline-flex items-center gap-2 text-xs font-bold text-white no-underline px-5 py-2.5 rounded tracking-wide" style={{background:GOLD}}><LuPencilLine size={13}/>Write a Review</a>
        </div>
        <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'}}>
          {REVIEWS.map((r,i)=>(
            <div key={r.id} className="bg-white rounded-xl p-5 flex flex-col gap-3 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{background:AVATAR_COLORS[i%AVATAR_COLORS.length]}}>{r.avatar}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{color:DARK}}>{r.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5"><StarRating rating={r.rating} size={12}/>{r.verified&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded border" style={{color:'#16a34a',background:'#f0fdf4',borderColor:'#86efac'}}>✓ Verified</span>}</div>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">{r.date}</span>
              </div>
              <div><div className="text-sm font-bold mb-1" style={{color:DARK}}>{r.title}</div><p className="text-xs text-gray-600 leading-relaxed m-0">{r.body}</p></div>
              <div className="border-t border-gray-100 pt-2.5 flex items-center gap-1.5">
                <span className="text-[11px] text-gray-400">Helpful?</span>
                {['👍 Yes','👎 No'].map(t=><button key={t} className="text-[11px] text-gray-500 bg-transparent border border-gray-200 rounded px-2 py-0.5 cursor-pointer hover:bg-gray-50">{t}</button>)}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="bg-transparent font-bold text-xs px-7 py-2.5 cursor-pointer rounded tracking-wide border" style={{color:GOLD,borderColor:GOLD}}>View All {total} Reviews</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ProductDetails() {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [quantity,      setQuantity]      = useState(1);
  const [isAdding,      setIsAdding]      = useState(false);
  const [cartError,    setCartError]    = useState<string | null>(null);

  const OUT_OF_STOCK = STOCK_QTY === 0;
  const MAX_QTY      = OUT_OF_STOCK ? 0 : STOCK_QTY;
  const countdown    = useCountdown(SALE_TARGET);

  useEffect(() => { AOS.init({ once: true, duration: 600, easing: 'ease-out-cubic', offset: 60 }); }, []);

  const { id } = useParams<{ id: string }>();
  const parsedId = parseInt(id ?? '0', 10);
  const fallbackProduct = productList.find((item: any) => item.id === parsedId);
  const [product, setProduct] = useState<any>(fallbackProduct);

  useEffect(() => {
    let alive = true;
    if (!Number.isFinite(parsedId)) return;

    getProductById(parsedId)
      .then((p) => {
        if (!alive) return;
        setProduct(p ?? fallbackProduct);
      })
      .catch(() => {
        if (!alive) return;
        setProduct(fallbackProduct);
      });

    return () => {
      alive = false;
    };
  }, [parsedId]);

  const productName         = product?.name  ?? 'Classic Relaxable Chair';
  const productPrice        = product?.price ?? '$85.00';
  const productComparePrice = '$140.99';
  const productImage        = product?.image ?? product1;

  const YT_SHORT_ID = 'F2hBxLaJhhU';
  const YT_THUMB    = `https://img.youtube.com/vi/${YT_SHORT_ID}/hqdefault.jpg`;

  // Build media array — images first, then optional video
  const mediaItems: MediaItem[] = [
    { type:'image', url:productImage, thumbnail:productImage, alt:`${productName} main` },
    { type:'image', url:product2,     thumbnail:product2,     alt:`${productName} view 2` },
    { type:'image', url:product3,     thumbnail:product3,     alt:`${productName} view 3` },
    { type:'image', url:product4,     thumbnail:product4,     alt:`${productName} view 4` },
    {
      type: 'video',
      url: `https://www.youtube.com/shorts/${YT_SHORT_ID}`,
      thumbnail: YT_THUMB,
      embedUrl: `https://www.youtube.com/embed/${YT_SHORT_ID}?autoplay=0&mute=1&controls=1&rel=0&playsinline=1`,
      poster: YT_THUMB,
      alt: `${productName} video`,
    },
  ];

  const handleDecrement = () => setQuantity(q => Math.max(1, q-1));
  const handleIncrement = () => setQuantity(q => Math.min(MAX_QTY, q+1));
  const handleQtyChange = (val: number) => setQuantity(val);
  const handleAddToCart = async () => {
    if (OUT_OF_STOCK) return;
    if (!Number.isFinite(parsedId) || parsedId <= 0) return;
    setCartError(null);
    setIsAdding(true);
    try {
      await addToCart(parsedId, quantity);
    } catch (e: any) {
      setCartError(e?.message ?? 'Failed to add to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const sizes:string[]       = ['S','M','L','XL'];
  const colors:ColorOption[] = [{hex:'#D68553',defaultChecked:false},{hex:'#61646E',defaultChecked:true},{hex:'#E9E3DC',defaultChecked:false},{hex:'#9A9088',defaultChecked:false}];

  const CLOCK_UNITS: [string, keyof CountdownTime][] = [['D','days'],['H','hours'],['M','minutes'],['S','seconds']];

  return (
    <>
      <NavbarOne/>
      <SizeGuideModal open={sizeGuideOpen} onClose={()=>setSizeGuideOpen(false)}/>

      {/* Breadcrumb */}
      <div className="bg-[#F8F5F0] dark:bg-dark-secondary py-5 md:py-[30px]">
        <div className="container-fluid">
          <ul className="flex items-center gap-2.5 text-base md:text-lg leading-none font-normal text-title dark:text-white max-w-[1720px] mx-auto flex-wrap">
            <li><Link to="/">Home</Link></li><li>/</li>
            <li><Link to="/shop-v1">Shop</Link></li><li>/</li>
            <li style={{color:GOLD}}>{productName}</li>
          </ul>
        </div>
      </div>

      {/* ── MAIN PRODUCT SECTION ── */}
      <div className="s-py-50" data-aos="fade-up">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex justify-between gap-10 flex-col lg:flex-row">

            {/* ── LEFT: Gallery ── */}
            <div className="w-full lg:w-[58%]">
              <ProductGallery
                media={mediaItems}
                productName={productName}
                discountPct="-10%"
              />
            </div>

            {/* ── RIGHT: Info ── */}
            <div className="lg:max-w-[635px] w-full">

              {/* Title + Price block */}
              <div className="pb-5 border-b border-bdr-clr dark:border-bdr-clr-drk">
                {OUT_OF_STOCK && (
                  <div className="inline-block text-xs font-bold px-3 py-1 rounded border mb-2 tracking-widest uppercase"
                    style={{background:'#fef2f2',borderColor:'#fecaca',color:'#b91c1c'}}>Out of Stock</div>
                )}
                <h2 className="font-semibold leading-none">{productName}</h2>
                <RatingSummary rating={RATING_SUMMARY.average} total={RATING_SUMMARY.total}/>
                <StockIndicator qty={STOCK_QTY}/>
                <div className="flex gap-3 items-center mt-3 flex-wrap">
                  <span className="text-lg leading-none line-through text-gray-400">{productComparePrice}</span>
                  <span className="text-2xl font-extrabold leading-none" style={{color:GOLD}}>{productPrice}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded border" style={{color:RED,background:'#fef2f2',borderColor:'#fecaca'}}>Save 40%</span>
                </div>
                <CustomizationBadge/>

                {/* Countdown */}
                <div className="mt-5 flex items-center gap-4 flex-wrap">
                  <h4 className="text-xl font-semibold !leading-none">Hurry Up!</h4>
                  <div className="overflow-auto">
                    <div className="py-2 px-3 bg-[#FAF2F2] rounded-[51px] flex items-end gap-1.5 w-[360px]">
                      <svg className="w-[15px]" height="20" viewBox="0 0 15 20" fill="none">
                        <path d="M12.6923 7.59087C12.6383 7.52329 12.573 7.53657 12.5387 7.55036C12.51 7.562 12.4442 7.59919 12.4533 7.69239C12.4642 7.80431 12.4704 7.91841 12.4715 8.03157C12.4764 8.50102 12.2881 8.96094 11.9549 9.2934C11.6238 9.62371 11.1884 9.80168 10.7247 9.79652C10.0913 9.78844 9.56601 9.45809 9.20551 8.84118C8.90742 8.33106 9.03844 7.67313 9.17715 6.97654C9.25832 6.5688 9.34227 6.14716 9.34227 5.74588C9.34227 2.62132 7.24173 0.818669 5.98962 0.0222265C5.96373 0.00578123 5.93908 0 5.91724 0C5.88173 0 5.85361 0.0153124 5.83974 0.0246874C5.81287 0.0428905 5.76986 0.0843747 5.78369 0.157812C6.26228 2.69929 4.83478 4.22783 3.32346 5.84611C1.76566 7.51419 0 9.40485 0 12.8147C0 16.7767 3.22331 20 7.18532 20C10.4475 20 13.3237 17.7256 14.1796 14.4692C14.7633 12.2487 14.1517 9.42031 12.6923 7.59087ZM7.36458 18.4663C6.37247 18.5115 5.42896 18.1557 4.7083 17.4667C3.99537 16.7849 3.58647 15.8336 3.58647 14.8565C3.58647 13.0228 4.28756 11.6768 6.17326 9.88973C6.20412 9.86047 6.23572 9.85121 6.26326 9.85121C6.28822 9.85121 6.30986 9.85883 6.32474 9.86598C6.35611 9.88109 6.40767 9.91852 6.40072 9.99945C6.33329 10.784 6.33447 11.4352 6.40415 11.9351C6.58228 13.2118 7.51692 14.0697 8.73 14.0697C9.32477 14.0697 9.89129 13.8458 10.3252 13.4394C10.3756 13.3922 10.4318 13.3982 10.4534 13.4028C10.4819 13.409 10.5202 13.4265 10.5402 13.4748C10.7202 13.9092 10.8121 14.3703 10.8135 14.8453C10.8193 16.7564 9.27207 18.3808 7.36458 18.4663Z" fill="#E13939"/>
                      </svg>
                      <h6 className="text-lg font-medium leading-none !text-[#E13939] whitespace-nowrap">Sale Ends :</h6>
                      <div className="countdown-clock flex gap-2.5 items-center">
                        {CLOCK_UNITS.map(([lbl,key],i,arr)=>(
                          <div key={key} className="flex items-center gap-0.5">
                            <div className="countdown-item flex">
                              <div className="ci-inner text-lg font-medium leading-none text-[#E13939]">
                                <span className="ci-value">{countdown[key]}</span>
                              </div>
                              <p className="text-lg font-medium leading-none text-[#E13939]">{lbl}</p>
                            </div>
                            {i<arr.length-1 && <p className="text-lg font-medium leading-none text-[#E13939]">:</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="sm:text-lg mt-5">
                  Experience the epitome of relaxation with our {productName}. Crafted with plush cushioning
                  and ergonomic design, it offers unparalleled comfort for lounging or reading.
                </p>
              </div>

              {/* Delivery Strip */}
              <div className="py-4"><DeliveryStrip/></div>
              <DeliveryInfo/>

              {/* Qty + Wishlist */}
              <div className="pb-5 border-b border-bdr-clr dark:border-bdr-clr-drk" data-aos="fade-up" data-aos-delay="200">
                {OUT_OF_STOCK ? <OutOfStockPanel/> : (
                  <div className="flex items-center gap-4 flex-wrap mb-2">
                    <QuantitySelector quantity={quantity} onDecrement={handleDecrement} onIncrement={handleIncrement} onChange={handleQtyChange} maxQty={MAX_QTY} disabled={false}/>
                    <WishlistButton productId={parsedId}/>
                  </div>
                )}
                <BulkOrderLink productName={productName} sku="CH_0015"/>
                <BestOffersBox offers={OFFERS}/>
                <AddToCartButtons onAddToCart={handleAddToCart} isAdding={isAdding} outOfStock={OUT_OF_STOCK}/>
                {cartError && (
                  <p className="text-xs font-medium mt-2" style={{ color: '#dc2626' }}>
                    {cartError}
                  </p>
                )}
                <div className="hidden"><IncreDre/></div>
              </div>

              {/* Size / Color */}
              <div className="py-5 border-b border-bdr-clr dark:border-bdr-clr-drk" data-aos="fade-up" data-aos-delay="300">
                <div className="flex gap-x-12 gap-y-2 flex-wrap mb-2">
                  <h6 className="leading-none font-medium">SKU : CH_0015</h6>
                  <h6 className="leading-none font-medium">Category : Chair</h6>
                </div>
                <div className="flex gap-x-12 gap-y-3 flex-wrap mt-5">
                  <div className="flex gap-2.5 items-center">
                    <h6 className="leading-none font-medium">Size :</h6>
                    <div className="flex gap-2.5">
                      {sizes.map(s=>(
                        <label key={s} className="product-size">
                          <input className="appearance-none hidden" type="radio" name="size" defaultChecked={s==='S'}/>
                          <span className="w-6 h-6 flex items-center justify-center pt-0.5 text-sm leading-none bg-[#E8E9EA] dark:bg-dark-secondary text-title dark:text-white duration-300">{s}</span>
                        </label>
                      ))}
                    </div>
                    <button onClick={()=>setSizeGuideOpen(true)} className="text-xs underline cursor-pointer bg-transparent border-none flex items-center gap-1" style={{color:GOLD}}>
                      <LuInfo size={12}/> Size Guide
                    </button>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <h6 className="leading-none font-medium">Color :</h6>
                    <div className="flex gap-2.5 items-center">
                      {colors.map(({hex,defaultChecked})=>(
                        <label key={hex} className="product-color">
                          <input className="appearance-none hidden" type="radio" name="color" defaultChecked={defaultChecked}/>
                          <span className="border flex rounded-full border-opacity-0 duration-300 p-1" style={{borderColor:hex}}>
                            <span className="w-4 h-4 rounded-full flex" style={{background:hex}}/>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="py-5 border-b border-bdr-clr dark:border-bdr-clr-drk" data-aos="fade-up" data-aos-delay="400">
                <h4 className="font-medium leading-none">Tags :</h4>
                <div className="flex flex-wrap gap-2.5 mt-5">
                  {productTag.map((item:string)=>(
                    <Link key={item} className="btn btn-theme-outline btn-xs" to="#" data-text={item}><span>{item}</span></Link>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="pt-5" data-aos="fade-up" data-aos-delay="200"><SocialShare productName={productName}/></div>

              {/* Accordions */}
              <div className="mt-6" data-aos="fade-up" data-aos-delay="300"><ProductAccordions/></div>

            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div style={{borderTop:'1px solid #e5e7eb',background:'#fafafa'}}>
        <div className="container-fluid"><CustomerReviews rating={RATING_SUMMARY.average} total={RATING_SUMMARY.total}/></div>
      </div>

      {/* Detail Tab */}
      <div className="s-py-50"><div className="container-fluid"><DetailTab/></div></div>

      {/* Related */}
      <div className="s-py-50-100" data-aos="fade-up" data-aos-delay="200">
        <div className="container-fluid">
          <div className="max-w-[547px] mx-auto text-center">
            <h6 className="text-2xl sm:text-3xl md:text-4xl leading-none">Related Products</h6>
            <p className="mt-3">Explore complementary options curated just for you.</p>
          </div>
          <div className="max-w-[1720px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-8 pt-8 md:pt-[50px]">
            {productList.slice(0,4).map((item:any)=><LayoutOne item={item} key={item.id??item.name}/>)}
          </div>
        </div>
      </div>

      <FooterOne/>
      <ScrollToTop/>
    </>
  );
}