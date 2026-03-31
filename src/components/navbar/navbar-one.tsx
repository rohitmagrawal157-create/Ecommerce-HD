// @ts-nocheck
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                    NavbarOne — Unified Responsive v3                ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  CHANGES v3:                                                         ║
 * ║  1. Mobile spacing — tighter, balanced rows. Equal visual weight.   ║
 * ║     Row A (icons): h=56px, 40×40 tap targets, even icon gaps        ║
 * ║     Row B (search): h=56px, full-width pill + purple icon btn       ║
 * ║     Row C (chips): h=48px, scrollable, active state persists        ║
 * ║                                                                      ║
 * ║  2. Mobile smart-scroll: ENTIRE mobile header hides when scrolling  ║
 * ║     DOWN and re-appears when scrolling UP. Uses translateY(-100%)   ║
 * ║     for GPU-composited 60fps animation. Thresholds prevent accidental║
 * ║     flicker. Always visible at top of page.                         ║
 * ║     Desktop utility bar still uses v2 hide-on-any-scroll.          ║
 * ║                                                                      ║
 * ║  SCROLL LOGIC (mobile):                                             ║
 * ║  scrollY <= 10px   → always show (at top)                          ║
 * ║  DOWN > 60px delta → hide (user is reading)                        ║
 * ║  UP   > 30px delta → show (user wants to navigate)                 ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
// DATA
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
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const toSlug = (s: string) => s.toLowerCase().replace(/[\s&]+/g, '-');

