// @ts-nocheck
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║         NavbarOne — Nestasia-Style Full-Width Mega Menu              ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  Mega menu layout (from reference images):                           ║
 * ║  ┌─────────┬──────────────┬──────────────┬──────────────────────┐  ║
 * ║  │ Category│  Flat list   │ Heading      │ Heading              │  ║
 * ║  │  Image  │  (no head)   │ + sub-links  │ + sub-links          │  ║
 * ║  │ 220px   │              │              │                      │  ║
 * ║  │ tall    │              │              │                      │  ║
 * ║  └─────────┴──────────────┴──────────────┴──────────────────────┘  ║
 * ║  • Full page width, flush to viewport edges                         ║
 * ║  • Left image changes per department                                ║
 * ║  • "NEW" pill badges on selected items                              ║
 * ║  • Active nav underline in brand colour                             ║
 * ║  • Category name tooltip above the dropdown (Image 2 detail)        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LuHeart, LuShoppingBasket, LuSearch, LuMapPin,
  LuTruck, LuSmartphone, LuCircle, LuX,
  LuChevronDown, LuChevronRight, LuMenu, LuUser,
} from 'react-icons/lu';
import { RiEBike2Line } from 'react-icons/ri';

// ─────────────────────────────────────────────────────────────────────────────
// BRAND COLOURS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  brand:      '#187fc1',     // primary blue
  brandHover: '#1268a0',
  brandBg:    '#f0f7fd',
  dark:       '#1c1c1c',
  text:       '#1a1a1a',
  muted:      '#555',
  light:      '#aaa',
  border:     '#efefef',
  borderMd:   '#e4e4e4',
  white:      '#ffffff',
  newBadge:   '#e8745a',     // salmon/coral for NEW badge
  sale:       '#d93030',
};
const FONT = "'DM Sans', sans-serif";

// ─────────────────────────────────────────────────────────────────────────────
// MEGA MENU DATA  — each dept has:
//   image:        URL for the left column category image
//   flatLinks:    first column items (no heading, shown as plain list)
//   groups:       remaining columns { heading, links[] } — links can be
//                 strings or { name, badge: 'NEW' }
// ─────────────────────────────────────────────────────────────────────────────

type MenuLink = string | { name: string; badge?: string; path?: string };

interface MenuGroup {
  heading: string;
  links: MenuLink[];
}

interface DeptMenu {
  image:      string;
  imageAlt:   string;
  flatLinks?: MenuLink[];
  groups:     MenuGroup[];
}

const MEGA_MENU: Record<string, DeptMenu> = {
  'UV Flatbed Printing': {
    image:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&h=400&fit=crop',
    imageAlt: 'UV Flatbed Printing',
    flatLinks: [
      'Printing on Glass',
      'Printing on Wood',
      'Printing on Foam',
      'Printing on Acrylic',
      'Printing on ACP',
      'Printing on Ceramic',
      { name: 'Shop All UV Flatbed', badge: '' },
    ],
    groups: [
      {
        heading: 'Finishes',
        links: ['Gloss Finish', 'Matte Finish', 'Satin Finish', 'Embossed Print', 'Shop All Finishes'],
      },
      {
        heading: 'Applications',
        links: ['Signage Boards', 'Display Panels', 'Promotional Items', { name: 'Custom Orders', badge: 'NEW' }, 'Shop All Applications'],
      },
    ],
  },

  'Signages Products': {
    image:    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=320&h=400&fit=crop',
    imageAlt: 'Signages Products',
    flatLinks: [
      'Safety Signage',
      { name: 'Night Glow Signs', badge: 'NEW' },
      'Acrylic Laser Cut',
      'ACP Signs',
      'Directional Signs',
      'Shop All Signages',
    ],
    groups: [
      {
        heading: 'Indoor Signage',
        links: ['Reception Signs', 'Wayfinding Signs', 'Wall Graphics', 'Shop All Indoor'],
      },
      {
        heading: 'Outdoor Signage',
        links: ['Pole Signs', 'Monument Signs', { name: 'LED Pylon Signs', badge: 'NEW' }, 'Shop All Outdoor'],
      },
    ],
  },

  'Eco Solvent': {
    image:    'https://images.unsplash.com/photo-1560472355-536de3962603?w=320&h=400&fit=crop',
    imageAlt: 'Eco Solvent Printing',
    flatLinks: [
      'Canvas Printing',
      'Wallpaper',
      'Metal Letters',
      'Eco Solvent Printing',
      'Flex Printing',
      { name: 'Backlit Film', badge: 'NEW' },
      'Shop All Eco Solvent',
    ],
    groups: [
      {
        heading: 'Media Types',
        links: ['Banner Media', 'Vinyl Stickers', 'Fabric Printing', 'One-Way Vision', 'Shop All Media'],
      },
    ],
  },

  'LED Products': {
    image:    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=320&h=400&fit=crop',
    imageAlt: 'LED Products',
    flatLinks: [
      'Scroll Display',
      'Translite Box',
      'Rollup Standee',
      'Rotating Sign',
      'Aluminum Slimbox',
      'Acrylic Sandwich',
      'Shop All Display',
    ],
    groups: [
      {
        heading: 'Signage & Screens',
        links: [
          'Glow Sign Boards',
          'Electronic Signage',
          { name: 'Neon Sign Boards', badge: 'NEW' },
          'Acrylic Boards',
          'LED Screen',
          'Bill Boards',
          'Shop All LED Signage',
        ],
      },
      {
        heading: 'Indoor LED',
        links: ['LED Strip Lights', 'Channel Letters', 'Backlit Panels', 'Shop All Indoor LED'],
      },
    ],
  },

  'CNC Cutting & Carving': {
    image:    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=320&h=400&fit=crop',
    imageAlt: 'CNC Cutting & Carving',
    flatLinks: [
      'MDF / HDHMR',
      'Stone Carving',
      'Korean Material',
      'ACP Cutting',
      { name: '3D Relief Carving', badge: 'NEW' },
      'Shop All CNC',
    ],
    groups: [
      {
        heading: 'Specialty Cuts',
        links: ['Intricate Patterns', 'Logo Cutouts', 'Lettering', 'Shop All Specialty'],
      },
    ],
  },

  'Offset Products': {
    image:    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=320&h=400&fit=crop',
    imageAlt: 'Offset Products',
    flatLinks: [
      'Calendars',
      'Presentation Folders',
      'Postcards',
      'Rack Cards',
      'Posters',
      'Labels',
      'Shop All Marketing',
    ],
    groups: [
      {
        heading: 'Stationery',
        links: [
          'Envelopes',
          'Books and Booklets',
          'Catalogues and Magazines',
          { name: 'Notepads', badge: '' },
          'Letterheads',
          'Business Cards',
          'Shop All Stationery',
        ],
      },
      {
        heading: 'Packaging',
        links: [
          'Boxes and Cardboard',
          'Brochures and Flyers',
          { name: 'Custom Packaging', badge: 'NEW' },
          'Shop All Packaging',
        ],
      },
    ],
  },
};

