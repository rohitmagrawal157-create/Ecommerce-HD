// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════════════
//  NavbarOne — 8 UNIQUE DEPARTMENT GRADIENTS
//
//  ALL logic, hooks, scroll behavior, mobile drawer, search,
//  cart/wishlist counts are 100% UNCHANGED.
//
//  NEW: Each of the 8 departments gets its own gradient from the logo palette.
//  The nav category bar is a horizontally scrollable strip with:
//    · Each dept label in its own gradient color on hover/active
//    · A 3px gradient underline bar that slides under the active dept
//    · No dropdown on the nav bar links (clicking goes straight to category page)
//    · A subtle left/right scroll hint (fade mask) when content overflows
//  The mega menu still works on hover exactly as before.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LuHeart, LuShoppingBasket, LuSearch, LuMapPin,
  LuTruck, LuSmartphone, LuCircle, LuX,
  LuChevronDown, LuChevronRight, LuMenu, LuUser, LuShieldCheck,
} from 'react-icons/lu';
import { RiEBike2Line } from 'react-icons/ri';

// ── Brand gradient system ─────────────────────────────────────────────────────
// Global brand gradient (purple → red → orange) — used for logo, CTA, badges
const BRAND_GRAD = 'linear-gradient(135deg, #5B4FBE 0%, #E8314A 50%, #F97316 100%)';
const CTA_GRAD = 'linear-gradient(135deg, #b7be4f 0%, #36c6ee 50%, #f9e216 100%)';
const BRAND_SOLID = '#5B4FBE';
const CTA_SOLID = '#eedf36';
const CTA_BLUE = '#36c6ee';

// ── 8 unique department gradients (from the infinity logo palette) ────────────
// Each is a 135° gradient between two or three colors pulled from the logo.
// Assignment is intentional: warm tones for art/decor, cool for tech/modern.
const DEPT_GRADS: Record<string, { grad: string; from: string; to: string }> = {
  'Portrait Frames':   { grad: 'linear-gradient(135deg,#5B4FBE,#9333EA)', from:'#5B4FBE', to:'#9333EA' }, // purple→violet
  'Canvas Paintings':  { grad: 'linear-gradient(135deg,#E8314A,#F97316)', from:'#E8314A', to:'#F97316' }, // red→orange
  'Temple Art Prints': { grad: 'linear-gradient(135deg,#F97316,#EAB308)', from:'#F97316', to:'#EAB308' }, // orange→yellow
  'Wall Murals':       { grad: 'linear-gradient(135deg,#22C55E,#84CC16)', from:'#22C55E', to:'#84CC16' }, // green→lime
  'Modern Wallpapers': { grad: 'linear-gradient(135deg,#06B6D4,#2563EB)', from:'#06B6D4', to:'#2563EB' }, // cyan→blue
  'Customize Blinds':  { grad: 'linear-gradient(135deg,#EC4899,#E8314A)', from:'#EC4899', to:'#E8314A' }, // pink→red
  'Neon Signs':        { grad: 'linear-gradient(135deg,#06B6D4,#22C55E)', from:'#06B6D4', to:'#22C55E' }, // cyan→green
  'Backlit LED':       { grad: 'linear-gradient(135deg,#5B4FBE,#06B6D4)', from:'#5B4FBE', to:'#06B6D4' }, // purple→cyan
};

const C = {
  brand: BRAND_SOLID,
  brandHover: '#4a3da0',
  brandBg: '#f0f0fc',
  dark: '#1c1c1c',
  text: '#1a1a1a',
  muted: '#555',
  light: '#aaa',
  border: '#efefef',
  borderMd: '#e4e4e4',
  white: '#ffffff',
  newBadge: '#E8314A',
  sale: '#F97316',
};
const FONT = "'DM Sans', sans-serif";

type MenuLink = string | { name: string; badge?: string; path?: string };
interface MenuGroup { heading: string; links: MenuLink[]; }
interface DeptMenu { image: string; imageAlt: string; flatLinks?: MenuLink[]; groups: MenuGroup[]; }

// ── Helpers — unchanged ───────────────────────────────────────────────────────
const toSlug = (s: string) => s.toLowerCase().replace(/[\s&\/]+/g, '-');
const getLinkName = (l: MenuLink): string => typeof l === 'string' ? l : l.name;
const getLinkBadge = (l: MenuLink): string | undefined => typeof l === 'string' ? undefined : l.badge;
const getLinkPath = (l: MenuLink, dept?: string): string => {
  if (typeof l !== 'string' && l.path) return l.path;
  const name = getLinkName(l);
  if (dept === 'Customize Blinds' && (name.toLowerCase().includes('custom') || name === 'Start Customizing')) return '/customize/blind';
  if (dept === 'Neon Signs' && (name.toLowerCase().includes('design') || name === 'Design Your Neon Sign')) return '/customize/neon';
  if (dept === 'Wall Murals' && name.toLowerCase().includes('custom photo')) return '/customize/mural';
  if (dept) return `/category/${toSlug(dept)}?sub=${encodeURIComponent(name)}`;
  return `/product/${toSlug(name)}`;
};

