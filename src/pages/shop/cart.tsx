// src/pages/cart/Cart.tsx
// ══════════════════════════════════════════════════════════════════════
//  Updated for new cart.api.ts CartLine shape:
//    line.id         = cart_id (for update/delete API calls)
//    line.productId  = actual product id (from cache/checkout)
//    line.product    = Product object (name, price, image)
//    line.quantity   = qty
//    line.subtotal   = price × qty from API
//    line.variantId  = variant_id if applicable
//
//  All API calls use cart_id (line.id) for update/delete — correct.
//  Product links use line.productId for /product-details/:id route.
// ══════════════════════════════════════════════════════════════════════

import { Link, useNavigate }                        from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Aos                                          from 'aos';
import NavbarOne   from '../../components/navbar/navbar-one';
import FooterOne   from '../../components/footer/footer-one';
import ScrollToTop from '../../components/scroll-to-top';
import bg          from '../../assets/img/shortcode/breadcumb.jpg';
import placeholderImg from '../../assets/img/thumb/shop-card.jpg';
import type { CartState, CartLine } from '../../api/cart.api';
import { getCart, removeFromCartItem, updateCartItem } from '../../api/cart.api';
import { toggleWishlist } from '../../api/wishlist.api';

// ── Brand tokens ───────────────────────────────────────────────────────────
const BRAND       = 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)';
const BRAND_SOLID = '#5B4FBE';

function GradText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={className} style={{
      background: BRAND, WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      color: 'transparent', display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function parseMoney(price: unknown): number {
  const n = parseFloat(String(price ?? '').replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function fmtINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function getMRP(line: CartLine): number {
  const selling = parseMoney(line.product.price);
  // Use API subtotal / qty as cross-check
  const apiUnit = line.subtotal > 0 ? line.subtotal / line.quantity : 0;
  const base    = apiUnit > 0 ? apiUnit : selling;
  return base * 1.4;  // 40% markup shown as fake MRP when no originalPrice
}

// ── Coupon definitions ─────────────────────────────────────────────────────
const COUPONS: Record<string, { label: string; type: 'percent' | 'fixed'; value: number }> = {
  PREPAID10:       { label: '10% off on prepaid',   type: 'percent', value: 0.10 },
  MAKEHOMESPECIAL: { label: '5% off sitewide',       type: 'percent', value: 0.05 },
  NESTTRY:         { label: '₹150 off (min ₹1,500)', type: 'fixed',   value: 150  },
};

const dispatchCartChange = () => window.dispatchEvent(new Event('cart:changed'));

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="text-center py-20">
      <div className="inline-block w-9 h-9 border-4 rounded-full animate-spin"
           style={{ borderColor: BRAND_SOLID, borderTopColor: 'transparent' }} />
      <p className="mt-4 text-[15px] text-gray-400 font-medium">Loading your basket…</p>
    </div>
  );
}

// ── Empty Cart ─────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
      <div className="text-6xl mb-4">🛒</div>
      <p className="text-[17px] font-semibold text-gray-700 mb-2">Your basket is empty</p>
      <p className="text-[14px] text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
      <Link to="/shop-v1"
        className="inline-block px-7 py-3 rounded-xl text-white text-[14px] font-semibold transition hover:opacity-90"
        style={{ background: BRAND }}>
        Continue Shopping
      </Link>
    </div>
  );
}

// ── Cart Item Row ──────────────────────────────────────────────────────────
interface CartLineRowProps {
  line:       CartLine;
  onQtyChange:(cartId: number, qty: number) => void;
  onRemove:   (cartId: number) => void;
  onFavourite:(productId: number, cartId: number) => void;
  isLoading:  boolean;
}

