// Cart.tsx
/**
 * FIXES applied:
 *  #1  useEffect cleanup: removeEventListener added to return fn
 *  #2  offerDiscount formula fixed: based on MRP diff, not doubled price
 *  #3  total now subtracts appliedOffer.discount correctly
 *  #4  applyOffer: validates coupon code, disables re-apply, shows feedback
 *  #5  shipping auto-waived when subtotal >= 50000 (free shipping offer)
 *  #6  Event listener properly removed in cleanup
 */

import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from '../../hooks/useAuth';
import Aos from "aos";
import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
import bg from '../../assets/img/shortcode/breadcumb.jpg';
import placeholderImg from '../../assets/img/thumb/shop-card.jpg';
import type { CartState } from "../../api/cart.api";
import { getCart, removeFromCartItem, updateCartItem } from "../../api/cart.api";
import { toggleWishlist } from "../../api/wishlist.api";

// ── Brand tokens ───────────────────────────────────────────────────────────
const BRAND = 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)';
const BRAND_SOLID = '#5B4FBE';

function GradText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{
        background: BRAND,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',        // cross-browser fallback
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parses a price string like "₹1,095" or "$85.00" → { value: 1095, symbol: '₹' }
 * Always returns ₹ as the symbol.
 */
const parseMoney = (price: string): { value: number; symbol: string } => {
  const s = (price ?? '').replace(/,/g, '');
  const match = s.match(/[\d]+(\.\d+)?/);
  const value = match ? parseFloat(match[0]) : 0;
  return { value, symbol: '₹' };
};

/**
 * COUPON definitions — extend this array to add more codes.
 * discount: fraction (0.1 = 10%) OR fixed amount in ₹ (if type='fixed')
 */
const COUPONS: Record<string, { label: string; type: 'percent' | 'fixed'; value: number }> = {
  PREPAID10:      { label: '10% off on prepaid',           type: 'percent', value: 0.10 },
  MAKEHOMESPECIAL:{ label: '5% off sitewide',              type: 'percent', value: 0.05 },
  NESTTRY:        { label: '₹150 off (min ₹1500)',         type: 'fixed',   value: 150  },
};

const dispatchCartChange = () => window.dispatchEvent(new Event('cart:changed'));

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="text-center py-20">
      <div
        className="inline-block w-9 h-9 border-4 rounded-full animate-spin"
        style={{ borderColor: BRAND_SOLID, borderTopColor: 'transparent' }}
      />
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
      <Link
        to="/shop-v1"
        className="inline-block px-7 py-3 rounded-xl text-white text-[14px] font-semibold transition hover:opacity-90"
        style={{ background: BRAND }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}

// ── Cart Item Row ──────────────────────────────────────────────────────────
interface CartLineRowProps {
  line: CartState['lines'][0];
  onQtyChange: (lineId: number, qty: number) => void;
  onRemove:    (lineId: number) => void;
  onFavourite: (productId: number, lineId: number) => void;
  isLoading:   boolean;
}

function CartLineRow({ line, onQtyChange, onRemove, onFavourite, isLoading }: CartLineRowProps) {
  const { value, symbol } = parseMoney(line.product.price);
  // FIX #2: MRP is a realistic 40% higher, NOT doubled
  const MRP_MULTIPLIER = 1.4;
  const mrpPerUnit  = value * MRP_MULTIPLIER;
  const itemTotal   = value * line.quantity;
  const mrpTotal    = mrpPerUnit * line.quantity;
  const savedAmount = (mrpPerUnit - value) * line.quantity;

  return (
    <div
      className={`p-5 md:p-6 flex flex-col sm:flex-row gap-5 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Image — click goes to product detail */}
      <Link
        to={`/product-details/${line.product.id}`}
        className="sm:w-[120px] md:w-[140px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 block"
      >
        <img
          src={line.product.image || placeholderImg}
          alt={line.product.name}
          className="w-full h-[120px] md:h-[140px] object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link to={`/product-details/${line.product.id}`}>
              <h4 className="text-[15px] font-bold text-gray-900 leading-snug mb-1 hover:text-[#5B4FBE] transition">
                {line.product.name}
              </h4>
            </Link>
            <p className="text-[12px] text-gray-400 font-medium mb-1">
              {(line.product as any).tag || 'Wall Art'}
            </p>
            {(line.product as any).color && (
              <p className="text-[12px] text-gray-500">
                Colour: <span className="font-semibold text-gray-700">{(line.product as any).color}</span>
              </p>
            )}
          </div>

          {/* Price block */}
          <div className="text-right flex-shrink-0">
            <div className="text-[18px] font-extrabold leading-none mb-1">
              <GradText>{symbol}{itemTotal.toFixed(0)}</GradText>
            </div>
            <div className="text-[12px] text-gray-400 line-through">
              {symbol}{mrpTotal.toFixed(0)}
            </div>
            <div className="text-[12px] font-semibold text-green-600 mt-0.5">
              Save {symbol}{savedAmount.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Quantity + actions */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Qty stepper */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onQtyChange(line.id, line.quantity - 1)}
              disabled={line.quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-[16px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >−</button>
            <span className="w-10 text-center text-[14px] font-bold text-gray-800 border-x border-gray-200 py-2 select-none">
              {line.quantity}
            </span>
            <button
              onClick={() => onQtyChange(line.id, line.quantity + 1)}
              className="w-9 h-9 flex items-center justify-center text-[16px] font-bold text-gray-600 hover:bg-gray-50 transition"
            >+</button>
          </div>

          <span className="text-gray-300 select-none">|</span>

          <button
            onClick={() => onRemove(line.id)}
            className="text-[13px] font-semibold text-gray-500 hover:text-red-500 transition"
          >
            Remove
          </button>

          <span className="text-gray-300 select-none">|</span>

          <button
            onClick={() => onFavourite(line.product.id, line.id)}
            className="text-[13px] font-semibold transition"
            style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}
          >
            Move to Favourites
          </button>
        </div>

        {/* Loading indicator per row */}
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
interface CouponBoxProps {
  subtotal:     number;
  applied:      { code: string; discount: number } | null;
  onApply:      (code: string, discount: number) => void;
  onRemove:     () => void;
  currencySymbol: string;
}

function CouponBox({ subtotal, applied, onApply, onRemove, currencySymbol }: CouponBoxProps) {
  const [input,  setInput]  = useState('');
  const [error,  setError]  = useState<string | null>(null);
  const [success,setSuccess]= useState<string | null>(null);

  const handleApply = () => {
    const code = input.trim().toUpperCase();
    if (!code) { setError('Enter a coupon code.'); return; }
    const coupon = COUPONS[code];
    if (!coupon) { setError('Invalid coupon code.'); setSuccess(null); return; }
    if (coupon.type === 'fixed' && coupon.value === 150 && subtotal < 1500) {
      setError('Minimum order value of ₹1,500 required.'); return;
    }
    const discount = coupon.type === 'percent' ? subtotal * coupon.value : coupon.value;
    onApply(code, discount);
    setSuccess(`"${code}" applied — ${currencySymbol}${discount.toFixed(0)} off!`);
    setError(null);
    setInput('');
  };

  if (applied) {
    return (
      <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-green-700">
          ✓ "{applied.code}" — {currencySymbol}{applied.discount.toFixed(0)} saved!
        </p>
        <button onClick={onRemove} className="text-[11px] text-red-500 font-bold hover:underline ml-2">Remove</button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={input}
          onChange={e => { setInput(e.target.value.toUpperCase()); setError(null); setSuccess(null); }}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#5B4FBE] transition uppercase"
        />
        <button
          onClick={handleApply}
          className="px-4 py-2 rounded-xl text-white text-[13px] font-semibold transition hover:opacity-90"
          style={{ background: BRAND }}
        >
          Apply
        </button>
      </div>
      {error   && <p className="text-[12px] mt-1.5 text-red-500 font-medium">{error}</p>}
      {success && <p className="text-[12px] mt-1.5 text-green-600 font-medium">{success}</p>}
    </div>
  );
}

// ── Order Summary ──────────────────────────────────────────────────────────
interface SummaryProps {
  lines:          CartState['lines'];
  subtotal:       number;
  appliedOffer:   { code: string; discount: number } | null;
  onApplyOffer:   (code: string, discount: number) => void;
  onRemoveOffer:  () => void;
  pincode:        string;
  setPincode:     (v: string) => void;
  deliveryMsg:    string | null;
  onPincodeCheck: () => void;
  currencySymbol: string;
  onProceed?: () => void;
}

function OrderSummary({
  lines, subtotal, appliedOffer, onApplyOffer, onRemoveOffer,
  pincode, setPincode, deliveryMsg, onPincodeCheck, currencySymbol,
  onProceed,
}: SummaryProps) {
  // FIX #2: MRP is 40% above selling price (realistic)
  const MRP_MULTIPLIER = 1.4;
  const totalMRP    = lines.reduce((acc, l) => acc + parseMoney(l.product.price).value * MRP_MULTIPLIER * l.quantity, 0);
  const offerSaving = totalMRP - subtotal;                       // FIX #2
  // FIX #5: free shipping when subtotal >= 50000
  const shipping    = subtotal >= 50000 ? 0 : 699;
  const platformFee = 10;
  const couponDiscount = appliedOffer?.discount ?? 0;
  // FIX #3: total subtracts coupon discount
  const total = subtotal + shipping + platformFee - couponDiscount;

  return (
    <div className="lg:w-[380px] flex-shrink-0">
      <div className="sticky top-24 space-y-5">

        {/* Pincode check */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-[15px] font-bold text-gray-900 mb-3">📍 Delivery Check</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter 6-digit pincode"
              value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && onPincodeCheck()}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#5B4FBE] transition"
            />
            <button
              onClick={onPincodeCheck}
              className="px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold transition hover:opacity-90"
              style={{ background: BRAND }}
            >
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
              <span className="text-[14px] font-semibold text-gray-700">{currencySymbol}{totalMRP.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-green-600 font-medium">Offer Discount</span>
              <span className="text-[14px] font-bold text-green-600">−{currencySymbol}{offerSaving.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              {/* FIX #5: dynamic shipping label */}
              <span className="text-[13px] text-gray-500">
                Shipping {shipping === 0 && <span className="text-green-600 font-semibold">(Free!)</span>}
              </span>
              <span className={`text-[14px] font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                {shipping === 0 ? 'FREE' : `${currencySymbol}${shipping}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">Platform Fee</span>
              <span className="text-[14px] font-semibold text-gray-700">{currencySymbol}{platformFee}</span>
            </div>

            {/* FIX #3: coupon discount shown in summary */}
            {appliedOffer && (
              <div className="flex justify-between">
                <span className="text-[13px] text-green-600 font-medium">Coupon ({appliedOffer.code})</span>
                <span className="text-[14px] font-bold text-green-600">−{currencySymbol}{couponDiscount.toFixed(0)}</span>
              </div>
            )}

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-bold text-gray-900">Total Amount</span>
                <span className="text-[18px] font-extrabold">
                  <GradText>{currencySymbol}{Math.max(0, total).toFixed(0)}</GradText>
                </span>
              </div>
              <p className="text-[11px] text-green-600 font-medium mt-1">
                You save {currencySymbol}{(offerSaving + couponDiscount).toFixed(0)} on this order 🎉
              </p>
            </div>
          </div>

          {/* FIX #4: CouponBox replaces the old simple applyOffer */}
          <CouponBox
            subtotal={subtotal}
            applied={appliedOffer}
            onApply={onApplyOffer}
            onRemove={onRemoveOffer}
            currencySymbol={currencySymbol}
          />

          <button
            onClick={() => onProceed && onProceed()}
            className="w-full block text-center mt-5 py-3.5 rounded-xl text-white text-[15px] font-bold tracking-wide transition hover:opacity-90"
            style={{ background: BRAND }}
          >
            Proceed to Checkout →
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">🔒 Secure &amp; Encrypted Payment</p>
        </div>

        {/* Offers list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
            🏷️ Available Offers
          </h4>
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
            {/* FIX #5: free shipping shown conditionally */}
            <div className="flex justify-between items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-gray-800 mb-0.5">Free Shipping above ₹50,000</p>
                <p className="text-[11px] text-gray-400">Auto-applied at checkout</p>
              </div>
              <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                subtotal >= 50000
                  ? 'text-green-600 bg-green-50 border-green-200'
                  : 'text-gray-400 bg-gray-100 border-gray-200'
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
  const [cart,          setCart]          = useState<CartState>({ lines: [] });
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [actionLoadId,  setActionLoadId]  = useState<number | null>(null);
  const [pincode,       setPincode]       = useState('');
  const [deliveryMsg,   setDeliveryMsg]   = useState<string | null>(null);
  const [appliedOffer,  setAppliedOffer]  = useState<{ code: string; discount: number } | null>(null);

  // FIX #1 + #6: stable refresh with useCallback, properly cleaned up
  const refreshCart = useCallback(() => {
    setLoading(true);
    getCart()
      .then(c  => setCart(c))
      .catch((e: any) => setError(e?.message ?? 'Failed to load cart.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
    refreshCart();

    // FIX #6: addEventListener AND removeEventListener for cleanup
    window.addEventListener('cart:changed', refreshCart as EventListener);
    return () => {
      window.removeEventListener('cart:changed', refreshCart as EventListener);
    };
  }, [refreshCart]);

  const currencySymbol = '₹';

  const subtotal = useMemo(
    () => cart.lines.reduce((acc, l) => acc + parseMoney(l.product.price).value * l.quantity, 0),
    [cart.lines],
  );

  const navigate = useNavigate();
  const { isAuth } = useAuth();

  const handleProceedToCheckout = useCallback(() => {
    if (isAuth) {
      navigate('/checkout');
    } else {
      // Redirect user to login first; after successful login they'll be redirected
      // back to the checkout page (Login reads location.state.from).
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuth, navigate]);

  // ── Action handlers ──────────────────────────────────────────────────────

  const handleQtyChange = useCallback(async (lineId: number, newQty: number) => {
    const qty = Math.max(1, Math.floor(newQty));
    setActionLoadId(lineId);
    try {
      const next = await updateCartItem(lineId, qty);
      setCart(next);
      dispatchCartChange();
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setActionLoadId(null);
    }
  }, []);

  const handleRemove = useCallback(async (lineId: number) => {
    setActionLoadId(lineId);
    try {
      const next = await removeFromCartItem(lineId);
      setCart(next);
      dispatchCartChange();
    } catch (err) {
      console.error('Remove failed', err);
    } finally {
      setActionLoadId(null);
    }
  }, []);

  const handleMoveToFavourites = useCallback(async (productId: number, lineId: number) => {
    setActionLoadId(lineId);
    try {
      await toggleWishlist(productId);
      const next = await removeFromCartItem(lineId);
      setCart(next);
      dispatchCartChange();
      window.dispatchEvent(new Event('wishlist:changed'));
    } catch (err) {
      console.error('Move to favourites failed', err);
    } finally {
      setActionLoadId(null);
    }
  }, []);

  const handlePincodeCheck = useCallback(() => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryMsg('Please enter a valid 6-digit pincode.');
      return;
    }
    setDeliveryMsg(null);
    setTimeout(() => {
      const firstDigit = parseInt(pincode[0], 10);
      if (firstDigit > 2) {
        setDeliveryMsg('✓ Delivery available. Standard delivery in 5–7 business days.');
      } else {
        setDeliveryMsg('✗ Delivery not available at this pincode. Try a nearby one.');
      }
    }, 600);
  }, [pincode]);

  // FIX #4: proper apply + remove
  const handleApplyOffer  = useCallback((code: string, discount: number) => setAppliedOffer({ code, discount }), []);
  const handleRemoveOffer = useCallback(() => setAppliedOffer(null), []);

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb */}
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
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

              {/* LEFT: Items */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-[17px] font-bold text-gray-900">
                      {cart.lines.length} Item{cart.lines.length !== 1 ? 's' : ''} in your basket
                    </h3>
                    <span className="text-[13px] text-gray-400">
                      Subtotal: <span className="font-bold text-gray-800">{currencySymbol}{subtotal.toFixed(0)}</span>
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {cart.lines.map(line => (
                      <CartLineRow
                        key={line.product.id}
                        line={line}
                        onQtyChange={handleQtyChange}
                        onRemove={handleRemove}
                        onFavourite={handleMoveToFavourites}
                        isLoading={actionLoadId === line.product.id}
                      />
                    ))}
                  </div>

                  {/* Continue shopping */}
                  <div className="px-6 py-4 border-t border-gray-100">
                    <Link
                      to="/shop-v1"
                      className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#5B4FBE] hover:underline"
                    >
                      ← Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>

              {/* RIGHT: Summary */}
              <OrderSummary
                lines={cart.lines}
                subtotal={subtotal}
                appliedOffer={appliedOffer}
                onApplyOffer={handleApplyOffer}
                onRemoveOffer={handleRemoveOffer}
                pincode={pincode}
                setPincode={setPincode}
                deliveryMsg={deliveryMsg}
                onPincodeCheck={handlePincodeCheck}
                currencySymbol={currencySymbol}
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