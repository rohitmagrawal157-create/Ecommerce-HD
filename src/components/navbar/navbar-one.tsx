// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LuHeart, LuShoppingBasket, LuSearch, LuMapPin,
  LuTruck, LuSmartphone, LuCircle, LuX,
  LuChevronDown, LuChevronRight, LuMenu, LuUser, LuShieldCheck,
} from 'react-icons/lu';
import { RiEBike2Line } from 'react-icons/ri';

const C = {
  brand: '#187fc1', brandHover: '#1268a0', brandBg: '#f0f7fd',
  dark: '#1c1c1c', text: '#1a1a1a', muted: '#555', light: '#aaa',
  border: '#efefef', borderMd: '#e4e4e4', white: '#ffffff',
  newBadge: '#e8745a', sale: '#d93030',
};
const FONT = "'DM Sans', sans-serif";

type MenuLink = string | { name: string; badge?: string; path?: string };
interface MenuGroup { heading: string; links: MenuLink[]; }
interface DeptMenu { image: string; imageAlt: string; flatLinks?: MenuLink[]; groups: MenuGroup[]; }

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

const MEGA_MENU: Record<string, DeptMenu> = {
  'Portrait Frames': {
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=320&h=400&fit=crop',
    imageAlt: 'Portrait Frames',
    flatLinks: ['All Portrait Frames', 'Wooden Frames', 'Metal Frames', 'Acrylic Frames', 'Collage Frames', { name: 'Custom Size Frames', badge: 'NEW' }],
    groups: [{ heading: 'By Orientation', links: ['Portrait', 'Landscape', 'Square', 'Panoramic'] }, { heading: 'By Color', links: ['Black', 'White', 'Gold', 'Silver', 'Natural Wood', 'Custom Color'] }],
  },
  'Canvas Paintings': {
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=320&h=400&fit=crop',
    imageAlt: 'Canvas Paintings',
    flatLinks: ['All Canvas Paintings', 'Abstract Canvas', 'Landscape Canvas', 'Portrait Canvas', 'Custom Canvas Print', { name: 'Canvas with Frame', badge: '' }],
    groups: [{ heading: 'Size', links: ['Small (under 24")', 'Medium (24"-48")', 'Large (48"+ )', 'Multi-panel'] }, { heading: 'Style', links: ['Modern', 'Traditional', 'Minimalist', 'Vintage', 'Religious', 'Custom Design'] }],
  },
  'Temple Art Prints': {
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=320&h=400&fit=crop',
    imageAlt: 'Temple Art Prints',
    flatLinks: ['All Temple Art', 'Ganesha Paintings', 'Lakshmi Prints', 'Sai Baba Art', 'Radha Krishna', { name: 'Pichwai Art', badge: 'NEW' }, 'Custom Temple Art'],
    groups: [{ heading: 'Medium', links: ['Canvas', 'Paper Print', 'Metal Print', 'Wood Panel', 'Fabric'] }, { heading: 'Frame Style', links: ['Ornate Gold', 'Wood Grain', 'Floating Frame', 'Unframed'] }],
  },
  'Wall Murals': {
    image: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=320&h=400&fit=crop',
    imageAlt: 'Wall Murals',
    flatLinks: ['All Wall Murals', 'Nature Murals', 'Abstract Murals', 'Cityscape Murals', 'Kids Room Murals', { name: 'Custom Photo Mural', badge: 'POPULAR' }],
    groups: [{ heading: 'Material', links: ['Non-woven', 'Vinyl', 'Peel & Stick', 'Pre-pasted', 'Textured'] }, { heading: 'Room', links: ['Living Room', 'Bedroom', 'Office', 'Restaurant', 'Kids Room'] }],
  },
  'Modern Wallpapers': {
    image: 'https://images.unsplash.com/photo-1581619356164-5d0a5cd06c79?w=320&h=400&fit=crop',
    imageAlt: 'Modern Wallpapers',
    flatLinks: ['All Wallpapers', 'Geometric Patterns', 'Floral Prints', '3D Textured', 'Metallic Finish', { name: 'Eco-friendly', badge: 'NEW' }, 'Sample Pack'],
    groups: [{ heading: 'Color', links: ['Neutral', 'Bold & Bright', 'Pastel', 'Dark & Moody', 'Custom Color'] }, { heading: 'Application', links: ['Living Room', 'Bedroom', 'Accent Wall', 'Ceiling', 'Bathroom'] }],
  },
  'Customize Blinds': {
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=320&h=400&fit=crop',
    imageAlt: 'Customize Blinds',
    flatLinks: [{ name: 'Start Customizing', path: '/customize/blind', badge: 'NEW' }, 'Roller Blinds', 'Roman Blinds', 'Venetian Blinds', 'Vertical Blinds', 'Motorized Blinds', 'Shop All Blinds'],
    groups: [{ heading: 'Features', links: ['Blackout', 'Light Filtering', 'Thermal Insulation', 'Water Resistant'] }, { heading: 'Colors & Textures', links: ['Solid Colors', 'Patterns', 'Wood Grain', 'Metallic', 'Custom Print'] }],
  },
  'Neon Signs': {
    image: 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=320&h=400&fit=crop',
    imageAlt: 'Neon Signs',
    flatLinks: [{ name: 'Design Your Neon Sign', path: '/customize/neon', badge: 'BESTSELLER' }, 'Pre-designed Quotes', 'Business Logos', 'Wedding Signs', 'Custom Shapes', 'LED Neon vs Glass Neon', 'Shop All Neon'],
    groups: [{ heading: 'Colors', links: ['Red', 'Blue', 'Green', 'Pink', 'White', 'Multicolor', 'RGB'] }, { heading: 'Sizes', links: ['Small (12"x12")', 'Medium (24"x24")', 'Large (36"x36")', 'Custom Size'] }],
  },
  'Backlit LED': {
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&h=400&fit=crop',
    imageAlt: 'Backlit LED',
    flatLinks: ['LED Panel Lights', 'Backlit Frames', 'Edge-lit Signs', 'Light Boxes', 'Slim LED Panels', { name: 'Tunable White', badge: 'NEW' }, 'Shop All Backlit LED'],
    groups: [{ heading: 'Applications', links: ['Home Lighting', 'Office Ceilings', 'Signage Backlight', 'Art Illumination', 'Retail Displays'] }, { heading: 'Technology', links: ['CCT Tunable', 'Dimmable', 'Smart (WiFi)', 'Emergency Backup', 'IP65 Waterproof'] }],
  },
};

