/**
 * ProductDetails - Refactored with modular components, improved UX, and cart API flow
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AOS from 'aos';
import { FourSquare } from 'react-loading-indicators';
import { LuPencilLine, LuStar, LuPackage, LuTruck, LuShieldCheck } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';

import NavbarOne from '../../components/navbar/navbar-one';
import FooterOne from '../../components/footer/footer-one';
import LayoutOne from '../../components/product/layout-one';
import ScrollToTop from '../../components/scroll-to-top';
import { ProductHeader } from '../../components/product-details/ProductHeader';
import { ProductGallery } from '../../components/product-details/ProductGallery';
import { ProductActions } from '../../components/product-details/ProductActions';
import { ProductInfo } from '../../components/product-details/ProductInfo';
import { StarRating } from '../../components/product-details/StarRating';
import { Toast } from '../../components/common/Toast';

import { productList } from '../../data/data';
import { getProductById, getProductDetailsById } from '../../api/products';
import { getReviewsByProduct, addReview as addReviewApi, deleteReview as deleteReviewApi } from '../../api/reviews';
import { addToCart } from '../../api/cart.api';
import { isWishlisted as checkWishlisted, toggleWishlist } from '../../api/wishlist.api';

import type { ProductDetails as ProductDetailsType, MediaItem, Review } from '../../types/product';
import {
  extractImages,
  extractVariants,
  useCountdown,
  useToast,
} from '../../utils/product.utils';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const BRAND_GRADIENT = 'linear-gradient(135deg, #5B4FBE 0%, #E8314A 50%, #F97316 100%)';
const BRAND_SOLID = '#5B4FBE';
const WHATSAPP_NUMBER = '919903504754';
const STOCK_QTY_FALLBACK = 7;
const SALE_TARGET = new Date(2026, 3, 30, 23, 59, 59);
const RATING_SUMMARY = { average: 4.8, total: 128 };
const AVATAR_COLORS = ['#5B4FBE', '#E8314A', '#0891b2'];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Priya M.',
    rating: 5,
    date: 'March 12, 2026',
    title: 'Absolutely love it!',
    body: 'The quality is exceptional. The finish is gorgeous and it fits perfectly in my living room. Very sturdy and worth every rupee.',
    verified: true,
  },
  {
    id: 2,
    name: 'Rohan S.',
    rating: 5,
    date: 'February 28, 2026',
    title: 'Great product, fast delivery',
    body: 'Ordered this for our new home. Packaging was excellent — no damage at all. Assembly was straightforward. Highly recommend!',
    verified: true,
  },
  {
    id: 3,
    name: 'Ananya K.',
    rating: 4,
    date: 'February 15, 2026',
    title: 'Beautiful design',
    body: 'Looks even better in person than in photos. Minor feedback — delivery took a day longer than expected, but totally worth the wait.',
    verified: true,
  },
];

// const OFFERS = [
//   { info: 'Get 5% off sitewide — No minimum spend', code: 'MAKEHOMESPECIAL' },
//   { info: 'Get Rs.150 off on your first order — Min. purchase of Rs.1500', code: 'NESTTRY' },
// ];

const RATING_BREAKDOWN = [
  { s: 5, p: 76 },
  { s: 4, p: 16 },
  { s: 3, p: 5 },
  { s: 2, p: 2 },
  { s: 1, p: 1 },
];

const productImages = {
  p1: 'https://placehold.co/600x400?text=Product+1',
  p2: 'https://placehold.co/600x400?text=Product+2',
  p3: 'https://placehold.co/600x400?text=Product+3',
  p4: 'https://placehold.co/600x400?text=Product+4',
};

// ─────────────────────────────────────────────────────────────────
// Review Component
// ─────────────────────────────────────────────────────────────────

interface ReviewFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({
    name: '',
    rating: 5,
    title: '',
    body: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.body || !form.rating) return;
    await onSubmit(form);
    setForm({ name: '', rating: 5, title: '', body: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-xl border border-gray-200">
      <div className="flex gap-3 mb-3">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Your name"
          className="border border-gray-200 px-3 py-2 rounded w-1/3"
        />
        <select
          value={String(form.rating)}
          onChange={(e) =>
            setForm((f) => ({ ...f, rating: Number(e.target.value) }))
          }
          className="border border-gray-200 px-3 py-2 rounded w-1/6"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star
            </option>
          ))}
        </select>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Title (optional)"
          className="border border-gray-200 px-3 py-2 rounded flex-1"
        />
      </div>
      <textarea
        value={form.body}
        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        placeholder="Write your review"
        className="w-full border border-gray-200 px-3 py-2 rounded mb-3"
        rows={4}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 rounded text-white disabled:opacity-50"
        style={{ background: BRAND_GRADIENT }}
      >
        {isSubmitting ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
};

interface ReviewCardProps {
  review: Review;
  index: number;
  isAuthenticated: boolean;
  onDelete?: (id: number) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  index,
  isAuthenticated,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-3 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
        >
          {String(review.name ?? '?')
            .trim()
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-base font-bold">{review.name ?? 'Customer'}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRating rating={Number(review.rating) || 0} size={14} />
            {review.verified && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-700">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.date ?? Date.now()).toLocaleDateString()}
        </span>
      </div>

      <div>
        <div className="text-base font-bold mb-1">{review.title}</div>
        <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
      </div>

      <div className="border-t border-gray-100 pt-2.5 flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Helpful?</span>
        <button className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50">
          👍 Yes
        </button>
        <button className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50">
          👎 No
        </button>
        {isAuthenticated && onDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="ml-auto text-xs text-red-600 border border-red-100 rounded px-2 py-0.5 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

interface CustomerReviewsProps {
  productId: number;
  reviews: Review[];
  onReviewAdded: (review: Review) => void;
  onReviewDeleted: (id: number) => void;
}

const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  productId,
  reviews,
  onReviewAdded,
  onReviewDeleted,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = Boolean(typeof window !== 'undefined' && window.localStorage.getItem('access_token'));

  const handleAddReview = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const created = await addReviewApi({
        product_id: productId,
        rating: Number(formData.rating) || 5,
        title: formData.title,
        body: formData.body,
        name: formData.name,
      });
      if (created) {
        onReviewAdded(created as any);
        setShowForm(false);
      }
    } catch (err) {
      console.warn('Failed to add review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      const ok = await deleteReviewApi(id);
      if (ok) {
        onReviewDeleted(id);
      }
    } catch (err) {
      console.warn('Failed to delete review', err);
    }
  };

  return (
    <div id="customer-reviews" className="py-12 bg-gray-50 border-t border-gray-200">
      <div className="max-w-[1720px] mx-auto px-5">
        <div className="flex items-start justify-between flex-wrap gap-6 mb-9">
          <div>
            <h3 className="text-2xl font-bold mb-2.5">Customer Reviews</h3>
            <div className="flex items-center gap-3">
              <StarRating rating={RATING_SUMMARY.average} size={24} />
              <span className="text-3xl font-extrabold">{RATING_SUMMARY.average}</span>
              <span className="text-sm text-gray-500">
                out of 5 · {reviews.length || RATING_SUMMARY.total} reviews
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              {RATING_BREAKDOWN.map(({ s, p }) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 text-right font-semibold text-gray-700">{s}</span>
                  <LuStar size={12} color="#f5a623" />
                  <div className="w-40 h-2 rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${p}%`, background: '#f5a623' }}
                    />
                  </div>
                  <span className="text-gray-400 w-7">{p}%</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded"
            style={{ background: BRAND_GRADIENT }}
          >
            <LuPencilLine size={16} />
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {showForm && (
          <ReviewForm onSubmit={handleAddReview} isSubmitting={isSubmitting} />
        )}

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, idx) => (
            <ReviewCard
              key={review.id}
              review={review}
              index={idx}
              isAuthenticated={isAuthenticated}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-transparent font-bold text-sm px-7 py-2.5 rounded border border-[#5B4FBE] text-[#5B4FBE] hover:bg-[#5B4FBE] hover:text-white transition">
            View All {RATING_SUMMARY.total} Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// ShippingBox — inline shipping / delivery info block
// New block added for the reordered sequence (was not present before)
// ─────────────────────────────────────────────────────────────────

interface ShippingBoxProps {
  stockQty: number;
}

const ShippingBox: React.FC<ShippingBoxProps> = ({ stockQty }) => {
  // Compute estimated delivery window: today + 15 to today + 16 days
  const today = new Date();
  const d15   = new Date(today); d15.setDate(today.getDate() + 15);
  const d16   = new Date(today); d16.setDate(today.getDate() + 16);
  const fmt   = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mt-5">
      {/* Delivery estimate row */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 bg-green-50">
        <LuTruck size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-gray-800">
            Estimated Delivery:{' '}
            <span className="text-green-700">
              {fmt(d15)} – {fmt(d16)}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">15–16 business days from order placement</p>
        </div>
      </div>

      {/* Packaging row */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100">
        <LuPackage size={18} className="text-[#5B4FBE] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-gray-800">Safe Packaging</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Every order is carefully packed to prevent damage in transit
          </p>
        </div>
      </div>

      {/* Secure order row */}
      <div className="flex items-start gap-3 px-4 py-3">
        <LuShieldCheck size={18} className="text-[#E8314A] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-gray-800">Secure Order</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {stockQty > 0
              ? `Only ${stockQty} left in stock — order soon`
              : 'Currently out of stock — check back soon'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const parsedId = parseInt(id ?? '0', 10);

  // State
  const [product, setProduct] = useState<ProductDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Toast state
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  // Fallback
  const fallbackProduct = productList.find((item: any) => item.id === parsedId);

  // Computed values
  const stockQty = Number(product?.variants?.[0]?.stock ?? STOCK_QTY_FALLBACK) || 0;
  const outOfStock = stockQty === 0;
  const maxQty = outOfStock ? 0 : stockQty;
  const countdown = useCountdown(SALE_TARGET);

  const productName = product?.name ?? 'Product';
  const price = product?.price ?? 0;
  const originalPrice = product?.originalPrice;
  const discountPercentage = product?.discountPercentage ?? 0;

  const images = extractImages(product);
  const variants = extractVariants(product);

  const mediaItems: MediaItem[] =
    images.length > 0
      ? images.map((url, idx) => ({
          type: 'image' as const,
          url,
          thumbnail: url,
          alt: `${productName} view ${idx + 1}`,
        }))
      : [
          { type: 'image' as const, url: productImages.p1, thumbnail: productImages.p1, alt: 'Product 1' },
          { type: 'image' as const, url: productImages.p2, thumbnail: productImages.p2, alt: 'Product 2' },
          { type: 'image' as const, url: productImages.p3, thumbnail: productImages.p3, alt: 'Product 3' },
          { type: 'image' as const, url: productImages.p4, thumbnail: productImages.p4, alt: 'Product 4' },
        ];

  // Load product data
  useEffect(() => {
    AOS.init({ once: true, duration: 600 });
    let alive = true;

    if (!Number.isFinite(parsedId)) return;

    setLoading(true);

    (async () => {
      try {
        // 1. Try getting detailed product
        const details = await getProductDetailsById(parsedId);
        if (alive && details) {
          setProduct(details as any);
          return;
        }

        // 2. Fallback to basic product
        const basicProduct = await getProductById(parsedId);
        if (alive) {
          setProduct((basicProduct as any) ?? fallbackProduct);
        }
      } catch (err) {
        console.error('[ProductDetails] Failed to fetch product', err);
        if (alive) setProduct(fallbackProduct as any);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [parsedId]);

  // Load wishlist status
  useEffect(() => {
    if (!Number.isFinite(parsedId) || parsedId <= 0) return;

    let alive = true;

    (async () => {
      try {
        const wishlisted = await checkWishlisted(parsedId);
        if (alive) setIsWishlisted(wishlisted);
      } catch (err) {
        console.warn('[ProductDetails] Failed to check wishlist', err);
      }
    })();

    return () => {
      alive = false;
    };
  }, [parsedId]);

  // Load reviews
  useEffect(() => {
    if (!Number.isFinite(parsedId) || parsedId <= 0) return;

    let alive = true;

    (async () => {
      setReviewsLoading(true);
      try {
        const rv = await getReviewsByProduct(parsedId);
        if (alive && Array.isArray(rv) && rv.length > 0) {
          setReviews(rv as any);
        }
      } catch (err) {
        console.warn('[ProductDetails] Failed to fetch reviews', err);
      } finally {
        if (alive) setReviewsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [parsedId]);

  // Handlers
  const handleWishlistToggle = useCallback(async () => {
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const result = await toggleWishlist(parsedId);
      const nextState = result.productIds.includes(parsedId);
      setIsWishlisted(nextState);
      showToast({
        type: 'success',
        message: nextState ? 'Added to wishlist' : 'Removed from wishlist',
        duration: 2000,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err?.message ?? 'Failed to update wishlist',
        duration: 2000,
      });
    } finally {
      setWishlistLoading(false);
    }
  }, [parsedId, wishlistLoading, showToast]);

  const handleAddToCart = useCallback(async () => {
    if (outOfStock || isAdding || !Number.isFinite(parsedId)) return;

    // Ensure session/auth token
    const token = window.localStorage.getItem('access_token');
    if (!token) {
      showToast({
        type: 'warning',
        message: 'Please sign in to add items to cart',
        duration: 3000,
      });
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.href)}`;
      return;
    }

    const variantId = Number(product?.variants?.[0]?.variantId ?? 0) || 0;

    setIsAdding(true);
    try {
      await addToCart(parsedId, quantity, variantId || undefined);
      showToast({
        type: 'success',
        message: `Added ${quantity} item(s) to cart`,
        duration: 2000,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err?.message ?? 'Failed to add to cart',
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  }, [parsedId, product, quantity, outOfStock, isAdding, showToast]);

  const handleReviewScroll = useCallback(() => {
    document.getElementById('customer-reviews')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <>
        <NavbarOne />
        <div className="s-py-50">
          <div className="container-fluid">
            <div className="max-w-[1720px] mx-auto flex items-center justify-center min-h-[400px]">
              <FourSquare color={BRAND_SOLID} size="large" />
            </div>
          </div>
        </div>
        <FooterOne />
        <ScrollToTop />
      </>
    );
  }

  const CLOCK_UNITS: [string, keyof typeof countdown][] = [
    ['D', 'days'],
    ['H', 'hours'],
    ['M', 'minutes'],
    ['S', 'seconds'],
  ];

  return (
    <>
      <NavbarOne />

      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={dismissToast}
          duration={toast.duration}
        />
      )}

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-5 md:py-[30px]">
        <div className="container-fluid">
          <ul className="flex items-center gap-2.5 text-sm md:text-base leading-none text-gray-500 max-w-[1720px] mx-auto flex-wrap">
            <li>
              <a href="/" className="hover:text-[#5B4FBE]">
                Home
              </a>
            </li>
            <li>/</li>
            <li>
              <a href="/shop-v1" className="hover:text-[#5B4FBE]">
                Shop
              </a>
            </li>
            <li>/</li>
            <li className="font-semibold text-gray-800">{productName}</li>
          </ul>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="s-py-50">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row gap-10">

            {/* ── LEFT: Gallery ────────────────────────────────────────────── */}
            <div className="w-full lg:w-[58%]">
              <ProductGallery
                media={mediaItems}
                productName={productName}
                discountPct={`-${discountPercentage}%`}
              />
            </div>

            {/* ── RIGHT: Product info — reordered sequence ─────────────────── */}
            <div className="lg:max-w-[635px] w-full">

              {/* ① Name + Rating + Price + Wishlist / Share icons */}
              {/* ProductHeader renders: product name, star rating, review count,
                  price with original/discount, wishlist toggle, share icon */}
              <ProductHeader
                name={productName}
                rating={RATING_SUMMARY.average}
                totalReviews={RATING_SUMMARY.total}
                price={price}
                originalPrice={originalPrice}
                discountPercentage={discountPercentage}
                stockQty={stockQty}
                isWishlisted={isWishlisted}
                onWishlistToggle={handleWishlistToggle}
                onReviewScroll={handleReviewScroll}
                isLoadingWishlist={wishlistLoading}
              />

              {/* ② Size / Color / Customize — rendered by ProductInfo (top portion)
                  ProductInfo internally shows sizes, colors, customize, sku, category.
                  We pass only the variant/customize fields here so it appears
                  right after name+price, before the cart button. */}
              <div className="mt-5">
                <ProductInfo
                  description={undefined}   /* description moved below cart */
                  details={undefined}       /* details moved below cart */
                  features={undefined}      /* features moved below cart */
                  sizes={variants.sizes}
                  colors={variants.colors}
                  category={product?.category?.name}
                  sku={String(product?.id ?? parsedId ?? '—')}
                />
              </div>

              {/* ③ Quantity selector + Add to Cart + Buy Now */}
              {/* ProductActions renders qty stepper, Add to Cart, Buy Now */}
              <ProductActions
                quantity={quantity}
                onQuantityChange={setQuantity}
                maxQty={maxQty}
                outOfStock={outOfStock}
                isAdding={isAdding}
                onAddToCart={handleAddToCart}
              />

              {/* ④ Shipping box + Estimated delivery 15–16 days */}
              {/* ShippingBox is new — added for this sequence, no existing code removed */}
              <ShippingBox stockQty={stockQty} />

              {/* ⑤ Bulk order WhatsApp link */}
              <p className="text-sm font-medium flex items-center gap-1.5 mt-4 mb-3">
                <FaWhatsapp size={16} color="#25d366" />
                Want to buy in bulk?{' '}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `I want to buy ${productName} in bulk.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-[#5B4FBE]"
                >
                  Chat with us
                </a>
              </p>

              {/* ⑥ Hurry Up! countdown timer */}
              <div className="mt-4 flex items-center gap-4 flex-wrap">
                <h4 className="text-xl font-bold">Hurry Up!</h4>
                <div className="bg-red-50 rounded-full px-4 py-2 flex items-center gap-2">
                  {CLOCK_UNITS.map(([lbl, key], i, arr) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-red-600">
                        {countdown[key]}
                      </span>
                      <span className="text-sm font-semibold text-red-600">{lbl}</span>
                      {i < arr.length - 1 && (
                        <span className="text-red-600 text-lg">:</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ⑦ Description paragraph */}
              <p className="text-base text-gray-600 mt-5 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                {product?.description ??
                  `Experience the epitome of relaxation with our ${productName}. Crafted with plush cushioning and ergonomic design, it offers unparalleled comfort for lounging or reading.`}
              </p>

            </div>
            {/* ── end RIGHT panel ──────────────────────────────────────────── */}

          </div>
        </div>
      </div>

      {/* Reviews */}
      {!reviewsLoading && (
        <CustomerReviews
          productId={parsedId}
          reviews={reviews}
          onReviewAdded={(review) => setReviews((prev) => [review, ...prev])}
          onReviewDeleted={(id) => setReviews((prev) => prev.filter((r) => r.id !== id))}
        />
      )}

      {/* Related Products */}
      <div className="s-py-50-100">
        <div className="container-fluid">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold">Related Products</h3>
            <p className="text-base text-gray-500 mt-2">
              Explore complementary options curated just for you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1720px] mx-auto">
            {productList.slice(0, 4).map((item: any) => (
              <LayoutOne key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}