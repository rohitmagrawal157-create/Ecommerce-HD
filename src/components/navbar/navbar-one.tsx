// @ts-nocheck
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║            NavbarOne — Unified with Full Page Routes v4              ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  Adds: Home, Pages (mega menu), Shop, Blog, Contact                  ║
 * ║  Preserves all existing furniture departments, smart scroll, etc.    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LuHeart,
  LuShoppingBasket,
  LuSearch,
  LuMapPin,
  LuTruck,
  LuSmartphone,
  LuCircle,
  LuX,
  LuChevronDown,
  LuChevronRight,
  LuMenu,
  LuUser,
} from 'react-icons/lu';
import { RiEBike2Line } from 'react-icons/ri';

// ─────────────────────────────────────────────────────────────────────────────
// DATA – Furniture Departments (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const MEGA_MENU: Record<string, { heading: string; links: string[] }[]> = {
  'Living Room': [
    { heading: 'Sofas',        links: ['3 Seater Sofas', '2 Seater Sofas', '1 Seater Sofas', 'Sofa Sets', 'Corner Sofas'] },
    { heading: 'Recliners',    links: ['3 Seater Recliners', '2 Seater Recliners', 'Recliner Sets'] },
    { heading: 'Chairs',       links: ['Accent Chairs', 'Folding Chairs', 'Cafe Chairs', 'Plastic Chairs'] },
    { heading: 'Tables',       links: ['Centre Tables', 'End Tables', 'Console Tables', 'Nesting Tables'] },
    { heading: 'TV & Media',   links: ['TV Consoles', 'TV Units', 'Wall Shelves', 'Corner Shelves'] },
  ],
  'Bedroom': [
    { heading: 'Beds',         links: ['King Beds', 'Queen Beds', 'Single Beds', 'Bunk Beds'] },
    { heading: 'Wardrobes',    links: ['2 Door Wardrobes', '3 Door Wardrobes', '4 Door Wardrobes', 'Sliding Wardrobes'] },
    { heading: 'Mattresses',   links: ['King Mattresses', 'Queen Mattresses', 'Single Mattresses'] },
    { heading: 'Storage',      links: ['Bed Side Tables', 'Chest of Drawers', 'Dresser Mirrors'] },
  ],
  'Dining Room': [
    { heading: 'Dining Sets',  links: ['4 Seater Dining Sets', '6 Seater Dining Sets', '8 Seater Dining Sets'] },
    { heading: 'Dining Tables',links: ['4 Seater Tables', '6 Seater Tables', '8 Seater Tables'] },
    { heading: 'Bar Furniture',links: ['Bar Cabinet', 'Bar Stools', 'Serving Trolleys'] },
    { heading: 'Seating',      links: ['Dining Chairs', 'Dining Benches', 'Crockery Units'] },
  ],
  'Decor': [
    { heading: 'Accessories',  links: ['Figurines', 'Vases', 'Candle Holders', 'Table Accents', 'Clocks'] },
    { heading: 'Lighting',     links: ['Table Lamps', 'Wall Lamps', 'Hanging Lamps', 'Floor Lamps', 'String Lights'] },
    { heading: 'Wall Decor',   links: ['Wall Accents', 'Decorative Mirrors', 'Photo Frames', 'Paintings'] },
    { heading: 'Fragrance',    links: ['Candles', 'Diffusers', 'Aroma Oils', 'Room Sprays'] },
  ],
  'Kitchen': [
    { heading: 'Storage',      links: ['Containers & Jars', 'Bottles', 'Flasks', 'Lunch Boxes'] },
    { heading: 'Cookware',     links: ['Cookware Sets', 'Pots & Pans', 'Kadhai & Woks', 'Pressure Cookers'] },
    { heading: 'Kitchenware',  links: ['Kitchen Trolleys', 'Knives & Scissors', 'Chopping Boards'] },
    { heading: 'Linens',       links: ['Aprons', 'Pot Holders & Mittens', 'Kitchen Towels'] },
  ],
  'Furnishings': [
    { heading: 'Bedding',      links: ['Double Bedsheets', 'Single Bedsheets', 'Bedding Sets', 'Blankets & Quilts'] },
    { heading: 'Cushions',     links: ['Cushion Covers', 'Filled Cushions', 'Floor Cushions'] },
    { heading: 'Curtains',     links: ['Door Curtains', 'Window Curtains', 'Blinds', 'Rods & Accessories'] },
    { heading: 'Floor',        links: ['Carpets & Rugs', 'Dhurries', 'Doormats'] },
  ],
  'Tableware': [
    { heading: 'Serving',      links: ['Trays & Platters', 'Glasses & Jugs', 'Bar Accessories'] },
    { heading: 'Crockery',     links: ['Bowls', 'Plates', 'Mugs', 'Cups & Saucers', 'Dinner Sets'] },
    { heading: 'Cutlery',      links: ['Spoons', 'Cutlery Sets', 'Cutlery Holders'] },
    { heading: 'Table Linens', links: ['Placemats', 'Table Runners', 'Table Cloths', 'Trivets & Coasters'] },
  ],
  'Bath & Laundry': [
    { heading: 'Bath Linen',   links: ['Towels', 'Robes', 'Bathmats'] },
    { heading: 'Accessories',  links: ['Soap Dispensers', 'Soap Dishes', 'Bath Sets', 'Shower Curtains'] },
    { heading: 'Laundry',      links: ['Laundry Baskets', 'Cloth Dryers', 'Hangers & Hooks', 'Dustbins'] },
  ],
  'Gifting': [
    { heading: 'By Occasion',  links: ['Housewarming', 'Wedding Gifts', 'Anniversary', 'Birthday'] },
    { heading: 'By Recipient', links: ['Gifts for Him', 'Gifts for Her'] },
    { heading: 'Gift Cards',   links: ['Online Gift Card'] },
    { heading: 'By Price',     links: ['Under ₹200', 'Under ₹500', 'Under ₹1000', 'Above ₹2000'] },
  ],
};

