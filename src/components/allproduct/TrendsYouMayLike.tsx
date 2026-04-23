// src/components/home/TrendsYouMayLike.tsx
// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════
//  "Trends you may like" — Pink bg, 4 image tiles with label bar & gaps
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react'
import { useNavigate }                       from 'react-router-dom'

const API_URL   = 'https://lightsteelblue-stinkbug-893971.hostingersite.com/Shopping-Cart/public/api/products'
const FONT_HEAD = "'DM Sans', sans-serif"
const FONT_BODY = "'DM Sans', sans-serif"

const PINK      = '#F4365A'
const PINK_DARK = '#d42048'

interface ApiProduct {
  product_id: number; name: string; category: string; images: string[]
  price: string; average_rating: number
}

function pickRandom(arr: ApiProduct[], count: number): ApiProduct[] {
  if (!arr.length) return []
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count)
}

// ─── CSS (with gaps) ──────────────────────────────────────────────────────────
const TREND_STYLE_ID = 'trend-v1-styles'
const TREND_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=Syne:wght@700;800&display=swap');

  @keyframes trendShim   { 0%{background-position:200% 0}100%{background-position:-200% 0} }
  @keyframes trendFadeUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }

  .trend-section { padding: 28px 0 0; animation: trendFadeUp .5s .05s ease both; }

  /* Outer pink card */
  .trend-outer {
    background: ${PINK};
    border-radius: 20px;
    padding: 20px 20px 24px;
    position: relative;
    overflow: hidden;
  }

  /* Decorative wheat SVG top-right */
  .trend-deco {
    position: absolute; top: 0; right: 0;
    width: 110px; height: 90px;
    pointer-events: none; opacity: .75;
  }

  /* Title */
  .trend-title {
    font-family: ${FONT_HEAD}; font-size: clamp(18px,2.8vw,24px);
    font-weight: 800; color: #fff; margin: 0 0 20px;
    position: relative; z-index: 1; letter-spacing: -.01em;
  }

  /* Inner white card */
  .trend-inner {
    background: #fff; border-radius: 16px; overflow: hidden;
    position: relative; z-index: 1;
    padding: 12px;  /* ← adds space around grid, creating visible gaps */
  }

  /* 4-col grid with gaps */
  .trend-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;   /* ← main gap between tiles */
  }
  @media (max-width: 899px) {
    .trend-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }

  /* Each tile (removed individual borders) */
  .trend-tile {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-radius: 12px;   /* subtle rounding on tiles */
    background: #fff;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .trend-tile:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  }

  /* Image wrapper */
  .trend-img-wrap {
    aspect-ratio: .85/1;
    overflow: hidden;
    background: #f5f5f7;
    border-radius: 12px 12px 0 0;
  }
  .trend-img {
    width:100%; height:100%; object-fit:cover; display:block;
    transition: transform .5s cubic-bezier(.25,.46,.45,.94);
  }
  .trend-tile:hover .trend-img { transform: scale(1.05); }

  /* Label bar at bottom */
  .trend-label-bar {
    background: ${PINK};
    padding: 10px 12px 11px;
    text-align: center;
    border-radius: 0 0 12px 12px;
    transition: background .18s;
  }
  .trend-tile:hover .trend-label-bar { background: ${PINK_DARK}; }
  .trend-label-text {
    font-family: ${FONT_BODY}; font-size: 14px; font-weight: 700;
    color: #fff; letter-spacing: .01em;
    display: block; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  @media (max-width: 767px) {
    .trend-label-text { font-size: 12px; }
    .trend-label-bar  { padding: 8px 10px 9px; }
  }

  /* Skeleton */
  .trend-skel {
    background: linear-gradient(90deg,#fad4dc 25%,#f8c1cc 50%,#fad4dc 75%);
    background-size: 300% 100%; animation: trendShim 1.5s infinite linear;
    border-radius: 8px;
  }
  .trend-skel-tile {
    background: #fff5f7;
    border-radius: 12px;
    overflow: hidden;
  }
  .trend-skel-img {
    aspect-ratio: .85/1; width: 100%;
  }
  .trend-skel-bar {
    padding: 10px 12px 11px; background: #f8aabb;
  }

  /* Error */
  .trend-err {
    text-align:center; padding:24px; color:#fff; font-family:${FONT_BODY};
    font-size:13px; background:rgba(255,255,255,.18); border-radius:16px;
  }
  .trend-retry {
    margin-top:12px; padding:8px 20px; background:#fff; color:${PINK};
    border:none; border-radius:8px; font-family:${FONT_BODY};
    font-size:13px; font-weight:700; cursor:pointer;
  }
`

function ensureTrendStyles() {
  if (!document.getElementById(TREND_STYLE_ID)) {
    const t = document.createElement('style')
    t.id = TREND_STYLE_ID; t.textContent = TREND_STYLES
    document.head.appendChild(t)
  }
}

function SkeletonTile() {
  return (
    <div className="trend-skel-tile">
      <div className="trend-skel trend-skel-img" />
      <div className="trend-skel-bar">
        <div className="trend-skel" style={{ height: 14, width: '70%', margin: '0 auto', borderRadius: 4 }} />
      </div>
    </div>
  )
}

function WheatDeco() {
  return (
    <svg className="trend-deco" viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="75" y1="88" x2="60" y2="10" stroke="#F9C34A" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="58" cy="20" rx="7" ry="5" fill="#F9C34A" transform="rotate(-20 58 20)"/>
      <ellipse cx="64" cy="20" rx="7" ry="5" fill="#F9C34A" transform="rotate(20 64 20)"/>
      <ellipse cx="56" cy="34" rx="7" ry="5" fill="#F9C34A" transform="rotate(-25 56 34)"/>
      <ellipse cx="64" cy="34" rx="7" ry="5" fill="#F9C34A" transform="rotate(25 64 34)"/>
      <ellipse cx="55" cy="48" rx="6" ry="4.5" fill="#F9C34A" transform="rotate(-20 55 48)"/>
      <ellipse cx="64" cy="48" rx="6" ry="4.5" fill="#F9C34A" transform="rotate(20 64 48)"/>
      <line x1="90" y1="88" x2="80" y2="18" stroke="#F9C34A" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="77" cy="28" rx="7" ry="5" fill="#F9C34A" transform="rotate(-20 77 28)"/>
      <ellipse cx="86" cy="28" rx="7" ry="5" fill="#F9C34A" transform="rotate(20 86 28)"/>
      <ellipse cx="76" cy="42" rx="6.5" ry="4.5" fill="#F9C34A" transform="rotate(-22 76 42)"/>
      <ellipse cx="86" cy="42" rx="6.5" ry="4.5" fill="#F9C34A" transform="rotate(22 86 42)"/>
      <ellipse cx="75" cy="55" rx="6" ry="4" fill="#F9C34A" transform="rotate(-18 75 55)"/>
      <ellipse cx="86" cy="55" rx="6" ry="4" fill="#F9C34A" transform="rotate(18 86 55)"/>
      <line x1="105" y1="88" x2="98" y2="30" stroke="#F9C34A" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="95" cy="38" rx="6" ry="4" fill="#F9C34A" transform="rotate(-18 95 38)"/>
      <ellipse cx="103" cy="38" rx="6" ry="4" fill="#F9C34A" transform="rotate(18 103 38)"/>
      <ellipse cx="94" cy="50" rx="5.5" ry="4" fill="#F9C34A" transform="rotate(-15 94 50)"/>
      <ellipse cx="103" cy="50" rx="5.5" ry="4" fill="#F9C34A" transform="rotate(15 103 50)"/>
    </svg>
  )
}

export default function TrendsYouMayLike() {
  const navigate  = useNavigate()
  const [picks,   setPicks]   = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => { ensureTrendStyles() }, [])

  const fetch4 = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch(API_URL, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const list: ApiProduct[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
      setPicks(pickRandom(list, 4))
    } catch (e: any) { setError(e?.message ?? 'Failed to load.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch4() }, [fetch4])

  return (
    <section className="trend-section">
      <div className="container-fluid">
        <div style={{ maxWidth: 1720, margin: '0 auto' }}>
          <div className="trend-outer">
            <WheatDeco />
            <h2 className="trend-title">Trends you may like</h2>

            {error && (
              <div className="trend-err">
                ⚠ {error}<br />
                <button className="trend-retry" onClick={fetch4}>Retry</button>
              </div>
            )}

            {!error && (
              <div className="trend-inner">
                <div className="trend-grid">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonTile key={i} />)
                    : picks.map((p, i) => (
                        <div
                          key={i}
                          className="trend-tile"
                          onClick={() => navigate(`/product-details/${p.product_id}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && navigate(`/product-details/${p.product_id}`)}
                          aria-label={p.category}
                        >
                          <div className="trend-img-wrap">
                            <img
                              src={p.images?.[0] ?? ''}
                              alt={p.name}
                              className="trend-img"
                              loading="lazy"
                              onError={e => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://placehold.co/400x470/f5f5f7/c4c4d4?text=No+Image'
                              }}
                            />
                          </div>
                          <div className="trend-label-bar">
                            <span className="trend-label-text">{p.category}</span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}