const C = {
  purple:      '#6c5fc7',
  purpleLight: '#9b8fff',
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
// SCOPED CSS
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

  .hcn *, .hcn *::before, .hcn *::after { box-sizing: border-box; }
  .hcn a { text-decoration: none; }
  .hcn button { font-family: ${FONT}; }
  .hcn input[type='search']::-webkit-search-cancel-button,
  .hcn input[type='search']::-webkit-search-decoration { display: none; }
  .hcn input:focus { outline: none; }

  /* ── Breakpoint helpers ──────────────────────────────────────────── */
  @media (max-width: 767px) { .hcn .dsk { display: none !important; } }
  @media (min-width: 768px) { .hcn .mob { display: none !important; } }

  /* ── Desktop utility bar: collapses on any scroll ─────────────────── */
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

  /* ── Mobile smart-scroll wrapper ──────────────────────────────────────
     translateY(-100%) slides the whole mobile header above the viewport.
     will-change: transform promotes to its own compositor layer → 60fps. */
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

  /* Desktop icon button hover */
  .hcn-icon-btn:hover { background: ${C.purpleBg}; }
  .hcn-icon-btn:hover .hcn-icon-svg { color: ${C.purple} !important; stroke: ${C.purple} !important; }
  .hcn-icon-btn:hover .hcn-icon-label { color: ${C.purple} !important; }

  /* ── Mobile icon button: 40×40 tap target, press feedback ──────────── */
  .hcn-mob-icon {
    display:         flex;
    align-items:     center;
    justify-content: center;
    background:      none;
    border:          none;
    cursor:          pointer;
    padding:         9px 9px;
    border-radius:   10px;
    flex-shrink:     0;
    -webkit-tap-highlight-color: transparent;
    transition:      background 0.13s;
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
  .hcn-mega.is-open  { opacity: 1; transform: translateY(0) scaleY(1);       pointer-events: auto; }
  .hcn-mega.is-shut  { opacity: 0; transform: translateY(-6px) scaleY(0.97); pointer-events: none; }
  .hcn-mega-head:hover { color: ${C.purple} !important; }
  .hcn-mega-link:hover { color: ${C.purple} !important; }

  /* ── Category chips ──────────────────────────────────────────────── */
  .hcn-chips {
    display: flex; gap: 7px;
    overflow-x: auto; scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 0 1px 2px;
  }
  .hcn-chips::-webkit-scrollbar { display: none; }

  .hcn-chip {
    flex-shrink: 0;
    padding: 6px 15px;
    border-radius: 22px;
    font-size: 13px; font-weight: 600;
    font-family: ${FONT}; white-space: nowrap;
    border: 1.5px solid ${C.borderMd};
    background: ${C.white}; color: ${C.textPrimary};
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .hcn-chip.is-active { background: ${C.purple}; color: ${C.white}; border-color: ${C.purple}; }
  .hcn-chip:active    { background: ${C.purple}; color: ${C.white}; border-color: ${C.purple}; }
  .hcn-chip.sale-chip { color: ${C.sale}; border-color: ${C.saleBorder}; background: ${C.saleBg}; }
  .hcn-chip.sale-chip.is-active,
  .hcn-chip.sale-chip:active { background: ${C.sale}; color: ${C.white}; border-color: ${C.sale}; }

  /* ── Drawer ──────────────────────────────────────────────────────── */
  .hcn-drawer-link:hover { background: ${C.purpleBg} !important; color: ${C.purple} !important; }
  .hcn-drawer-sub-link:hover { color: ${C.purple} !important; }
  .hcn-drawer-btn:hover { background: #f5f5f5; }

  @keyframes hcn-shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
  .hcn-sale-shimmer { animation: hcn-shimmer 2s ease-in-out infinite; }

  /* ── Search bar ──────────────────────────────────────────────────── */
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
// SUB-COMPONENT: Tooltip
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
// SUB-COMPONENT: MobileDrawer
// ─────────────────────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (dept: string) => setExpanded(p => (p === dept ? null : dept));

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 1100, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.28s ease' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(82vw, 340px)', background: C.white, zIndex: 1200, display: 'flex', flexDirection: 'column', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '4px 0 32px rgba(0,0,0,0.18)' }}>

        <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}`, background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 19, color: '#4a4a8a', letterSpacing: -0.5, lineHeight: 1 }}>homecentre</div>
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
          <Link to="/sale" onClick={onClose} className="hcn-drawer-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid #f5f5f5`, fontWeight: 700, fontSize: 14, color: C.sale, fontFamily: FONT }}>
            🔥 Sale <LuChevronRight size={14} color={C.sale} />
          </Link>
          {Object.entries(MEGA_MENU).map(([dept, groups]) => (
            <div key={dept} style={{ borderBottom: `1px solid #f5f5f5` }}>
              <button onClick={() => toggle(dept)} className="hcn-drawer-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: C.textPrimary, fontFamily: FONT, textAlign: 'left', transition: 'background 0.15s' }}>
                {dept}
                <LuChevronDown size={14} color="#999" style={{ flexShrink: 0, transition: 'transform 0.22s ease', transform: expanded === dept ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              <div style={{ maxHeight: expanded === dept ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                <div style={{ background: '#fafaf9', padding: '8px 16px 16px' }}>
                  {groups.map((group, gi) => (
                    <div key={gi} style={{ marginBottom: 13 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 7, fontFamily: FONT }}>{group.heading}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 14px' }}>
                        {group.links.map((link, li) => <Link key={li} to="#" onClick={onClose} className="hcn-drawer-sub-link" style={{ fontSize: 13, color: '#555', fontFamily: FONT, transition: 'color 0.15s' }}>{link}</Link>)}
                      </div>
                    </div>
                  ))}
                  <Link to={`/department/${toSlug(dept)}`} onClick={onClose} style={{ fontSize: 12, fontWeight: 700, color: C.purple, fontFamily: FONT }}>View All {dept} →</Link>
                </div>
              </div>
            </div>
          ))}
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

  const [activeMenu,   setActiveMenu]   = useState<string | null>(null);
  const [searchFocused,setSearchFocused]= useState(false);
  const [searchVal,    setSearchVal]    = useState('');
  const [showFreeShip, setShowFreeShip] = useState(false);
  const [showEmi,      setShowEmi]      = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [activeChip,   setActiveChip]   = useState<string | null>(null);
  const [scrolled,     setScrolled]     = useState(false);      // desktop utility bar
  const [mobNavHidden, setMobNavHidden] = useState(false);      // mobile smart-scroll

  const navRef     = useRef<HTMLElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY= useRef(0);   // last recorded scrollY (ref = no re-render)
  const scrollDelta= useRef(0);   // accumulated px since last direction change

  // ── Smart directional scroll ─────────────────────────────────────────────
  //
  //  Logic (mobile only):
  //  ① Always at top (scrollY ≤ 10px) → always show
  //  ② Scrolling DOWN and accumulated delta > 60px → hide
  //  ③ Scrolling UP and accumulated delta > 30px   → show
  //
  //  The delta accumulator resets direction on reversal. This prevents
  //  a single small jitter triggering the transition.
  //
  const HIDE_THRESHOLD = 60;   // px down before hiding
  const SHOW_THRESHOLD = 30;   // px up before showing
  const AT_TOP         = 10;   // px from top = always show

  const handleScroll = useCallback(() => {
    const current  = window.scrollY;
    const isMobile = window.innerWidth < 768;

    // Desktop: shadow + utility bar toggle only
    setScrolled(current > 2);

    if (!isMobile) {
      setMobNavHidden(false);
      lastScrollY.current = current;
      scrollDelta.current = 0;
      return;
    }

    // ① At the very top → always show
    if (current <= AT_TOP) {
      setMobNavHidden(false);
      scrollDelta.current = 0;
      lastScrollY.current = current;
      return;
    }

    const diff = current - lastScrollY.current;

    if (diff > 0) {
      // ② Scrolling DOWN
      // If delta was negative (was scrolling up), reset to 0 first
      if (scrollDelta.current < 0) scrollDelta.current = 0;
      scrollDelta.current += diff;
      if (scrollDelta.current > HIDE_THRESHOLD) {
        setMobNavHidden(true);
      }
    } else if (diff < 0) {
      // ③ Scrolling UP
      // If delta was positive (was scrolling down), reset to 0 first
      if (scrollDelta.current > 0) scrollDelta.current = 0;
      scrollDelta.current += diff; // diff is negative, so this subtracts
      if (scrollDelta.current < -SHOW_THRESHOLD) {
        setMobNavHidden(false);
      }
    }

    lastScrollY.current = current;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Body scroll lock for drawer
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close mega on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Timer cleanup on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const onDeptEnter = (dept: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveMenu(MEGA_MENU[dept] ? dept : null);
  };
  const onDeptLeave  = () => { timerRef.current = setTimeout(() => setActiveMenu(null), 100); };
  const onMegaEnter  = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const onMegaLeave  = () => { timerRef.current = setTimeout(() => setActiveMenu(null), 100); };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header
        ref={navRef}
        className="hcn"
        style={{
          width:    '100%',
          position: 'sticky',
          top:      0,
          zIndex:   1000,
          fontFamily: FONT,
          // Desktop shadow only (mobile shadow is inside .hcn-mob-header)
          boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.10)' : '0 1px 0 #ebebeb',
          transition: 'box-shadow 0.3s ease',
        }}
      >

        {/* ══════════════════════════════════════════════════
            DESKTOP — three rows, unchanged from v2
        ══════════════════════════════════════════════════ */}

        {/* Desktop Row 1: utility bar */}
        <div className={`dsk hcn-util-bar${scrolled ? ' is-hidden' : ''}`}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ position: 'relative' }}>
                <button onMouseEnter={() => setShowFreeShip(true)} onMouseLeave={() => setShowFreeShip(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11.5, fontFamily: FONT }}>
                  <RiEBike2Line size={14} color="#9b8fff" />Free Shipping
                </button>
                <Tooltip text="Free shipping on all orders over ₹999" visible={showFreeShip} />
              </div>
              <span style={{ color: '#3a3a3a', fontSize: 11 }}>|</span>
              <div style={{ position: 'relative' }}>
                <button onMouseEnter={() => setShowEmi(true)} onMouseLeave={() => setShowEmi(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11.5, fontFamily: FONT }}>
                  <svg width="13" height="13" fill="none" stroke="#9b8fff" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><rect x="5" y="14" width="4" height="2" rx=".5" fill="#9b8fff" stroke="none"/><rect x="10" y="14" width="4" height="2" rx=".5" fill="#9b8fff" stroke="none"/></svg>
                  EMI Options
                </button>
                <Tooltip text="Easy EMI available on orders above ₹3,000" visible={showEmi} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 11.5 }}>
              {[
                { icon: <LuMapPin size={12} color="#9b8fff" />,     label: 'Delivering To', href: '#' },
                { icon: <LuSmartphone size={12} color="#9b8fff" />, label: 'Download Apps', href: '/apps' },
                { icon: <LuTruck size={12} color="#9b8fff" />,      label: 'Track Order',   href: '/track' },
                { icon: <LuCircle size={12} color="#9b8fff" />,     label: 'Help',          href: '/help' },
              ].map(({ icon, label, href }, i, arr) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center' }}>
                  <Link to={href} className="hcn-util-link" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', height: 36, fontFamily: FONT }}>{icon}{label}</Link>
                  {i < arr.length - 1 && <span style={{ color: '#3a3a3a', fontSize: 11 }}>|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Row 2: logo + search + actions */}
        <div className="dsk" style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/" aria-label="homecentre home" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#4a4a8a', letterSpacing: -0.5, lineHeight: 1, fontFamily: FONT }}>homecentre</div>
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

        {/* Desktop Row 3: dept nav + mega menu */}
        <div className="dsk" style={{ background: C.white, borderBottom: '1px solid #e8e8e8', position: 'relative' }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px' }}>
            <nav aria-label="Department navigation" style={{ display: 'flex', height: 46, overflow: 'visible' }}>
              {DEPARTMENTS.map(dept => {
                const hasMega = !!MEGA_MENU[dept];
                const isActive = activeMenu === dept;
                const isSale = dept === 'Sale';
                return (
                  <div key={dept} style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }} onMouseEnter={() => onDeptEnter(dept)} onMouseLeave={onDeptLeave}>
                    <Link to={isSale ? '/sale' : `/department/${toSlug(dept)}`} className={['hcn-dept-link', isActive?'is-active':'', isSale?'is-sale':''].join(' ')}>
                      {isSale ? <span className="hcn-sale-shimmer">{dept}</span> : dept}
                      {hasMega && <LuChevronDown size={11} style={{ transition: 'transform 0.2s ease', transform: isActive?'rotate(180deg)':'rotate(0deg)' }} />}
                    </Link>
                    {hasMega && (
                      <div className={`hcn-mega ${isActive?'is-open':'is-shut'}`} onMouseEnter={onMegaEnter} onMouseLeave={onMegaLeave}>
                        <div style={{ height: 3, background: `linear-gradient(90deg,${C.purple},${C.purpleLight},#c4b8ff)` }} />
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(MEGA_MENU[dept].length,5)},1fr)`, padding: '18px 14px 14px' }}>
                          {MEGA_MENU[dept].map((group, gi) => (
                            <div key={gi} style={{ padding: '0 14px 8px', borderRight: gi<MEGA_MENU[dept].length-1?'1px solid #f2f2f2':'none', minWidth: 130 }}>
                              <Link to="#" className="hcn-mega-head" style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#111', marginBottom: 8, fontFamily: FONT, transition: 'color 0.14s' }}>{group.heading}</Link>
                              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {group.links.map((link,li) => <li key={li}><Link to="#" className="hcn-mega-link" style={{ display: 'block', fontSize: 11.5, color: C.textMuted, fontFamily: FONT, lineHeight: 1.4, transition: 'color 0.14s' }}>{link}</Link></li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px solid #f2f2f2', background: '#fafaf9', padding: '9px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: C.textLight, fontFamily: FONT }}>{MEGA_MENU[dept].length} categories</span>
                          <Link to={`/department/${toSlug(dept)}`} style={{ fontSize: 12, fontWeight: 700, color: C.purple, fontFamily: FONT }} onMouseEnter={e=>(e.currentTarget.style.color=C.purpleHover)} onMouseLeave={e=>(e.currentTarget.style.color=C.purple)}>View All {dept} →</Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MOBILE — all 3 rows inside ONE wrapper div (.hcn-mob-header)
            ─────────────────────────────────────────────────────────────
            The wrapper slides UP on scroll-down and back DOWN on scroll-up.
            CSS: transform: translateY(-100%) / translateY(0)
            transition: 0.32s cubic-bezier (feels snappy, not laggy)
            will-change: transform → compositor layer → GPU, 60fps
        ══════════════════════════════════════════════════════════════ */}
        <div
          className={`mob hcn-mob-header${mobNavHidden ? ' is-hidden' : ''}`}
          style={{
            background: C.white,
            // Shadow appears after the user has scrolled at all
            boxShadow: scrolled ? '0 3px 16px rgba(0,0,0,0.08)' : 'none',
          }}
        >

          {/* ── MOBILE ROW A: ☰  homecentre  ···  ♡  🛒  👤 ────────────
              Height 56px. Hamburger left, logo centre-left, icons right.
              All buttons use .hcn-mob-icon for 40px+ touch targets.      */}
          <div style={{
            height:       56,
            display:      'flex',
            alignItems:   'center',
            padding:      '0 10px 0 6px',
            borderBottom: `1px solid ${C.border}`,
            gap:          0,
          }}>

            {/* Hamburger */}
            <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="hcn-mob-icon" style={{ marginRight: 2 }}>
              <LuMenu size={22} color={C.textPrimary} strokeWidth={2} />
            </button>

            {/* Logo */}
            <Link to="/" aria-label="homecentre" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginLeft: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#4a4a8a', letterSpacing: -0.3, lineHeight: 1, fontFamily: FONT }}>
                homecentre
              </span>
            </Link>

            {/* Spacer — pushes icons to far right */}
            <div style={{ flex: 1 }} />

            {/* Wishlist */}
            <button aria-label="Wishlist" className="hcn-mob-icon">
              <LuHeart size={22} color="#2a2a2a" strokeWidth={1.8} />
            </button>

            {/* Basket with badge */}
            <button aria-label="Basket" className="hcn-mob-icon">
              <div style={{ position: 'relative' }}>
                <LuShoppingBasket size={22} color="#2a2a2a" strokeWidth={1.8} />
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 16, height: 16, borderRadius: '50%',
                  background: C.purple, color: C.white,
                  fontSize: 9, fontWeight: 700, lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT,
                }}>0</span>
              </div>
            </button>

            {/* Profile */}
            <button aria-label="Account" className="hcn-mob-icon">
              <LuUser size={22} color="#2a2a2a" strokeWidth={1.8} />
            </button>

          </div>

          {/* ── MOBILE ROW B: Search bar ─────────────────────────────────
              Pill input, full width. Purple icon button on right.
              Vertical padding 9px top + bottom = 62px row height total.  */}
          <div style={{
            padding:      '9px 12px',
            borderBottom: `1px solid ${C.border}`,
            background:   C.white,
          }}>
            <div className={`hcn-search-wrap${searchFocused ? ' focused' : ''}`}>
              <LuSearch size={15} color={C.textLight} style={{ marginLeft: 14, flexShrink: 0 }} />
              <input
                type="search"
                className="hcn-search-input"
                placeholder="Search for products..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search products"
              />
              {searchVal && (
                <button onClick={() => setSearchVal('')} aria-label="Clear" style={{ ...iconBtnStyle, padding: '0 8px', color: C.textLight }}>
                  <LuX size={13} />
                </button>
              )}
              <button aria-label="Search" style={{ height: '100%', width: 50, border: 'none', borderRadius: '0 100px 100px 0', background: C.purple, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <LuSearch size={17} color={C.white} />
              </button>
            </div>
          </div>

          {/* ── MOBILE ROW C: Category chips ─────────────────────────────
              Horizontal scroll. Active chip = filled purple.
              Padding 9px top + bottom = 48px row height total.           */}
          <div style={{ padding: '9px 12px', background: C.white }}>
            <div className="hcn-chips">
              {DEPARTMENTS.map(dept => (
                <Link
                  key={dept}
                  to={dept === 'Sale' ? '/sale' : `/department/${toSlug(dept)}`}
                  onClick={() => setActiveChip(dept)}
                  className={[
                    'hcn-chip',
                    dept === 'Sale'     ? 'sale-chip' : '',
                    activeChip === dept ? 'is-active'  : '',
                  ].filter(Boolean).join(' ')}
                >
                  {dept === 'Sale' ? '🔥 Sale' : dept}
                </Link>
              ))}
            </div>
          </div>

        </div>
        {/* END .hcn-mob-header */}

      </header>

      {/* Desktop mega menu backdrop */}
      <div style={{
        position: 'fixed', inset: 0, top: 120,
        background: 'rgba(0,0,0,0.16)', zIndex: 998,
        opacity: activeMenu ? 1 : 0, pointerEvents: 'none',
        transition: 'opacity 0.16s ease',
      }} />
    </>
  );
}