const PAGE_MENU = {
  Home: { links: [{ name: 'Home Minimal', path: '/' }, { name: 'Home Stylish', path: '/index-v2' }, { name: 'Home Accessories', path: '/index-v3' }, { name: 'Home Collection', path: '/index-v4' }, { name: 'Home Luxury', path: '/index-v5' }] },
  Pages: { groups: [{ heading: 'Company', links: [{ name: 'About Us', path: '/about' }, { name: 'Price Plan', path: '/pricing' }, { name: 'Team Member', path: '/team' }, { name: 'FAQs', path: '/faq' }, { name: 'Terms', path: '/terms-and-conditions' }] }, { heading: 'Portfolio', links: [{ name: 'Portfolio 1', path: '/portfolio-v1' }, { name: 'Portfolio 2', path: '/portfolio-v2' }, { name: '404 Error', path: '/error' }] }, { heading: 'Account', links: [{ name: 'My Profile', path: '/my-profile' }, { name: 'Login', path: '/login' }, { name: 'Register', path: '/register' }] }, { heading: 'Checkout', links: [{ name: 'Shipping Method', path: '/shipping-method' }, { name: 'Payment Method', path: '/payment-method' }, { name: 'Invoice', path: '/invoice' }] }] },
  Shop: { links: [{ name: 'Shop Layout 01', path: '/shop-v1' }, { name: 'Shop Layout 02', path: '/shop-v2' }, { name: 'Product Details', path: '/product-details' }, { name: 'My Cart', path: '/cart' }, { name: 'Checkout', path: '/checkout' }] },
};