// ── Mega menu data — unchanged ────────────────────────────────────────────────
const MEGA_MENU: Record<string, DeptMenu> = {
  'Portrait Frames': { image:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=320&h=400&fit=crop',imageAlt:'Portrait Frames',flatLinks:['All Portrait Frames','Wooden Frames','Metal Frames','Acrylic Frames','Collage Frames',{name:'Custom Size Frames',badge:'NEW'}],groups:[{heading:'By Orientation',links:['Portrait','Landscape','Square','Panoramic']},{heading:'By Color',links:['Black','White','Gold','Silver','Natural Wood','Custom Color']}]},
  'Canvas Paintings': { image:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=320&h=400&fit=crop',imageAlt:'Canvas Paintings',flatLinks:['All Canvas Paintings','Abstract Canvas','Landscape Canvas','Portrait Canvas','Custom Canvas Print',{name:'Canvas with Frame',badge:''}],groups:[{heading:'Size',links:['Small (under 24")','Medium (24"-48")','Large (48"+ )','Multi-panel']},{heading:'Style',links:['Modern','Traditional','Minimalist','Vintage','Religious','Custom Design']}]},
  'Temple Art Prints': { image:'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=320&h=400&fit=crop',imageAlt:'Temple Art Prints',flatLinks:['All Temple Art','Ganesha Paintings','Lakshmi Prints','Sai Baba Art','Radha Krishna',{name:'Pichwai Art',badge:'NEW'},'Custom Temple Art'],groups:[{heading:'Medium',links:['Canvas','Paper Print','Metal Print','Wood Panel','Fabric']},{heading:'Frame Style',links:['Ornate Gold','Wood Grain','Floating Frame','Unframed']}]},
  'Wall Murals': { image:'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=320&h=400&fit=crop',imageAlt:'Wall Murals',flatLinks:['All Wall Murals','Nature Murals','Abstract Murals','Cityscape Murals','Kids Room Murals',{name:'Custom Photo Mural',badge:'POPULAR'}],groups:[{heading:'Material',links:['Non-woven','Vinyl','Peel & Stick','Pre-pasted','Textured']},{heading:'Room',links:['Living Room','Bedroom','Office','Restaurant','Kids Room']}]},
  'Modern Wallpapers': { image:'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=320&h=400&fit=crop',imageAlt:'Modern Wallpapers',flatLinks:['All Wallpapers','Geometric Patterns','Floral Prints','3D Textured','Metallic Finish',{name:'Eco-friendly',badge:'NEW'},'Sample Pack'],groups:[{heading:'Color',links:['Neutral','Bold & Bright','Pastel','Dark & Moody','Custom Color']},{heading:'Application',links:['Living Room','Bedroom','Accent Wall','Ceiling','Bathroom']}]},
  'Customize Blinds': { image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=320&h=400&fit=crop',imageAlt:'Customize Blinds',flatLinks:[{name:'Start Customizing',path:'/customize/blind',badge:'NEW'},'Roller Blinds','Roman Blinds','Venetian Blinds','Vertical Blinds','Motorized Blinds','Shop All Blinds'],groups:[{heading:'Features',links:['Blackout','Light Filtering','Thermal Insulation','Water Resistant']},{heading:'Colors & Textures',links:['Solid Colors','Patterns','Wood Grain','Metallic','Custom Print']}]},
  'Neon Signs': { image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnnDsYuA7SInsAMt2y3r-DG21vVwRYkUWsxQ&s',imageAlt:'Neon Signs',flatLinks:[{name:'Design Your Neon Sign',path:'/customize/neon',badge:'BESTSELLER'},'Pre-designed Quotes','Business Logos','Wedding Signs','Custom Shapes','LED Neon vs Glass Neon','Shop All Neon'],groups:[{heading:'Colors',links:['Red','Blue','Green','Pink','White','Multicolor','RGB']},{heading:'Sizes',links:['Small (12"x12")','Medium (24"x24")','Large (36"x36")','Custom Size']}]},
  'Backlit LED': { image:'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&h=400&fit=crop',imageAlt:'Backlit LED',flatLinks:['LED Panel Lights','Backlit Frames','Edge-lit Signs','Light Boxes','Slim LED Panels',{name:'Tunable White',badge:'NEW'},'Shop All Backlit LED'],groups:[{heading:'Applications',links:['Home Lighting','Office Ceilings','Signage Backlight','Art Illumination','Retail Displays']},{heading:'Technology',links:['CCT Tunable','Dimmable','Smart (WiFi)','Emergency Backup','IP65 Waterproof']}]},
};

const PAGE_MENU = {
  Home:{links:[{name:'Home Minimal',path:'/'},{name:'Home Stylish',path:'/index-v2'},{name:'Home Accessories',path:'/index-v3'},{name:'Home Collection',path:'/index-v4'},{name:'Home Luxury',path:'/index-v5'}]},
  Pages:{groups:[{heading:'Company',links:[{name:'About Us',path:'/about'},{name:'Price Plan',path:'/pricing'},{name:'Team Member',path:'/team'},{name:'FAQs',path:'/faq'},{name:'Terms',path:'/terms-and-conditions'}]},{heading:'Portfolio',links:[{name:'Portfolio 1',path:'/portfolio-v1'},{name:'Portfolio 2',path:'/portfolio-v2'},{name:'404 Error',path:'/error'}]},{heading:'Account',links:[{name:'My Profile',path:'/my-profile'},{name:'Login',path:'/login'},{name:'Register',path:'/register'}]},{heading:'Checkout',links:[{name:'Shipping Method',path:'/shipping-method'},{name:'Payment Method',path:'/payment-method'},{name:'Invoice',path:'/invoice'}]}]},
  Shop:{links:[{name:'Shop Layout 01',path:'/shop-v1'},{name:'Shop Layout 02',path:'/shop-v2'},{name:'Product Details',path:'/product-details'},{name:'My Cart',path:'/cart'},{name:'Checkout',path:'/checkout'}]},
};

const DEPARTMENTS = Object.keys(MEGA_MENU);

// ── CSS ───────────────────────────────────────────────────────────────────────
// Key additions:
//   .hcn-dept-link  — base styles for each department nav pill
//   .hcn-dept-link[data-dept="X"]:hover / .is-active — unique gradient per dept
//   .hcn-catbar — the scrollable category bar container with fade masks
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  .hcn*,.hcn *::before,.hcn *::after{box-sizing:border-box}
  .hcn a{text-decoration:none}
  .hcn button{font-family:${FONT}}
  .hcn input[type='search']::-webkit-search-cancel-button{display:none}
  .hcn input:focus{outline:none}
  @media(max-width:1023px){.hcn .dsk{display:none!important}}
  @media(min-width:1024px){.hcn .mob{display:none!important}}

  /* Utility bar */
  .hcn-util-bar{background:${C.dark};max-height:36px;overflow:hidden;transition:max-height .3s ease,opacity .22s ease;opacity:1}
  .hcn-util-bar.is-hidden{max-height:0;opacity:0}
  .hcn-util-link{color:#aaa;transition:color .15s;display:flex;align-items:center;gap:5px;padding:0 10px;height:36px;font-family:${FONT};font-size:11.5px}
  .hcn-util-link:hover{color:#fff}

  /* ── CATEGORY BAR ─────────────────────────────────────────────── */
  /* Scrollable strip with fade masks on edges */
  .hcn-catbar-wrap {
    position: relative;
    overflow: hidden;
    background: ${C.white};
    border-bottom: 1px solid #e8e8e8;
  }
  /* Left fade mask */
  .hcn-catbar-wrap::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 32px;
    background: linear-gradient(to right, ${C.white}, transparent);
    z-index: 2;
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s;
  }
  /* Right fade mask */
  .hcn-catbar-wrap::after {
    content: '';
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 32px;
    background: linear-gradient(to left, ${C.white}, transparent);
    z-index: 2;
    pointer-events: none;
    transition: opacity .2s;
  }
  .hcn-catbar-wrap.can-scroll-right::after { opacity: 1; }
  .hcn-catbar-wrap.can-scroll-left::before { opacity: 1; }

  /* The actual scrollable row */
  .hcn-catbar {
    display: flex;
    align-items: stretch;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    max-width: 1720px;
    margin: 0 auto;
    padding: 0 24px;
    height: 48px;
  }
  .hcn-catbar::-webkit-scrollbar { display: none; }

  /* ── Each department link pill ──────────────────────────────────── */
  .hcn-dept-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 18px;
    height: 100%;
    font-size: 13px;
    font-weight: 600;
    font-family: ${FONT};
    white-space: nowrap;
    color: ${C.text};
    flex-shrink: 0;
    border-bottom: 2.5px solid transparent;
    transition: color .18s, border-color .18s;
    cursor: pointer;
    text-decoration: none;
  }
  /* The 3px gradient underline — hidden by default, slides in on hover/active */
  .hcn-dept-link::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    right: 50%;
    height: 2.5px;
    border-radius: 2px;
    transition: left .22s ease, right .22s ease, opacity .18s;
    opacity: 0;
  }
  .hcn-dept-link:hover::after,
  .hcn-dept-link.is-active::after {
    left: 12px;
    right: 12px;
    opacity: 1;
  }

  /* ── 8 unique gradient underlines + text colors ──────────────────── */
  .hcn-dept-link[data-dept="Portrait Frames"]::after   { background: linear-gradient(90deg,#5B4FBE,#9333EA); }
  .hcn-dept-link[data-dept="Canvas Paintings"]::after  { background: linear-gradient(90deg,#E8314A,#F97316); }
  .hcn-dept-link[data-dept="Temple Art Prints"]::after { background: linear-gradient(90deg,#F97316,#EAB308); }
  .hcn-dept-link[data-dept="Wall Murals"]::after       { background: linear-gradient(90deg,#22C55E,#84CC16); }
  .hcn-dept-link[data-dept="Modern Wallpapers"]::after { background: linear-gradient(90deg,#06B6D4,#2563EB); }
  .hcn-dept-link[data-dept="Customize Blinds"]::after  { background: linear-gradient(90deg,#EC4899,#E8314A); }
  .hcn-dept-link[data-dept="Neon Signs"]::after        { background: linear-gradient(90deg,#06B6D4,#22C55E); }
  .hcn-dept-link[data-dept="Backlit LED"]::after       { background: linear-gradient(90deg,#5B4FBE,#06B6D4); }

  /* Gradient text on hover/active — each dept uses its own color pair */
  .hcn-dept-link[data-dept="Portrait Frames"]:hover,
  .hcn-dept-link[data-dept="Portrait Frames"].is-active   { background-image:linear-gradient(135deg,#5B4FBE,#9333EA); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .hcn-dept-link[data-dept="Canvas Paintings"]:hover,
  .hcn-dept-link[data-dept="Canvas Paintings"].is-active  { background-image:linear-gradient(135deg,#E8314A,#F97316); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .hcn-dept-link[data-dept="Temple Art Prints"]:hover,
  .hcn-dept-link[data-dept="Temple Art Prints"].is-active { background-image:linear-gradient(135deg,#F97316,#EAB308); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .hcn-dept-link[data-dept="Wall Murals"]:hover,
  .hcn-dept-link[data-dept="Wall Murals"].is-active       { background-image:linear-gradient(135deg,#22C55E,#84CC16); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .hcn-dept-link[data-dept="Modern Wallpapers"]:hover,
  .hcn-dept-link[data-dept="Modern Wallpapers"].is-active { background-image:linear-gradient(135deg,#06B6D4,#2563EB); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .hcn-dept-link[data-dept="Customize Blinds"]:hover,
  .hcn-dept-link[data-dept="Customize Blinds"].is-active  { background-image:linear-gradient(135deg,#EC4899,#E8314A); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .hcn-dept-link[data-dept="Neon Signs"]:hover,
  .hcn-dept-link[data-dept="Neon Signs"].is-active        { background-image:linear-gradient(135deg,#06B6D4,#22C55E); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .hcn-dept-link[data-dept="Backlit LED"]:hover,
  .hcn-dept-link[data-dept="Backlit LED"].is-active       { background-image:linear-gradient(135deg,#5B4FBE,#06B6D4); -webkit-background-clip:text; background-clip:text; color:transparent; }

  /* chevron inside dept link */
  .hcn-dept-link .dept-chevron { transition: transform .2s; flex-shrink:0; }
  .hcn-dept-link:hover .dept-chevron { transform: rotate(180deg); }

  /* Divider between logo section and dept links */
  .hcn-catbar-divider { width:1px; background:${C.border}; margin:12px 8px; flex-shrink:0; }

  /* ── Rest of CSS — unchanged from original ── */
  .hcn-mega-fw{position:fixed;left:0;right:0;background:${C.white};border-top:1px solid ${C.border};box-shadow:0 12px 40px rgba(0,0,0,.10),0 2px 6px rgba(0,0,0,.05);z-index:8999;transition:opacity .18s ease,transform .18s ease;transform-origin:top center;overflow:hidden}
  .hcn-mega-fw.is-open{opacity:1;transform:translateY(0) scaleY(1);pointer-events:auto}
  .hcn-mega-fw.is-shut{opacity:0;transform:translateY(-8px) scaleY(.97);pointer-events:none}
  .hcn-fl-link{display:block;font-size:14px;font-family:${FONT};color:${C.text};padding:5px 0;transition:color .15s;font-weight:400;white-space:nowrap}
  .hcn-fl-link:hover{color:${BRAND_SOLID}}
  .hcn-fl-link.shop-all{font-weight:600;color:${C.muted};margin-top:4px}
  .hcn-fl-link.shop-all:hover{color:${BRAND_SOLID}}
  .hcn-grp-head{font-size:14px;font-weight:700;font-family:${FONT};color:${C.text};margin-bottom:12px;padding-bottom:6px;border-bottom:1.5px solid ${C.border}}
  .hcn-grp-link{display:flex;align-items:center;gap:7px;font-size:13.5px;font-family:${FONT};color:${C.muted};padding:4px 0;transition:color .15s}
  .hcn-grp-link:hover{color:${BRAND_SOLID}}
  .hcn-grp-link.shop-all{font-weight:600;color:${C.muted};margin-top:6px}
  .hcn-grp-link.shop-all:hover{color:${BRAND_SOLID}}
  .hcn-badge-new{display:inline-flex;align-items:center;background:${C.newBadge};color:#fff;font-size:9px;font-weight:700;letter-spacing:.06em;padding:2px 6px;border-radius:10px;line-height:1;flex-shrink:0;text-transform:uppercase}
  .hcn-icon-btn{background:none;border:none;cursor:pointer;padding:0;display:flex;flex-direction:column;align-items:center;gap:2px;border-radius:8px;padding:5px 9px;transition:background .14s}
  .hcn-icon-btn:hover{background:${C.brandBg}}
  .hcn-icon-btn:hover .hcn-ico{color:${BRAND_SOLID}!important}
  .hcn-icon-btn:hover .hcn-lbl{color:${BRAND_SOLID}!important}
  .hcn-search-wrap{display:flex;align-items:center;height:44px;border-radius:100px;overflow:hidden;background:#f4f3f8;border:1.5px solid ${C.borderMd};transition:border-color .2s,box-shadow .2s}
  .hcn-search-wrap.focused{border-color:${BRAND_SOLID};box-shadow:0 0 0 3px rgba(91,79,190,.12)}
  .hcn-search-input{flex:1;min-width:0;background:transparent;border:none;outline:none;padding:0 10px;font-size:14px;color:${C.text};font-family:${FONT}}
  .hcn-search-input::placeholder{color:${C.light}}
  .hcn-mob-header{transform:translateY(0);transition:transform .3s cubic-bezier(.4,0,.2,1);will-change:transform}
  .hcn-mob-header.is-hidden{transform:translateY(-100%)}
  .hcn-mob-icon{display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:9px;border-radius:10px;-webkit-tap-highlight-color:transparent}
  .hcn-mob-icon:active{background:${C.brandBg}}
  .hcn-chips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .hcn-chips::-webkit-scrollbar{display:none}
  .hcn-chip{flex-shrink:0;padding:6px 14px;border-radius:22px;font-size:12.5px;font-weight:600;font-family:${FONT};white-space:nowrap;border:1.5px solid ${C.borderMd};background:${C.white};color:${C.text};cursor:pointer;transition:all .15s;text-decoration:none}
  .hcn-chip:hover,.hcn-chip.is-active{background:${BRAND_GRAD};color:#fff;border-color:transparent}
  .hcn-drawer-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:none;border:none;cursor:pointer;font-weight:600;font-size:14px;color:${C.text};font-family:${FONT};text-align:left;transition:background .14s}
  .hcn-drawer-btn:hover{background:#f5f5f5}
  .hcn-sub-link{font-size:13px;color:${C.muted};font-family:${FONT};transition:color .14s}
  .hcn-sub-link:hover{color:${BRAND_SOLID}}

  /* Simple drop / pages drop (kept for potential use) */
  .hcn-simple-drop{position:absolute;top:100%;left:0;background:${C.white};border:1px solid ${C.border};border-top:none;border-radius:0 0 12px 12px;min-width:200px;box-shadow:0 16px 40px rgba(0,0,0,.10);z-index:9001;transition:opacity .15s,transform .15s;transform-origin:top left}
  .hcn-simple-drop.is-open{opacity:1;transform:scaleY(1);pointer-events:auto}
  .hcn-simple-drop.is-shut{opacity:0;transform:scaleY(.96);pointer-events:none}
  .hcn-drop-link{display:block;padding:9px 18px;font-size:13px;font-family:${FONT};color:${C.muted};transition:background .14s,color .14s}
  .hcn-drop-link:hover{background:${C.brandBg};color:${BRAND_SOLID}}
`;

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ text, visible }: { text: string; visible: boolean }) {
  return <div style={{position:'absolute',top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',fontSize:11,fontFamily:FONT,fontWeight:500,padding:'5px 11px',borderRadius:5,whiteSpace:'nowrap',zIndex:9999,boxShadow:'0 4px 14px rgba(0,0,0,.2)',opacity:visible?1:0,pointerEvents:'none',transition:'opacity .18s'}}><div style={{position:'absolute',top:-4,left:'50%',transform:'translateX(-50%) rotate(45deg)',width:8,height:8,background:'#1a1a1a'}}/>{text}</div>;
}

// ── MegaMenuPanel — unchanged logic, dept gradient accent bar added ────────────
function MegaMenuPanel({ dept, data, isOpen, navbarBottom, onEnter, onLeave }: { dept:string; data:DeptMenu; isOpen:boolean; navbarBottom:number; onEnter:()=>void; onLeave:()=>void }) {
  const dg = DEPT_GRADS[dept];
  return (
    <div className={`hcn-mega-fw ${isOpen?'is-open':'is-shut'}`} style={{top:navbarBottom}} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {/* Dept-specific gradient accent bar at top of panel */}
      <div style={{height:3, background:dg?.grad ?? BRAND_GRAD}} />
      {isOpen && <div style={{position:'absolute',top:-28,left:'50%',transform:'translateX(-50%)',background:'rgba(26,26,26,.9)',color:'#fff',fontSize:12,fontWeight:600,fontFamily:FONT,padding:'5px 14px',borderRadius:'6px 6px 0 0',whiteSpace:'nowrap',pointerEvents:'none'}}>{dept}</div>}
      <div style={{maxWidth:1400,margin:'0 auto',padding:'28px 40px',display:'flex',alignItems:'flex-start',gap:28,justifyContent:'center'}}>
        {/* Dept image with gradient border */}
        <div style={{width:220,minWidth:220,overflow:'hidden',borderRadius:8,boxShadow:`0 0 0 2px ${dg?.from ?? BRAND_SOLID}22, 0 6px 18px rgba(0,0,0,.06)`}}>
          <img src={data.image} alt={data.imageAlt} style={{width:'100%',height:280,objectFit:'cover',display:'block'}}/>
        </div>
        <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
          {data.flatLinks&&data.flatLinks.length>0&&(
            <div style={{minWidth:180,padding:'0 24px',borderRight:`1px solid ${C.border}`,flexShrink:0}}>
              {/* Section heading in dept gradient */}
              <div style={{fontSize:10,fontWeight:800,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:12,backgroundImage:dg?.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Quick Links</div>
              {data.flatLinks.map((item,i)=>{const name=getLinkName(item);const badge=getLinkBadge(item);const isShopAll=name.toLowerCase().startsWith('shop all');return <Link key={i} to={getLinkPath(item,dept)} className={`hcn-fl-link ${isShopAll?'shop-all':''}`}>{name}{badge==='NEW'&&<span className="hcn-badge-new" style={{marginLeft:6}}>NEW</span>}</Link>;})}
            </div>
          )}
          {data.groups.map((group,gi)=>(
            <div key={gi} style={{minWidth:180,padding:'0 24px',borderRight:gi<data.groups.length-1?`1px solid ${C.border}`:'none',flexShrink:0}}>
              <div className="hcn-grp-head" style={{backgroundImage:dg?.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{group.heading}</div>
              {group.links.map((item,li)=>{const name=getLinkName(item);const badge=getLinkBadge(item);const isShopAll=name.toLowerCase().startsWith('shop all');return <Link key={li} to={getLinkPath(item,dept)} className={`hcn-grp-link ${isShopAll?'shop-all':''}`}>{name}{badge==='NEW'&&<span className="hcn-badge-new">NEW</span>}</Link>;})}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MobileDrawer ──────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const [expanded,setExpanded]=useState<string|null>(null);
  const toggle=(s:string)=>setExpanded(p=>p===s?null:s);
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1100,opacity:open?1:0,pointerEvents:open?'auto':'none',transition:'opacity .27s ease'}}/>
      <div style={{position:'fixed',top:0,left:0,bottom:0,width:'min(84vw,350px)',background:C.white,zIndex:1200,display:'flex',flexDirection:'column',transform:open?'translateX(0)':'translateX(-100%)',transition:'transform .3s cubic-bezier(.4,0,.2,1)',boxShadow:'5px 0 30px rgba(0,0,0,.16)'}}>
        {/* Gradient strip at top */}
        <div style={{height:3,background:BRAND_GRAD,flexShrink:0}}/>
        <div style={{padding:'15px 16px',borderBottom:`1px solid ${C.border}`,background:C.brandBg,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontWeight:800,fontSize:20,letterSpacing:-.5,lineHeight:1,fontFamily:FONT,backgroundImage:BRAND_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Infinity</div>
            <div style={{fontSize:9,color:C.light,letterSpacing:'0.15em',textTransform:'uppercase',marginTop:3}}>printing &amp; signage</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${C.borderMd}`,background:C.white,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><LuX size={15} color="#555"/></button>
        </div>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <a href="#" onClick={(e)=>{e.preventDefault();const dest=window.localStorage.getItem('access_token')?'/my-profile':'/login';window.location.href=dest;}}
            style={{width:'100%',display:'inline-block',textAlign:'center',padding:'11px 0',borderRadius:10,border:'none',background:CTA_GRAD,color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.06em',cursor:'pointer',fontFamily:FONT,textDecoration:'none'}}>
            SIGN UP / SIGN IN
          </a>
        </div>
        <div style={{flex:1,overflowY:'auto',overscrollBehavior:'contain'}}>
          {[{label:'Home',links:PAGE_MENU.Home.links},{label:'Shop',links:PAGE_MENU.Shop.links}].map(sec=>(
            <div key={sec.label} style={{borderBottom:`1px solid #f5f5f5`}}>
              <button onClick={()=>toggle(sec.label)} className="hcn-drawer-btn">{sec.label}<LuChevronDown size={14} color="#999" style={{transition:'transform .2s',transform:expanded===sec.label?'rotate(180deg)':'rotate(0)'}}/></button>
              <div style={{maxHeight:expanded===sec.label?400:0,overflow:'hidden',transition:'max-height .3s ease'}}><div style={{background:'#fafaf9',padding:'8px 16px 14px',display:'flex',flexDirection:'column',gap:9}}>{sec.links.map((l:any,i:number)=><Link key={i} to={l.path} onClick={onClose} className="hcn-sub-link">{l.name}</Link>)}</div></div>
            </div>
          ))}
          <Link to="/contact" onClick={onClose} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',borderBottom:`1px solid #f5f5f5`,fontSize:14,fontWeight:600,color:C.text,fontFamily:FONT}}>Contact <LuChevronRight size={14} color="#aaa"/></Link>
          {DEPARTMENTS.map(dept=>{
            const data=MEGA_MENU[dept];
            const dg=DEPT_GRADS[dept];
            return (
              <div key={dept} style={{borderBottom:`1px solid #f5f5f5`}}>
                <button onClick={()=>toggle(dept)} className="hcn-drawer-btn">
                  {/* Dept name in its own gradient color */}
                  <span style={{backgroundImage:expanded===dept?dg?.grad:'none',WebkitBackgroundClip:expanded===dept?'text':'unset',WebkitTextFillColor:expanded===dept?'transparent':'inherit',backgroundClip:expanded===dept?'text':'unset',transition:'all .2s'}}>
                    {dept}
                  </span>
                  <LuChevronDown size={14} color="#999" style={{transition:'transform .2s',transform:expanded===dept?'rotate(180deg)':'rotate(0)'}}/>
                </button>
                <div style={{maxHeight:expanded===dept?700:0,overflow:'hidden',transition:'max-height .32s ease'}}>
                  <div style={{background:'#fafaf9',padding:'10px 16px 14px'}}>
                    {/* Gradient top strip inside drawer panel */}
                    <div style={{height:2,background:dg?.grad,borderRadius:1,marginBottom:10}}/>
                    <div style={{borderRadius:8,overflow:'hidden',marginBottom:12,height:100}}><img src={data.image} alt={dept} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
                    {(data.flatLinks||[]).map((item,i)=>{const name=getLinkName(item);const badge=getLinkBadge(item);return <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 0'}}><Link to={getLinkPath(item,dept)} onClick={onClose} className="hcn-sub-link">{name}</Link>{badge==='NEW'&&<span className="hcn-badge-new">NEW</span>}</div>;})}
                    {data.groups.map((group,gi)=>(<div key={gi} style={{marginTop:12}}><div style={{fontSize:10,fontWeight:700,color:'#bbb',textTransform:'uppercase',letterSpacing:'0.13em',marginBottom:6,fontFamily:FONT}}>{group.heading}</div>{group.links.map((item,li)=>{const name=getLinkName(item);const badge=getLinkBadge(item);return <div key={li} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 0'}}><Link to={getLinkPath(item,dept)} onClick={onClose} className="hcn-sub-link">{name}</Link>{badge==='NEW'&&<span className="hcn-badge-new">NEW</span>}</div>;})}</div>))}
                    <Link to={`/category/${toSlug(dept)}`} onClick={onClose} style={{display:'inline-block',marginTop:10,fontSize:12,fontWeight:700,fontFamily:FONT,backgroundImage:dg?.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                      View All {dept} →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,background:'#fafaf9',padding:'11px 16px',flexShrink:0}}>
          {[{icon:<RiEBike2Line size={14}/>,label:'Fast Delivery Available'},{icon:<LuMapPin size={13}/>,label:'Delivering To Your City'},{icon:<LuTruck size={13}/>,label:'Track Your Order'},{icon:<LuSmartphone size={13}/>,label:'Download Our App'}].map(({icon,label})=>(<div key={label} style={{display:'flex',alignItems:'center',gap:10,padding:'5px 0',fontSize:12.5,color:'#555',fontFamily:FONT}}><span style={{color:BRAND_SOLID,display:'flex'}}>{icon}</span>{label}</div>))}
        </div>
      </div>
    </>
  );
}

// ── NavbarOne — all hooks and logic unchanged ─────────────────────────────────
export default function NavbarOne() {
  const location=useLocation();const navigate=useNavigate();const curr=location.pathname;
  const [activeMenu,setActiveMenu]=useState<string|null>(null);
  const [searchFocused,setSearchFocused]=useState(false);
  const [searchVal,setSearchVal]=useState('');
  const [showFreeShip,setShowFreeShip]=useState(false);
  const [showEmi,setShowEmi]=useState(false);
  const [drawerOpen,setDrawerOpen]=useState(false);
  const [cartCount,setCartCount]=useState(0);
  const [wishlistCount,setWishlistCount]=useState(0);
  const [isAuthenticated,setIsAuthenticated]=useState<boolean>(false);
  const [scrolled,setScrolled]=useState(false);
  const [mobHidden,setMobHidden]=useState(false);
  const [navbarBottom,setNavbarBottom]=useState(0);
  const [activeChip,setActiveChip]=useState<string|null>(null);
  // Scroll state for the category bar fade masks
  const [catBarScroll,setCatBarScroll]=useState({left:false,right:false});
  const catBarRef=useRef<HTMLDivElement>(null);

  const navRef=useRef<HTMLElement>(null);
  const timerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const rafRef=useRef<number|null>(null);
  const lastY=useRef(0);const delta=useRef(0);const scrolled_=useRef(false);const mobHid_=useRef(false);

  const measureNavbar=useCallback(()=>{if(navRef.current)setNavbarBottom(navRef.current.getBoundingClientRect().bottom);},[]);
  useEffect(()=>{measureNavbar();window.addEventListener('resize',measureNavbar);return()=>window.removeEventListener('resize',measureNavbar);},[measureNavbar]);

  // Category bar scroll mask check
  const checkCatBarScroll=useCallback(()=>{
    const el=catBarRef.current;
    if(!el) return;
    setCatBarScroll({
      left: el.scrollLeft > 8,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8,
    });
  },[]);
  useEffect(()=>{
    const el=catBarRef.current;
    if(!el) return;
    checkCatBarScroll();
    el.addEventListener('scroll',checkCatBarScroll,{passive:true});
    window.addEventListener('resize',checkCatBarScroll);
    return()=>{el.removeEventListener('scroll',checkCatBarScroll);window.removeEventListener('resize',checkCatBarScroll);};
  },[checkCatBarScroll]);

  useEffect(()=>{
    setIsAuthenticated(Boolean(window.localStorage.getItem('access_token')));
    async function refreshCounts(){
      try{const{getCart}=await import('../../api/cart.api');const cart=await getCart();setCartCount(cart.lines.reduce((s:number,l:any)=>s+(l.quantity??0),0));}catch{}
      try{const{getWishlist}=await import('../../api/wishlist.api');const wl=await getWishlist();setWishlistCount(wl.productIds.length);}catch{}
    }
    refreshCounts();
    const onCart=()=>refreshCounts();const onWl=()=>refreshCounts();
    const onStorage=(e:StorageEvent)=>{if(e.key==='access_token')setIsAuthenticated(Boolean(window.localStorage.getItem('access_token')));if(e.key?.startsWith('cart'))refreshCounts();if(e.key?.startsWith('wishlist'))refreshCounts();};
    window.addEventListener('cart:changed',onCart as EventListener);window.addEventListener('wishlist:changed',onWl as EventListener);window.addEventListener('storage',onStorage as EventListener);
    return()=>{window.removeEventListener('cart:changed',onCart as EventListener);window.removeEventListener('wishlist:changed',onWl as EventListener);window.removeEventListener('storage',onStorage as EventListener);};
  },[]);
  useEffect(()=>{measureNavbar();},[scrolled,measureNavbar]);
  const onScroll=useCallback(()=>{const y=window.scrollY;if(rafRef.current)cancelAnimationFrame(rafRef.current);rafRef.current=requestAnimationFrame(()=>{rafRef.current=null;const isMobile=window.innerWidth<1024;if(y>2!==scrolled_.current){scrolled_.current=y>2;setScrolled(y>2);}if(!isMobile){if(mobHid_.current){mobHid_.current=false;setMobHidden(false);}lastY.current=y;delta.current=0;return;}if(y<=10){if(mobHid_.current){mobHid_.current=false;setMobHidden(false);}lastY.current=y;delta.current=0;return;}const diff=y-lastY.current;if(diff>0){if(delta.current<0)delta.current=0;delta.current+=diff;if(delta.current>60){mobHid_.current=true;setMobHidden(true);}}else if(diff<0){if(delta.current>0)delta.current=0;delta.current+=diff;if(delta.current<-30){mobHid_.current=false;setMobHidden(false);}}lastY.current=y;});},[]);
  useEffect(()=>{window.addEventListener('scroll',onScroll,{passive:true});return()=>{window.removeEventListener('scroll',onScroll);if(rafRef.current)cancelAnimationFrame(rafRef.current);};},[onScroll]);
  useEffect(()=>{document.body.style.overflow=drawerOpen?'hidden':'';return()=>{document.body.style.overflow='';};},[drawerOpen]);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(navRef.current&&!navRef.current.contains(e.target as Node))setActiveMenu(null);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

  const enter=(key:string)=>{if(timerRef.current)clearTimeout(timerRef.current);setActiveMenu(key);measureNavbar();};
  const leave=()=>{timerRef.current=setTimeout(()=>setActiveMenu(null),120);};
  const keep=()=>{if(timerRef.current)clearTimeout(timerRef.current);};
  const handleSearch=()=>{if(searchVal.trim()){navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);setSearchVal('');setSearchFocused(false);}};

  const BADGE={position:'absolute' as const,top:-7,right:-7,minWidth:16,height:16,padding:'0 4px',borderRadius:'50%',background:BRAND_GRAD,color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'};

  return (
    <>
      <style>{STYLES}</style>
      <MobileDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)}/>
      <header ref={navRef} className="hcn" style={{width:'100%',position:'sticky',top:0,zIndex:1000,fontFamily:FONT,boxShadow:scrolled?'0 2px 20px rgba(0,0,0,.09)':'0 1px 0 #ebebeb',transition:'box-shadow .3s'}}>

        {/* Utility bar */}
        <div className={`dsk hcn-util-bar${scrolled?' is-hidden':''}`}>
          <div style={{maxWidth:1720,margin:'0 auto',padding:'0 24px',height:36,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:2}}>
              <div style={{position:'relative'}}><button onMouseEnter={()=>setShowFreeShip(true)} onMouseLeave={()=>setShowFreeShip(false)} style={{display:'flex',alignItems:'center',gap:6,padding:'0 10px',height:36,background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:11.5,fontFamily:FONT}}><RiEBike2Line size={14} color={BRAND_SOLID}/> Fast Delivery</button><Tooltip text="Fast delivery on all print orders" visible={showFreeShip}/></div>
              <span style={{color:'#3a3a3a',fontSize:10}}>|</span>
              <div style={{position:'relative'}}><button onMouseEnter={()=>setShowEmi(true)} onMouseLeave={()=>setShowEmi(false)} style={{display:'flex',alignItems:'center',gap:6,padding:'0 10px',height:36,background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:11.5,fontFamily:FONT}}><svg width="13" height="13" fill="none" stroke={BRAND_SOLID} strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><rect x="5" y="14" width="4" height="2" rx=".5" fill={BRAND_SOLID} stroke="none"/><rect x="10" y="14" width="4" height="2" rx=".5" fill={BRAND_SOLID} stroke="none"/></svg>EMI Options</button><Tooltip text="Easy EMI on bulk orders" visible={showEmi}/></div>
            </div>
            <div style={{display:'flex',alignItems:'center'}}>{[{icon:<LuMapPin size={13} color={BRAND_SOLID}/>,label:'Delivering To',href:'#'},{icon:<LuSmartphone size={13} color={BRAND_SOLID}/>,label:'Download Apps',href:'/apps'},{icon:<LuTruck size={13} color={BRAND_SOLID}/>,label:'Track Order',href:'/track'},{icon:<LuCircle size={13} color={BRAND_SOLID}/>,label:'Help',href:'/help'}].map(({icon,label,href},i,arr)=>(<span key={label} style={{display:'flex',alignItems:'center'}}><Link to={href} className="hcn-util-link">{icon}{label}</Link>{i<arr.length-1&&<span style={{color:'#3a3a3a',fontSize:10}}>|</span>}</span>))}</div>
          </div>
        </div>

        {/* Main header */}
        <div className="dsk" style={{background:C.white,borderBottom:`1px solid ${C.border}`}}>
          <div style={{maxWidth:1720,margin:'0 auto',padding:'0 24px',height:66,display:'flex',alignItems:'center',gap:18}}>
            {/* Logo */}
            <Link to="/" style={{flexShrink:0,display:'flex',alignItems:'center',gap:8,marginRight:8}}>
              <div>
                <div style={{fontWeight:800,fontSize:22,backgroundImage:BRAND_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',letterSpacing:-.5,lineHeight:1,fontFamily:FONT}}>Infinity</div>
                <div style={{fontSize:8,color:'#bbb',letterSpacing:'0.17em',textTransform:'uppercase',marginTop:3,fontFamily:FONT}}>printing &amp; signage</div>
              </div>
              {/* Gradient bar chart icon */}
              <div style={{display:'flex',gap:2,alignItems:'flex-end',paddingBottom:2}}>
                {[{h:6,c:'#5B4FBE'},{h:9,c:'#E8314A'},{h:7,c:'#F97316'},{h:5,c:'#2563EB'},{h:8,c:'#22C55E'}].map(({h,c},i)=><div key={i} style={{width:3,height:h,borderRadius:2,background:c}}/>)}
              </div>
            </Link>
            {/* Search */}
            <div style={{flex:1,minWidth:0,maxWidth:620}}>
              <div className={`hcn-search-wrap${searchFocused?' focused':''}`}>
                <LuSearch size={15} color="#aaa" style={{marginLeft:14,flexShrink:0}}/>
                <input type="search" className="hcn-search-input" placeholder="Search printing, signage, products..." value={searchVal} onChange={e=>setSearchVal(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)} onKeyDown={e=>e.key==='Enter'&&handleSearch()}/>
                {searchVal&&<button onClick={()=>setSearchVal('')} style={{background:'none',border:'none',cursor:'pointer',padding:'0 6px',color:C.light,display:'flex',alignItems:'center'}}><LuX size={13}/></button>}
                <button onClick={handleSearch} style={{height:'100%',padding:'0 22px',border:'none',borderRadius:'0 100px 100px 0',background:BRAND_GRAD,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:FONT,flexShrink:0}}>Search</button>
              </div>
            </div>
            {/* Right icons */}
            <div style={{display:'flex',alignItems:'center',gap:2,marginLeft:'auto',flexShrink:0}}>
              {isAuthenticated?(
                <><Link to="/my-profile" style={{padding:'8px 14px',borderRadius:8,border:'none',background:'#fff',fontSize:12,fontWeight:700,letterSpacing:'0.02em',cursor:'pointer',fontFamily:FONT,textDecoration:'none',marginRight:8,backgroundImage:BRAND_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>My Profile</Link>
                <Link to="/admin" aria-label="Admin" className="hcn-icon-btn" style={{marginRight:6}}><LuShieldCheck className="hcn-ico" size={20} color="#444"/><span className="hcn-lbl" style={{fontSize:10.5,color:C.muted,fontFamily:FONT,fontWeight:500}}>Admin</span></Link></>
              ):(
                <Link to="/login" style={{padding:'8px 16px',borderRadius:8,border:'none',background:CTA_GRAD,color:'#fff',fontSize:12,fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',fontFamily:FONT,whiteSpace:'nowrap',marginRight:6,textDecoration:'none'}}>SIGN IN</Link>
              )}
              <Link to="/wishlist" className="hcn-icon-btn"><div style={{position:'relative'}}><LuHeart className="hcn-ico" size={21} color="#444"/>{wishlistCount>0&&<span style={BADGE}>{wishlistCount}</span>}</div><span className="hcn-lbl" style={{fontSize:10.5,color:C.muted,fontFamily:FONT,fontWeight:500}}>Wishlist</span></Link>
              <Link to="/cart" className="hcn-icon-btn"><div style={{position:'relative'}}><LuShoppingBasket className="hcn-ico" size={21} color="#444"/>{cartCount>0&&<span style={BADGE}>{cartCount}</span>}</div><span className="hcn-lbl" style={{fontSize:10.5,color:C.muted,fontFamily:FONT,fontWeight:500}}>Basket</span></Link>
              <Link to={isAuthenticated?'/my-profile':'/my-profile'} aria-label="Profile" className="hcn-icon-btn" style={{marginLeft:6}}><LuUser className="hcn-ico" size={20} color="#444"/><span className="hcn-lbl" style={{fontSize:10.5,color:C.muted,fontFamily:FONT,fontWeight:500}}>{isAuthenticated?'Profile':'Account'}</span></Link>
            </div>
          </div>
        </div>

        {/* ══ CATEGORY BAR — 8 dept links, each with unique gradient ══════════ */}
        <div className={`dsk hcn-catbar-wrap${catBarScroll.left?' can-scroll-left':''}${catBarScroll.right?' can-scroll-right':''}`}>
          <div className="hcn-catbar" ref={catBarRef}>
            <div className="hcn-catbar-divider"/>
            {DEPARTMENTS.map(dept=>(
              <div
                key={dept}
                style={{position:'relative',height:'100%',display:'flex',alignItems:'center',flexShrink:0}}
                onMouseEnter={()=>enter(dept)}
                onMouseLeave={leave}
              >
                {/*
                  NO DROPDOWN here — clicking goes straight to the category page.
                  The mega menu still opens on hover via onMouseEnter/onMouseLeave.
                  data-dept attribute powers the CSS gradient text + underline rules.
                */}
                <Link
                  to={`/category/${toSlug(dept)}`}
                  data-dept={dept}
                  className={`hcn-dept-link ${activeMenu===dept||curr===`/category/${toSlug(dept)}`?'is-active':''}`}
                >
                  {dept}
                  {/* Small chevron to signal mega menu exists on hover */}
                  <svg className="dept-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.5}}>
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/* ══ END CATEGORY BAR ════════════════════════════════════════════════ */}

        {/* Mobile header */}
        <div className={`mob hcn-mob-header${mobHidden?' is-hidden':''}`} style={{background:C.white,boxShadow:scrolled?'0 3px 14px rgba(0,0,0,.07)':'none'}}>
          <div style={{height:56,display:'flex',alignItems:'center',padding:'0 8px',borderBottom:`1px solid ${C.border}`,gap:0}}>
            <button onClick={()=>setDrawerOpen(true)} aria-label="Open menu" className="hcn-mob-icon" style={{marginRight:4}}><LuMenu size={22} color={C.text} strokeWidth={2}/></button>
            <Link to="/" style={{display:'flex',alignItems:'center',textDecoration:'none',marginLeft:2}}>
              <span style={{fontWeight:800,fontSize:20,backgroundImage:BRAND_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',letterSpacing:-.3,fontFamily:FONT}}>Infinity</span>
            </Link>
            <div style={{flex:1}}/>
            <a href="/wishlist" className="hcn-mob-icon" style={{display:'flex',alignItems:'center'}}><LuHeart size={22} color="#2a2a2a" strokeWidth={1.8}/>{wishlistCount>0&&<span style={{...BADGE,top:8,right:48}}>{wishlistCount}</span>}</a>
            <a href="/cart" className="hcn-mob-icon" style={{display:'flex',alignItems:'center'}}><div style={{position:'relative'}}><LuShoppingBasket size={22} color="#2a2a2a" strokeWidth={1.8}/>{cartCount>0&&<span style={BADGE}>{cartCount}</span>}</div></a>
            <a href="/my-profile" className="hcn-mob-icon"><LuUser size={22} color="#2a2a2a" strokeWidth={1.8}/></a>
          </div>
          <div style={{padding:'9px 12px',borderBottom:`1px solid ${C.border}`}}>
            <div className={`hcn-search-wrap${searchFocused?' focused':''}`}>
              <LuSearch size={15} color={C.light} style={{marginLeft:13,flexShrink:0}}/>
              <input type="search" className="hcn-search-input" placeholder="Search printing, signage..." value={searchVal} onChange={e=>setSearchVal(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)} onKeyDown={e=>e.key==='Enter'&&handleSearch()}/>
              {searchVal&&<button onClick={()=>setSearchVal('')} style={{background:'none',border:'none',cursor:'pointer',padding:'0 6px',color:C.light,display:'flex'}}><LuX size={13}/></button>}
              <button onClick={handleSearch} style={{height:'100%',width:48,border:'none',borderRadius:'0 100px 100px 0',background:BRAND_GRAD,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}><LuSearch size={16} color="#fff"/></button>
            </div>
          </div>
          {/* Mobile chips with dept-specific gradient on active */}
          <div style={{padding:'8px 12px',background:C.white}}>
            <div className="hcn-chips">
              {['Home','Shop','Contact',...DEPARTMENTS].map(label=>(
                <Link
                  key={label}
                  to={label==='Home'?'/':label==='Shop'?'/shop-v1':label==='Contact'?'/contact':`/category/${toSlug(label)}`}
                  onClick={()=>setActiveChip(label)}
                  className={`hcn-chip ${activeChip===label?'is-active':''}`}
                  style={activeChip===label && DEPT_GRADS[label] ? {
                    background: DEPT_GRADS[label].grad,
                    borderColor: 'transparent',
                    color: '#fff',
                  } : {}}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mega menu panels — each with its own dept gradient accent */}
      {DEPARTMENTS.map(dept=>(<MegaMenuPanel key={dept} dept={dept} data={MEGA_MENU[dept]} isOpen={activeMenu===dept} navbarBottom={navbarBottom} onEnter={keep} onLeave={leave}/>))}
      <div style={{position:'fixed',inset:0,top:navbarBottom,background:'rgba(0,0,0,.18)',zIndex:8998,opacity:DEPARTMENTS.includes(activeMenu??'')?1:0,pointerEvents:'none',transition:'opacity .18s ease'}}/>
    </>
  );
}