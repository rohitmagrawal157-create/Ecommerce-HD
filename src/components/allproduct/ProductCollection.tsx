// src/components/ProductCollection.tsx
// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuHeart, LuEye } from 'react-icons/lu';
import { RiShoppingBag2Line } from 'react-icons/ri';
import { GoStarFill } from 'react-icons/go';
import { addToCart } from '../../api/cart.api';
import { isWishlisted, toggleWishlist } from '../../api/wishlist.api';

// ── Brand tokens ─────────────────────────────────────────
const BRAND = 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)';
const CTA   = 'linear-gradient(90deg,#2563EB,#06B6D4,#22C55E)';

interface Product {
  id: number; name: string; price: string;
  oldPrice?: string; image: string;
  badge?: { label: string; grad: string };
}

const products: Product[] = [
  {
    id: 1, name: 'Premium Canvas Print – Abstract Waves', price: '$129.99', oldPrice: '$189.99',
    badge: { label: 'HOT', grad: 'linear-gradient(90deg,#E8314A,#F97316)' },
    image: 'https://imgs.search.brave.com/xFTkEltVU-Fcai1S5B6E96-71Q6WDcSLGbEv3mJDxsc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDIzLzEw/LzM1MTU4NDYwMC9R/US9HTS9WWC8xOTc4/OTQwMDkvcHJpbnRl/ZC1jYW52YXMtNTAw/eDUwMC5qcGc',
  },
  {
    id: 4, name: 'Portrait Sketch – Charcoal Drawing', price: '$89.99', oldPrice: '$129.99',
    badge: { label: 'NEW', grad: 'linear-gradient(90deg,#5B4FBE,#EC4899)' },
    image: 'https://imgs.search.brave.com/pO3_geDNJr-PHRVvzlSlXdVEI8SCMrHvO8C_TPKAtpE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rb3Rh/cnQuaW4vY2RuL3No/b3AvZmlsZXMvZWZm/ZWN0MDFfNS5qcGc_/dj0xNzIxMjU0NDA2/JndpZHRoPTUzMw',
  },
  {
    id: 2, name: 'Customizable Wood Blind', price: '$159.99', oldPrice: '$219.99',
    badge: { label: 'SALE', grad: 'linear-gradient(90deg,#2563EB,#06B6D4)' },
    image: 'http://imgs.search.brave.com/8pvxihMVVfCFrOag3N0XXUlhAiCEuXmOgqEdPrDfxjA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudGhkc3RhdGlj/LmNvbS9wcm9kdWN0/SW1hZ2VzLzc2NWIy/ZTNhLTcwYjctNGVk/ZC1hNTY2LWNmYjBi/MjY5MWI3Yy9zdm4v/YXNzb3J0ZWQtY29s/b3JzLWJhbGktd29v/ZC1ibGluZHMtNTM0/ODk4LTY0XzYwMC5q/cGc',
  },
  {
    id: 3, name: 'Neon Signage – Custom LED', price: '$249.99', oldPrice: '$329.99',
    badge: { label: 'HOT', grad: 'linear-gradient(90deg,#E8314A,#F97316)' },
    image: 'https://imgs.search.brave.com/HmDJxfWjB5hRZqdcv4eGpsgJOCgBDwZ33VWtzjD2DAU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NjUyMDY1OTU2NDAt/NmNmZDkwZTBhZTA5/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZhdXRv/PWZvcm1hdCZmaXQ9/Y3JvcCZpeGxpYj1y/Yi00LjEuMCZpeGlk/PU0zd3hNakEzZkRC/OE1IeHpaV0Z5WTJo/OE1UaDhmRzVsYjI0/bE1qQnphV2R1ZkdW/dWZEQjhmREI4Zkh3/dw',
  },
  {
    id: 5, name: 'Temple Art – Handmade Painting', price: '$149.99', oldPrice: '$199.99',
    badge: { label: 'NEW', grad: 'linear-gradient(90deg,#5B4FBE,#EC4899)' },
    image: 'https://m.media-amazon.com/images/I/71z78D0J8VL._AC_UF894,1000_QL80_.jpg',
  },
  {
    id: 6, name: 'Wall Mural – Large Format', price: '$199.99', oldPrice: '$269.99',
    badge: { label: 'SALE', grad: 'linear-gradient(90deg,#2563EB,#06B6D4)' },
    image: 'https://imgs.search.brave.com/WRQWwv92NnMS5xJ59lU6PMBKvVKPoPoAHRkS1FId_ZA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/OTE3LURaOGU3TEwu/anBn',
  },
];

// ── Gradient text helper ──────────────────────────────────
function GradText({ grad, children, className = '' }: { grad: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={className} style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
      {children}
    </span>
  );
}

