// src/components/top-picks.tsx
// @ts-nocheck

/**
 * TopPicks — Amazon-style Mobile Grid
 * ─────────────────────────────────────
 * Mobile:  2 rows × 4 columns — ALL 8 visible at once, NO horizontal scroll
 *          Card = square image + label + number badge
 *          Matches the Amazon "category grid" layout exactly
 *
 * Desktop: same 2×4 grid but larger cards with hover effects
 *
 * Key mobile fix vs original:
 *   ❌ Old: w-[72%] horizontal scroll — only 1.5 cards visible
 *   ✅ New: grid-cols-4 on ALL breakpoints — 4 per row, 2 rows = all visible
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface PickItem {
  href:       string;
  src:        string;
  alt:        string;
  label:      string;
  badge?:     string;   // e.g. "New", "Sale", "Hot"
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA — 8 products in display order
// ─────────────────────────────────────────────────────────────────────────────

const TOP_PICKS: PickItem[] = [
  {
    href:  '/product/portrait-frames',
    src:   'https://imgs.search.brave.com/pO3_geDNJr-PHRVvzlSlXdVEI8SCMrHvO8C_TPKAtpE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rb3Rh/cnQuaW4vY2RuL3No/b3AvZmlsZXMvZWZm/ZWN0MDFfNS5qcGc_/dj0xNzIxMjU0NDA2/JndpZHRoPTUzMw',
    alt:   'Elegant Portrait Frames',
    label: 'Portrait Frames',
    badge: 'New',
  },
  {
    href:  '/product/canvas-painting',
    src:   'https://imgs.search.brave.com/xFTkEltVU-Fcai1S5B6E96-71Q6WDcSLGbEv3mJDxsc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDIzLzEw/LzM1MTU4NDYwMC9R/US9HTS9WWC8xOTc4/OTQwMDkvcHJpbnRl/ZC1jYW52YXMtNTAw/eDUwMC5qcGc',
    alt:   'Handmade Canvas Painting',
    label: 'Canvas Painting',
    badge: 'Hot',
  },
  {
    href:  '/product/temple-art',
    src:   'https://imgs.search.brave.com/iSJDT4eaWXl9svug-yyvq083ZbpszVix4vJplcwZp_I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvaG9tZS10ZW1w/bGUveS9qL3MvMzUt/NjAtMzYtc2h0NC1z/aGl2b2phLTEzMC1v/cmlnaW5hbC1pbWFo/amRmOWF1eHp3ZGIy/LmpwZWc_cT03MA',
    alt:   'Temple Art Print',
    label: 'Temple Art',
  },
  {
    href:  '/product/wall-murals',
    src:   'https://imgs.search.brave.com/WRQWwv92NnMS5xJ59lU6PMBKvVKPoPoAHRkS1FId_ZA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/OTE3LURaOGU3TEwu/anBn',
    alt:   'Large Wall Murals',
    label: 'Wall Murals',
    badge: 'Sale',
  },
  {
    href:  '/product/wallpapers',
    src:   'https://imgs.search.brave.com/FaPylEVXEQAg2Jj09k4z7mjQwyEC4ANjHucK95wN9Xs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saWZl/bmNvbG9ycy5pbi9j/ZG4vc2hvcC9maWxl/cy9LdXN1bS1JbmRp/YW4tRmxvcmFsLUpo/YXJva2hhLTExMTEu/d2VicD92PTE3NTM2/MjE3MDAmd2lkdGg9/MzIw',
    alt:   'Modern Wallpapers',
    label: 'Wallpapers',
  },
  {
    href:  '/product/customize-blind',
    src:   'https://imgs.search.brave.com/UMY9_2-06fuMpicI-QsTkC8Ofik_dK-K95NZBmJVsF0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YmxpbmRzdGVyLmNv/bS9jZG4tY2dpL2lt/YWdlL2Zvcm1hdD1h/dXRvLHdpZHRoPTM4/NDAvc2l0ZS91cGxv/YWRzL2NhdGVnb3Jp/ZXMvd29vZC1ibGlu/ZHMvSE9NRVBBR0Ut/Q0FURU9HUlktV09P/RC1ST0xMT1ZFUi5q/cGc',
    alt:   'Customizable Wood Blinds',
    label: 'Customize Blind',
  },
  {
    href:  '/product/neon-signage',
    src:   'https://imgs.search.brave.com/HmDJxfWjB5hRZqdcv4eGpsgJOCgBDwZ33VWtzjD2DAU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NjUyMDY1OTU2NDAt/NmNmZDkwZTBhZTA5/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZhdXRv/PWZvcm1hdCZmaXQ9/Y3JvcCZpeGxpYj1y/Yi00LjEuMCZpeGlk/PU0zd3hNakEzZkRC/OE1IeHpaV0Z5WTJo/OE1UaDhmRzVsYjI0/bE1qQnphV2R1ZkdW/dWZEQjhmREI4Zkh3/dw',
    alt:   'Custom Neon Signs',
    label: 'Neon Signage',
    badge: 'Hot',
  },
  {
    href:  '/product/back-lit',
    src:   'https://imgs.search.brave.com/hFfkLA9JoRsvLL0HcTsKldXpRoKuGwhQsggD2SzBHLo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2FtZWxiYWNrZGlz/cGxheXMuY29tL3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDIzLzA3/L1ZlY3Rvci1GcmFt/ZS1Fc3NlbnRpYWwt/MDEtTGVmdC1EYXJr/LWxpZ2h0aW5nLnBu/Zw',
    alt:   'Backlit LED Art',
    label: 'Back Lit',
    badge: 'New',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BADGE COLOURS — maps badge label → background colour
// ─────────────────────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  New:  '#16a34a',
  Hot:  '#dc2626',
  Sale: '#d97706',
};

// ─────────────────────────────────────────────────────────────────────────────
// SCOPED CSS — injected once
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
  /* ── Card ──────────────────────────────────────────────────────────
     White bg, subtle border, border-radius.
     On mobile the gap between cards is 2px — tight like Amazon.
     On desktop hover lifts the card.                                  */
  .tp-card {
    display:         flex;
    flex-direction:  column;
    background:      #ffffff;
    border-radius:   8px;
    border:          1px solid #e8e8e8;
    overflow:        hidden;
    text-decoration: none;
    color:           inherit;
    transition:      transform 0.22s ease, box-shadow 0.22s ease,
                     border-color 0.22s ease;
    /* Prevent layout shift from failed images */
    min-width:       0;
  }

  /* Desktop: lift on hover */
  @media (min-width: 768px) {
    .tp-card:hover {
      transform:    translateY(-4px);
      box-shadow:   0 12px 28px rgba(0,0,0,0.10);
      border-color: #c49a6c;
    }
    .tp-card:hover .tp-img {
      transform: scale(1.06);
    }
  }

  /* Mobile: subtle tap feedback */
  @media (max-width: 767px) {
    .tp-card:active {
      transform:   scale(0.97);
      border-color: #c49a6c;
    }
  }

  /* ── Image wrapper — always square ──────────────────────────────── */
  .tp-img-wrap {
    position:    relative;
    width:       100%;
    aspect-ratio: 1 / 1;
    overflow:    hidden;
    background:  #f5f5f5;
    flex-shrink: 0;
  }

  .tp-img {
    width:      100%;
    height:     100%;
    object-fit: cover;
    display:    block;
    transition: transform 0.45s ease;
  }

  /* ── Image fallback ─────────────────────────────────────────────── */
  .tp-img-fallback {
    width:           100%;
    height:          100%;
    display:         flex;
    align-items:     center;
    justify-content: center;
    background:      #f0ede8;
    font-size:       10px;
    color:           #999;
    text-align:      center;
    padding:         4px;
    line-height:     1.3;
  }

  /* ── Number badge ───────────────────────────────────────────────── */
  .tp-num-badge {
    position:        absolute;
    top:             6px;
    left:            6px;
    width:           22px;
    height:          22px;
    border-radius:   50%;
    display:         flex;
    align-items:     center;
    justify-content: center;
    font-size:       10px;
    font-weight:     800;
    color:           #fff;
    background:      linear-gradient(135deg, #c49a6c, #a07040);
    box-shadow:      0 2px 6px rgba(0,0,0,0.25);
    line-height:     1;
    z-index:         2;
    user-select:     none;
  }

  /* Desktop: slightly larger badge */
  @media (min-width: 768px) {
    .tp-num-badge {
      width:     28px;
      height:    28px;
      font-size: 12px;
      top:       8px;
      left:      8px;
    }
  }

  /* ── Status badge (New / Hot / Sale) ────────────────────────────── */
  .tp-status-badge {
    position:     absolute;
    top:          6px;
    right:        6px;
    font-size:    9px;
    font-weight:  700;
    color:        #fff;
    padding:      2px 6px;
    border-radius: 3px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    z-index:       2;
    line-height:   1.4;
  }

  /* ── Label area ─────────────────────────────────────────────────── */
  .tp-label-wrap {
    padding:     6px 6px 8px;
    flex:        1;
    display:     flex;
    align-items: flex-start;
  }

  .tp-label {
    font-size:    11px;
    font-weight:  600;
    color:        #1a1a1a;
    line-height:  1.35;
    /* Clamp to 2 lines */
    display:      -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow:     hidden;
    width:        100%;
    margin:       0;
  }

  /* Desktop: bigger label */
  @media (min-width: 768px) {
    .tp-label-wrap { padding: 10px 12px 12px; }
    .tp-label       { font-size: 13px; }
  }

  /* ── Grid wrapper ────────────────────────────────────────────────── */
  .tp-grid {
    display:               grid;
    /* MOBILE: exactly 4 columns — matches Amazon layout                */
    grid-template-columns: repeat(4, 1fr);
    /* Very tight gap on mobile — 3px matches Amazon density           */
    gap:                   3px;
  }

  /* Desktop: loosen the gap */
  @media (min-width: 768px) {
    .tp-grid { gap: 16px; }
  }
  @media (min-width: 1024px) {
    .tp-grid { gap: 20px; }
  }

  /* ── Section heading ────────────────────────────────────────────── */
  .tp-heading {
    font-size:   20px;
    font-weight: 800;
    color:       #1e1e2a;
    line-height: 1.2;
    margin:      0 0 4px;
    font-family: 'Playfair Display', Georgia, serif;
  }
  @media (min-width: 768px) {
    .tp-heading { font-size: 32px; }
  }
  @media (min-width: 1024px) {
    .tp-heading { font-size: 40px; }
  }

  /* ── Divider between the two rows ──────────────────────────────── */
  .tp-row-divider {
    width:            100%;
    height:           1px;
    background:       #f0ede8;
    /* On mobile: no gap, rows sit flush — divider only on desktop   */
  }
  @media (min-width: 768px) {
    .tp-row-divider { display: none; }
  }

  /* ── View all button ────────────────────────────────────────────── */
  .tp-view-all {
    display:         inline-flex;
    align-items:     center;
    gap:             8px;
    padding:         10px 24px;
    border-radius:   50px;
    font-size:       13px;
    font-weight:     700;
    border:          2px solid #c49a6c;
    color:           #c49a6c;
    text-decoration: none;
    background:      transparent;
    letter-spacing:  0.04em;
    transition:      background 0.2s, color 0.2s;
    cursor:          pointer;
  }
  .tp-view-all:hover {
    background: #c49a6c;
    color:      #fff;
  }
  .tp-view-all:active { transform: scale(0.97); }

  @media (min-width: 768px) {
    .tp-view-all { font-size: 14px; padding: 12px 32px; }
  }

  /* ── Tap hint text (mobile only) ───────────────────────────────── */
  .tp-tap-hint {
    font-size:  11px;
    color:      #aaa;
    text-align: center;
    margin-top: 8px;
    display:    block;
  }
  @media (min-width: 768px) {
    .tp-tap-hint { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tp-card, .tp-img { transition: none; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: ProductCard
// ─────────────────────────────────────────────────────────────────────────────

function ProductCard({ item, index }: { item: PickItem; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={item.href}
      className="tp-card"
      aria-label={item.label}
    >
      {/* Image */}
      <div className="tp-img-wrap">
        {/* Number badge */}
        <span className="tp-num-badge" aria-hidden="true">
          {index + 1}
        </span>

        {/* Status badge (New / Hot / Sale) */}
        {item.badge && (
          <span
            className="tp-status-badge"
            style={{ background: BADGE_COLORS[item.badge] || '#555' }}
            aria-label={item.badge}
          >
            {item.badge}
          </span>
        )}

        {imgError ? (
          <div className="tp-img-fallback">
            <span>{item.label}</span>
          </div>
        ) : (
          <img
            src={item.src}
            alt={item.alt}
            className="tp-img"
            loading={index < 4 ? 'eager' : 'lazy'}
            onError={() => setImgError(true)}
            draggable={false}
          />
        )}
      </div>

      {/* Label */}
      <div className="tp-label-wrap">
        <p className="tp-label">{item.label}</p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function TopPicks() {
  // Inject styles once
  useEffect(() => {
    const ID = 'top-picks-styles';
    if (document.getElementById(ID)) return;
    const tag       = document.createElement('style');
    tag.id          = ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);

  // Two rows of 4
  const row1 = TOP_PICKS.slice(0, 4);
  const row2 = TOP_PICKS.slice(4, 8);

  return (
    <section style={{ width: '100%', background: '#fff', padding: 'clamp(20px, 4vw, 64px) 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(8px, 3vw, 24px)' }}>

        {/* ── Section header ──────────────────────────────────────── */}
        <div style={{ marginBottom: 'clamp(12px, 2vw, 28px)', textAlign: 'center' }}>
          <h2 className="tp-heading">
            Top 8 Art &amp; Canvas Picks
          </h2>
          <p style={{ fontSize: 'clamp(12px, 1.5vw, 15px)', color: '#777', margin: '4px 0 0' }}>
            Handpicked premium collection for your space
          </p>
          {/* Gold accent line */}
          <div style={{ width: 40, height: 2, background: '#c49a6c', borderRadius: 1, margin: '10px auto 0' }} />
        </div>

        {/* ── THE GRID — 4 columns, 2 rows, always ───────────────────
            On MOBILE  : 4 cols × 2 rows = all 8 visible, NO scroll
            On DESKTOP : same 4 cols but larger cards with more spacing
            This is exactly the Amazon "category grid" pattern.         */}
        <div className="tp-grid">
          {/* ROW 1: items 0–3 */}
          {row1.map((item, i) => (
            <ProductCard key={item.href} item={item} index={i} />
          ))}

          {/* ROW 2: items 4–7 */}
          {row2.map((item, i) => (
            <ProductCard key={item.href} item={item} index={i + 4} />
          ))}
        </div>

        {/* Mobile tap hint */}
        <span className="tp-tap-hint">Tap any product to explore</span>

        {/* ── View all button ─────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(16px, 3vw, 36px)' }}>
          <Link to="/shop-v1" className="tp-view-all">
            Shop All Products
            <svg
              width="14" height="14"
              viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}