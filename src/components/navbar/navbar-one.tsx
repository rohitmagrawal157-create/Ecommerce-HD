// src/components/navbar/navbar-one.tsx
// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════════════
//  NavbarOne — Live API Categories (no static fallback)
//
//  BUG FIXED: Sub-category navigation
//
//  ROOT CAUSE: The "All X" links (e.g. "All Portrait Frames", id=22) were
//  generating /category?subId=22&parentId=21 → calling child endpoint
//  /api/categories/22/products which returns nothing or wrong data.
//
//  FIX in getLinkPath():
//  · Any child named "All …" → /category?id={parentId}   (parent all-products)
//  · Any other child         → /category?subId={id}&parentId={parentId}
//
//  URL CONTRACT:
//    Parent click     →  /category?id=21
//    "All X" click    →  /category?id=21          (same as parent)
//    Child click      →  /category?subId=23&parentId=21
//
//  API INTEGRATION:
//  · GET /navbar-categories on mount (AbortController)
//  · Response: { status:true, data:[{id,name,image_url,children:[{id,name}]}] }
//  · No static fallback — if API fails, category bar is hidden
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LuHeart, LuShoppingBasket, LuSearch, LuMapPin,
  LuTruck, LuSmartphone, LuCircle, LuX,
  LuChevronDown, LuChevronRight, LuMenu, LuUser,
  LuClipboardCheck, LuGift, LuLogOut,
} from 'react-icons/lu';
import { RiEBike2Line } from 'react-icons/ri';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND_GRAD  = 'linear-gradient(135deg, #5B4FBE 0%, #E8314A 50%, #F97316 100%)';
const CTA_GRAD    = 'linear-gradient(135deg, #2563EB 0%, #06B6D4 50%, #22C55E 100%)';
const BRAND_SOLID = '#5B4FBE';

const DEPT_GRADS: Record<string, { grad: string; from: string; to: string }> = {
  'Portrait Frames':   { grad: 'linear-gradient(135deg,#5B4FBE,#9333EA)', from:'#5B4FBE', to:'#9333EA' },
  'Canvas Paintings':  { grad: 'linear-gradient(135deg,#E8314A,#F97316)', from:'#E8314A', to:'#F97316' },
  'Temple Art Prints': { grad: 'linear-gradient(135deg,#F97316,#EAB308)', from:'#F97316', to:'#EAB308' },
  'Wall Murals':       { grad: 'linear-gradient(135deg,#22C55E,#84CC16)', from:'#22C55E', to:'#84CC16' },
  'Modern Wallpapers': { grad: 'linear-gradient(135deg,#06B6D4,#2563EB)', from:'#06B6D4', to:'#2563EB' },
  'Customize Blinds':  { grad: 'linear-gradient(135deg,#EC4899,#E8314A)', from:'#EC4899', to:'#E8314A' },
  'Neon Signs':        { grad: 'linear-gradient(135deg,#06B6D4,#22C55E)', from:'#06B6D4', to:'#22C55E' },
  'Backlit LED':       { grad: 'linear-gradient(135deg,#5B4FBE,#06B6D4)', from:'#5B4FBE', to:'#06B6D4' },
};
const FALLBACK_GRAD = { grad: BRAND_GRAD, from: '#5B4FBE', to: '#F97316' };

function resolveDeptGrad(name: string) {
  if (DEPT_GRADS[name]) return DEPT_GRADS[name];
  const key = Object.keys(DEPT_GRADS).find(k =>
    k.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(k.toLowerCase().split(' ')[0])
  );
  return key ? DEPT_GRADS[key] : FALLBACK_GRAD;
}

const C = {
  brand: BRAND_SOLID, brandHover: '#4a3da0', brandBg: '#f0f0fc',
  dark: '#1c1c1c', text: '#1a1a1a', muted: '#555', light: '#aaa',
  border: '#efefef', borderMd: '#e4e4e4', white: '#ffffff',
  newBadge: '#E8314A',
};
const FONT = "'DM Sans', sans-serif";

// ── API types ─────────────────────────────────────────────────────────────────
interface ApiChild { id: number; name: string; image_url: string | null; }
interface ApiCat   { id: number; name: string; image_url: string | null; children: ApiChild[]; }
interface ApiResp  { status: boolean; data: ApiCat[]; }