// Top-level page nav items
const PAGE_MENU = {
  Home: {
    links: [
      { name: 'Home Minimal',     path: '/' },
      { name: 'Home Stylish',     path: '/index-v2' },
      { name: 'Home Accessories', path: '/index-v3' },
      { name: 'Home Collection',  path: '/index-v4' },
      { name: 'Home Luxury',      path: '/index-v5' },
    ],
  },
  Pages: {
    groups: [
      {
        heading: 'Company',
        links: [
          { name: 'About Us',    path: '/about'   },
          { name: 'Price Plan',  path: '/pricing' },
          { name: 'Team Member', path: '/team'    },
          { name: 'FAQs',        path: '/faq'     },
          { name: 'Terms',       path: '/terms-and-conditions' },
        ],
      },
      {
        heading: 'Portfolio',
        links: [
          { name: 'Portfolio 1', path: '/portfolio-v1' },
          { name: 'Portfolio 2', path: '/portfolio-v2' },
          { name: '404 Error',   path: '/error'        },
        ],
      },
      {
        heading: 'Account',
        links: [
          { name: 'My Profile', path: '/my-profile' },
          { name: 'Login',      path: '/login'      },
          { name: 'Register',   path: '/register'   },
        ],
      },
      {
        heading: 'Checkout',
        links: [
          { name: 'Shipping Method', path: '/shipping-method' },
          { name: 'Payment Method',  path: '/payment-method'  },
          { name: 'Invoice',         path: '/invoice'          },
        ],
      },
    ],
  },
  Shop: {
    links: [
      { name: 'Shop Layout 01',  path: '/shop-v1'          },
      { name: 'Shop Layout 02',  path: '/shop-v2'          },
      { name: 'Shop Layout 03',  path: '/shop-v3'          },
      { name: 'Product Details', path: '/product-details'  },
      { name: 'My Cart',         path: '/cart'              },
      { name: 'Checkout',        path: '/checkout'          },
    ],
  },
};

const DEPARTMENTS = Object.keys(MEGA_MENU);
const toSlug = (s: string) => s.toLowerCase().replace(/[\s&\/]+/g, '-');
const getLinkName = (l: MenuLink): string =>
  typeof l === 'string' ? l : l.name;
const getLinkBadge = (l: MenuLink): string | undefined =>
  typeof l === 'string' ? undefined : l.badge;
const getLinkPath = (l: MenuLink, dept?: string): string =>
  typeof l !== 'string' && l.path
    ? l.path
    : `/product/${toSlug(getLinkName(l))}`;