const DEPARTMENTS = Object.keys(MEGA_MENU);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  .hcn *, .hcn *::before, .hcn *::after { box-sizing: border-box; }
  .hcn a { text-decoration: none; }
  .hcn button { font-family: ${FONT}; }
  .hcn input[type='search']::-webkit-search-cancel-button { display: none; }
  .hcn input:focus { outline: none; }
  @media (max-width: 1023px) { .hcn .dsk { display: none !important; } }
  @media (min-width: 1024px) { .hcn .mob { display: none !important; } }
  .hcn-util-bar { background: ${C.dark}; max-height: 36px; overflow: hidden; transition: max-height 0.3s ease, opacity 0.22s ease; opacity: 1; }
  .hcn-util-bar.is-hidden { max-height: 0; opacity: 0; }
  .hcn-util-link { color: #aaa; transition: color 0.15s; display: flex; align-items: center; gap: 5px; padding: 0 10px; height: 36px; font-family: ${FONT}; font-size: 11.5px; }
  .hcn-util-link:hover { color: #fff; }
  .hcn-nav-link { display: flex; align-items: center; gap: 3px; padding: 0 16px; height: 100%; font-size: 13.5px; font-weight: 600; font-family: ${FONT}; white-space: nowrap; color: ${C.text}; border-bottom: 2.5px solid transparent; transition: color 0.15s, border-color 0.15s; position: relative; }
  .hcn-nav-link:hover, .hcn-nav-link.is-open { color: ${C.brand}; border-bottom-color: ${C.brand}; }
  .hcn-nav-link.is-active { color: ${C.brand}; border-bottom-color: ${C.brand}; }
  .hcn-mega-fw { position: fixed; left: 0; right: 0; background: ${C.white}; border-top: 1px solid ${C.border}; box-shadow: 0 12px 40px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05); z-index: 8999; transition: opacity 0.18s ease, transform 0.18s ease; transform-origin: top center; overflow: hidden; }
  .hcn-mega-fw.is-open { opacity: 1; transform: translateY(0) scaleY(1); pointer-events: auto; }
  .hcn-mega-fw.is-shut { opacity: 0; transform: translateY(-8px) scaleY(0.97); pointer-events: none; }
  .hcn-fl-link { display: block; font-size: 14px; font-family: ${FONT}; color: ${C.text}; padding: 5px 0; transition: color 0.15s; font-weight: 400; white-space: nowrap; }
  .hcn-fl-link:hover { color: ${C.brand}; }
  .hcn-fl-link.shop-all { font-weight: 600; color: ${C.muted}; margin-top: 4px; }
  .hcn-fl-link.shop-all:hover { color: ${C.brand}; }
  .hcn-grp-head { font-size: 14px; font-weight: 700; font-family: ${FONT}; color: ${C.text}; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1.5px solid ${C.border}; }
  .hcn-grp-link { display: flex; align-items: center; gap: 7px; font-size: 13.5px; font-family: ${FONT}; color: ${C.muted}; padding: 4px 0; transition: color 0.15s; }
  .hcn-grp-link:hover { color: ${C.brand}; }
  .hcn-grp-link.shop-all { font-weight: 600; color: ${C.muted}; margin-top: 6px; }
  .hcn-grp-link.shop-all:hover { color: ${C.brand}; }
  .hcn-badge-new { display: inline-flex; align-items: center; background: ${C.newBadge}; color: #fff; font-size: 9px; font-weight: 700; letter-spacing: 0.06em; padding: 2px 6px; border-radius: 10px; line-height: 1; flex-shrink: 0; text-transform: uppercase; }
  .hcn-simple-drop { position: absolute; top: 100%; left: 0; background: ${C.white}; border: 1px solid ${C.border}; border-top: none; border-radius: 0 0 12px 12px; min-width: 200px; box-shadow: 0 16px 40px rgba(0,0,0,0.10); z-index: 9001; transition: opacity 0.15s, transform 0.15s; transform-origin: top left; }
  .hcn-simple-drop.is-open { opacity: 1; transform: scaleY(1); pointer-events: auto; }
  .hcn-simple-drop.is-shut { opacity: 0; transform: scaleY(0.96); pointer-events: none; }
  .hcn-drop-link { display: block; padding: 9px 18px; font-size: 13px; font-family: ${FONT}; color: ${C.muted}; transition: background 0.14s, color 0.14s; }
  .hcn-drop-link:hover { background: ${C.brandBg}; color: ${C.brand}; }
  .hcn-pages-drop { position: absolute; top: 100%; left: 0; background: ${C.white}; border: 1px solid ${C.border}; border-top: none; border-radius: 0 0 12px 12px; width: 680px; box-shadow: 0 16px 40px rgba(0,0,0,0.10); z-index: 9001; transition: opacity 0.15s, transform 0.15s; transform-origin: top left; }
  .hcn-pages-drop.is-open { opacity: 1; transform: scaleY(1); pointer-events: auto; }
  .hcn-pages-drop.is-shut { opacity: 0; transform: scaleY(0.96); pointer-events: none; }
  .hcn-icon-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; border-radius: 8px; padding: 5px 9px; transition: background 0.14s; }
  .hcn-icon-btn:hover { background: ${C.brandBg}; }
  .hcn-icon-btn:hover .hcn-ico { color: ${C.brand} !important; }
  .hcn-icon-btn:hover .hcn-lbl { color: ${C.brand} !important; }
  .hcn-search-wrap { display: flex; align-items: center; height: 44px; border-radius: 100px; overflow: hidden; background: #f4f3f8; border: 1.5px solid ${C.borderMd}; transition: border-color 0.2s, box-shadow 0.2s; }
  .hcn-search-wrap.focused { border-color: ${C.brand}; box-shadow: 0 0 0 3px rgba(24,127,193,0.12); }
  .hcn-search-input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; padding: 0 10px; font-size: 14px; color: ${C.text}; font-family: ${FONT}; }
  .hcn-search-input::placeholder { color: ${C.light}; }
  .hcn-mob-header { transform: translateY(0); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); will-change: transform; }
  .hcn-mob-header.is-hidden { transform: translateY(-100%); }
  .hcn-mob-icon { display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; padding: 9px; border-radius: 10px; -webkit-tap-highlight-color: transparent; }
  .hcn-mob-icon:active { background: ${C.brandBg}; }
  .hcn-chips { display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .hcn-chips::-webkit-scrollbar { display: none; }
  .hcn-chip { flex-shrink: 0; padding: 6px 14px; border-radius: 22px; font-size: 12.5px; font-weight: 600; font-family: ${FONT}; white-space: nowrap; border: 1.5px solid ${C.borderMd}; background: ${C.white}; color: ${C.text}; cursor: pointer; transition: all 0.15s; text-decoration: none; }
  .hcn-chip:hover, .hcn-chip.is-active { background: ${C.brand}; color: #fff; border-color: ${C.brand}; }
  .hcn-drawer-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; background: none; border: none; cursor: pointer; font-weight: 600; font-size: 14px; color: ${C.text}; font-family: ${FONT}; text-align: left; transition: background 0.14s; }
  .hcn-drawer-btn:hover { background: #f5f5f5; }
  .hcn-sub-link { font-size: 13px; color: ${C.muted}; font-family: ${FONT}; transition: color 0.14s; }
  .hcn-sub-link:hover { color: ${C.brand}; }
`;

function Tooltip({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: '#fff', fontSize: 11, fontFamily: FONT, fontWeight: 500, padding: '5px 11px', borderRadius: 5, whiteSpace: 'nowrap', zIndex: 9999, boxShadow: '0 4px 14px rgba(0,0,0,0.2)', opacity: visible ? 1 : 0, pointerEvents: 'none', transition: 'opacity 0.18s' }}>
      <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: '#1a1a1a' }} />
      {text}
    </div>
  );
}

function MegaMenuPanel({ dept, data, isOpen, navbarBottom, onEnter, onLeave }: { dept: string; data: DeptMenu; isOpen: boolean; navbarBottom: number; onEnter: () => void; onLeave: () => void }) {
  const IMG_WIDTH = 220;
  return (
    <div className={`hcn-mega-fw ${isOpen ? 'is-open' : 'is-shut'}`} style={{ top: navbarBottom }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {isOpen && <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', background: 'rgba(26,26,26,0.9)', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: FONT, padding: '5px 14px', borderRadius: '6px 6px 0 0', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{dept}</div>}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px', display: 'flex', alignItems: 'flex-start', gap: 28, justifyContent: 'center' }}>
        <div style={{ width: IMG_WIDTH, minWidth: IMG_WIDTH, overflow: 'hidden', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <img src={data.image} alt={data.imageAlt} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {data.flatLinks && data.flatLinks.length > 0 && (
            <div style={{ minWidth: 180, padding: '0 24px', borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
              {data.flatLinks.map((item, i) => {
                const name = getLinkName(item);
                const badge = getLinkBadge(item);
                const isShopAll = name.toLowerCase().startsWith('shop all');
                return <Link key={i} to={getLinkPath(item, dept)} className={`hcn-fl-link ${isShopAll ? 'shop-all' : ''}`}>{name}{badge === 'NEW' && <span className="hcn-badge-new" style={{ marginLeft: 6 }}>NEW</span>}</Link>;
              })}
            </div>
          )}
          {data.groups.map((group, gi) => (
            <div key={gi} style={{ minWidth: 180, padding: '0 24px', borderRight: gi < data.groups.length - 1 ? `1px solid ${C.border}` : 'none', flexShrink: 0 }}>
              <div className="hcn-grp-head">{group.heading}</div>
              {group.links.map((item, li) => {
                const name = getLinkName(item);
                const badge = getLinkBadge(item);
                const isShopAll = name.toLowerCase().startsWith('shop all');
                return <Link key={li} to={getLinkPath(item, dept)} className={`hcn-grp-link ${isShopAll ? 'shop-all' : ''}`}>{name}{badge === 'NEW' && <span className="hcn-badge-new">NEW</span>}</Link>;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const curr = location.pathname;
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (s: string) => setExpanded(p => p === s ? null : s);
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.27s ease' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(84vw, 350px)', background: C.white, zIndex: 1200, display: 'flex', flexDirection: 'column', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '5px 0 30px rgba(0,0,0,0.16)' }}>
        <div style={{ padding: '15px 16px', borderBottom: `1px solid ${C.border}`, background: '#f0f7fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div><div style={{ fontWeight: 800, fontSize: 20, color: C.brand, letterSpacing: -0.5, lineHeight: 1, fontFamily: FONT }}>Infinity</div><div style={{ fontSize: 9, color: C.light, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>printing &amp; signage</div></div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${C.borderMd}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><LuX size={15} color="#555" /></button>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); const dest = window.localStorage.getItem('access_token') ? '/my-profile' : '/login'; window.location.href = dest; }} style={{ width: '100%', display: 'inline-block', textAlign: 'center', padding: '11px 0', borderRadius: 10, border: 'none', background: C.brand, color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: FONT, textDecoration: 'none' }}>SIGN UP / SIGN IN</a>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {[{ label: 'Home', links: PAGE_MENU.Home.links }, { label: 'Shop', links: PAGE_MENU.Shop.links }].map(sec => (
            <div key={sec.label} style={{ borderBottom: `1px solid #f5f5f5` }}>
              <button onClick={() => toggle(sec.label)} className="hcn-drawer-btn">{sec.label}<LuChevronDown size={14} color="#999" style={{ transition: 'transform 0.2s', transform: expanded === sec.label ? 'rotate(180deg)' : 'rotate(0)' }} /></button>
              <div style={{ maxHeight: expanded === sec.label ? 400 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}><div style={{ background: '#fafaf9', padding: '8px 16px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>{sec.links.map((l: any, i: number) => <Link key={i} to={l.path} onClick={onClose} className="hcn-sub-link">{l.name}</Link>)}</div></div>
            </div>
          ))}
          <Link to="/contact" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: `1px solid #f5f5f5`, fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT }}>Contact <LuChevronRight size={14} color="#aaa" /></Link>
          {DEPARTMENTS.map(dept => {
            const data = MEGA_MENU[dept];
            const allLinks: MenuLink[] = [...(data.flatLinks || []), ...data.groups.flatMap(g => g.links)];
            return (
              <div key={dept} style={{ borderBottom: `1px solid #f5f5f5` }}>
                <button onClick={() => toggle(dept)} className="hcn-drawer-btn">{dept}<LuChevronDown size={14} color="#999" style={{ transition: 'transform 0.2s', transform: expanded === dept ? 'rotate(180deg)' : 'rotate(0)' }} /></button>
                <div style={{ maxHeight: expanded === dept ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.32s ease' }}>
                  <div style={{ background: '#fafaf9', padding: '10px 16px 14px' }}>
                    <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 12, height: 100 }}><img src={data.image} alt={dept} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                    {(data.flatLinks || []).map((item, i) => { const name = getLinkName(item); const badge = getLinkBadge(item); return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}><Link to={getLinkPath(item, dept)} onClick={onClose} className="hcn-sub-link">{name}</Link>{badge === 'NEW' && <span className="hcn-badge-new">NEW</span>}</div>; })}
                    {data.groups.map((group, gi) => (<div key={gi} style={{ marginTop: 12 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: 6, fontFamily: FONT }}>{group.heading}</div>{group.links.map((item, li) => { const name = getLinkName(item); const badge = getLinkBadge(item); return <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}><Link to={getLinkPath(item, dept)} onClick={onClose} className="hcn-sub-link">{name}</Link>{badge === 'NEW' && <span className="hcn-badge-new">NEW</span>}</div>; })}</div>))}
                    <Link to={`/category/${toSlug(dept)}`} onClick={onClose} style={{ display: 'inline-block', marginTop: 10, fontSize: 12, fontWeight: 700, color: C.brand, fontFamily: FONT }}>View All {dept} →</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, background: '#fafaf9', padding: '11px 16px', flexShrink: 0 }}>
          {[{ icon: <RiEBike2Line size={14} />, label: 'Fast Delivery Available' }, { icon: <LuMapPin size={13} />, label: 'Delivering To Your City' }, { icon: <LuTruck size={13} />, label: 'Track Your Order' }, { icon: <LuSmartphone size={13} />, label: 'Download Our App' }].map(({ icon, label }) => (<div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 12.5, color: '#555', fontFamily: FONT }}><span style={{ color: C.brand, display: 'flex' }}>{icon}</span>{label}</div>))}
        </div>
      </div>
    </>
  );
}