// ── Internal types ────────────────────────────────────────────────────────────
// id = child's own id, parentId = parent dept id
type MenuLink = string | { name: string; badge?: string; path?: string; id?: number; parentId?: number };
interface MenuGroup { heading: string; links: MenuLink[]; }
interface DeptMenu  { id?: number; image: string; imageAlt: string; flatLinks?: MenuLink[]; groups: MenuGroup[]; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const toSlug = (s: string) => s.toLowerCase().replace(/[\s&\/]+/g, '-');
const getLinkName  = (l: MenuLink): string  => typeof l === 'string' ? l : l.name;
const getLinkBadge = (l: MenuLink): string | undefined => typeof l === 'string' ? undefined : l.badge;

/**
 * ══ FIXED URL BUILDER ══
 *
 * Rule 1: Explicit path override (configurator pages) → use path as-is
 * Rule 2: "All …" child links  → /category?id={parentId}          (parent, all-products endpoint)
 * Rule 3: Normal child links   → /category?subId={id}&parentId={parentId}
 * Rule 4: No id at all (string link) → graceful slug fallback
 */
function getLinkPath(l: MenuLink, deptId?: number): string {
  // Rule 1: explicit path (e.g. /customize/neon)
  if (typeof l !== 'string' && l.path) return l.path;

  const name = getLinkName(l);

  // Rule 2: "All X" links → treat as parent category (all-products endpoint)
  // These have their own child id (22, 29, 36…) but the correct page is the parent
  const isAllLink = name.toLowerCase().startsWith('all ');
  if (isAllLink) {
    const pid = (typeof l !== 'string' ? l.parentId : undefined) ?? deptId;
    if (pid && pid > 0) return `/category?id=${pid}`;
  }

  // Rule 3: Normal child with id → sub-category page
  if (typeof l !== 'string' && l.id && l.id > 0) {
    const pid = l.parentId ?? deptId;
    const parentPart = pid && pid > 0 ? `&parentId=${pid}` : '';
    return `/category?subId=${l.id}${parentPart}`;
  }

  // Rule 4: Fallback for plain string links (should rarely happen with API data)
  if (deptId) return `/category?id=${deptId}`;
  return `/category?sub=${encodeURIComponent(name)}`;
}

const gradText = (grad: string): React.CSSProperties => ({
  backgroundImage: grad, WebkitBackgroundClip: 'text',
  backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
});

// ── Build menu from API data ──────────────────────────────────────────────────
function mergeApiCategories(apiData: ApiCat[]): Record<string, DeptMenu> {
  const merged: Record<string, DeptMenu> = {};
  for (const cat of apiData) {
    // Each child gets id + parentId so getLinkPath can build the correct URL
    const flatLinks: MenuLink[] = cat.children.map(child => ({
      name:     child.name,
      id:       child.id,       // child's own id
      parentId: cat.id,         // parent dept id
    }));
    merged[cat.name] = {
      id:        cat.id,
      image:     cat.image_url ?? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&h=400&fit=crop',
      imageAlt:  cat.name,
      flatLinks,
      groups: [],
    };
  }
  return merged;
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  .hcn*,.hcn *::before,.hcn *::after{box-sizing:border-box}
  .hcn a{text-decoration:none}
  .hcn button{font-family:${FONT}}
  .hcn input:focus{outline:none}
  @media(max-width:1023px){.hcn .dsk{display:none!important}}
  @media(min-width:1024px){.hcn .mob{display:none!important}}

  @keyframes hcnShim{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .hcn-skel{background:linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);background-size:200% 100%;animation:hcnShim 1.4s infinite linear;border-radius:4px}

  .hcn-util-bar{background:${C.dark};max-height:36px;overflow:hidden;transition:max-height .3s ease,opacity .22s ease;opacity:1}
  .hcn-util-bar.is-hidden{max-height:0;opacity:0}
  .hcn-util-link{color:#aaa;transition:color .15s;display:flex;align-items:center;gap:5px;padding:0 10px;height:36px;font-family:${FONT};font-size:11.5px}
  .hcn-util-link:hover{color:#fff}

  .hcn-catbar-wrap{position:relative;overflow:hidden;background:${C.white};border-bottom:1px solid #e8e8e8}
  .hcn-catbar-wrap::before{content:'';position:absolute;left:0;top:0;bottom:0;width:36px;background:linear-gradient(to right,${C.white},transparent);z-index:2;pointer-events:none;opacity:0;transition:opacity .2s}
  .hcn-catbar-wrap::after{content:'';position:absolute;right:0;top:0;bottom:0;width:36px;background:linear-gradient(to left,${C.white},transparent);z-index:2;pointer-events:none;transition:opacity .2s}
  .hcn-catbar-wrap.can-scroll-right::after{opacity:1}
  .hcn-catbar-wrap.can-scroll-left::before{opacity:1}
  .hcn-catbar{display:flex;align-items:stretch;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;max-width:1720px;margin:0 auto;padding:0 24px;height:48px}
  .hcn-catbar::-webkit-scrollbar{display:none}
  .hcn-catbar-divider{width:1px;background:${C.border};margin:12px 8px;flex-shrink:0}

  .hcn-dept-link{position:relative;display:inline-flex;align-items:center;gap:4px;padding:0 18px;height:100%;font-size:13px;font-weight:600;font-family:${FONT};white-space:nowrap;color:${C.text};flex-shrink:0;border-bottom:2.5px solid transparent;transition:color .18s;cursor:pointer;text-decoration:none}

  .hcn-mega-fw{position:fixed;left:0;right:0;background:${C.white};border-top:1px solid ${C.border};box-shadow:0 12px 40px rgba(0,0,0,.10),0 2px 6px rgba(0,0,0,.05);z-index:8999;transition:opacity .18s ease,transform .18s ease;transform-origin:top center;overflow:visible}
  .hcn-mega-fw.is-open{opacity:1;transform:translateY(0) scaleY(1);pointer-events:auto}
  .hcn-mega-fw.is-shut{opacity:0;transform:translateY(-8px) scaleY(.97);pointer-events:none}

  .hcn-fl-link{display:flex;align-items:center;gap:6px;font-size:14px;font-family:${FONT};color:${C.text};padding:5px 0;transition:color .15s;font-weight:400;white-space:nowrap;text-decoration:none}
  .hcn-fl-link:hover{color:${BRAND_SOLID}}
  .hcn-fl-link.is-all{font-weight:600}

  .hcn-badge-new{display:inline-flex;align-items:center;background:${C.newBadge};color:#fff;font-size:9px;font-weight:700;letter-spacing:.06em;padding:2px 6px;border-radius:10px;line-height:1;flex-shrink:0;text-transform:uppercase}

  .hcn-icon-btn{background:none;border:none;cursor:pointer;padding:5px 9px;display:flex;flex-direction:column;align-items:center;gap:2px;border-radius:8px;transition:background .14s;text-decoration:none}
  .hcn-icon-btn:hover{background:${C.brandBg}}
  .hcn-icon-btn:hover .hcn-ico{color:${BRAND_SOLID}!important}
  .hcn-icon-btn:hover .hcn-lbl{color:${BRAND_SOLID}!important}

  .hcn-search-wrap{display:flex;align-items:center;height:44px;border-radius:100px;overflow:hidden;background:#f4f3f8;border:1.5px solid ${C.borderMd};transition:border-color .2s,box-shadow .2s}
  .hcn-search-wrap.focused{border-color:${BRAND_SOLID};box-shadow:0 0 0 3px rgba(91,79,190,.12)}
  .hcn-search-input{flex:1;min-width:0;background:transparent;border:none;outline:none;padding:0 10px;font-size:14px;color:${C.text};font-family:${FONT}}
  .hcn-search-input::placeholder{color:${C.light}}

  .hcn-mob-header{transform:translateY(0);transition:transform .3s cubic-bezier(.4,0,.2,1);will-change:transform}
  .hcn-mob-header.is-hidden{transform:translateY(-100%)}
  .hcn-mob-icon{display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:9px;border-radius:10px;-webkit-tap-highlight-color:transparent;text-decoration:none;color:inherit}
  .hcn-mob-icon:active{background:${C.brandBg}}
  .hcn-chips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .hcn-chips::-webkit-scrollbar{display:none}
  .hcn-chip{flex-shrink:0;padding:6px 14px;border-radius:22px;font-size:12.5px;font-weight:600;font-family:${FONT};white-space:nowrap;border:1.5px solid ${C.borderMd};background:${C.white};color:${C.text};cursor:pointer;transition:all .15s;text-decoration:none}
  .hcn-chip:hover,.hcn-chip.is-active{background:${BRAND_GRAD};color:#fff;border-color:transparent}
  .hcn-drawer-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:none;border:none;cursor:pointer;font-weight:600;font-size:14px;color:${C.text};font-family:${FONT};text-align:left;transition:background .14s}
  .hcn-drawer-btn:hover{background:#f5f5f5}
  .hcn-sub-link{font-size:13px;color:${C.muted};font-family:${FONT};transition:color .14s;text-decoration:none;display:block}
  .hcn-sub-link:hover{color:${BRAND_SOLID}}

  .hcn-profile-drop{position:absolute;top:calc(100% + 10px);right:0;min-width:240px;background:${C.white};border-radius:14px;border:1px solid ${C.borderMd};box-shadow:0 20px 40px rgba(0,0,0,0.12);z-index:9010;overflow:hidden;transform-origin:top right;transition:opacity .18s ease,transform .18s ease}
  .hcn-profile-drop.is-open{opacity:1;transform:scale(1);pointer-events:auto}
  .hcn-profile-drop.is-shut{opacity:0;transform:scale(.95);pointer-events:none}
  .hcn-pdrop-item{display:flex;align-items:center;gap:10px;padding:10px 16px;font-size:13px;font-weight:500;font-family:${FONT};color:${C.text};text-decoration:none;transition:background .14s,color .14s;cursor:pointer;border:none;background:none;width:100%;text-align:left}
  .hcn-pdrop-item:hover{background:${C.brandBg};color:${BRAND_SOLID}}
  .hcn-pdrop-item.danger:hover{background:#fff5f5;color:#e11d48}
`;

// ── Small components ──────────────────────────────────────────────────────────

function Tooltip({ text, visible }: { text: string; visible: boolean }) {
  return <div style={{ position:'absolute',top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',fontSize:11,fontFamily:FONT,fontWeight:500,padding:'5px 11px',borderRadius:5,whiteSpace:'nowrap',zIndex:9999,boxShadow:'0 4px 14px rgba(0,0,0,.2)',opacity:visible?1:0,pointerEvents:'none',transition:'opacity .18s' }}>
    <div style={{ position:'absolute',top:-4,left:'50%',transform:'translateX(-50%) rotate(45deg)',width:8,height:8,background:'#1a1a1a' }}/>
    {text}
  </div>;
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span style={{ position:'absolute',top:-7,right:-7,minWidth:16,height:16,padding:'0 4px',borderRadius:8,background:BRAND_GRAD,color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>{count > 99 ? '99+' : count}</span>;
}

function CatBarSkeleton() {
  return <div className="dsk" style={{ display:'flex',alignItems:'center',height:48,padding:'0 24px',gap:8,borderBottom:'1px solid #e8e8e8' }}>
    {[100,90,120,80,130,95,85,110].map((w,i)=><div key={i} className="hcn-skel" style={{ width:w,height:14,flexShrink:0 }}/>)}
  </div>;
}

// ── Mega Menu Panel ───────────────────────────────────────────────────────────
function MegaMenuPanel({ dept, data, isOpen, navbarBottom, onEnter, onLeave }: {
  dept: string; data: DeptMenu; isOpen: boolean;
  navbarBottom: number; onEnter: ()=>void; onLeave: ()=>void;
}) {
  const navigate = useNavigate();
  const dg     = resolveDeptGrad(dept);
  const deptId = data.id;

  return <>
    {isOpen && (
      <div style={{ position:'fixed',top:navbarBottom-28,left:'50%',transform:'translateX(-50%)',background:'rgba(26,26,26,.9)',color:'#fff',fontSize:12,fontWeight:600,fontFamily:FONT,padding:'5px 14px',borderRadius:'6px 6px 0 0',whiteSpace:'nowrap',zIndex:9000,pointerEvents:'none' }}>
        {dept}
      </div>
    )}
    <div className={`hcn-mega-fw ${isOpen?'is-open':'is-shut'}`} style={{ top:navbarBottom }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div style={{ height:3,background:dg.grad }}/>
      <div style={{ maxWidth:1400,margin:'0 auto',padding:'28px 40px',display:'flex',alignItems:'flex-start',gap:32,justifyContent:'flex-start' }}>

        {/* Category image */}
        <div style={{ width:220,minWidth:220,overflow:'hidden',borderRadius:8,boxShadow:`0 0 0 2px ${dg.from}22,0 6px 18px rgba(0,0,0,.06)`,flexShrink:0 }}>
          <img src={data.image} alt={data.imageAlt} style={{ width:'100%',height:280,objectFit:'cover',display:'block' }}/>
        </div>

        {/* Links */}
        {data.flatLinks && data.flatLinks.length > 0 && (
          <div style={{ minWidth:200,flexShrink:0 }}>
            <div style={{ fontSize:10,fontWeight:800,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:14,...gradText(dg.grad) }}>
              Sub-Categories
            </div>
            {data.flatLinks.map((item, i) => {
              const name     = getLinkName(item);
              const badge    = getLinkBadge(item);
              const isAll    = name.toLowerCase().startsWith('all ');
              const href     = getLinkPath(item, deptId);
              return (
                <a
                  key={i}
                  href={href}
                  onClick={(e) => { e.preventDefault(); onLeave(); navigate(href); }}
                  className={`hcn-fl-link ${isAll ? 'is-all' : ''}`}
                  style={isAll ? gradText(dg.grad) : {}}
                >
                  {isAll ? `→ ${name}` : name}
                  {badge === 'NEW'        && <span className="hcn-badge-new">NEW</span>}
                  {badge === 'POPULAR'    && <span className="hcn-badge-new" style={{background:'#22C55E'}}>HOT</span>}
                  {badge === 'BESTSELLER' && <span className="hcn-badge-new" style={{background:'#F97316'}}>BEST</span>}
                </a>
              );
            })}
            {/* Explicit "View All" at bottom */}
            {deptId && (
              <a
                href={`/category?id=${deptId}`}
                onClick={(e) => { e.preventDefault(); onLeave(); navigate(`/category?id=${deptId}`); }}
                style={{ display:'inline-flex',alignItems:'center',gap:4,marginTop:14,fontSize:12,fontWeight:700,fontFamily:FONT,...gradText(dg.grad) }}
              >
                View All {dept} →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  </>;
}

// ── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ user, isOpen, onToggle, onLogout, containerRef }: {
  user: { name: string; email: string } | null;
  isOpen: boolean; onToggle: ()=>void; onLogout: ()=>void;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const ITEMS = [
    { icon: LuUser,           label: 'My Profile',    path: '/my-profile'    },
    { icon: LuClipboardCheck, label: 'Order History', path: '/order-history' },
    { icon: LuHeart,          label: 'My Wishlist',   path: '/wishlist'      },
    { icon: LuGift,           label: 'My Cart',       path: '/cart'          },
  ];
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? '?';

  return (
    <div ref={containerRef} style={{ position:'relative',display:'flex',alignItems:'center' }}>
      <button onClick={onToggle} className="hcn-icon-btn" aria-expanded={isOpen} style={{ flexDirection:'column',alignItems:'center',gap:'2px',background:'none',border:'none',padding:'5px 9px',borderRadius:'8px',cursor:'pointer' }}>
        <div style={{ position:'relative' }}>
          <LuUser size={21} color="#444"/>
          {isOpen && <span style={{ position:'absolute',bottom:-2,right:-4,width:8,height:8,background:BRAND_SOLID,borderRadius:'50%',border:'1px solid #fff' }}/>}
        </div>
        <span className="hcn-lbl" style={{ fontSize:'10.5px',color:'#555',fontFamily:FONT,fontWeight:500 }}>Account</span>
      </button>
      <div className={`hcn-profile-drop ${isOpen?'is-open':'is-shut'}`}>
        <div style={{ padding:'16px 16px 12px',borderBottom:`1px solid ${C.border}`,background:'#FAFAFC',display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:'50%',background:BRAND_GRAD,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'#fff',flexShrink:0 }}>{initial}</div>
          <div style={{ minWidth:0,flex:1 }}>
            <div style={{ fontWeight:700,fontSize:14,color:C.text,fontFamily:FONT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.name??'User'}</div>
            <div style={{ fontSize:11,color:C.light,fontFamily:FONT,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.email??''}</div>
          </div>
        </div>
        <div style={{ padding:'8px 0' }}>
          {ITEMS.map(({icon:Icon,label,path})=>(
            <Link key={label} to={path} onClick={onToggle} className="hcn-pdrop-item">
              <Icon size={16} strokeWidth={1.8} style={{ flexShrink:0 }}/>{label}
            </Link>
          ))}
        </div>
        <div style={{ height:1,background:C.border,margin:'4px 0' }}/>
        <div style={{ padding:'8px 0 12px' }}>
          <button onClick={()=>{onToggle();onLogout();}} className="hcn-pdrop-item danger" style={{ color:'#E11D48',fontFamily:FONT }}>
            <LuLogOut size={16} strokeWidth={1.8} style={{ flexShrink:0 }}/>Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Drawer ─────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose, departments, megaMenu }: {
  open: boolean; onClose: ()=>void;
  departments: string[]; megaMenu: Record<string, DeptMenu>;
}) {
  const [expanded, setExpanded] = useState<string|null>(null);
  const toggle = (s: string) => setExpanded(p => p===s ? null : s);
  const navigate = useNavigate();

  return <>
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1100,opacity:open?1:0,pointerEvents:open?'auto':'none',transition:'opacity .27s ease' }}/>
    <div style={{ position:'fixed',top:0,left:0,bottom:0,width:'min(84vw,350px)',background:C.white,zIndex:1200,display:'flex',flexDirection:'column',transform:open?'translateX(0)':'translateX(-100%)',transition:'transform .3s cubic-bezier(.4,0,.2,1)',boxShadow:'5px 0 30px rgba(0,0,0,.16)' }}>
      <div style={{ height:3,background:BRAND_GRAD,flexShrink:0 }}/>
      {/* Header */}
      <div style={{ padding:'15px 16px',borderBottom:`1px solid ${C.border}`,background:C.brandBg,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:800,fontSize:20,letterSpacing:-.5,lineHeight:1,fontFamily:FONT,...gradText(BRAND_GRAD) }}>Infinity</div>
          <div style={{ fontSize:9,color:C.light,letterSpacing:'0.15em',textTransform:'uppercase',marginTop:3 }}>printing &amp; signage</div>
        </div>
        <button onClick={onClose} style={{ width:32,height:32,borderRadius:'50%',border:`1px solid ${C.borderMd}`,background:C.white,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
          <LuX size={15} color="#555"/>
        </button>
      </div>
      {/* Sign in */}
      <div style={{ padding:'12px 16px',borderBottom:`1px solid ${C.border}`,flexShrink:0 }}>
        <Link to="/login" onClick={onClose} style={{ display:'block',textAlign:'center',padding:'11px 0',borderRadius:10,background:CTA_GRAD,color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.06em',fontFamily:FONT }}>SIGN UP / SIGN IN</Link>
      </div>
      {/* Nav */}
      <div style={{ flex:1,overflowY:'auto',overscrollBehavior:'contain' }}>
        {[{label:'Home',links:[{name:'Home',path:'/'},{name:'Contact',path:'/contact'}]},{label:'Shop',links:[{name:'Shop',path:'/shop-v1'},{name:'Cart',path:'/cart'}]}].map(sec=>(
          <div key={sec.label} style={{ borderBottom:`1px solid #f5f5f5` }}>
            <button onClick={()=>toggle(sec.label)} className="hcn-drawer-btn">{sec.label}<LuChevronDown size={14} color="#999" style={{ transition:'transform .2s',transform:expanded===sec.label?'rotate(180deg)':'rotate(0)' }}/></button>
            <div style={{ maxHeight:expanded===sec.label?300:0,overflow:'hidden',transition:'max-height .3s ease' }}>
              <div style={{ background:'#fafaf9',padding:'8px 16px 14px',display:'flex',flexDirection:'column',gap:9 }}>
                {sec.links.map((l,i)=><Link key={i} to={l.path} onClick={onClose} className="hcn-sub-link">{l.name}</Link>)}
              </div>
            </div>
          </div>
        ))}
        <Link to="/contact" onClick={onClose} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',borderBottom:`1px solid #f5f5f5`,fontSize:14,fontWeight:600,color:C.text,fontFamily:FONT }}>Contact<LuChevronRight size={14} color="#aaa"/></Link>

        {/* Departments */}
        {departments.map(dept => {
          const data = megaMenu[dept]; if(!data) return null;
          const dg = resolveDeptGrad(dept);
          const deptId = data.id;
          return (
            <div key={dept} style={{ borderBottom:`1px solid #f5f5f5` }}>
              <button onClick={()=>toggle(dept)} className="hcn-drawer-btn">
                <span style={expanded===dept?gradText(dg.grad):{}}>{dept}</span>
                <LuChevronDown size={14} color="#999" style={{ transition:'transform .2s',transform:expanded===dept?'rotate(180deg)':'rotate(0)' }}/>
              </button>
              <div style={{ maxHeight:expanded===dept?700:0,overflow:'hidden',transition:'max-height .32s ease' }}>
                <div style={{ background:'#fafaf9',padding:'10px 16px 14px' }}>
                  <div style={{ height:2,background:dg.grad,borderRadius:1,marginBottom:10 }}/>
                  <div style={{ borderRadius:8,overflow:'hidden',marginBottom:12,height:90 }}>
                    <img src={data.image} alt={dept} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                  </div>
                  {/* View All → parent */}
                  {deptId && (
                    <Link to={`/category?id=${deptId}`} onClick={onClose}
                      style={{ display:'inline-block',marginBottom:10,fontSize:12,fontWeight:700,fontFamily:FONT,...gradText(dg.grad) }}>
                      All {dept} →
                    </Link>
                  )}
                  {/* Child links — skip "All X" since we already have the View All above */}
                  {(data.flatLinks||[]).filter(item => !getLinkName(item).toLowerCase().startsWith('all ')).map((item,i)=>{
                    const name  = getLinkName(item);
                    const badge = getLinkBadge(item);
                    const href  = getLinkPath(item, deptId);
                    return (
                      <div key={i} style={{ display:'flex',alignItems:'center',gap:6,padding:'4px 0' }}>
                        <a href={href} onClick={(e)=>{ e.preventDefault(); onClose(); navigate(href); }} className="hcn-sub-link">{name}</a>
                        {badge==='NEW'&&<span className="hcn-badge-new">NEW</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div style={{ borderTop:`1px solid ${C.border}`,background:'#fafaf9',padding:'11px 16px',flexShrink:0 }}>
        {[{icon:<RiEBike2Line size={14}/>,label:'Fast Delivery Available'},{icon:<LuMapPin size={13}/>,label:'Delivering To Your City'},{icon:<LuTruck size={13}/>,label:'Track Your Order'},{icon:<LuSmartphone size={13}/>,label:'Download Our App'}].map(({icon,label})=>(
          <div key={label} style={{ display:'flex',alignItems:'center',gap:10,padding:'5px 0',fontSize:12.5,color:'#555',fontFamily:FONT }}>
            <span style={{ color:BRAND_SOLID,display:'flex' }}>{icon}</span>{label}
          </div>
        ))}
      </div>
    </div>
  </>;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
// Use apiClient for requests so baseURL is centralised in `src/api/client.ts`.
import { apiClient } from '../../api/client';

export default function NavbarOne() {
  const location = useLocation();
  const navigate  = useNavigate();
  const curr      = location.pathname + location.search;

  const [activeMenu,   setActiveMenu]   = useState<string|null>(null);
  const [searchFocused,setSearchFocused]= useState(false);
  const [searchVal,    setSearchVal]    = useState('');
  const [showFreeShip, setShowFreeShip] = useState(false);
  const [showEmi,      setShowEmi]      = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [cartCount,    setCartCount]    = useState(0);
  const [wishlistCount,setWishlistCount]= useState(0);
  const [isAuth,       setIsAuth]       = useState(false);
  const [authUser,     setAuthUser]     = useState<{name:string;email:string}|null>(null);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [mobHidden,    setMobHidden]    = useState(false);
  const [navbarBottom, setNavbarBottom] = useState(0);
  const [activeChip,   setActiveChip]   = useState<string|null>(null);
  const [catBarScroll, setCatBarScroll] = useState({ left:false, right:false });
  const [apiLoading,   setApiLoading]   = useState(true);
  const [apiMenu,      setApiMenu]      = useState<Record<string,DeptMenu>|null>(null);
  const [apiDepts,     setApiDepts]     = useState<string[]|null>(null);

  const navRef     = useRef<HTMLElement>(null);
  const megaWrapRef = useRef<HTMLDivElement>(null);
  const catBarRef  = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout>|null>(null);
  const rafRef     = useRef<number|null>(null);
  const nbRafRef   = useRef<number|null>(null);
  const lastY      = useRef(0); const delta_ = useRef(0);
  const scrolled_  = useRef(false); const mobHid_ = useRef(false);

  const megaMenu    = useMemo(()=>apiMenu??{}, [apiMenu]);
  const departments = useMemo(()=>apiDepts??[], [apiDepts]);

  // ── API ────────────────────────────────────────────────────────────────────
  useEffect(()=>{
    let alive=true;
    const ctrl=new AbortController();
    (async()=>{
      try{
        const res = await apiClient.get('/api/navbar-categories', { signal: ctrl.signal } as any);
        const payload:ApiResp = res.data;
        if(!alive) return;
        if(payload?.status && Array.isArray(payload.data) && payload.data.length>0){
          setApiMenu(mergeApiCategories(payload.data));
          setApiDepts(payload.data.map(c=>c.name));
        } else {
          setApiMenu({}); setApiDepts([]);
        }
      }catch(err:any){
        if(err?.name!=='AbortError'){
          console.warn('[NavbarOne] API failed:',err?.message);
          setApiMenu({}); setApiDepts([]);
        }
      }finally{
        if(alive) setApiLoading(false);
      }
    })();
    return ()=>{ alive=false; ctrl.abort(); };
  },[]);

  // ── Navbar measurement ─────────────────────────────────────────────────────
  const measureNavbar=useCallback(()=>{
    if(navRef.current) setNavbarBottom(navRef.current.getBoundingClientRect().bottom);
  },[]);
  useEffect(()=>{
    if(!activeMenu) return;
    let alive=true;
    function tick(){if(!alive) return; measureNavbar(); nbRafRef.current=requestAnimationFrame(tick);}
    nbRafRef.current=requestAnimationFrame(tick);
    return()=>{ alive=false; if(nbRafRef.current) cancelAnimationFrame(nbRafRef.current); };
  },[activeMenu,measureNavbar]);
  useEffect(()=>{ measureNavbar(); window.addEventListener('resize',measureNavbar); return()=>window.removeEventListener('resize',measureNavbar); },[measureNavbar]);

  // ── Catbar scroll masks ────────────────────────────────────────────────────
  const checkCatBar=useCallback(()=>{
    const el=catBarRef.current; if(!el) return;
    setCatBarScroll({left:el.scrollLeft>8,right:el.scrollLeft<el.scrollWidth-el.clientWidth-8});
  },[]);
  useEffect(()=>{
    const el=catBarRef.current; if(!el) return;
    checkCatBar();
    el.addEventListener('scroll',checkCatBar,{passive:true});
    window.addEventListener('resize',checkCatBar);
    return()=>{ el.removeEventListener('scroll',checkCatBar); window.removeEventListener('resize',checkCatBar); };
  },[checkCatBar,departments]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const syncAuth=useCallback(()=>{
    const token=window.localStorage.getItem('access_token');
    const raw=window.localStorage.getItem('auth_user');
    setIsAuth(Boolean(token));
    if(token&&raw){try{setAuthUser(JSON.parse(raw));}catch{setAuthUser(null);}}else setAuthUser(null);
  },[]);

  // ── Counts ─────────────────────────────────────────────────────────────────
  const refreshCounts=useCallback(async()=>{
    try{const{getCart}=await import('../../api/cart.api');const cart=await getCart();setCartCount(cart.lines.reduce((s:number,l:any)=>s+(l.quantity??0),0));}catch{}
    try{const{getWishlist}=await import('../../api/wishlist.api');const wl=await getWishlist();setWishlistCount(wl.productIds.length);}catch{}
  },[]);

  useEffect(()=>{
    syncAuth(); refreshCounts();
    const onCart=()=>refreshCounts();
    const onWl=()=>refreshCounts();
    const onStorage=(e:StorageEvent)=>{ if(e.key==='access_token'||e.key==='auth_user') syncAuth(); if(e.key?.startsWith('cart')||e.key?.startsWith('wishlist')) refreshCounts(); };
    const onAuth=()=>{ syncAuth(); refreshCounts(); };
    window.addEventListener('cart:changed',   onCart    as EventListener);
    window.addEventListener('wishlist:changed',onWl      as EventListener);
    window.addEventListener('storage',         onStorage as EventListener);
    window.addEventListener('auth:changed',    onAuth    as EventListener);
    return()=>{
      window.removeEventListener('cart:changed',   onCart    as EventListener);
      window.removeEventListener('wishlist:changed',onWl      as EventListener);
      window.removeEventListener('storage',         onStorage as EventListener);
      window.removeEventListener('auth:changed',    onAuth    as EventListener);
    };
  },[refreshCounts,syncAuth]);

  // Close profile on outside click
  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(profileRef.current&&!profileRef.current.contains(e.target as Node)) setProfileOpen(false); };
    document.addEventListener('mousedown',h); return()=>document.removeEventListener('mousedown',h);
  },[]);

  // ── Scroll ─────────────────────────────────────────────────────────────────
  const onScroll=useCallback(()=>{
    const y=window.scrollY;
    if(rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current=requestAnimationFrame(()=>{
      rafRef.current=null;
      const isMobile=window.innerWidth<1024;
      if(y>2!==scrolled_.current){scrolled_.current=y>2;setScrolled(y>2);}
      if(!isMobile){if(mobHid_.current){mobHid_.current=false;setMobHidden(false);}lastY.current=y;delta_.current=0;return;}
      if(y<=10){if(mobHid_.current){mobHid_.current=false;setMobHidden(false);}lastY.current=y;delta_.current=0;return;}
      const diff=y-lastY.current;
      if(diff>0){if(delta_.current<0)delta_.current=0;delta_.current+=diff;if(delta_.current>60){mobHid_.current=true;setMobHidden(true);}}
      else if(diff<0){if(delta_.current>0)delta_.current=0;delta_.current+=diff;if(delta_.current<-30){mobHid_.current=false;setMobHidden(false);}}
      lastY.current=y;
    });
  },[]);
  useEffect(()=>{ window.addEventListener('scroll',onScroll,{passive:true}); return()=>{ window.removeEventListener('scroll',onScroll); if(rafRef.current) cancelAnimationFrame(rafRef.current); }; },[onScroll]);
  useEffect(()=>{ document.body.style.overflow=drawerOpen?'hidden':''; return()=>{ document.body.style.overflow=''; }; },[drawerOpen]);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      const target = e.target as Node;
      const clickedHeader = navRef.current?.contains(target);
      const clickedMega   = megaWrapRef.current?.contains(target);
      if (!clickedHeader && !clickedMega) setActiveMenu(null);
    };
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[]);

  const enter=(key:string)=>{ if(timerRef.current) clearTimeout(timerRef.current); setActiveMenu(key); };
  const leave=()=>{ timerRef.current=setTimeout(()=>setActiveMenu(null),120); };
  const keep=()=>{ if(timerRef.current) clearTimeout(timerRef.current); };

  const handleSearch=useCallback(()=>{
    const q = searchVal.trim(); if(!q) return;
    navigate(`/shop-v1?q=${encodeURIComponent(q)}`);
    setSearchFocused(false);
    if (typeof window !== 'undefined') requestAnimationFrame(()=>window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }));
  },[searchVal,navigate]);

  const handleLogout=useCallback(()=>{
    localStorage.removeItem('access_token'); localStorage.removeItem('auth_user');
    setIsAuth(false); setAuthUser(null); setProfileOpen(false);
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/');
  },[navigate]);

  return <>
    <style>{STYLES}</style>
    <MobileDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} departments={departments} megaMenu={megaMenu}/>

    <header ref={navRef} className="hcn" style={{ width:'100%',position:'sticky',top:0,zIndex:1000,fontFamily:FONT,boxShadow:scrolled?'0 2px 20px rgba(0,0,0,.09)':'0 1px 0 #ebebeb',transition:'box-shadow .3s' }}>

      {/* Utility bar */}
      <div className={`dsk hcn-util-bar${scrolled?' is-hidden':''}`}>
        <div style={{ maxWidth:1720,margin:'0 auto',padding:'0 24px',height:36,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:2 }}>
            <div style={{ position:'relative' }}><button onMouseEnter={()=>setShowFreeShip(true)} onMouseLeave={()=>setShowFreeShip(false)} style={{ display:'flex',alignItems:'center',gap:6,padding:'0 10px',height:36,background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:11.5,fontFamily:FONT }}><RiEBike2Line size={14} color={BRAND_SOLID}/>Fast Delivery</button><Tooltip text="Fast delivery on all print orders" visible={showFreeShip}/></div>
            <span style={{ color:'#3a3a3a',fontSize:10 }}>|</span>
            <div style={{ position:'relative' }}><button onMouseEnter={()=>setShowEmi(true)} onMouseLeave={()=>setShowEmi(false)} style={{ display:'flex',alignItems:'center',gap:6,padding:'0 10px',height:36,background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:11.5,fontFamily:FONT }}><svg width="13" height="13" fill="none" stroke={BRAND_SOLID} strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><rect x="5" y="14" width="4" height="2" rx=".5" fill={BRAND_SOLID} stroke="none"/><rect x="10" y="14" width="4" height="2" rx=".5" fill={BRAND_SOLID} stroke="none"/></svg>EMI Options</button><Tooltip text="Easy EMI on bulk orders" visible={showEmi}/></div>
          </div>
          <div style={{ display:'flex',alignItems:'center' }}>
            {[{icon:<LuMapPin size={13} color={BRAND_SOLID}/>,label:'Delivering To',href:'#'},{icon:<LuSmartphone size={13} color={BRAND_SOLID}/>,label:'Download Apps',href:'/apps'},{icon:<LuTruck size={13} color={BRAND_SOLID}/>,label:'Track Order',href:'/track'},{icon:<LuCircle size={13} color={BRAND_SOLID}/>,label:'Help',href:'/help'}].map(({icon,label,href},i,arr)=>(
              <span key={label} style={{ display:'flex',alignItems:'center' }}>
                <Link to={href} className="hcn-util-link">{icon}{label}</Link>
                {i<arr.length-1&&<span style={{ color:'#3a3a3a',fontSize:10 }}>|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Logo + Search + Actions */}
      <div className="dsk" style={{ background:C.white,borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1720,margin:'0 auto',padding:'0 24px',height:66,display:'flex',alignItems:'center',gap:18 }}>
          <Link to="/" style={{ flexShrink:0,display:'flex',alignItems:'center',gap:8,marginRight:8 }}>
            <div>
              <div style={{ fontWeight:800,fontSize:22,letterSpacing:-.5,lineHeight:1,fontFamily:FONT,...gradText(BRAND_GRAD) }}>Infinity</div>
              <div style={{ fontSize:8,color:'#bbb',letterSpacing:'0.17em',textTransform:'uppercase',marginTop:3,fontFamily:FONT }}>printing &amp; signage</div>
            </div>
            <div style={{ display:'flex',gap:2,alignItems:'flex-end',paddingBottom:2 }}>
              {[{h:6,c:'#5B4FBE'},{h:9,c:'#E8314A'},{h:7,c:'#F97316'},{h:5,c:'#2563EB'},{h:8,c:'#22C55E'}].map(({h,c},i)=><div key={i} style={{ width:3,height:h,borderRadius:2,background:c }}/>)}
            </div>
          </Link>
          <div style={{ flex:1,minWidth:0,maxWidth:620 }}>
            <form role="search" onSubmit={(e)=>{e.preventDefault();handleSearch();}} className={`hcn-search-wrap${searchFocused?' focused':''}`}>
              <LuSearch size={15} color="#aaa" style={{ marginLeft:14,flexShrink:0 }}/>
              <input aria-label="Search products" type="text" className="hcn-search-input" placeholder="Search printing, signage, products..." value={searchVal} onChange={e=>setSearchVal(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)} autoComplete="off"/>
              {searchVal&&<button onMouseDown={e=>{e.preventDefault();setSearchVal('');}} style={{ background:'none',border:'none',cursor:'pointer',padding:'0 6px',color:C.light,display:'flex',alignItems:'center' }} aria-label="Clear search"><LuX size={13}/></button>}
              <button type="submit" aria-label="Search" style={{ height:'100%',padding:'0 22px',border:'none',borderRadius:'0 100px 100px 0',background:BRAND_GRAD,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:FONT,flexShrink:0 }}>Search</button>
            </form>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:4,marginLeft:'auto',flexShrink:0 }}>
            {isAuth ? (
              <ProfileDropdown user={authUser} isOpen={profileOpen} onToggle={()=>setProfileOpen(p=>!p)} onLogout={handleLogout} containerRef={profileRef}/>
            ) : (
              <Link to="/login" style={{ padding:'9px 18px',borderRadius:10,background:CTA_GRAD,color:'#fff',fontSize:12.5,fontWeight:700,letterSpacing:'0.04em',cursor:'pointer',fontFamily:FONT,whiteSpace:'nowrap',marginRight:4,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6 }}>
                <LuUser size={14} color="#fff"/>SIGN IN
              </Link>
            )}
            <Link to="/wishlist" className="hcn-icon-btn"><div style={{ position:'relative' }}><LuHeart className="hcn-ico" size={21} color="#444"/><CountBadge count={wishlistCount}/></div><span className="hcn-lbl" style={{ fontSize:10.5,color:C.muted,fontFamily:FONT,fontWeight:500 }}>Wishlist</span></Link>
            <Link to="/cart" className="hcn-icon-btn"><div style={{ position:'relative' }}><LuShoppingBasket className="hcn-ico" size={21} color="#444"/><CountBadge count={cartCount}/></div><span className="hcn-lbl" style={{ fontSize:10.5,color:C.muted,fontFamily:FONT,fontWeight:500 }}>Basket</span></Link>
          </div>
        </div>
      </div>

      {/* ══ CATEGORY BAR ══ */}
      {apiLoading ? (
        <CatBarSkeleton/>
      ) : departments.length > 0 ? (
        <div className={`dsk hcn-catbar-wrap${catBarScroll.left?' can-scroll-left':''}${catBarScroll.right?' can-scroll-right':''}`}>
          <div className="hcn-catbar" ref={catBarRef}>
            <div className="hcn-catbar-divider"/>
            {departments.map(dept=>{
              const data  = megaMenu[dept];
              const dg    = resolveDeptGrad(dept);
              const deptId= data?.id;
              const isActive = activeMenu===dept || curr===`/category?id=${deptId}` || curr.startsWith(`/category?id=${deptId}&`) || curr.includes(`parentId=${deptId}`);
              return (
                <div key={dept} style={{ position:'relative',height:'100%',display:'flex',alignItems:'center',flexShrink:0 }}
                  onMouseEnter={()=>enter(dept)} onMouseLeave={leave}>
                  {/* Click → parent all-products page */}
                  <Link
                    to={deptId ? `/category?id=${deptId}` : `/category?sub=${encodeURIComponent(dept)}`}
                    className="hcn-dept-link"
                    style={isActive ? gradText(dg.grad) : {}}
                    onMouseEnter={e=>{const a=e.currentTarget as HTMLAnchorElement;a.style.backgroundImage=dg.grad;a.style.webkitTextFillColor='transparent';a.style.color='transparent';}}
                    onMouseLeave={e=>{if(!isActive){const a=e.currentTarget as HTMLAnchorElement;a.style.backgroundImage='none';a.style.webkitTextFillColor='';a.style.color='';} }}
                  >
                    {dept}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:.5,transition:'transform .2s',flexShrink:0 }}>
                      <path d="M19 9l-7 7-7-7"/>
                    </svg>
                  </Link>
                  {isActive && <div style={{ position:'absolute',bottom:0,left:12,right:12,height:2.5,borderRadius:2,background:dg.grad,pointerEvents:'none' }}/>}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Mobile header */}
      <div className={`mob hcn-mob-header${mobHidden?' is-hidden':''}`} style={{ background:C.white,boxShadow:scrolled?'0 3px 14px rgba(0,0,0,.07)':'none' }}>
        <div style={{ height:56,display:'flex',alignItems:'center',padding:'0 8px',borderBottom:`1px solid ${C.border}`,gap:0 }}>
          <button onClick={()=>setDrawerOpen(true)} aria-label="Open menu" className="hcn-mob-icon" style={{ marginRight:4 }}><LuMenu size={22} color={C.text} strokeWidth={2}/></button>
          <Link to="/" style={{ display:'flex',alignItems:'center',marginLeft:2 }}><span style={{ fontWeight:800,fontSize:20,letterSpacing:-.3,fontFamily:FONT,...gradText(BRAND_GRAD) }}>Infinity</span></Link>
          <div style={{ flex:1 }}/>
          <Link to="/wishlist" className="hcn-mob-icon"><div style={{ position:'relative' }}><LuHeart size={22} color="#2a2a2a" strokeWidth={1.8}/><CountBadge count={wishlistCount}/></div></Link>
          <Link to="/cart" className="hcn-mob-icon"><div style={{ position:'relative' }}><LuShoppingBasket size={22} color="#2a2a2a" strokeWidth={1.8}/><CountBadge count={cartCount}/></div></Link>
          {isAuth
            ? <Link to="/my-profile" className="hcn-mob-icon" title={authUser?.name??''}><div style={{ width:30,height:30,borderRadius:'50%',background:BRAND_GRAD,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'#fff' }}>{authUser?.name?.trim()?.[0]?.toUpperCase()??'?'}</div></Link>
            : <Link to="/login" className="hcn-mob-icon"><LuUser size={22} color="#2a2a2a" strokeWidth={1.8}/></Link>
          }
        </div>
        <div style={{ padding:'9px 12px',borderBottom:`1px solid ${C.border}` }}>
          <form role="search" onSubmit={(e)=>{e.preventDefault();handleSearch();}} className={`hcn-search-wrap${searchFocused?' focused':''}`}>
            <LuSearch size={15} color={C.light} style={{ marginLeft:13,flexShrink:0 }}/>
            <input aria-label="Search products" type="text" className="hcn-search-input" placeholder="Search printing, signage..." value={searchVal} onChange={e=>setSearchVal(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)} autoComplete="off"/>
            {searchVal&&<button onMouseDown={e=>{e.preventDefault();setSearchVal('');}} style={{ background:'none',border:'none',cursor:'pointer',padding:'0 6px',color:C.light,display:'flex' }} aria-label="Clear search"><LuX size={13}/></button>}
            <button type="submit" aria-label="Search" style={{ height:'100%',width:48,border:'none',borderRadius:'0 100px 100px 0',background:BRAND_GRAD,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0 }}><LuSearch size={16} color="#fff"/></button>
          </form>
        </div>
        <div style={{ padding:'8px 12px',background:C.white }}>
          <div className="hcn-chips">
            {departments.map(label=>{
              const data=megaMenu[label]; const dg=resolveDeptGrad(label); const isChipActive=activeChip===label;
              return (
                <Link key={label}
                  to={data?.id ? `/category?id=${data.id}` : `/category?sub=${encodeURIComponent(label)}`}
                  onClick={()=>setActiveChip(label)}
                  className={`hcn-chip ${isChipActive?'is-active':''}`}
                  style={isChipActive?{background:dg.grad,borderColor:'transparent',color:'#fff'}:{}}>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>

    <div ref={megaWrapRef}>
      {/* Mega menu panels */}
      {!apiLoading && departments.map(dept=>{
        const data=megaMenu[dept]; if(!data) return null;
        return <MegaMenuPanel key={dept} dept={dept} data={data} isOpen={activeMenu===dept} navbarBottom={navbarBottom} onEnter={keep} onLeave={leave}/>;
      })}

      {/* Backdrop */}
      <div style={{ position:'fixed',inset:0,top:navbarBottom,background:'rgba(0,0,0,.18)',zIndex:8998,opacity:departments.includes(activeMenu??'')?1:0,pointerEvents:'none',transition:'opacity .18s ease' }}/>
    </div>
  </>;
}