function ProductCard({ item, tall }: { item: Product; tall?: boolean }) {
  const [wished,  setWished]  = useState(false);
  const [busy,    setBusy]    = useState<null | 'cart' | 'wishlist'>(null);
  const [notice,  setNotice]  = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    isWishlisted(item.id).then(v => active && setWished(v)).catch(() => {});
    return () => { active = false; };
  }, [item.id]);

  const onWishlist = async () => {
    if (busy) return;
    setBusy('wishlist'); setNotice(null);
    try {
      const next = await toggleWishlist(item.id);
      const inWL = next.productIds.includes(item.id);
      setWished(inWL);
      setNotice(inWL ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { setNotice('Wishlist action failed'); }
    finally { setBusy(null); }
  };

  const onAddToCart = async () => {
    if (busy) return;
    setBusy('cart'); setNotice(null);
    try {
      await addToCart(item.id, 1);
      setNotice('Added to cart ✓');
    } catch { setNotice('Add to cart failed'); }
    finally { setBusy(null); }
  };

  return (
    <div className="group flex flex-col">
      {/* Image wrapper */}
      <div className={`relative overflow-hidden ${tall ? 'flex-1' : ''} rounded-2xl`}
        style={{ boxShadow: '0 4px 24px rgba(91,79,190,0.08)' }}>

        {/* Badge */}
        {item.badge && (
          <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-widest"
            style={{ background: item.badge.grad, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
            {item.badge.label}
          </div>
        )}

        <Link to={`/product-details/${item.id}`}>
          <img
            className={`w-full ${tall ? 'h-full' : 'sm:max-h-[340px]'} object-cover transform group-hover:scale-110 duration-500 transition-transform`}
            src={item.image} alt={item.name}
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"
            style={{ background: BRAND }} />
        </Link>

        {/* Hover action strip */}
        <div className="absolute z-10 top-1/2 right-4 transform -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 flex flex-col items-end gap-2">

          {/* Wishlist */}
          <button type="button" onClick={onWishlist} disabled={busy === 'wishlist'}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full shadow-lg text-white font-medium transition-all ${busy === 'wishlist' ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
            style={{ background: wished ? BRAND : 'rgba(255,255,255,0.95)', color: wished ? undefined : '#374151' }}>
            <LuHeart className="h-4 w-4" style={wished ? {} : { color: '#5B4FBE' }} />
            <span style={wished ? {} : { background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {wished ? 'Wishlisted' : 'Wishlist'}
            </span>
          </button>

          {/* Add to Cart — CTA gradient */}
          <button type="button" onClick={onAddToCart} disabled={busy === 'cart'}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full shadow-lg text-white font-medium transition-all ${busy === 'cart' ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
            style={{ background: CTA }}>
            <RiShoppingBag2Line className="h-4 w-4" />
            <span>{busy === 'cart' ? 'Adding…' : 'Add to Cart'}</span>
          </button>

          {/* Quick View */}
          <button type="button"
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full shadow-lg font-medium text-white hover:scale-105 transition-all quick-view"
            style={{ background: 'rgba(255,255,255,0.95)' }}>
            <LuEye className="h-4 w-4" style={{ color: '#E8314A' }} />
            <span style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Quick View
            </span>
          </button>
        </div>
      </div>

      {/* Info below card */}
      <div className="lg:pt-6 pt-5 flex gap-3 md:gap-4 flex-col">

        {/* Price — brand gradient */}
        <h4 className="font-bold text-xl flex items-baseline gap-2 flex-wrap">
          <GradText grad={BRAND}>{item.price}</GradText>
          {item.oldPrice && (
            <span className="text-gray-400 line-through text-sm font-normal">{item.oldPrice}</span>
          )}
        </h4>

        {/* Product name — gradient on hover */}
        <h5 className="font-medium text-[19px] leading-tight text-gray-800 dark:text-white">
          <Link to={`/product-details/${item.id}`}
            className="hover:opacity-80 transition-opacity"
            style={{ ['--hover-grad' as string]: BRAND }}>
            <span className="product-name-link">{item.name}</span>
          </Link>
        </h5>

        {/* Notice */}
        {notice && (
          <p className="text-xs font-medium" style={{ background: CTA, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
            {notice}
          </p>
        )}

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <GoStarFill key={i} style={{ color: '#F97316' }} className="size-4" />
          ))}
          <GoStarFill className="text-slate-300 size-4" />
          <span className="ml-2 text-sm" style={{ color: '#9CA3AF' }}>(1,230)</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductCollection() {
  return (
    <div className="s-py-100-50" data-aos="fade-up">
      <div className="container-fluid">

        {/* Header */}
        <div className="max-w-xl mx-auto mb-8 md:mb-12 text-center">
          <h3 className="leading-none mt-4 md:mt-6 text-2xl md:text-3xl font-bold"
            style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
            Featured Products
          </h3>
          {/* Gradient accent line */}
          <div style={{ width: 48, height: 3, borderRadius: 2, margin: '10px auto 0', background: BRAND }} />
          <p className="mt-4 text-gray-500 text-sm md:text-base">
            Discover our handpicked selection of standout products.
          </p>
        </div>

        <div className="max-w-[1720px] mx-auto flex gap-5 sm:gap-8 flex-col lg:flex-row">
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:max-w-[766px] w-full">
            {products.slice(0, 4).map(item => <ProductCard item={item} key={item.id} />)}
          </div>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:max-w-[925px] w-full">
            {products.slice(4, 6).map(item => <ProductCard item={item} key={item.id} tall />)}
          </div>
        </div>
      </div>
    </div>
  );
}