export default function NavbarOne() {
  const location = useLocation();
  const navigate = useNavigate();
  const curr = location.pathname;
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [showFreeShip, setShowFreeShip] = useState(false);
  const [showEmi, setShowEmi] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobHidden, setMobHidden] = useState(false);
  const [navbarBottom, setNavbarBottom] = useState(0);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastY = useRef(0);
  const delta = useRef(0);
  const scrolled_ = useRef(false);
  const mobHid_ = useRef(false);

  const measureNavbar = useCallback(() => { if (navRef.current) setNavbarBottom(navRef.current.getBoundingClientRect().bottom); }, []);
  useEffect(() => { measureNavbar(); window.addEventListener('resize', measureNavbar); return () => window.removeEventListener('resize', measureNavbar); }, [measureNavbar]);
  // Keep counts in sync — prefer static imports so behavior is consistent
  useEffect(() => {
    setIsAuthenticated(Boolean(window.localStorage.getItem('access_token')));
    async function refreshCounts() {
      try {
        const { getCart } = await import('../../api/cart.api');
        const cart = await getCart();
        setCartCount(cart.lines.reduce((s: number, l: any) => s + (l.quantity ?? 0), 0));
      } catch {
        // ignore
      }
      try {
        const { getWishlist } = await import('../../api/wishlist.api');
        const wl = await getWishlist();
        setWishlistCount(wl.productIds.length);
      } catch {
        // ignore
      }
    }

    // initial
    refreshCounts();

    const onCart = () => refreshCounts();
    const onWl = () => refreshCounts();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token') setIsAuthenticated(Boolean(window.localStorage.getItem('access_token')));
      if (e.key?.startsWith('cart')) refreshCounts();
      if (e.key?.startsWith('wishlist')) refreshCounts();
    };

    window.addEventListener('cart:changed', onCart as EventListener);
    window.addEventListener('wishlist:changed', onWl as EventListener);
    window.addEventListener('storage', onStorage as EventListener);
    return () => {
      window.removeEventListener('cart:changed', onCart as EventListener);
      window.removeEventListener('wishlist:changed', onWl as EventListener);
      window.removeEventListener('storage', onStorage as EventListener);
    };
  }, []);
  useEffect(() => { measureNavbar(); }, [scrolled, measureNavbar]);
  const onScroll = useCallback(() => { const y = window.scrollY; if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(() => { rafRef.current = null; const isMobile = window.innerWidth < 1024; if (y > 2 !== scrolled_.current) { scrolled_.current = y > 2; setScrolled(y > 2); } if (!isMobile) { if (mobHid_.current) { mobHid_.current = false; setMobHidden(false); } lastY.current = y; delta.current = 0; return; } if (y <= 10) { if (mobHid_.current) { mobHid_.current = false; setMobHidden(false); } lastY.current = y; delta.current = 0; return; } const diff = y - lastY.current; if (diff > 0) { if (delta.current < 0) delta.current = 0; delta.current += diff; if (delta.current > 60) { mobHid_.current = true; setMobHidden(true); } } else if (diff < 0) { if (delta.current > 0) delta.current = 0; delta.current += diff; if (delta.current < -30) { mobHid_.current = false; setMobHidden(false); } } lastY.current = y; }); }, []);
  useEffect(() => { window.addEventListener('scroll', onScroll, { passive: true }); return () => { window.removeEventListener('scroll', onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); }; }, [onScroll]);
  useEffect(() => { document.body.style.overflow = drawerOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [drawerOpen]);
  useEffect(() => { const h = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveMenu(null); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  const enter = (key: string) => { if (timerRef.current) clearTimeout(timerRef.current); setActiveMenu(key); measureNavbar(); };
  const leave = () => { timerRef.current = setTimeout(() => setActiveMenu(null), 120); };
  const keep = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const handleSearch = () => { if (searchVal.trim()) { navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`); setSearchVal(''); setSearchFocused(false); } };

  return (
    <>
      <style>{STYLES}</style>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <header ref={navRef} className="hcn" style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000, fontFamily: FONT, boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.09)' : '0 1px 0 #ebebeb', transition: 'box-shadow 0.3s' }}>
        <div className={`dsk hcn-util-bar${scrolled ? ' is-hidden' : ''}`}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ position: 'relative' }}><button onMouseEnter={() => setShowFreeShip(true)} onMouseLeave={() => setShowFreeShip(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11.5, fontFamily: FONT }}><RiEBike2Line size={14} color={C.brand} /> Fast Delivery</button><Tooltip text="Fast delivery on all print orders" visible={showFreeShip} /></div>
              <span style={{ color: '#3a3a3a', fontSize: 10 }}>|</span>
              <div style={{ position: 'relative' }}><button onMouseEnter={() => setShowEmi(true)} onMouseLeave={() => setShowEmi(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11.5, fontFamily: FONT }}><svg width="13" height="13" fill="none" stroke={C.brand} strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><rect x="5" y="14" width="4" height="2" rx=".5" fill={C.brand} stroke="none" /><rect x="10" y="14" width="4" height="2" rx=".5" fill={C.brand} stroke="none" /></svg>EMI Options</button><Tooltip text="Easy EMI on bulk orders" visible={showEmi} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>{[{ icon: <LuMapPin size={13} color={C.brand} />, label: 'Delivering To', href: '#' }, { icon: <LuSmartphone size={13} color={C.brand} />, label: 'Download Apps', href: '/apps' }, { icon: <LuTruck size={13} color={C.brand} />, label: 'Track Order', href: '/track' }, { icon: <LuCircle size={13} color={C.brand} />, label: 'Help', href: '/help' }].map(({ icon, label, href }, i, arr) => (<span key={label} style={{ display: 'flex', alignItems: 'center' }}><Link to={href} className="hcn-util-link">{icon}{label}</Link>{i < arr.length - 1 && <span style={{ color: '#3a3a3a', fontSize: 10 }}>|</span>}</span>))}</div>
          </div>
        </div>
        <div className="dsk" style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px', height: 66, display: 'flex', alignItems: 'center', gap: 18 }}>
            <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}><div><div style={{ fontWeight: 800, fontSize: 22, color: C.brand, letterSpacing: -0.5, lineHeight: 1, fontFamily: FONT }}>Infinity</div><div style={{ fontSize: 8, color: '#bbb', letterSpacing: '0.17em', textTransform: 'uppercase', marginTop: 3, fontFamily: FONT }}>printing &amp; signage</div></div><div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', paddingBottom: 2 }}>{[6, 9, 7, 5, 8].map((h, i) => <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: i % 2 === 0 ? C.brand : '#7bbde0' }} />)}</div></Link>
            <div style={{ flex: 1, minWidth: 0, maxWidth: 620 }}><div className={`hcn-search-wrap${searchFocused ? ' focused' : ''}`}><LuSearch size={15} color="#aaa" style={{ marginLeft: 14, flexShrink: 0 }} /><input type="search" className="hcn-search-input" placeholder="Search printing, signage, products..." value={searchVal} onChange={e => setSearchVal(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />{searchVal && <button onClick={() => setSearchVal('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px', color: C.light, display: 'flex', alignItems: 'center' }}><LuX size={13} /></button>}<button onClick={handleSearch} style={{ height: '100%', padding: '0 22px', border: 'none', borderRadius: '0 100px 100px 0', background: C.brand, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}>Search</button></div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', flexShrink: 0 }}>{isAuthenticated ? (<><Link to="/my-profile" style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#fff', color: C.brand, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', fontFamily: FONT, textDecoration: 'none', marginRight: 8 }}>My Profile</Link><Link to="/admin" aria-label="Admin" className="hcn-icon-btn" style={{ marginRight: 6 }}><LuShieldCheck className="hcn-ico" size={20} color="#444" /><span className="hcn-lbl" style={{ fontSize: 10.5, color: C.muted, fontFamily: FONT, fontWeight: 500 }}>Admin</span></Link></>) : (<Link to="/login" style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.brand, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', marginRight: 6 }}>SIGN IN</Link>)}<Link to="/wishlist" className="hcn-icon-btn"><div style={{ position: 'relative' }}><LuHeart className="hcn-ico" size={21} color="#444" />{wishlistCount > 0 && <span style={{ position: 'absolute', top: -7, right: -7, minWidth: 16, height: 16, padding: '0 4px', borderRadius: '50%', background: C.brand, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishlistCount}</span>}</div><span className="hcn-lbl" style={{ fontSize: 10.5, color: C.muted, fontFamily: FONT, fontWeight: 500 }}>Wishlist</span></Link><Link to="/cart" className="hcn-icon-btn"><div style={{ position: 'relative' }}><LuShoppingBasket className="hcn-ico" size={21} color="#444" />{cartCount > 0 && <span style={{ position: 'absolute', top: -7, right: -7, minWidth: 16, height: 16, padding: '0 4px', borderRadius: '50%', background: C.brand, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}</div><span className="hcn-lbl" style={{ fontSize: 10.5, color: C.muted, fontFamily: FONT, fontWeight: 500 }}>Basket</span></Link>
              {/* Profile icon added to desktop header (right of Basket) */}
              <Link to={isAuthenticated ? '/my-profile' : '/login'} aria-label="Profile" className="hcn-icon-btn" style={{ marginLeft: 6 }}>
                <LuUser className="hcn-ico" size={20} color="#444" />
                <span className="hcn-lbl" style={{ fontSize: 10.5, color: C.muted, fontFamily: FONT, fontWeight: 500 }}>{isAuthenticated ? 'Profile' : 'Account'}</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="dsk" style={{ background: C.white, borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px' }}><nav style={{ display: 'flex', height: 48, overflow: 'visible', position: 'relative' }}>
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={() => enter('Home')} onMouseLeave={leave}><Link to="#" className={`hcn-nav-link ${activeMenu === 'Home' ? 'is-open' : ''} ${['/', 'index-v2', 'index-v3'].includes(curr) ? 'is-active' : ''}`}>Home <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Home' ? 'rotate(180deg)' : 'rotate(0)' }} /></Link><div className={`hcn-simple-drop ${activeMenu === 'Home' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}><div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} />{PAGE_MENU.Home.links.map(l => <Link key={l.path} to={l.path} className="hcn-drop-link">{l.name}</Link>)}</div></div>
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={() => enter('Pages')} onMouseLeave={leave}><Link to="#" className={`hcn-nav-link ${activeMenu === 'Pages' ? 'is-open' : ''}`}>Pages <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Pages' ? 'rotate(180deg)' : 'rotate(0)' }} /></Link><div className={`hcn-pages-drop ${activeMenu === 'Pages' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}><div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '18px 14px 14px', gap: 0 }}>{PAGE_MENU.Pages.groups.map((g, gi) => (<div key={gi} style={{ padding: '0 14px', borderRight: gi < 3 ? `1px solid ${C.border}` : 'none' }}><div style={{ fontSize: 12.5, fontWeight: 700, color: '#111', marginBottom: 8, fontFamily: FONT }}>{g.heading}</div>{g.links.map(l => <Link key={l.path} to={l.path} className="hcn-grp-link" style={{ fontSize: 12, color: C.muted, fontFamily: FONT, padding: '3px 0', display: 'block' }}>{l.name}</Link>)}</div>))}</div></div></div>
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={() => enter('Shop')} onMouseLeave={leave}><Link to="#" className={`hcn-nav-link ${activeMenu === 'Shop' ? 'is-open' : ''} ${curr.startsWith('/shop') || curr === '/cart' ? 'is-active' : ''}`}>Shop <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Shop' ? 'rotate(180deg)' : 'rotate(0)' }} /></Link><div className={`hcn-simple-drop ${activeMenu === 'Shop' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}><div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} />{PAGE_MENU.Shop.links.map(l => <Link key={l.path} to={l.path} className="hcn-drop-link">{l.name}</Link>)}</div></div>
            {/* <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}><Link to="/contact" className={`hcn-nav-link ${curr === '/contact' ? 'is-active' : ''}`}>Contact</Link></div> */}
            <div style={{ width: 1, background: C.border, margin: '12px 8px', flexShrink: 0 }} />
            {DEPARTMENTS.map(dept => (<div key={dept} style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={() => enter(dept)} onMouseLeave={leave}><Link to={`/category/${toSlug(dept)}`} className={`hcn-nav-link ${activeMenu === dept || curr === `/category/${toSlug(dept)}` ? 'is-active' : ''}`}>{dept}<LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === dept ? 'rotate(180deg)' : 'rotate(0)' }} /></Link></div>))}
          </nav></div>
        </div>
        <div className={`mob hcn-mob-header${mobHidden ? ' is-hidden' : ''}`} style={{ background: C.white, boxShadow: scrolled ? '0 3px 14px rgba(0,0,0,0.07)' : 'none' }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: `1px solid ${C.border}`, gap: 0 }}><button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="hcn-mob-icon" style={{ marginRight: 4 }}><LuMenu size={22} color={C.text} strokeWidth={2} /></button><Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginLeft: 2 }}><span style={{ fontWeight: 800, fontSize: 20, color: C.brand, letterSpacing: -0.3, fontFamily: FONT }}>Infinity</span></Link><div style={{ flex: 1 }} /><a href="/wishlist" className="hcn-mob-icon" style={{ display: 'flex', alignItems: 'center' }}><LuHeart size={22} color="#2a2a2a" strokeWidth={1.8} />{wishlistCount > 0 && <span style={{ position: 'absolute', top: 8, right: 48, minWidth: 16, height: 16, padding: '0 4px', borderRadius: '50%', background: C.brand, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishlistCount}</span>}</a><a href="/cart" className="hcn-mob-icon" style={{ display: 'flex', alignItems: 'center' }}><div style={{ position: 'relative' }}><LuShoppingBasket size={22} color="#2a2a2a" strokeWidth={1.8} />{cartCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 16, height: 16, padding: '0 4px', borderRadius: '50%', background: C.brand, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}</div></a><a href="/my-profile" className="hcn-mob-icon"><LuUser size={22} color="#2a2a2a" strokeWidth={1.8} /></a></div>
          <div style={{ padding: '9px 12px', borderBottom: `1px solid ${C.border}` }}><div className={`hcn-search-wrap${searchFocused ? ' focused' : ''}`}><LuSearch size={15} color={C.light} style={{ marginLeft: 13, flexShrink: 0 }} /><input type="search" className="hcn-search-input" placeholder="Search printing, signage..." value={searchVal} onChange={e => setSearchVal(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />{searchVal && <button onClick={() => setSearchVal('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px', color: C.light, display: 'flex' }}><LuX size={13} /></button>}<button onClick={handleSearch} style={{ height: '100%', width: 48, border: 'none', borderRadius: '0 100px 100px 0', background: C.brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><LuSearch size={16} color="#fff" /></button></div></div>
          <div style={{ padding: '8px 12px', background: C.white }}><div className="hcn-chips">{['Home', 'Shop', 'Contact', ...DEPARTMENTS].map(label => (<Link key={label} to={label === 'Home' ? '/' : label === 'Shop' ? '/shop-v1' : label === 'Contact' ? '/contact' : `/category/${toSlug(label)}`} onClick={() => setActiveChip(label)} className={`hcn-chip ${activeChip === label ? 'is-active' : ''}`}>{label}</Link>))}</div></div>
        </div>
      </header>
      {DEPARTMENTS.map(dept => (<MegaMenuPanel key={dept} dept={dept} data={MEGA_MENU[dept]} isOpen={activeMenu === dept} navbarBottom={navbarBottom} onEnter={keep} onLeave={leave} />))}
      <div style={{ position: 'fixed', inset: 0, top: navbarBottom, background: 'rgba(0,0,0,0.18)', zIndex: 8998, opacity: DEPARTMENTS.includes(activeMenu ?? '') ? 1 : 0, pointerEvents: 'none', transition: 'opacity 0.18s ease' }} />
    </>
  );
}