function CartLineRow({ line, onQtyChange, onRemove, onFavourite, isLoading }: CartLineRowProps) {
  // Use API subtotal when available, otherwise calculate
  const itemTotal   = line.subtotal > 0 ? line.subtotal : parseMoney(line.product.price) * line.quantity;
  const unitPrice   = parseMoney(line.product.price);
  const mrpPerUnit  = getMRP(line);
  const mrpTotal    = mrpPerUnit * line.quantity;
  const savedAmount = mrpTotal - itemTotal;

  return (
    <div className={`p-5 md:p-6 flex flex-col sm:flex-row gap-5 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Image — link to product page using productId */}
      <Link to={`/product-details/${line.productId}`}
        className="sm:w-[120px] md:w-[140px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 block">
        <img
          src={line.product.image || placeholderImg}
          alt={line.product.name}
          className="w-full h-[120px] md:h-[140px] object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImg; }}
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link to={`/product-details/${line.productId}`}>
              <h4 className="text-[15px] font-bold text-gray-900 leading-snug mb-1 hover:text-[#5B4FBE] transition">
                {line.product.name}
              </h4>
            </Link>
            {/* Cart ID — useful for support */}
            <p className="text-[11px] text-gray-300 mb-1">Cart #{line.id}</p>
            {/* Variant info */}
            {line.variantMeta?.color && (
              <p className="text-[12px] text-gray-500">
                Colour: <span className="font-semibold text-gray-700">{line.variantMeta.color}</span>
              </p>
            )}
            {line.variantMeta?.size && (
              <p className="text-[12px] text-gray-500">
                Size: <span className="font-semibold text-gray-700">{line.variantMeta.size}</span>
              </p>
            )}
            {/* Unit price */}
            {unitPrice > 0 && (
              <p className="text-[12px] text-gray-400 mt-0.5">
                {fmtINR(unitPrice)} × {line.quantity}
              </p>
            )}
          </div>

          {/* Price block — use API subtotal */}
          <div className="text-right flex-shrink-0">
            <div className="text-[18px] font-extrabold leading-none mb-1">
              <GradText>{fmtINR(itemTotal)}</GradText>
            </div>
            {savedAmount > 0 && (
              <>
                <div className="text-[12px] text-gray-400 line-through">{fmtINR(mrpTotal)}</div>
                <div className="text-[12px] font-semibold text-green-600 mt-0.5">Save {fmtINR(savedAmount)}</div>
              </>
            )}
          </div>
        </div>

        {/* Quantity + actions — all use line.id (cart_id) for API */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => onQtyChange(line.id, line.quantity - 1)}
              disabled={line.quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-[16px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
              −
            </button>
            <span className="w-10 text-center text-[14px] font-bold text-gray-800 border-x border-gray-200 py-2 select-none">
              {line.quantity}
            </span>
            <button onClick={() => onQtyChange(line.id, line.quantity + 1)}
              className="w-9 h-9 flex items-center justify-center text-[16px] font-bold text-gray-600 hover:bg-gray-50 transition">
              +
            </button>
          </div>

          <span className="text-gray-300 select-none">|</span>

          <button onClick={() => onRemove(line.id)}
            className="text-[13px] font-semibold text-gray-500 hover:text-red-500 transition">
            Remove
          </button>

          <span className="text-gray-300 select-none">|</span>

          <button onClick={() => onFavourite(line.productId, line.id)}
            className="text-[13px] font-semibold transition"
            style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>
            Move to Favourites
          </button>
        </div>

        {isLoading && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#5B4FBE] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400">Updating…</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Coupon Input ──────────────────────────────────────────────────────────
function CouponBox({ subtotal, applied, onApply, onRemove }: {
  subtotal: number;
  applied:  { code: string; discount: number } | null;
  onApply:  (code: string, discount: number) => void;
  onRemove: () => void;
}) {
  const [input,   setInput]   = useState('');
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApply = () => {
    const code   = input.trim().toUpperCase();
    if (!code) { setError('Enter a coupon code.'); return; }
    const coupon = COUPONS[code];
    if (!coupon) { setError('Invalid coupon code.'); setSuccess(null); return; }
    if (coupon.type === 'fixed' && coupon.value === 150 && subtotal < 1500) {
      setError('Minimum order value of ₹1,500 required.'); return;
    }
    const discount = coupon.type === 'percent' ? subtotal * coupon.value : coupon.value;
    onApply(code, discount);
    setSuccess(`"${code}" applied — ₹${Math.round(discount).toLocaleString('en-IN')} off!`);
    setError(null); setInput('');
  };

  if (applied) {
    return (
      <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-green-700">
          ✓ "{applied.code}" — ₹{Math.round(applied.discount).toLocaleString('en-IN')} saved!
        </p>
        <button onClick={onRemove} className="text-[11px] text-red-500 font-bold hover:underline ml-2">Remove</button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input type="text" placeholder="Enter coupon code" value={input}
          onChange={e => { setInput(e.target.value.toUpperCase()); setError(null); setSuccess(null); }}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#5B4FBE] transition uppercase" />
        <button onClick={handleApply}
          className="px-4 py-2 rounded-xl text-white text-[13px] font-semibold transition hover:opacity-90"
          style={{ background: BRAND }}>
          Apply
        </button>
      </div>
      {error   && <p className="text-[12px] mt-1.5 text-red-500 font-medium">{error}</p>}
      {success && <p className="text-[12px] mt-1.5 text-green-600 font-medium">{success}</p>}
    </div>
  );
}

// ── Order Summary ──────────────────────────────────────────────────────────
function OrderSummary({ lines, subtotal, totalMRP, appliedOffer, onApplyOffer, onRemoveOffer,
  pincode, setPincode, deliveryMsg, onPincodeCheck, onProceed }: {
  lines: CartLine[]; subtotal: number; totalMRP: number;
  appliedOffer: { code: string; discount: number } | null;
  onApplyOffer: (code: string, discount: number) => void;
  onRemoveOffer: () => void;
  pincode: string; setPincode: (v: string) => void;
  deliveryMsg: string | null; onPincodeCheck: () => void;
  onProceed?: () => void;
}) {
  const offerSaving    = totalMRP - subtotal;
  const shipping       = subtotal >= 50000 ? 0 : 699;
  const platformFee    = 10;
  const couponDiscount = appliedOffer?.discount ?? 0;
  const total          = Math.max(0, subtotal + shipping + platformFee - couponDiscount);

  return (
    <div className="lg:w-[380px] flex-shrink-0">
      <div className="sticky top-24 space-y-5">

        {/* Pincode check */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-[15px] font-bold text-gray-900 mb-3">📍 Delivery Check</h4>
          <div className="flex gap-2">
            <input type="text" placeholder="Enter 6-digit pincode" value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && onPincodeCheck()}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#5B4FBE] transition" />
            <button onClick={onPincodeCheck}
              className="px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold transition hover:opacity-90"
              style={{ background: BRAND }}>
              Check
            </button>
          </div>
          {deliveryMsg && (
            <p className={`text-[12px] mt-2 font-medium ${deliveryMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {deliveryMsg}
            </p>
          )}
        </div>

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-[15px] font-bold text-gray-900 mb-4">Price Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">Total MRP ({lines.length} item{lines.length !== 1 ? 's' : ''})</span>
              <span className="text-[14px] font-semibold text-gray-700">{fmtINR(totalMRP)}</span>
            </div>
            {offerSaving > 0 && (
              <div className="flex justify-between">
                <span className="text-[13px] text-green-600 font-medium">Offer Discount</span>
                <span className="text-[14px] font-bold text-green-600">−{fmtINR(offerSaving)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">
                Shipping{shipping === 0 && <span className="text-green-600 font-semibold"> (Free!)</span>}
              </span>
              <span className={`text-[14px] font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                {shipping === 0 ? 'FREE' : fmtINR(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">Platform Fee</span>
              <span className="text-[14px] font-semibold text-gray-700">{fmtINR(platformFee)}</span>
            </div>
            {appliedOffer && (
              <div className="flex justify-between">
                <span className="text-[13px] text-green-600 font-medium">Coupon ({appliedOffer.code})</span>
                <span className="text-[14px] font-bold text-green-600">−{fmtINR(couponDiscount)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-bold text-gray-900">Total Amount</span>
                <span className="text-[18px] font-extrabold"><GradText>{fmtINR(total)}</GradText></span>
              </div>
              {(offerSaving + couponDiscount) > 0 && (
                <p className="text-[11px] text-green-600 font-medium mt-1">
                  You save {fmtINR(offerSaving + couponDiscount)} on this order 🎉
                </p>
              )}
            </div>
          </div>

          <CouponBox subtotal={subtotal} applied={appliedOffer} onApply={onApplyOffer} onRemove={onRemoveOffer} />

          <button onClick={() => onProceed?.()}
            className="w-full block text-center mt-5 py-3.5 rounded-xl text-white text-[15px] font-bold tracking-wide transition hover:opacity-90"
            style={{ background: BRAND }}>
            Proceed to Checkout →
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">🔒 Secure &amp; Encrypted Payment</p>
        </div>

        {/* Available Offers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">🏷️ Available Offers</h4>
          <div className="space-y-4">
            {Object.entries(COUPONS).map(([code, coupon]) => (
              <div key={code} className="flex justify-between items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-gray-800 mb-1">{coupon.label}</p>
                  <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider border border-dashed border-[#5B4FBE] bg-[#f3f1ff] text-[#5B4FBE]">
                    {code}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-gray-800 mb-0.5">Free Shipping above ₹50,000</p>
                <p className="text-[11px] text-gray-400">Auto-applied at checkout</p>
              </div>
              <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                subtotal >= 50000 ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-400 bg-gray-100 border-gray-200'
              }`}>
                {subtotal >= 50000 ? '✓ Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function Cart() {
  const [cart,         setCart]         = useState<CartState>({ lines: [] });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [actionLoadId, setActionLoadId] = useState<number | null>(null); // holds cart_id
  const [pincode,      setPincode]      = useState('');
  const [deliveryMsg,  setDeliveryMsg]  = useState<string | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<{ code: string; discount: number } | null>(null);

  const refreshCart = useCallback(() => {
    setLoading(true);
    getCart()
      .then(c  => { setCart(c); setError(null); })
      .catch((e: any) => setError(e?.message ?? 'Failed to load cart.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
    refreshCart();
    window.addEventListener('cart:changed', refreshCart as EventListener);
    return () => window.removeEventListener('cart:changed', refreshCart as EventListener);
  }, [refreshCart]);

  // Compute subtotal from API subtotal field (most accurate)
  const subtotal = useMemo(
    () => cart.lines.reduce((acc, l) => acc + (l.subtotal > 0 ? l.subtotal : parseMoney(l.product.price) * l.quantity), 0),
    [cart.lines],
  );
  const totalMRP = useMemo(
    () => cart.lines.reduce((acc, l) => acc + getMRP(l) * l.quantity, 0),
    [cart.lines],
  );

  const navigate = useNavigate();

  const handleProceedToCheckout = useCallback(() => {
    const token    = window.localStorage.getItem('access_token');
    const authUser = window.localStorage.getItem('auth_user');
    if (token && authUser) {
      navigate('/checkout');
    } else {
      navigate('/login?returnUrl=%2Fcheckout');
    }
  }, [navigate]);

  // All handlers use line.id (cart_id) — correct for PUT/DELETE /api/cart/:cart_id
  const handleQtyChange = useCallback(async (cartId: number, newQty: number) => {
    const qty = Math.max(1, Math.floor(newQty));
    setActionLoadId(cartId);
    try {
      const next = await updateCartItem(cartId, qty);
      setCart(next);
      dispatchCartChange();
    } catch (err) {
      console.error('Cart: update qty failed', err);
    } finally {
      setActionLoadId(null);
    }
  }, []);

  const handleRemove = useCallback(async (cartId: number) => {
    setActionLoadId(cartId);
    try {
      const next = await removeFromCartItem(cartId);
      setCart(next);
      dispatchCartChange();
    } catch (err) {
      console.error('Cart: remove failed', err);
    } finally {
      setActionLoadId(null);
    }
  }, []);

  const handleMoveToFavourites = useCallback(async (productId: number, cartId: number) => {
    setActionLoadId(cartId);
    try {
      await toggleWishlist(productId);
      const next = await removeFromCartItem(cartId);
      setCart(next);
      dispatchCartChange();
      window.dispatchEvent(new Event('wishlist:changed'));
    } catch (err) {
      console.error('Cart: move to favourites failed', err);
    } finally {
      setActionLoadId(null);
    }
  }, []);

  const handlePincodeCheck = useCallback(() => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryMsg('Please enter a valid 6-digit pincode.'); return;
    }
    setDeliveryMsg(null);
    setTimeout(() => {
      const first = parseInt(pincode[0], 10);
      setDeliveryMsg(
        first > 2
          ? '✓ Delivery available. Standard delivery in 5–7 business days.'
          : '✗ Delivery not available at this pincode.',
      );
    }, 600);
  }, [pincode]);

  return (
    <>
      <NavbarOne />

      <div className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}>
        <div className="text-center w-full">
          <h2 className="text-white md:text-[40px] font-normal leading-none">Your Shopping Basket</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li><GradText>Cart</GradText></li>
          </ul>
        </div>
      </div>

      <div className="s-py-100">
        <div className="container mx-auto px-4 max-w-[1400px]">

          {loading && <Spinner />}

          {!loading && error && (
            <div className="text-center text-[14px] font-medium text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl">
              {error}
              <button onClick={refreshCart} className="ml-4 underline text-[#5B4FBE] font-bold">Retry</button>
            </div>
          )}

          {!loading && !error && cart.lines.length === 0 && <EmptyCart />}

          {!loading && !error && cart.lines.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-8">

              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-[17px] font-bold text-gray-900">
                      {cart.lines.length} Item{cart.lines.length !== 1 ? 's' : ''} in your basket
                    </h3>
                    <span className="text-[13px] text-gray-400">
                      Subtotal: <span className="font-bold text-gray-800">{fmtINR(subtotal)}</span>
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cart.lines.map(line => (
                      // key on line.id (cart_id) — unique even for same product in different variants
                      <CartLineRow
                        key={line.id}
                        line={line}
                        onQtyChange={handleQtyChange}
                        onRemove={handleRemove}
                        onFavourite={handleMoveToFavourites}
                        isLoading={actionLoadId === line.id}
                      />
                    ))}
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100">
                    <Link to="/shop-v1"
                      className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#5B4FBE] hover:underline">
                      ← Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>

              <OrderSummary
                lines={cart.lines}
                subtotal={subtotal}
                totalMRP={totalMRP}
                appliedOffer={appliedOffer}
                onApplyOffer={(code, discount) => setAppliedOffer({ code, discount })}
                onRemoveOffer={() => setAppliedOffer(null)}
                pincode={pincode}
                setPincode={setPincode}
                deliveryMsg={deliveryMsg}
                onPincodeCheck={handlePincodeCheck}
                onProceed={handleProceedToCheckout}
              />
            </div>
          )}

        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}