// ─────────────────────────────────────────────────────────────────────────────
// SCOPED STYLES
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .hcn *, .hcn *::before, .hcn *::after { box-sizing: border-box; }
  .hcn a { text-decoration: none; }
  .hcn button { font-family: ${FONT}; }
  .hcn input[type='search']::-webkit-search-cancel-button { display: none; }
  .hcn input:focus { outline: none; }

  @media (max-width: 1023px) { .hcn .dsk { display: none !important; } }
  @media (min-width: 1024px) { .hcn .mob { display: none !important; } }

  /* ── Utility bar slide out on scroll ── */
  .hcn-util-bar {
    background: ${C.dark};
    max-height: 36px;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.22s ease;
    opacity: 1;
  }
  .hcn-util-bar.is-hidden { max-height: 0; opacity: 0; }

  /* ── Utility bar links ── */
  .hcn-util-link { color: #aaa; transition: color 0.15s; display: flex; align-items: center; gap: 5px; padding: 0 10px; height: 36px; font-family: ${FONT}; font-size: 11.5px; }
  .hcn-util-link:hover { color: #fff; }

  /* ── Top nav tab ── */
  .hcn-nav-link {
    display: flex; align-items: center; gap: 3px;
    padding: 0 16px; height: 100%;
    font-size: 13.5px; font-weight: 600; font-family: ${FONT};
    white-space: nowrap; color: ${C.text};
    border-bottom: 2.5px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    position: relative;
  }
  .hcn-nav-link:hover,
  .hcn-nav-link.is-open  { color: ${C.brand}; border-bottom-color: ${C.brand}; }
  .hcn-nav-link.is-active{ color: ${C.brand}; border-bottom-color: ${C.brand}; }

  /* ── FULL-WIDTH MEGA MENU ── */
  /* The outer wrapper is position:fixed so it can span 100vw regardless
     of where the trigger sits in the nav.                               */
  .hcn-mega-fw {
    position: fixed;
    left: 0;
    right: 0;
    background: ${C.white};
    border-top: 1px solid ${C.border};
    box-shadow: 0 12px 40px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05);
    z-index: 8999;
    transition: opacity 0.18s ease, transform 0.18s ease;
    transform-origin: top center;
    overflow: hidden;
  }
  .hcn-mega-fw.is-open { opacity: 1; transform: translateY(0) scaleY(1); pointer-events: auto; }
  .hcn-mega-fw.is-shut { opacity: 0; transform: translateY(-8px) scaleY(0.97); pointer-events: none; }

  /* ── Mega: flat list (first column after image) ── */
  .hcn-fl-link {
    display: block; font-size: 14px; font-family: ${FONT};
    color: ${C.text}; padding: 5px 0;
    transition: color 0.15s; font-weight: 400;
    white-space: nowrap;
  }
  .hcn-fl-link:hover { color: ${C.brand}; }
  .hcn-fl-link.shop-all { font-weight: 600; color: ${C.muted}; margin-top: 4px; }
  .hcn-fl-link.shop-all:hover { color: ${C.brand}; }

  /* ── Mega: group heading ── */
  .hcn-grp-head {
    font-size: 14px; font-weight: 700; font-family: ${FONT};
    color: ${C.text}; margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1.5px solid ${C.border};
  }

  /* ── Mega: group sub-link ── */
  .hcn-grp-link {
    display: flex; align-items: center; gap: 7px;
    font-size: 13.5px; font-family: ${FONT};
    color: ${C.muted}; padding: 4px 0;
    transition: color 0.15s;
  }
  .hcn-grp-link:hover { color: ${C.brand}; }
  .hcn-grp-link.shop-all { font-weight: 600; color: ${C.muted}; margin-top: 6px; }
  .hcn-grp-link.shop-all:hover { color: ${C.brand}; }

  /* ── NEW badge ── */
  .hcn-badge-new {
    display: inline-flex; align-items: center;
    background: ${C.newBadge}; color: #fff;
    font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
    padding: 2px 6px; border-radius: 10px;
    line-height: 1; flex-shrink: 0;
    text-transform: uppercase;
  }

  /* ── Simple dropdown (Home, Shop, Pages) ── */
  .hcn-simple-drop {
    position: absolute; top: 100%; left: 0;
    background: ${C.white};
    border: 1px solid ${C.border}; border-top: none;
    border-radius: 0 0 12px 12px;
    min-width: 200px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.10);
    z-index: 9001;
    transition: opacity 0.15s, transform 0.15s;
    transform-origin: top left;
  }
  .hcn-simple-drop.is-open { opacity: 1; transform: scaleY(1);    pointer-events: auto; }
  .hcn-simple-drop.is-shut { opacity: 0; transform: scaleY(0.96); pointer-events: none; }

  .hcn-drop-link {
    display: block; padding: 9px 18px;
    font-size: 13px; font-family: ${FONT}; color: ${C.muted};
    transition: background 0.14s, color 0.14s;
  }
  .hcn-drop-link:hover { background: ${C.brandBg}; color: ${C.brand}; }

  /* ── Pages mega drop (4-col grid) ── */
  .hcn-pages-drop {
    position: absolute; top: 100%; left: 0;
    background: ${C.white};
    border: 1px solid ${C.border}; border-top: none;
    border-radius: 0 0 12px 12px;
    width: 680px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.10);
    z-index: 9001;
    transition: opacity 0.15s, transform 0.15s;
    transform-origin: top left;
  }
  .hcn-pages-drop.is-open { opacity: 1; transform: scaleY(1);    pointer-events: auto; }
  .hcn-pages-drop.is-shut { opacity: 0; transform: scaleY(0.96); pointer-events: none; }

  /* ── Icon buttons ── */
  .hcn-icon-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; border-radius: 8px; padding: 5px 9px; transition: background 0.14s; }
  .hcn-icon-btn:hover { background: ${C.brandBg}; }
  .hcn-icon-btn:hover .hcn-ico { color: ${C.brand} !important; }
  .hcn-icon-btn:hover .hcn-lbl { color: ${C.brand} !important; }

  /* ── Search wrap ── */
  .hcn-search-wrap { display: flex; align-items: center; height: 44px; border-radius: 100px; overflow: hidden; background: #f4f3f8; border: 1.5px solid ${C.borderMd}; transition: border-color 0.2s, box-shadow 0.2s; }
  .hcn-search-wrap.focused { border-color: ${C.brand}; box-shadow: 0 0 0 3px rgba(24,127,193,0.12); }
  .hcn-search-input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; padding: 0 10px; font-size: 14px; color: ${C.text}; font-family: ${FONT}; }
  .hcn-search-input::placeholder { color: ${C.light}; }

  /* ── Mobile ── */
  .hcn-mob-header { transform: translateY(0); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); will-change: transform; }
  .hcn-mob-header.is-hidden { transform: translateY(-100%); }
  .hcn-mob-icon { display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; padding: 9px; border-radius: 10px; -webkit-tap-highlight-color: transparent; }
  .hcn-mob-icon:active { background: ${C.brandBg}; }

  /* ── Chips ── */
  .hcn-chips { display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .hcn-chips::-webkit-scrollbar { display: none; }
  .hcn-chip { flex-shrink: 0; padding: 6px 14px; border-radius: 22px; font-size: 12.5px; font-weight: 600; font-family: ${FONT}; white-space: nowrap; border: 1.5px solid ${C.borderMd}; background: ${C.white}; color: ${C.text}; cursor: pointer; transition: all 0.15s; text-decoration: none; }
  .hcn-chip:hover, .hcn-chip.is-active { background: ${C.brand}; color: #fff; border-color: ${C.brand}; }

  /* ── Drawer ── */
  .hcn-drawer-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; background: none; border: none; cursor: pointer; font-weight: 600; font-size: 14px; color: ${C.text}; font-family: ${FONT}; text-align: left; transition: background 0.14s; }
  .hcn-drawer-btn:hover { background: #f5f5f5; }
  .hcn-sub-link { font-size: 13px; color: ${C.muted}; font-family: ${FONT}; transition: color 0.14s; }
  .hcn-sub-link:hover { color: ${C.brand}; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP (utility bar)
// ─────────────────────────────────────────────────────────────────────────────

function Tooltip({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a1a', color: '#fff',
      fontSize: 11, fontFamily: FONT, fontWeight: 500,
      padding: '5px 11px', borderRadius: 5, whiteSpace: 'nowrap',
      zIndex: 9999, boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
      opacity: visible ? 1 : 0, pointerEvents: 'none',
      transition: 'opacity 0.18s',
    }}>
      <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: '#1a1a1a' }} />
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL-WIDTH MEGA MENU PANEL (Nestasia-style)
// ─────────────────────────────────────────────────────────────────────────────

function MegaMenuPanel({
  dept,
  data,
  isOpen,
  navbarBottom,
  onEnter,
  onLeave,
}: {
  dept: string;
  data: DeptMenu;
  isOpen: boolean;
  navbarBottom: number;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const IMG_WIDTH = 220;   // px — left image column width

  return (
    <div
      className={`hcn-mega-fw ${isOpen ? 'is-open' : 'is-shut'}`}
      style={{ top: navbarBottom }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Category name tooltip (Image 2 detail) */}
      {isOpen && (
        <div style={{
          position:  'absolute',
          top:       -28,
          left:      '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(26,26,26,0.9)',
          color:     '#fff',
          fontSize:  12,
          fontWeight: 600,
          fontFamily: FONT,
          padding:   '5px 14px',
          borderRadius: '6px 6px 0 0',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {dept}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'stretch', maxWidth: 1720, margin: '0 auto', padding: '0' }}>

        {/* ── LEFT: Category image ── */}
        <div style={{
          width:       IMG_WIDTH,
          minWidth:    IMG_WIDTH,
          flexShrink:  0,
          overflow:    'hidden',
          position:    'relative',
        }}>
          <img
            src={data.image}
            alt={data.imageAlt}
            style={{
              width:    '100%',
              height:   '100%',
              minHeight: 280,
              objectFit: 'cover',
              objectPosition: 'center',
              display:  'block',
            }}
          />
          {/* Subtle overlay for text legibility */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* ── CONTENT: flat list + groups ── */}
        <div style={{
          flex:    1,
          display: 'flex',
          alignItems: 'flex-start',
          padding: '24px 0',
          minWidth: 0,
        }}>

          {/* Flat list column (no heading) */}
          {data.flatLinks && data.flatLinks.length > 0 && (
            <div style={{
              minWidth:    180,
              padding:     '0 32px',
              borderRight: `1px solid ${C.border}`,
              flexShrink:  0,
            }}>
              {data.flatLinks.map((item, i) => {
                const name  = getLinkName(item);
                const badge = getLinkBadge(item);
                const isShopAll = name.toLowerCase().startsWith('shop all');
                return (
                  <Link
                    key={i}
                    to={getLinkPath(item)}
                    className={`hcn-fl-link ${isShopAll ? 'shop-all' : ''}`}
                  >
                    {name}
                    {badge === 'NEW' && <span className="hcn-badge-new" style={{ marginLeft: 6 }}>NEW</span>}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Group columns */}
          {data.groups.map((group, gi) => (
            <div
              key={gi}
              style={{
                minWidth:    180,
                padding:     '0 32px',
                borderRight: gi < data.groups.length - 1 ? `1px solid ${C.border}` : 'none',
                flexShrink:  0,
              }}
            >
              <div className="hcn-grp-head">{group.heading}</div>
              {group.links.map((item, li) => {
                const name  = getLinkName(item);
                const badge = getLinkBadge(item);
                const isShopAll = name.toLowerCase().startsWith('shop all');
                return (
                  <Link
                    key={li}
                    to={getLinkPath(item)}
                    className={`hcn-grp-link ${isShopAll ? 'shop-all' : ''}`}
                  >
                    {name}
                    {badge === 'NEW' && <span className="hcn-badge-new">NEW</span>}
                  </Link>
                );
              })}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE DRAWER
// ─────────────────────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const curr = location.pathname;
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (s: string) => setExpanded(p => p === s ? null : s);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.27s ease' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(84vw, 350px)', background: C.white, zIndex: 1200, display: 'flex', flexDirection: 'column', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '5px 0 30px rgba(0,0,0,0.16)' }}>

        {/* Header */}
        <div style={{ padding: '15px 16px', borderBottom: `1px solid ${C.border}`, background: '#f0f7fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.brand, letterSpacing: -0.5, lineHeight: 1, fontFamily: FONT }}>Infinity</div>
            <div style={{ fontSize: 9, color: C.light, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>printing &amp; signage</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${C.borderMd}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LuX size={15} color="#555" />
          </button>
        </div>

        {/* Sign in */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: C.brand, color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: FONT }}>
            SIGN UP / SIGN IN
          </button>
        </div>

        {/* Nav list */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>

          {/* Page sections */}
          {[
            { label: 'Home',    links: PAGE_MENU.Home.links },
            { label: 'Shop',    links: PAGE_MENU.Shop.links },
          ].map(sec => (
            <div key={sec.label} style={{ borderBottom: `1px solid #f5f5f5` }}>
              <button onClick={() => toggle(sec.label)} className="hcn-drawer-btn">
                {sec.label}
                <LuChevronDown size={14} color="#999" style={{ transition: 'transform 0.2s', transform: expanded === sec.label ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              <div style={{ maxHeight: expanded === sec.label ? 400 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                <div style={{ background: '#fafaf9', padding: '8px 16px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {sec.links.map((l: any, i: number) => (
                    <Link key={i} to={l.path} onClick={onClose} className="hcn-sub-link">{l.name}</Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Contact */}
          <Link to="/contact" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: `1px solid #f5f5f5`, fontSize: 14, fontWeight: 600, color: C.text, fontFamily: FONT }}>
            Contact <LuChevronRight size={14} color="#aaa" />
          </Link>

          {/* Departments */}
          {DEPARTMENTS.map(dept => {
            const data = MEGA_MENU[dept];
            const allLinks: MenuLink[] = [
              ...(data.flatLinks || []),
              ...data.groups.flatMap(g => g.links),
            ];
            return (
              <div key={dept} style={{ borderBottom: `1px solid #f5f5f5` }}>
                <button onClick={() => toggle(dept)} className="hcn-drawer-btn">
                  {dept}
                  <LuChevronDown size={14} color="#999" style={{ transition: 'transform 0.2s', transform: expanded === dept ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                <div style={{ maxHeight: expanded === dept ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.32s ease' }}>
                  <div style={{ background: '#fafaf9', padding: '10px 16px 14px' }}>
                    {/* Category image thumbnail */}
                    <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 12, height: 100 }}>
                      <img src={data.image} alt={dept} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {/* Flat links */}
                    {(data.flatLinks || []).map((item, i) => {
                      const name = getLinkName(item);
                      const badge = getLinkBadge(item);
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                          <Link to={getLinkPath(item)} onClick={onClose} className="hcn-sub-link">{name}</Link>
                          {badge === 'NEW' && <span className="hcn-badge-new">NEW</span>}
                        </div>
                      );
                    })}
                    {/* Groups */}
                    {data.groups.map((group, gi) => (
                      <div key={gi} style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: 6, fontFamily: FONT }}>{group.heading}</div>
                        {group.links.map((item, li) => {
                          const name = getLinkName(item);
                          const badge = getLinkBadge(item);
                          return (
                            <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                              <Link to={getLinkPath(item)} onClick={onClose} className="hcn-sub-link">{name}</Link>
                              {badge === 'NEW' && <span className="hcn-badge-new">NEW</span>}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <Link to={`/department/${toSlug(dept)}`} onClick={onClose} style={{ display: 'inline-block', marginTop: 10, fontSize: 12, fontWeight: 700, color: C.brand, fontFamily: FONT }}>
                      View All {dept} →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer utils */}
        <div style={{ borderTop: `1px solid ${C.border}`, background: '#fafaf9', padding: '11px 16px', flexShrink: 0 }}>
          {[
            { icon: <RiEBike2Line size={14} />, label: 'Fast Delivery Available' },
            { icon: <LuMapPin size={13} />,     label: 'Delivering To Your City' },
            { icon: <LuTruck size={13} />,      label: 'Track Your Order' },
            { icon: <LuSmartphone size={13} />, label: 'Download Our App' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 12.5, color: '#555', fontFamily: FONT }}>
              <span style={{ color: C.brand, display: 'flex' }}>{icon}</span>
              {label}
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
  const location    = useLocation();
  const curr        = location.pathname;

  const [activeMenu,    setActiveMenu]    = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal,     setSearchVal]     = useState('');
  const [showFreeShip,  setShowFreeShip]  = useState(false);
  const [showEmi,       setShowEmi]       = useState(false);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [mobHidden,     setMobHidden]     = useState(false);
  const [navbarBottom,  setNavbarBottom]  = useState(0);    // px from top — where mega menu starts
  const [activeChip,    setActiveChip]    = useState<string | null>(null);

  const navRef    = useRef<HTMLElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef    = useRef<number | null>(null);
  const lastY     = useRef(0);
  const delta     = useRef(0);
  const scrolled_ = useRef(false);
  const mobHid_   = useRef(false);

  // ── Measure navbar bottom for mega panel positioning ──
  const measureNavbar = useCallback(() => {
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      setNavbarBottom(rect.bottom);
    }
  }, []);

  useEffect(() => {
    measureNavbar();
    window.addEventListener('resize', measureNavbar);
    return () => window.removeEventListener('resize', measureNavbar);
  }, [measureNavbar]);

  // Re-measure when scrolled changes (utility bar appears/disappears)
  useEffect(() => { measureNavbar(); }, [scrolled, measureNavbar]);

  // ── Scroll behaviour ──
  const onScroll = useCallback(() => {
    const y = window.scrollY;
    if (rafRef.current != null) { window.cancelAnimationFrame(rafRef.current); }
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const isMobile = window.innerWidth < 1024;

      if (y > 2 !== scrolled_.current) {
        scrolled_.current = y > 2;
        setScrolled(y > 2);
      }

      if (!isMobile) {
        if (mobHid_.current) { mobHid_.current = false; setMobHidden(false); }
        lastY.current = y; delta.current = 0; return;
      }
      if (y <= 10) {
        if (mobHid_.current) { mobHid_.current = false; setMobHidden(false); }
        lastY.current = y; delta.current = 0; return;
      }
      const diff = y - lastY.current;
      if (diff > 0) { if (delta.current < 0) delta.current = 0; delta.current += diff; if (delta.current > 60) { mobHid_.current = true; setMobHidden(true); } }
      else if (diff < 0) { if (delta.current > 0) delta.current = 0; delta.current += diff; if (delta.current < -30) { mobHid_.current = false; setMobHidden(false); } }
      lastY.current = y;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (rafRef.current) window.cancelAnimationFrame(rafRef.current); };
  }, [onScroll]);

  useEffect(() => { document.body.style.overflow = drawerOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [drawerOpen]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const enter = (key: string) => { if (timerRef.current) clearTimeout(timerRef.current); setActiveMenu(key); measureNavbar(); };
  const leave = () => { timerRef.current = setTimeout(() => setActiveMenu(null), 120); };
  const keep  = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  return (
    <>
      <style>{STYLES}</style>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ═══════════════════════════════════════════════════════
          STICKY HEADER
      ═══════════════════════════════════════════════════════ */}
      <header
        ref={navRef}
        className="hcn"
        style={{
          width:      '100%',
          position:   'sticky',
          top:        0,
          zIndex:     1000,
          fontFamily: FONT,
          boxShadow:  scrolled ? '0 2px 20px rgba(0,0,0,0.09)' : '0 1px 0 #ebebeb',
          transition: 'box-shadow 0.3s',
        }}
      >

        {/* ── UTILITY BAR (desktop) ── */}
        <div className={`dsk hcn-util-bar${scrolled ? ' is-hidden' : ''}`}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ position: 'relative' }}>
                <button onMouseEnter={() => setShowFreeShip(true)} onMouseLeave={() => setShowFreeShip(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11.5, fontFamily: FONT }}>
                  <RiEBike2Line size={14} color={C.brand} /> Fast Delivery
                </button>
                <Tooltip text="Fast delivery on all print orders" visible={showFreeShip} />
              </div>
              <span style={{ color: '#3a3a3a', fontSize: 10 }}>|</span>
              <div style={{ position: 'relative' }}>
                <button onMouseEnter={() => setShowEmi(true)} onMouseLeave={() => setShowEmi(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11.5, fontFamily: FONT }}>
                  <svg width="13" height="13" fill="none" stroke={C.brand} strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><rect x="5" y="14" width="4" height="2" rx=".5" fill={C.brand} stroke="none"/><rect x="10" y="14" width="4" height="2" rx=".5" fill={C.brand} stroke="none"/></svg>
                  EMI Options
                </button>
                <Tooltip text="Easy EMI on bulk orders" visible={showEmi} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { icon: <LuMapPin size={13} color={C.brand}/>,     label: 'Delivering To', href: '#' },
                { icon: <LuSmartphone size={13} color={C.brand}/>, label: 'Download Apps', href: '/apps' },
                { icon: <LuTruck size={13} color={C.brand}/>,      label: 'Track Order',   href: '/track' },
                { icon: <LuCircle size={13} color={C.brand}/>,     label: 'Help',          href: '/help' },
              ].map(({ icon, label, href }, i, arr) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center' }}>
                  <Link to={href} className="hcn-util-link">{icon}{label}</Link>
                  {i < arr.length - 1 && <span style={{ color: '#3a3a3a', fontSize: 10 }}>|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── LOGO / SEARCH / ACTIONS (desktop) ── */}
        <div className="dsk" style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px', height: 66, display: 'flex', alignItems: 'center', gap: 18 }}>

            {/* Logo */}
            <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, color: C.brand, letterSpacing: -0.5, lineHeight: 1, fontFamily: FONT }}>Infinity</div>
                <div style={{ fontSize: 8, color: '#bbb', letterSpacing: '0.17em', textTransform: 'uppercase', marginTop: 3, fontFamily: FONT }}>printing &amp; signage</div>
              </div>
              <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', paddingBottom: 2 }}>
                {[6,9,7,5,8].map((h, i) => <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: i%2===0 ? C.brand : '#7bbde0' }}/>)}
              </div>
            </Link>

            {/* Search */}
            <div style={{ flex: 1, minWidth: 0, maxWidth: 620 }}>
              <div className={`hcn-search-wrap${searchFocused ? ' focused' : ''}`}>
                <LuSearch size={15} color="#aaa" style={{ marginLeft: 14, flexShrink: 0 }} />
                <input type="search" className="hcn-search-input" placeholder="Search printing, signage, products..." value={searchVal} onChange={e => setSearchVal(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
                {searchVal && <button onClick={() => setSearchVal('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px', color: C.light, display: 'flex', alignItems: 'center' }}><LuX size={13}/></button>}
                <button style={{ height: '100%', padding: '0 22px', border: 'none', borderRadius: '0 100px 100px 0', background: C.brand, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}>Search</button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', flexShrink: 0 }}>
              <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.brand, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', marginRight: 6 }}>SIGN IN</button>
              <button className="hcn-icon-btn" aria-label="Wishlist">
                <LuHeart className="hcn-ico" size={21} color="#444" />
                <span className="hcn-lbl" style={{ fontSize: 10.5, color: C.muted, fontFamily: FONT, fontWeight: 500 }}>Wishlist</span>
              </button>
              <button className="hcn-icon-btn" aria-label="Basket">
                <div style={{ position: 'relative' }}>
                  <LuShoppingBasket className="hcn-ico" size={21} color="#444" />
                  <span style={{ position: 'absolute', top: -7, right: -7, width: 16, height: 16, borderRadius: '50%', background: C.brand, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0</span>
                </div>
                <span className="hcn-lbl" style={{ fontSize: 10.5, color: C.muted, fontFamily: FONT, fontWeight: 500 }}>Basket</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP NAV BAR (page links + departments) ── */}
        <div className="dsk" style={{ background: C.white, borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 24px' }}>
            <nav style={{ display: 'flex', height: 48, overflow: 'visible', position: 'relative' }}>

              {/* Page nav: Home */}
              <div
                style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                onMouseEnter={() => enter('Home')}
                onMouseLeave={leave}
              >
                <Link to="#" className={`hcn-nav-link ${activeMenu === 'Home' ? 'is-open' : ''} ${['/','index-v2','index-v3'].includes(curr) ? 'is-active' : ''}`}>
                  Home <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Home' ? 'rotate(180deg)' : 'rotate(0)' }} />
                </Link>
                <div className={`hcn-simple-drop ${activeMenu === 'Home' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}>
                  <div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} />
                  {PAGE_MENU.Home.links.map(l => (
                    <Link key={l.path} to={l.path} className="hcn-drop-link">{l.name}</Link>
                  ))}
                </div>
              </div>

              {/* Pages */}
              <div
                style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                onMouseEnter={() => enter('Pages')}
                onMouseLeave={leave}
              >
                <Link to="#" className={`hcn-nav-link ${activeMenu === 'Pages' ? 'is-open' : ''}`}>
                  Pages <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Pages' ? 'rotate(180deg)' : 'rotate(0)' }} />
                </Link>
                <div className={`hcn-pages-drop ${activeMenu === 'Pages' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}>
                  <div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '18px 14px 14px', gap: 0 }}>
                    {PAGE_MENU.Pages.groups.map((g, gi) => (
                      <div key={gi} style={{ padding: '0 14px', borderRight: gi < 3 ? `1px solid ${C.border}` : 'none' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111', marginBottom: 8, fontFamily: FONT }}>{g.heading}</div>
                        {g.links.map(l => (
                          <Link key={l.path} to={l.path} className="hcn-grp-link" style={{ fontSize: 12, color: C.muted, fontFamily: FONT, padding: '3px 0', display: 'block' }}>{l.name}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shop */}
              <div
                style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                onMouseEnter={() => enter('Shop')}
                onMouseLeave={leave}
              >
                <Link to="#" className={`hcn-nav-link ${activeMenu === 'Shop' ? 'is-open' : ''} ${curr.startsWith('/shop') || curr === '/cart' ? 'is-active' : ''}`}>
                  Shop <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: activeMenu === 'Shop' ? 'rotate(180deg)' : 'rotate(0)' }} />
                </Link>
                <div className={`hcn-simple-drop ${activeMenu === 'Shop' ? 'is-open' : 'is-shut'}`} onMouseEnter={keep} onMouseLeave={leave}>
                  <div style={{ height: 3, background: `linear-gradient(90deg,${C.brand},#7bbde0)` }} />
                  {PAGE_MENU.Shop.links.map(l => (
                    <Link key={l.path} to={l.path} className="hcn-drop-link">{l.name}</Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Link to="/contact" className={`hcn-nav-link ${curr === '/contact' ? 'is-active' : ''}`}>Contact</Link>
              </div>

              {/* Separator */}
              <div style={{ width: 1, background: C.border, margin: '12px 8px', flexShrink: 0 }} />

              {/* Printing / Signage departments — FULL-WIDTH mega menu */}
              {DEPARTMENTS.map(dept => {
                const deptData = MEGA_MENU[dept];
                const isOpen   = activeMenu === dept;
                const isActive = curr === `/department/${toSlug(dept)}`;
                return (
                  <div
                    key={dept}
                    style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                    onMouseEnter={() => enter(dept)}
                    onMouseLeave={leave}
                  >
                    <Link
                      to={`/department/${toSlug(dept)}`}
                      className={`hcn-nav-link ${isOpen || isActive ? 'is-active' : ''}`}
                    >
                      {dept}
                      <LuChevronDown size={11} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── MOBILE HEADER ── */}
        <div className={`mob hcn-mob-header${mobHidden ? ' is-hidden' : ''}`} style={{ background: C.white, boxShadow: scrolled ? '0 3px 14px rgba(0,0,0,0.07)' : 'none' }}>
          {/* Row A: menu + logo + icons */}
          <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: `1px solid ${C.border}`, gap: 0 }}>
            <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="hcn-mob-icon" style={{ marginRight: 4 }}>
              <LuMenu size={22} color={C.text} strokeWidth={2} />
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginLeft: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 20, color: C.brand, letterSpacing: -0.3, fontFamily: FONT }}>Infinity</span>
            </Link>
            <div style={{ flex: 1 }} />
            <button aria-label="Wishlist"  className="hcn-mob-icon"><LuHeart size={22} color="#2a2a2a" strokeWidth={1.8} /></button>
            <button aria-label="Basket"    className="hcn-mob-icon">
              <div style={{ position: 'relative' }}>
                <LuShoppingBasket size={22} color="#2a2a2a" strokeWidth={1.8} />
                <span style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', background: C.brand, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0</span>
              </div>
            </button>
            <button aria-label="Account"   className="hcn-mob-icon"><LuUser size={22} color="#2a2a2a" strokeWidth={1.8} /></button>
          </div>

          {/* Row B: search */}
          <div style={{ padding: '9px 12px', borderBottom: `1px solid ${C.border}` }}>
            <div className={`hcn-search-wrap${searchFocused ? ' focused' : ''}`}>
              <LuSearch size={15} color={C.light} style={{ marginLeft: 13, flexShrink: 0 }} />
              <input type="search" className="hcn-search-input" placeholder="Search printing, signage..." value={searchVal} onChange={e => setSearchVal(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
              {searchVal && <button onClick={() => setSearchVal('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px', color: C.light, display: 'flex' }}><LuX size={13}/></button>}
              <button style={{ height: '100%', width: 48, border: 'none', borderRadius: '0 100px 100px 0', background: C.brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><LuSearch size={16} color="#fff"/></button>
            </div>
          </div>

          {/* Row C: chips */}
          <div style={{ padding: '8px 12px', background: C.white }}>
            <div className="hcn-chips">
              {['Home','Shop','Contact', ...DEPARTMENTS].map(label => (
                <Link
                  key={label}
                  to={label === 'Home' ? '/' : label === 'Shop' ? '/shop-v1' : label === 'Contact' ? '/contact' : `/department/${toSlug(label)}`}
                  onClick={() => setActiveChip(label)}
                  className={`hcn-chip ${activeChip === label ? 'is-active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </header>

      {/* ── FULL-WIDTH MEGA MENU PANELS (rendered outside header for true 100vw) ── */}
      {DEPARTMENTS.map(dept => (
        <MegaMenuPanel
          key={dept}
          dept={dept}
          data={MEGA_MENU[dept]}
          isOpen={activeMenu === dept}
          navbarBottom={navbarBottom}
          onEnter={keep}
          onLeave={leave}
        />
      ))}

      {/* Backdrop */}
      <div style={{
        position:      'fixed', inset: 0,
        top:           navbarBottom,
        background:    'rgba(0,0,0,0.18)',
        zIndex:        8998,
        opacity:       DEPARTMENTS.includes(activeMenu ?? '') ? 1 : 0,
        pointerEvents: 'none',
        transition:    'opacity 0.18s ease',
      }} />
    </>
  );
}