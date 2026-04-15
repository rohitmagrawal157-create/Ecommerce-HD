// src/components/top-picks.tsx
// @ts-nocheck

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─── API Endpoint ─────────────────────────────────────────
const CATEGORIES_API =
  'https://lightsteelblue-stinkbug-893971.hostingersite.com/Shopping-Cart/public/api/categories';

// ─── Types ────────────────────────────────────────────────
interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;   // ✅ API uses image_url
  badge?: string;
}

interface PickItem {
  href: string;
  src: string;
  alt: string;
  label: string;
  badge?: string;
}

// Badge gradient map – same as before
const BADGE_GRADIENTS: Record<string, string> = {
  New:  'linear-gradient(90deg,#5B4FBE,#EC4899)',
  Hot:  'linear-gradient(90deg,#E8314A,#F97316)',
  Sale: 'linear-gradient(90deg,#2563EB,#06B6D4)',
};

// ─── Styles (unchanged) ───────────────────────────────────
const STYLES = `
  /* ... (keep all your existing styles) ... */
`;

// ─── Helper: Fetch categories from API ────────────────────
async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(CATEGORIES_API);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  
  // ✅ Handle API response wrapper: { status: true, message: "...", data: [...] }
  if (data && data.status === true && Array.isArray(data.data)) {
    return data.data;
  }
  
  // Fallback for direct array response
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  
  throw new Error('Unexpected API response format');
}

// ─── Product Card Component ───────────────────────────────
function ProductCard({ item, index }: { item: PickItem; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={item.href} className="tp-card" aria-label={item.label}>
      <div className="tp-img-wrap">
        <span className="tp-num-badge" aria-hidden="true">{index + 1}</span>

        {item.badge && (
          <span className="tp-status-badge"
            style={{ background: BADGE_GRADIENTS[item.badge] || '#555' }}
            aria-label={item.badge}>
            {item.badge}
          </span>
        )}

        {imgError ? (
          <div className="tp-img-fallback"><span>{item.label}</span></div>
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
      <div className="tp-label-wrap">
        <p className="tp-label">{item.label}</p>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function TopPicks() {
  const [items, setItems] = useState<PickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inject styles once
  useEffect(() => {
    const ID = 'top-picks-styles';
    if (document.getElementById(ID)) return;
    const tag = document.createElement('style');
    tag.id = ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchCategories()
      .then((categories) => {
        if (!isMounted) return;

        // ✅ Map API categories to PickItem format using image_url
        const mapped: PickItem[] = categories.slice(0, 8).map((cat) => ({
          href: `/category/${cat.slug}`,
          src: cat.image_url || 'https://placehold.co/400x400?text=No+Image',
          alt: cat.name,
          label: cat.name,
          badge: cat.badge || undefined,
        }));
        setItems(mapped);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load categories:', err);
        setError(err.message || 'Unable to load categories');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Split into two rows
  const row1 = items.slice(0, 4);
  const row2 = items.slice(4, 8);

  // Loading state
  if (loading) {
    return (
      <section style={{ width: '100%', background: '#fff', padding: 'clamp(20px,4vw,64px) 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(8px,3vw,24px)', textAlign: 'center' }}>
          <div className="tp-heading">Top 8 Art &amp; Canvas Picks</div>
          <div style={{ marginTop: 32 }}>
            <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#5B4FBE', borderTopColor: 'transparent' }} />
            <p style={{ marginTop: 12, color: '#6B7280' }}>Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section style={{ width: '100%', background: '#fff', padding: 'clamp(20px,4vw,64px) 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(8px,3vw,24px)', textAlign: 'center' }}>
          <div className="tp-heading">Top 8 Art &amp; Canvas Picks</div>
          <div style={{ marginTop: 24, color: '#EF4444', background: '#FEF2F2', padding: 16, borderRadius: 12 }}>
            ⚠️ {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 20px', borderRadius: 40, background: '#5B4FBE', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // No items
  if (items.length === 0) {
    return (
      <section style={{ width: '100%', background: '#fff', padding: 'clamp(20px,4vw,64px) 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(8px,3vw,24px)', textAlign: 'center' }}>
          <div className="tp-heading">Top 8 Art &amp; Canvas Picks</div>
          <p style={{ marginTop: 24, color: '#9CA3AF' }}>No categories found.</p>
        </div>
      </section>
    );
  }

  // Success – render grid
  return (
    <section style={{ width: '100%', background: '#fff', padding: 'clamp(20px,4vw,64px) 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(8px,3vw,24px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(12px,2vw,28px)', textAlign: 'center' }}>
          <h2 className="tp-heading">Top 8 Art &amp; Canvas Picks</h2>
          <p style={{ fontSize: 'clamp(12px,1.5vw,15px)', color: '#9CA3AF', margin: '6px 0 0' }}>
            Handpicked premium collection for your space
          </p>
          <div style={{
            width: 48, height: 3, borderRadius: 2, margin: '12px auto 0',
            background: 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)'
          }} />
        </div>

        <div className="tp-grid">
          {row1.map((item, i) => <ProductCard key={item.href} item={item} index={i} />)}
          {row2.map((item, i) => <ProductCard key={item.href} item={item} index={i + 4} />)}
        </div>

        <span className="tp-tap-hint">Tap any product to explore</span>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(16px,3vw,36px)' }}>
          <Link to="/shop-v1" className="tp-view-all">
            Shop All Products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}