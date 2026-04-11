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
    image: 'data:image/jpeg;base64,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',
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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnnDsYuA7SInsAMt2y3r-DG21vVwRYkUWsxQ&s',
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
              <Link to={isAuthenticated ? '/my-profile' : '/my-profile'} aria-label="Profile" className="hcn-icon-btn" style={{ marginLeft: 6 }}>
                <LuUser className="hcn-ico" size={20} color="#444" />
                <span className="hcn-lbl" style={{ fontSize: 10.5, color: C.muted, fontFamily: FONT, fontWeight: 500 }}>{isAuthenticated ? 'Profile' : 'Account'}</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="dsk" style={{ background: C.white, borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px' }}><nav style={{ display: 'flex', height: 48, overflow: 'visible', position: 'relative' }}>
            {/* <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={() => enter('Home')} onMouseLeave={leave}><Link to="#" className={`hcn-nav-link ${activeMenu === 'Home' ? 'is-open' : ''} ${['/', 'index-v2', 'index-v3'].includes(curr) ? 'is-active' : ''}`}>Home <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Home' ? 'rotate(180deg)' : 'rotate(0)' }} /></Link><div className={`hcn-simple-drop ${activeMenu === 'Home' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}><div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} />{PAGE_MENU.Home.links.map(l => <Link key={l.path} to={l.path} className="hcn-drop-link">{l.name}</Link>)}</div></div> */}
            {/* <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={() => enter('Pages')} onMouseLeave={leave}><Link to="#" className={`hcn-nav-link ${activeMenu === 'Pages' ? 'is-open' : ''}`}>Pages <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Pages' ? 'rotate(180deg)' : 'rotate(0)' }} /></Link><div className={`hcn-pages-drop ${activeMenu === 'Pages' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}><div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '18px 14px 14px', gap: 0 }}>{PAGE_MENU.Pages.groups.map((g, gi) => (<div key={gi} style={{ padding: '0 14px', borderRight: gi < 3 ? `1px solid ${C.border}` : 'none' }}><div style={{ fontSize: 12.5, fontWeight: 700, color: '#111', marginBottom: 8, fontFamily: FONT }}>{g.heading}</div>{g.links.map(l => <Link key={l.path} to={l.path} className="hcn-grp-link" style={{ fontSize: 12, color: C.muted, fontFamily: FONT, padding: '3px 0', display: 'block' }}>{l.name}</Link>)}</div>))}</div></div></div> */}
            {/* <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={() => enter('Shop')} onMouseLeave={leave}><Link to="#" className={`hcn-nav-link ${activeMenu === 'Shop' ? 'is-open' : ''} ${curr.startsWith('/shop') || curr === '/cart' ? 'is-active' : ''}`}>Shop <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Shop' ? 'rotate(180deg)' : 'rotate(0)' }} /></Link><div className={`hcn-simple-drop ${activeMenu === 'Shop' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}><div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} />{PAGE_MENU.Shop.links.map(l => <Link key={l.path} to={l.path} className="hcn-drop-link">{l.name}</Link>)}</div></div> */}
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