// src/pages/shop/ShopV1.tsx
// ══════════════════════════════════════════════════════════════════════
//  Shop Layout 01 — Infinity Printing & Signage
//
//  UPDATES vs original:
//  · Categories replaced with Infinity's 8 departments
//  · $ → ₹ throughout price filter (Indian rupee)
//  · Category pills use each dept's unique gradient on hover/active
//  · Filter bar redesigned with brand gradient accent elements
//  · "Load More" button uses brand gradient
//  · Page heading uses brand gradient text
//  · Breadcrumb "Shop" uses brand gradient
//  · Sort bar added above grid (result count + sort dropdown)
//  · All original logic preserved:
//    - productList.map → LayoutOne
//    - Aos.init()
//    - NavbarOne / FooterOne / ScrollToTop
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import NavbarOne   from "../../components/navbar/navbar-one";
import LayoutOne   from "../../components/product/layout-one";
import FooterOne   from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
// import SelectOne   from "../../components/product/select-one";

import bg from '../../assets/img/shortcode/breadcumb.jpg';

import { getProducts, type Product as ApiProduct } from "../../api/products";

import Aos from "aos";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND      = 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)'
const CTA        = 'linear-gradient(135deg,#2563EB 0%,#06B6D4 50%,#22C55E 100%)'
const BRAND_SOLID = '#5B4FBE'
const FONT        = "'DM Sans', sans-serif"

// ── 8 unique department gradients matching NavbarOne ─────────────────────────
const DEPT_GRADS: Record<string, string> = {
  'All':               BRAND,
  'Portrait Frames':   'linear-gradient(135deg,#5B4FBE,#9333EA)',
  'Canvas Paintings':  'linear-gradient(135deg,#E8314A,#F97316)',
  'Temple Art Prints': 'linear-gradient(135deg,#F97316,#EAB308)',
  'Wall Murals':       'linear-gradient(135deg,#22C55E,#84CC16)',
  'Modern Wallpapers': 'linear-gradient(135deg,#06B6D4,#2563EB)',
  'Customize Blinds':  'linear-gradient(135deg,#EC4899,#E8314A)',
  'Neon Signs':        'linear-gradient(135deg,#06B6D4,#22C55E)',
  'Backlit LED':       'linear-gradient(135deg,#5B4FBE,#06B6D4)',
}

const CATEGORIES = [
  'All',
  'Portrait Frames',
  'Canvas Paintings',
  'Temple Art Prints',
  'Wall Murals',
  'Modern Wallpapers',
  'Customize Blinds',
  'Neon Signs',
  'Backlit LED',
]

// Map UI category names to expected tag substrings returned by the API.
// Add synonyms so API tag_name or category names map correctly to the UI pills.
const CATEGORY_TAG_MATCHERS: Record<string, string[]> = {
  'All': [''],
  'Portrait Frames': ['portrait', 'portrait frames', 'frame', 'frames'],
  'Canvas Paintings': ['canvas', 'canvas painting', 'painting'],
  'Temple Art Prints': ['temple', 'temple art', 'spiritual', 'tanjore'],
  'Wall Murals': ['mural', 'wall mural', 'wall'],
  'Modern Wallpapers': ['wallpaper', 'wall paper', 'modern wallpaper'],
  'Customize Blinds': ['blind', 'blinds', 'customize', 'custom'],
  'Neon Signs': ['neon', 'neon sign', 'led sign'],
  'Backlit LED': ['backlit', 'backlit led', 'led', 'back light'],
}