const DEPARTMENTS = [
  'Sale', 'Living Room', 'Bedroom', 'Dining Room',
  'Decor', 'Kitchen', 'Furnishings', 'Tableware', 'Bath & Laundry', 'Gifting',
];

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Page navigation data (Home, Pages, Shop, Blog, Contact)
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_MENU = {
  Home: {
    links: [
      { name: 'Home Minimal',    path: '/' },
      { name: 'Home Stylish',    path: '/index-v2' },
      { name: 'Home Accessories',path: '/index-v3' },
      { name: 'Home Collection', path: '/index-v4' },
      { name: 'Home Luxury',     path: '/index-v5' },
      { name: 'Home Retro',      path: '/index-v6' },
    ],
  },
  Pages: {
    megaGroups: [
      {
        heading: 'Company',
        links: [
          { name: 'About Us',            path: '/about' },
          { name: 'Price Plan',          path: '/pricing' },
          { name: 'Team Member',         path: '/team' },
          { name: 'Clients',             path: '/our-clients' },
          { name: 'FAQs',                path: '/faq' },
          { name: 'Terms & Conditions',  path: '/terms-and-conditions' },
        ],
      },
      {
        heading: 'Portfolio',
        links: [
          { name: 'Portfolio 1',          path: '/portfolio-v1' },
          { name: 'Portfolio 2',          path: '/portfolio-v2' },
          { name: 'Portfolio 3',          path: '/portfolio-v3' },
          { name: 'Portfolio Details 1',  path: '/portfolio-details-v1' },
          { name: 'Portfolio Details 2',  path: '/portfolio-details-v2' },
          { name: '404 Error',            path: '/error' },
        ],
      },
      {
        heading: 'Account',
        links: [
          { name: 'My Profile',           path: '/my-profile' },
          { name: 'Login',                path: '/login' },
          { name: 'Register',             path: '/register' },
          { name: 'Forget Password',      path: '/forger-password' },
          { name: 'Coming Soon',          path: '/coming-soon' },
          { name: 'Thank You',            path: '/thank-you' },
        ],
      },
      {
        heading: 'Checkout',
        links: [
          { name: 'Shipping Method',      path: '/shipping-method' },
          { name: 'Payment Method',       path: '/payment-method' },
          { name: 'Invoice',              path: '/invoice' },
          { name: 'Payment Confirmation', path: '/payment-confirmation' },
          { name: 'Payment Completed',    path: '/payment-success' },
          { name: 'Payment Failure',      path: '/payment-failure' },
        ],
      },
    ],
  },
  Shop: {
    links: [
      { name: 'Shop Layout 01',   path: '/shop-v1' },
      { name: 'Shop Layout 02',   path: '/shop-v2' },
      { name: 'Shop Layout 03',   path: '/shop-v3' },
      { name: 'Shop Layout 04',   path: '/shop-v4' },
      { name: 'Product Details',  path: '/product-details' },
      { name: 'My Cart',          path: '/cart' },
      { name: 'Checkout',         path: '/checkout' },
    ],
  },
  Blog: {
    links: [
      { name: 'Blog Layout 1',    path: '/blog-v1' },
      { name: 'Blog Layout 2',    path: '/blog-v2' },
      { name: 'Blog Details 1',   path: '/blog-details-v1' },
      { name: 'Blog Details 2',   path: '/blog-details-v2' },
      { name: 'Blog Details 3',   path: '/blog-details-v3' },
      { name: 'Blog Tag',         path: '/blog-tag' },
    ],
  },
  Contact: {
    singlePath: '/contact',
  },
};