function toNumber(value: unknown): number {
  const num = typeof value === 'number'
    ? value
    : parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

function priceToNumber(price: unknown): number {
  // Accepts API formatted "₹12,345" as well as raw numbers/strings.
  return toNumber(String(price ?? '').replace(/,/g, ''));
}

// ── Category pill component ───────────────────────────────────────────────────
function CategoryPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const grad = DEPT_GRADS[label] ?? BRAND
  const isOn = active || hov

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 16px',
        borderRadius: 6,
        border: `1.5px solid ${isOn ? 'transparent' : '#E5E7EB'}`,
        background: isOn ? grad : '#fff',
        color: isOn ? '#fff' : '#374151',
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.04em',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 4px 14px rgba(91,79,190,0.22)' : hov ? '0 2px 8px rgba(91,79,190,0.14)' : 'none',
        transform: active ? 'translateY(-1px)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// ── Price input ───────────────────────────────────────────────────────────────
function RupeeInput({
  label, value, placeholder, onChange,
}: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      border: `1.5px solid ${focused ? BRAND_SOLID : '#E5E7EB'}`,
      borderRadius: 8,
      padding: '9px 14px',
      background: focused ? '#FAFAFC' : '#fff',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: focused ? `0 0 0 3px rgba(91,79,190,0.10)` : 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span style={{
        fontSize: 12, fontWeight: 600, color: BRAND_SOLID,
        fontFamily: FONT, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', flexShrink: 0 }}>₹</span>
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, minWidth: 0, background: 'transparent', border: 'none',
          outline: 'none', fontFamily: FONT, fontSize: 13, fontWeight: 500,
          color: '#111827', appearance: 'none',
        }}
      />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ShopV1() {

  // ── STATE ──────────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('All')
  const [minPrice,       setMinPrice]       = useState('0')
  const [maxPrice,       setMaxPrice]       = useState('50000')
  const [sortBy,         setSortBy]         = useState('default')
  const [hovLoad,        setHovLoad]        = useState(false)

  const [allProducts, setAllProducts] = useState<ApiProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    Aos.init()
  })                                  // original — no dependency array

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialise filters from URL query params (deep-link support)
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || params.get('cat') || '';
    if (cat) setActiveCategory(decodeURIComponent(cat));
    const min = params.get('min'); if (min) setMinPrice(min);
    const max = params.get('max'); if (max) setMaxPrice(max);
    const s = params.get('sort'); if (s) setSortBy(s);
  }, [location.search]);

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    try {
      const params = new URLSearchParams(location.search);
      if (cat === 'All') params.delete('category'); else params.set('category', cat);
      const dest = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      navigate(dest);
    } catch {
      // ignore navigation errors
    }
  };

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoadingProducts(true)
      setProductsError(null)
      try {
        const items = await getProducts()
        if (cancelled) return
        setAllProducts(Array.isArray(items) ? items : [])
      } catch (err) {
        console.error('[shop-v1] Failed to load products', err)
        if (cancelled) return
        setProductsError('Failed to load products. Please try again.')
        setAllProducts([])
      } finally {
        if (cancelled) return
        setLoadingProducts(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // Robust category matcher that checks tag + name together
  const matchesCategory = (p: ApiProduct, label: string) => {
    if (!label || label.toLowerCase() === 'all') return true;
    const matchers = CATEGORY_TAG_MATCHERS[label] ?? [label.toLowerCase()];
    const hay = ((p.tag ?? '') + ' ' + (p.name ?? '')).toLowerCase();
    return matchers.some(m => m && hay.includes(m));
  };

  const filteredProducts = useMemo(() => {
    const min = Math.max(0, toNumber(minPrice))
    const max = Math.max(0, toNumber(maxPrice))
    const cat = String(activeCategory ?? 'All').trim().toLowerCase()

    let list = allProducts

    if (cat && cat !== 'all') {
      list = list.filter((p) => matchesCategory(p, activeCategory));
    }

    list = list.filter((p) => {
      const price = priceToNumber(p.price)
      if (min > 0 && price < min) return false
      if (max > 0 && price > max) return false
      return true
    })

    const sorted = [...list]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price))
        break
      case 'price-desc':
        sorted.sort((a, b) => priceToNumber(b.price) - priceToNumber(a.price))
        break
      case 'newest':
        // No createdAt is available in the base list; use id as a stable proxy.
        sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        break
      case 'popular':
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      default:
        break
    }

    return sorted
  }, [activeCategory, allProducts, maxPrice, minPrice, sortBy])

  return (
    <>
      <NavbarOne />

      {/* ── Hero Breadcrumb ── */}
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          {/* Gradient heading */}
          <h2
            className="md:text-[40px] font-normal leading-none text-center"
            style={{
              fontSize: 32,
              backgroundImage: BRAND,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Shop
          </h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/" style={{ color: 'rgba(255,255,255,0.75)' }}>Home</Link></li>
            <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
            <li style={{
              backgroundImage: BRAND,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 600,
            }}>
              Shop
            </li>
          </ul>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="s-py-100">
        <div className="container-fluid">

          {/* ══ FILTER BAR ══════════════════════════════════════════════════ */}
          <div
            className="max-w-[1720px] mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
            style={{
              borderBottom: '1px solid #F0F0F4',
              paddingBottom: 36,
              marginBottom: 36,
            }}
          >
            {/* Filter bar top: gradient label + 3px rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                height: 18, width: 3, borderRadius: 2,
                background: BRAND, flexShrink: 0,
              }} />
              <span style={{
                fontFamily: FONT, fontSize: 10, fontWeight: 800,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                backgroundImage: BRAND,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Filter &amp; Browse
              </span>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">

              {/* ── Category pills ── */}
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontFamily: FONT, fontWeight: 700, fontSize: 13,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: '#374151', marginBottom: 12,
                }}>
                  Category
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <CategoryPill
                      key={cat}
                      label={cat}
                      active={activeCategory === cat}
                      onClick={() => handleCategorySelect(cat)}
                    />
                  ))}
                </div>
              </div>

              {/* ── Price + Brand filters ── */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                width: '100%',
                maxWidth: 520,
                flexShrink: 0,
              }}>

                {/* Price range */}
                <div>
                  <h4 style={{
                    fontFamily: FONT, fontWeight: 700, fontSize: 13,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#374151', marginBottom: 12,
                  }}>
                    Price Range
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <RupeeInput
                      label="Min"
                      value={minPrice}
                      placeholder="0"
                      onChange={setMinPrice}
                    />
                    <RupeeInput
                      label="Max"
                      value={maxPrice}
                      placeholder="50,000"
                      onChange={setMaxPrice}
                    />
                  </div>
                </div>

                {/* Brand */}
                {/* <div>
                  <h4 style={{
                    fontFamily: FONT, fontWeight: 700, fontSize: 13,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#374151', marginBottom: 12,
                  }}>
                    Choose Brand
                  </h4>
                  <SelectOne />
                </div> */}

              </div>
            </div>
          </div>
          {/* ══ END FILTER BAR ══════════════════════════════════════════════ */}

          {/* ══ SORT / RESULT BAR ═══════════════════════════════════════════ */}
          <div
            className="max-w-[1720px] mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: '1px solid #F0F0F4',
            }}
          >
            {/* Result count */}
            <p style={{ fontFamily: FONT, fontSize: 12, color: '#6B7280', margin: 0 }}>
              Showing{' '}
              <strong style={{
                backgroundImage: BRAND,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
              }}>
                {filteredProducts.length}
              </strong>
              {' '}products
              {activeCategory !== 'All' && (
                <> in <strong style={{ color: '#374151' }}>{activeCategory}</strong></>
              )}
            </p>

            {/* Sort dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FONT, fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                Sort By :
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  fontFamily: FONT, fontSize: 12, color: '#374151',
                  border: '1px solid #E5E7EB', borderRadius: 6,
                  padding: '7px 12px', background: '#fff',
                  outline: 'none', cursor: 'pointer', minWidth: 155,
                }}
              >
                <option value="default">Relevance</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          {/* ══ END SORT BAR ════════════════════════════════════════════════ */}

          {/* ══ PRODUCT GRID ════════════════════════════════════════════════ */}
          {/*  Original productList.map → LayoutOne preserved exactly  */}
          <div
            className="max-w-[1720px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            {loadingProducts ? (
              <div className="col-span-full text-center" style={{ fontFamily: FONT, color: '#6B7280' }}>
                Loading products...
              </div>
            ) : productsError ? (
              <div className="col-span-full text-center" style={{ fontFamily: FONT, color: '#B91C1C' }}>
                {productsError}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center" style={{ fontFamily: FONT, color: '#6B7280' }}>
                No products found for the selected filters.
              </div>
            ) : (
              filteredProducts.map((item: ApiProduct, index: number) => (
                <LayoutOne item={item} key={item.id ?? index} />
              ))
            )}
          </div>
          {/* ══ END GRID ════════════════════════════════════════════════════ */}

          {/* ══ LOAD MORE ═══════════════════════════════════════════════════ */}
          <div
            style={{ textAlign: 'center', marginTop: 48 }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {/* Gradient "Load More" button */}
            <Link
              to="/shop-v1"
              onMouseEnter={() => setHovLoad(true)}
              onMouseLeave={() => setHovLoad(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 40px',
                background: hovLoad ? CTA : BRAND,
                color: '#fff',
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 6,
                transition: 'background 0.35s ease, transform 0.15s, box-shadow 0.2s',
                transform: hovLoad ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: hovLoad
                  ? '0 8px 24px rgba(37,99,235,0.28)'
                  : '0 4px 14px rgba(91,79,190,0.22)',
              }}
            >
              {/* Load more icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.86" />
              </svg>
              Load More
            </Link>

            {/* Subtle count below button */}
            <p style={{ fontFamily: FONT, fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>
              Showing {filteredProducts.length} of {allProducts.length} products
            </p>
          </div>
          {/* ══ END LOAD MORE ═══════════════════════════════════════════════ */}

        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  )
}