// Helper: check if current route matches any of the given paths
const isActiveRoute = (currentPath: string, paths: string | string[]): boolean => {
  if (typeof paths === 'string') return currentPath === paths;
  return paths.includes(currentPath);
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const toSlug = (s: string) => s.toLowerCase().replace(/[\s&]+/g, '-');

const C = {
  // purple:      '#6c5fc7',
  purple:'#187fc1',
  purpleLight: '#187fc1',
  purpleBg:    '#f5f3ff',
  purpleHover: '#5a4db5',
  sale:        '#d93030',
  saleBg:      '#fff8f8',
  saleBorder:  '#ffd0d0',
  dark:        '#1c1c1c',
  textPrimary: '#1a1a1a',
  textMuted:   '#666',
  textLight:   '#aaa',
  border:      '#efefef',
  borderMd:    '#e4e4e4',
  bg:          '#fafaf9',
  bgInput:     '#f4f3f8',
  white:       '#ffffff',
};

const FONT = "'DM Sans', sans-serif";

const iconBtnStyle: React.CSSProperties = {
  background:     'none',
  border:         'none',
  cursor:         'pointer',
  padding:        0,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  borderRadius:   10,
};

// ─────────────────────────────────────────────────────────────────────────────
// SCOPED CSS (unchanged from your original)
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

  .hcn *, .hcn *::before, .hcn *::after { box-sizing: border-box; }
  .hcn a { text-decoration: none; }
  .hcn button { font-family: ${FONT}; }
  .hcn input[type='search']::-webkit-search-cancel-button,
  .hcn input[type='search']::-webkit-search-decoration { display: none; }
  .hcn input:focus { outline: none; }

  @media (max-width: 767px) { .hcn .dsk { display: none !important; } }
  @media (min-width: 768px) { .hcn .mob { display: none !important; } }

  .hcn-util-bar {
    background: ${C.dark};
    max-height: 36px;
    overflow: hidden;
    opacity: 1;
    transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1),
                opacity    0.22s ease;
  }
  .hcn-util-bar.is-hidden {
    max-height: 0;
    opacity: 0;
  }

  .hcn-mob-header {
    transform: translateY(0);
    will-change: transform;
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hcn-mob-header.is-hidden {
    transform: translateY(-100%);
  }

  .hcn-util-link { color: #aaa; transition: color 0.15s; }
  .hcn-util-link:hover { color: #fff; }

  .hcn-icon-btn:hover { background: ${C.purpleBg}; }
  .hcn-icon-btn:hover .hcn-icon-svg { color: ${C.purple} !important; stroke: ${C.purple} !important; }
  .hcn-icon-btn:hover .hcn-icon-label { color: ${C.purple} !important; }

  .hcn-mob-icon {
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
    padding: 9px 9px; border-radius: 10px; flex-shrink: 0;
    -webkit-tap-highlight-color: transparent; transition: background 0.13s;
  }
  .hcn-mob-icon:active { background: ${C.purpleBg}; }

  .hcn-dept-link {
    display: flex; align-items: center; gap: 3px;
    padding: 0 13px; height: 100%;
    font-size: 13px; font-weight: 600;
    font-family: ${FONT}; white-space: nowrap;
    color: ${C.textPrimary};
    border-bottom: 2.5px solid transparent;
    transition: color 0.14s, border-color 0.14s;
  }
  .hcn-dept-link:hover { color: ${C.purple}; border-bottom-color: ${C.purple}; }
  .hcn-dept-link.is-active { color: ${C.purple}; border-bottom-color: ${C.purple}; }
  .hcn-dept-link.is-sale { color: ${C.sale}; }
  .hcn-dept-link.is-sale:hover { color: #b72020; border-bottom-color: ${C.sale}; }

  .hcn-mega {
    position: absolute; top: 100%; left: 0;
    background: ${C.white};
    border: 1px solid #ebebeb; border-top: none;
    border-radius: 0 0 16px 16px;
    min-width: 640px; max-width: 900px; width: max-content;
    box-shadow: 0 20px 48px rgba(0,0,0,0.13), 0 4px 8px rgba(0,0,0,0.05);
    transform-origin: top center;
    z-index: 9000;
    transition: opacity 0.16s ease, transform 0.16s ease;
  }
  .hcn-mega.is-open  { opacity: 1; transform: translateY(0) scaleY(1); pointer-events: auto; }
  .hcn-mega.is-shut  { opacity: 0; transform: translateY(-6px) scaleY(0.97); pointer-events: none; }
  .hcn-mega-head:hover { color: ${C.purple} !important; }
  .hcn-mega-link:hover { color: ${C.purple} !important; }

  .hcn-chips {
    display: flex; gap: 7px;
    overflow-x: auto; scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 0 1px 2px;
  }
  .hcn-chips::-webkit-scrollbar { display: none; }

  .hcn-chip {
    flex-shrink: 0; padding: 6px 15px; border-radius: 22px;
    font-size: 13px; font-weight: 600; font-family: ${FONT}; white-space: nowrap;
    border: 1.5px solid ${C.borderMd};
    background: ${C.white}; color: ${C.textPrimary};
    cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .hcn-chip.is-active { background: ${C.purple}; color: ${C.white}; border-color: ${C.purple}; }
  .hcn-chip:active    { background: ${C.purple}; color: ${C.white}; border-color: ${C.purple}; }
  .hcn-chip.sale-chip { color: ${C.sale}; border-color: ${C.saleBorder}; background: ${C.saleBg}; }
  .hcn-chip.sale-chip.is-active,
  .hcn-chip.sale-chip:active { background: ${C.sale}; color: ${C.white}; border-color: ${C.sale}; }

  .hcn-drawer-link:hover { background: ${C.purpleBg} !important; color: ${C.purple} !important; }
  .hcn-drawer-sub-link:hover { color: ${C.purple} !important; }
  .hcn-drawer-btn:hover { background: #f5f5f5; }

  @keyframes hcn-shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
  .hcn-sale-shimmer { animation: hcn-shimmer 2s ease-in-out infinite; }

  .hcn-search-wrap {
    display: flex; align-items: center;
    height: 44px; border-radius: 100px; overflow: hidden;
    background: ${C.bgInput};
    border: 1.5px solid ${C.borderMd};
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .hcn-search-wrap.focused {
    border-color: ${C.purple};
    box-shadow: 0 0 0 3px rgba(108,95,199,0.12);
  }
  .hcn-search-input {
    flex: 1; min-width: 0;
    background: transparent; border: none; outline: none;
    padding: 0 10px; font-size: 14px;
    color: ${C.textPrimary}; font-family: ${FONT};
  }
  .hcn-search-input::placeholder { color: ${C.textLight}; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: Tooltip (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function Tooltip({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a1a', color: C.white, fontSize: 11, fontFamily: FONT,
      fontWeight: 500, padding: '6px 12px', borderRadius: 6,
      whiteSpace: 'nowrap', zIndex: 9999,
      boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 0.18s ease',
    }}>
      <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: '#1a1a1a' }} />
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: MobileDrawer (updated to include new page sections)
// ─────────────────────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (section: string) => setExpanded(p => (p === section ? null : section));

  // Build all sections for mobile
  const allSections = [
    { type: 'link', label: 'Sale', path: '/sale', isSale: true },
    ...Object.keys(MEGA_MENU).map(dept => ({ type: 'mega', label: dept, data: MEGA_MENU[dept] })),
    { type: 'simple', label: 'Home', links: PAGE_MENU.Home.links },
    { type: 'megaPage', label: 'Pages', groups: PAGE_MENU.Pages.megaGroups },
    { type: 'simple', label: 'Shop', links: PAGE_MENU.Shop.links },
    { type: 'simple', label: 'Blog', links: PAGE_MENU.Blog.links },
    { type: 'link', label: 'Contact', path: '/contact', isSale: false },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 1100, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.28s ease' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(82vw, 340px)', background: C.white, zIndex: 1200, display: 'flex', flexDirection: 'column', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '4px 0 32px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}`, background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 19, color: '#4a4a8a', letterSpacing: -0.5, lineHeight: 1 }}>Infinity</div>
            <div style={{ fontSize: 9, color: C.textLight, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 3 }}>a landmark group company</div>
          </div>
          <button onClick={onClose} aria-label="Close menu" style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${C.borderMd}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LuX size={15} color="#555" />
          </button>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`, color: C.white, fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: FONT }}>
            SIGN UP / SIGN IN
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {allSections.map((section, idx) => {
            if (section.type === 'link') {
              return (
                <Link
                  key={section.label}
                  to={section.path}
                  onClick={onClose}
                  className="hcn-drawer-link"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid #f5f5f5`, fontWeight: section.isSale ? 700 : 500, fontSize: 14, color: section.isSale ? C.sale : C.textPrimary, fontFamily: FONT }}
                >
                  {section.isSale ? '🔥 Sale' : section.label}
                  <LuChevronRight size={14} color={section.isSale ? C.sale : '#aaa'} />
                </Link>
              );
            }
            if (section.type === 'simple') {
              const isActive = section.links.some(link => link.path === currentPath);
              return (
                <div key={section.label} style={{ borderBottom: `1px solid #f5f5f5` }}>
                  <button onClick={() => toggle(section.label)} className="hcn-drawer-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: isActive ? C.purpleBg : 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: isActive ? C.purple : C.textPrimary, fontFamily: FONT, textAlign: 'left', transition: 'background 0.15s' }}>
                    {section.label}
                    <LuChevronDown size={14} color="#999" style={{ transition: 'transform 0.22s ease', transform: expanded === section.label ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>
                  <div style={{ maxHeight: expanded === section.label ? 400 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                    <div style={{ background: '#fafaf9', padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {section.links.map((link, i) => (
                        <Link key={i} to={link.path} onClick={onClose} className="hcn-drawer-sub-link" style={{ fontSize: 13, color: currentPath === link.path ? C.purple : '#555', fontFamily: FONT, transition: 'color 0.15s' }}>
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            if (section.type === 'mega' || section.type === 'megaPage') {
              const groups = section.type === 'mega' ? section.data : section.groups;
              return (
                <div key={section.label} style={{ borderBottom: `1px solid #f5f5f5` }}>
                  <button onClick={() => toggle(section.label)} className="hcn-drawer-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: C.textPrimary, fontFamily: FONT, textAlign: 'left' }}>
                    {section.label}
                    <LuChevronDown size={14} color="#999" style={{ transition: 'transform 0.22s ease', transform: expanded === section.label ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>
                  <div style={{ maxHeight: expanded === section.label ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                    <div style={{ background: '#fafaf9', padding: '8px 16px 16px' }}>
                      {groups.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: 13 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 7, fontFamily: FONT }}>{group.heading}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 14px' }}>
                            {group.links.map((link, li) => (
                              <Link key={li} to={link.path || '#'} onClick={onClose} className="hcn-drawer-sub-link" style={{ fontSize: 13, color: '#555', fontFamily: FONT, transition: 'color 0.15s' }}>
                                {link.name || link}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                      {section.type === 'mega' && (
                        <Link to={`/department/${toSlug(section.label)}`} onClick={onClose} style={{ fontSize: 12, fontWeight: 700, color: C.purple, fontFamily: FONT }}>
                          View All {section.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, background: '#fafaf9', padding: '12px 16px', flexShrink: 0 }}>
          {[
            { icon: <RiEBike2Line size={14} />, label: 'Free Shipping over ₹999' },
            { icon: <LuMapPin size={13} />,     label: 'Delivering To' },
            { icon: <LuTruck size={13} />,      label: 'Track Furniture Order' },
            { icon: <LuSmartphone size={13} />, label: 'Download our Apps' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 12.5, color: '#555', fontFamily: FONT }}>
              <span style={{ color: C.purple, display: 'flex' }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function NavbarOne() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [activeMenu,   setActiveMenu]   = useState<string | null>(null);
  const [searchFocused,setSearchFocused]= useState(false);
  const [searchVal,    setSearchVal]    = useState('');
  const [showFreeShip, setShowFreeShip] = useState(false);
  const [showEmi,      setShowEmi]      = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [activeChip,   setActiveChip]   = useState<string | null>(null);
  const [scrolled,     setScrolled]     = useState(false);
  const [mobNavHidden, setMobNavHidden] = useState(false);

  const navRef     = useRef<HTMLElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY= useRef(0);
  const scrollDelta= useRef(0);

  const HIDE_THRESHOLD = 60;
  const SHOW_THRESHOLD = 30;
  const AT_TOP         = 10;

  const handleScroll = useCallback(() => {
    const current  = window.scrollY;
    const isMobile = window.innerWidth < 768;

    setScrolled(current > 2);

    if (!isMobile) {
      setMobNavHidden(false);
      lastScrollY.current = current;
      scrollDelta.current = 0;
      return;
    }

    if (current <= AT_TOP) {
      setMobNavHidden(false);
      scrollDelta.current = 0;
      lastScrollY.current = current;
      return;
    }

    const diff = current - lastScrollY.current;

    if (diff > 0) {
      if (scrollDelta.current < 0) scrollDelta.current = 0;
      scrollDelta.current += diff;
      if (scrollDelta.current > HIDE_THRESHOLD) setMobNavHidden(true);
    } else if (diff < 0) {
      if (scrollDelta.current > 0) scrollDelta.current = 0;
      scrollDelta.current += diff;
      if (scrollDelta.current < -SHOW_THRESHOLD) setMobNavHidden(false);
    }

    lastScrollY.current = current;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const onDeptEnter = (label: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveMenu(label);
  };
  const onDeptLeave  = () => { timerRef.current = setTimeout(() => setActiveMenu(null), 100); };
  const onMegaEnter  = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const onMegaLeave  = () => { timerRef.current = setTimeout(() => setActiveMenu(null), 100); };

  // ── Combined desktop navigation items (page items + furniture departments) ──
  const desktopNavItems = [
    { type: 'simple-dropdown', label: 'Home', data: PAGE_MENU.Home.links, activePaths: PAGE_MENU.Home.links.map(l => l.path) },
    { type: 'mega-dropdown',   label: 'Pages', groups: PAGE_MENU.Pages.megaGroups, activePaths: [] },
    { type: 'simple-dropdown', label: 'Shop', data: PAGE_MENU.Shop.links, activePaths: PAGE_MENU.Shop.links.map(l => l.path) },
    { type: 'simple-dropdown', label: 'Blog', data: PAGE_MENU.Blog.links, activePaths: PAGE_MENU.Blog.links.map(l => l.path) },
    { type: 'link',            label: 'Contact', path: '/contact', activePaths: ['/contact'] },
    ...DEPARTMENTS.map(dept => ({
      type: 'mega-furniture',
      label: dept,
      hasMega: !!MEGA_MENU[dept],
      activePaths: dept === 'Sale' ? ['/sale'] : [`/department/${toSlug(dept)}`],
    })),
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header ref={navRef} className="hcn" style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000, fontFamily: FONT, boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.10)' : '0 1px 0 #ebebeb', transition: 'box-shadow 0.3s ease' }}>

        {/* Desktop utility bar (unchanged) */}
        <div className={`dsk hcn-util-bar${scrolled ? ' is-hidden' : ''}`}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ position: 'relative' }}>
                <button onMouseEnter={() => setShowFreeShip(true)} onMouseLeave={() => setShowFreeShip(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11.5, fontFamily: FONT }}>
                  <RiEBike2Line size={14} color="#187fc1" />Free Shipping
                </button>
                <Tooltip text="Free shipping on all orders over ₹999" visible={showFreeShip} />
              </div>
              <span style={{ color: '#3a3a3a', fontSize: 11 }}>|</span>
              <div style={{ position: 'relative' }}>
                <button onMouseEnter={() => setShowEmi(true)} onMouseLeave={() => setShowEmi(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11.5, fontFamily: FONT }}>
                  <svg width="13" height="13" fill="none" stroke="#187fc1" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><rect x="5" y="14" width="4" height="2" rx=".5" fill="#9b8fff" stroke="none"/><rect x="10" y="14" width="4" height="2" rx=".5" fill="#9b8fff" stroke="none"/></svg>
                  EMI Options
                </button>
                <Tooltip text="Easy EMI available on orders above ₹3,000" visible={showEmi} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 11.5 }}>
              {[
                { icon: <LuMapPin size={14} color="#187fc1" />, label: 'Delivering To', href: '#' },
                { icon: <LuSmartphone size={14} color="#187fc1" />, label: 'Download Apps', href: '/apps' },
                { icon: <LuTruck size={14} color="#187fc1" />, label: 'Track Order', href: '/track' },
                { icon: <LuCircle size={14} color="#187fc1" />, label: 'Help', href: '/help' },
              ].map(({ icon, label, href }, i, arr) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center' }}>
                  <Link to={href} className="hcn-util-link" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', height: 36, fontFamily: FONT }}>{icon}{label}</Link>
                  {i < arr.length - 1 && <span style={{ color: '#3a3a3a', fontSize: 11 }}>|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Row 2: logo + search + actions (unchanged) */}
        <div className="dsk" style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/" aria-label="Infinity home" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#4a4a8a', letterSpacing: -0.5, lineHeight: 1, fontFamily: FONT }}>Infinity</div>
                <div style={{ fontSize: 8, color: '#bbb', letterSpacing: '0.17em', textTransform: 'uppercase', marginTop: 2, fontFamily: FONT }}>a landmark group company</div>
              </div>
              <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', paddingBottom: 2 }}>
                {[6,9,7,5,8].map((h,i) => <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: i%2===0?'#7b6fcc':'#b8a9f0' }} />)}
              </div>
            </Link>
            <div style={{ flex: 1, minWidth: 0, maxWidth: 640 }}>
              <div className={`hcn-search-wrap${searchFocused?' focused':''}`}>
                <LuSearch size={15} color="#aaa" style={{ marginLeft: 14, flexShrink: 0 }} />
                <input type="search" className="hcn-search-input" placeholder="Search for products..." value={searchVal} onChange={e => setSearchVal(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} aria-label="Search products" />
                {searchVal && <button onClick={() => setSearchVal('')} aria-label="Clear" style={{ ...iconBtnStyle, padding: '0 6px', color: C.textLight }}><LuX size={13} /></button>}
                <button style={{ height: '100%', padding: '0 22px', border: 'none', borderRadius: '0 100px 100px 0', background: C.purple, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', flexShrink: 0 }}>Search</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', flexShrink: 0 }}>
              <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.purple, color: C.white, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}>SIGN IN</button>
              <button className="hcn-icon-btn" aria-label="Wishlist" style={{ ...iconBtnStyle, flexDirection: 'column', gap: 2, padding: '6px 10px' }}>
                <LuHeart className="hcn-icon-svg" size={21} color="#444" />
                <span className="hcn-icon-label" style={{ fontSize: 10.5, color: C.textMuted, fontFamily: FONT, fontWeight: 500 }}>Wishlist</span>
              </button>
              <button className="hcn-icon-btn" aria-label="Basket" style={{ ...iconBtnStyle, flexDirection: 'column', gap: 2, padding: '6px 10px' }}>
                <div style={{ position: 'relative' }}>
                  <LuShoppingBasket className="hcn-icon-svg" size={21} color="#444" />
                  <span style={{ position: 'absolute', top: -7, right: -7, width: 16, height: 16, borderRadius: '50%', background: C.purple, color: C.white, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>0</span>
                </div>
                <span className="hcn-icon-label" style={{ fontSize: 10.5, color: C.textMuted, fontFamily: FONT, fontWeight: 500 }}>Basket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Row 3: combined navigation (page items + furniture departments) */}
        <div className="dsk" style={{ background: C.white, borderBottom: '1px solid #e8e8e8', position: 'relative' }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px' }}>
            <nav aria-label="Main navigation" style={{ display: 'flex', height: 46, overflow: 'visible' }}>
              {desktopNavItems.map((item) => {
                const isActive = item.activePaths ? isActiveRoute(currentPath, item.activePaths) : false;
                const isOpen = activeMenu === item.label;

                // Simple link (Contact)
                if (item.type === 'link') {
                  return (
                    <div key={item.label} style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <Link to={item.path} className={`hcn-dept-link ${isActive ? 'is-active' : ''}`}>
                        {item.label}
                      </Link>
                    </div>
                  );
                }

                // Simple dropdown (Home, Shop, Blog)
                if (item.type === 'simple-dropdown') {
                  return (
                    <div
                      key={item.label}
                      style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      onMouseEnter={() => onDeptEnter(item.label)}
                      onMouseLeave={onDeptLeave}
                    >
                      <Link
                        to="#"
                        className={`hcn-dept-link ${isActive ? 'is-active' : ''}`}
                      >
                        {item.label}
                        <LuChevronDown size={11} style={{ transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </Link>
                      <div
                        className={`hcn-mega ${isOpen ? 'is-open' : 'is-shut'}`}
                        onMouseEnter={onMegaEnter}
                        onMouseLeave={onMegaLeave}
                        style={{ minWidth: 220, width: 'auto' }}
                      >
                        <div style={{ height: 3, background: `linear-gradient(90deg,${C.purple},${C.purpleLight},#c4b8ff)` }} />
                        <ul style={{ padding: '12px 0', margin: 0, listStyle: 'none' }}>
                          {item.data.map((link: { name: string; path: string }) => (
                            <li key={link.path}>
                              <Link
                                to={link.path}
                                className="hcn-mega-link"
                                style={{ display: 'block', padding: '6px 20px', fontSize: 13, color: C.textMuted, fontFamily: FONT, transition: 'color 0.14s' }}
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                }

                // Mega dropdown (Pages)
                if (item.type === 'mega-dropdown') {
                  return (
                    <div
                      key={item.label}
                      style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      onMouseEnter={() => onDeptEnter(item.label)}
                      onMouseLeave={onDeptLeave}
                    >
                      <Link to="#" className={`hcn-dept-link ${isActive ? 'is-active' : ''}`}>
                        {item.label}
                        <LuChevronDown size={11} style={{ transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </Link>
                      <div
                        className={`hcn-mega ${isOpen ? 'is-open' : 'is-shut'}`}
                        onMouseEnter={onMegaEnter}
                        onMouseLeave={onMegaLeave}
                        style={{ minWidth: 720, maxWidth: 960 }}
                      >
                        <div style={{ height: 3, background: `linear-gradient(90deg,${C.purple},${C.purpleLight},#c4b8ff)` }} />
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(4,1fr)`, padding: '18px 14px 14px' }}>
                          {item.groups.map((group: any, idx: number) => (
                            <div key={idx} style={{ padding: '0 14px', borderRight: idx < item.groups.length-1 ? '1px solid #f2f2f2' : 'none' }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111', marginBottom: 8, fontFamily: FONT }}>{group.heading}</div>
                              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                {group.links.map((link: any) => (
                                  <li key={link.path}>
                                    <Link to={link.path} className="hcn-mega-link" style={{ fontSize: 11.5, color: C.textMuted, fontFamily: FONT, lineHeight: 1.8, transition: 'color 0.14s' }}>
                                      {link.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px solid #f2f2f2', background: '#fafaf9', padding: '9px 20px', textAlign: 'right' }}>
                          <Link to="#" style={{ fontSize: 12, fontWeight: 700, color: C.purple, fontFamily: FONT }}>All Pages →</Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Furniture departments (mega-furniture)
                if (item.type === 'mega-furniture') {
                  const isSale = item.label === 'Sale';
                  return (
                    <div
                      key={item.label}
                      style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      onMouseEnter={() => onDeptEnter(item.label)}
                      onMouseLeave={onDeptLeave}
                    >
                      <Link
                        to={isSale ? '/sale' : `/department/${toSlug(item.label)}`}
                        className={`hcn-dept-link ${isOpen ? 'is-active' : ''} ${isSale ? 'is-sale' : ''}`}
                      >
                        {isSale ? <span className="hcn-sale-shimmer">{item.label}</span> : item.label}
                        {item.hasMega && <LuChevronDown size={11} style={{ transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
                      </Link>
                      {item.hasMega && (
                        <div className={`hcn-mega ${isOpen ? 'is-open' : 'is-shut'}`} onMouseEnter={onMegaEnter} onMouseLeave={onMegaLeave}>
                          <div style={{ height: 3, background: `linear-gradient(90deg,${C.purple},${C.purpleLight},#c4b8ff)` }} />
                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(MEGA_MENU[item.label].length,5)},1fr)`, padding: '18px 14px 14px' }}>
                            {MEGA_MENU[item.label].map((group: any, gi: number) => (
                              <div key={gi} style={{ padding: '0 14px 8px', borderRight: gi < MEGA_MENU[item.label].length-1 ? '1px solid #f2f2f2' : 'none', minWidth: 130 }}>
                                <Link to="#" className="hcn-mega-head" style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#111', marginBottom: 8, fontFamily: FONT, transition: 'color 0.14s' }}>{group.heading}</Link>
                                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  {group.links.map((link: string, li: number) => (
                                    <li key={li}>
                                      <Link to="#" className="hcn-mega-link" style={{ display: 'block', fontSize: 11.5, color: C.textMuted, fontFamily: FONT, lineHeight: 1.4, transition: 'color 0.14s' }}>{link}</Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          <div style={{ borderTop: '1px solid #f2f2f2', background: '#fafaf9', padding: '9px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: C.textLight, fontFamily: FONT }}>{MEGA_MENU[item.label].length} categories</span>
                            <Link to={`/department/${toSlug(item.label)}`} style={{ fontSize: 12, fontWeight: 700, color: C.purple, fontFamily: FONT }}>View All {item.label} →</Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </nav>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────
            MOBILE HEADER (3 rows, smart-scroll)
        ─────────────────────────────────────────────────────────────── */}
        <div className={`mob hcn-mob-header${mobNavHidden ? ' is-hidden' : ''}`} style={{ background: C.white, boxShadow: scrolled ? '0 3px 16px rgba(0,0,0,0.08)' : 'none' }}>
          {/* Row A: hamburger, logo, icons */}
          <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 10px 0 6px', borderBottom: `1px solid ${C.border}`, gap: 0 }}>
            <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="hcn-mob-icon" style={{ marginRight: 2 }}>
              <LuMenu size={22} color={C.textPrimary} strokeWidth={2} />
            </button>
            <Link to="/" aria-label="Infinity" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginLeft: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#4a4a8a', letterSpacing: -0.3, lineHeight: 1, fontFamily: FONT }}>Infinity</span>
            </Link>
            <div style={{ flex: 1 }} />
            <button aria-label="Wishlist" className="hcn-mob-icon"><LuHeart size={22} color="#2a2a2a" strokeWidth={1.8} /></button>
            <button aria-label="Basket" className="hcn-mob-icon">
              <div style={{ position: 'relative' }}>
                <LuShoppingBasket size={22} color="#2a2a2a" strokeWidth={1.8} />
                <span style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', background: C.purple, color: C.white, fontSize: 9, fontWeight: 700, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>0</span>
              </div>
            </button>
            <button aria-label="Account" className="hcn-mob-icon"><LuUser size={22} color="#2a2a2a" strokeWidth={1.8} /></button>
          </div>

          {/* Row B: Search bar */}
          <div style={{ padding: '9px 12px', borderBottom: `1px solid ${C.border}`, background: C.white }}>
            <div className={`hcn-search-wrap${searchFocused ? ' focused' : ''}`}>
              <LuSearch size={15} color={C.textLight} style={{ marginLeft: 14, flexShrink: 0 }} />
              <input type="search" className="hcn-search-input" placeholder="Search for products..." value={searchVal} onChange={e => setSearchVal(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} aria-label="Search products" />
              {searchVal && <button onClick={() => setSearchVal('')} aria-label="Clear" style={{ ...iconBtnStyle, padding: '0 8px', color: C.textLight }}><LuX size={13} /></button>}
              <button aria-label="Search" style={{ height: '100%', width: 50, border: 'none', borderRadius: '0 100px 100px 0', background: C.purple, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><LuSearch size={17} color={C.white} /></button>
            </div>
          </div>

          {/* Row C: Category chips (show both page items and some departments) */}
          <div style={{ padding: '9px 12px', background: C.white }}>
            <div className="hcn-chips">
              {['Home', 'Shop', 'Blog', 'Contact', ...DEPARTMENTS.slice(0, 5)].map(label => (
                <Link
                  key={label}
                  to={label === 'Home' ? '/' : label === 'Shop' ? '/shop-v1' : label === 'Blog' ? '/blog-v1' : label === 'Contact' ? '/contact' : label === 'Sale' ? '/sale' : `/department/${toSlug(label)}`}
                  onClick={() => setActiveChip(label)}
                  className={`hcn-chip ${activeChip === label ? 'is-active' : ''} ${label === 'Sale' ? 'sale-chip' : ''}`}
                >
                  {label === 'Sale' ? '🔥 Sale' : label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for mega menu */}
      <div style={{ position: 'fixed', inset: 0, top: 120, background: 'rgba(0,0,0,0.16)', zIndex: 998, opacity: activeMenu ? 1 : 0, pointerEvents: 'none', transition: 'opacity 0.16s ease' }} />
    </>
  );
}