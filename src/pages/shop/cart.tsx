// Cart.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Aos from "aos";
import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
import bg from '../../assets/img/shortcode/breadcumb.jpg';
import type { CartState } from "../../api/cart.api";
import { getCart, removeFromCartItem, updateCartItem } from "../../api/cart.api";

// ── Brand tokens ─────────────────────────────────────────
const BRAND = 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)';

function GradText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span 
      className={className}
      style={{ 
        background: BRAND, 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent', 
        backgroundClip: 'text', 
        display: 'inline-block' 
      }}
    >
      {children}
    </span>
  );
}

const parseMoney = (price: string): { value: number; symbol: string } => {
  const s = price ?? '';
  const symbol = s.includes('$') ? '$' : s.includes('$') ? '$' : '$';
  const normalized = s.replace(/,/g, '');
  const match = normalized.match(/(\d+(\.\d+)?)/);
  const value = match ? parseFloat(match[1]) : 0;
  return { value, symbol };
};

export default function Cart() {
  const [cart, setCart] = useState<CartState>({ lines: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
    let alive = true;
    setLoading(true);

    const refresh = () => {
      setLoading(true);
      getCart()
        .then(c => { if (alive) setCart(c); })
        .catch((e: any) => { if (alive) setError(e?.message ?? 'Failed to load cart.'); })
        .finally(() => { if (alive) setLoading(false); });
    };

    refresh();
    window.addEventListener('cart:changed', refresh as EventListener);

    return () => { alive = false; };
  }, []);

  const currencySymbol = useMemo(() => {
    if (cart.lines[0]?.product?.price) return parseMoney(cart.lines[0].product.price).symbol || '$';
    return '$';
  }, [cart.lines]);

  const subtotal = useMemo(() =>
    cart.lines.reduce((acc, line) => acc + parseMoney(line.product.price).value * line.quantity, 0),
    [cart.lines]);

  const totalMRP = useMemo(() =>
    cart.lines.reduce((acc, line) => acc + parseMoney(line.product.price).value * 2 * line.quantity, 0),
    [cart.lines]);

  const offerDiscount = totalMRP - subtotal;
  const shipping = 699;
  const platformFee = 10;
  const total = subtotal + shipping + platformFee;

  const handleQtyChange = async (productId: number, newQty: number) => {
    const qty = Math.max(1, Math.floor(newQty));
    setActionLoadingId(productId);
    try {
      const next = await updateCartItem(productId, qty);
      setCart(next);
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (productId: number) => {
    setActionLoadingId(productId);
    try {
      const next = await removeFromCartItem(productId);
      setCart(next);
    } catch (err) {
      console.error('Remove failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePincodeCheck = () => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryMsg('Please enter a valid 6-digit pincode');
      return;
    }
    setTimeout(() => {
      setDeliveryMsg('✓ Delivery available. Standard delivery in 5–7 days.');
    }, 500);
  };

  const applyOffer = (code: string, discount: number) => {
    setAppliedOffer({ code, discount });
  };

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb */}
      <div 
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          <h2 className="text-white md:text-[40px] font-normal leading-none text-center">Your Shopping Basket</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li><GradText>Cart</GradText></li>
          </ul>
        </div>
      </div>

      <div className="s-py-100">
        <div className="container mx-auto px-4 max-w-[1400px]">

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div 
                className="inline-block w-9 h-9 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#5B4FBE', borderTopColor: 'transparent' }} 
              />
              <p className="mt-4 text-[15px] text-gray-400 font-medium">Loading your basket…</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center text-[14px] font-medium text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Empty Cart */}
          {!loading && !error && cart.lines.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-[17px] font-semibold text-gray-700 mb-2">Your basket is empty</p>
              <p className="text-[14px] text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
              <Link 
                to="/shop" 
                className="inline-block px-7 py-3 rounded-xl text-white text-[14px] font-semibold"
                style={{ background: BRAND }}
              >
                Continue Shopping
              </Link>
            </div>
          )}

          {/* Main Cart Content */}
          {!loading && !error && cart.lines.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* LEFT: Cart Items */}
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

                  {/* Items List */}
                  <div className="divide-y divide-gray-100">
                    {cart.lines.map(line => {
                      const { value, symbol } = parseMoney(line.product.price);
                      const itemTotal = value * line.quantity;
                      const mrpValue = value * 2;
                      const saved = (mrpValue - value) * line.quantity;
                      const isLoading = actionLoadingId === line.product.id;

                      return (
                        <div 
                          key={line.product.id} 
                          className={`p-5 md:p-6 flex flex-col sm:flex-row gap-5 transition-opacity ${isLoading ? 'opacity-50' : ''}`}
                        >
                          {/* Product Image */}
                          <div className="sm:w-[120px] md:w-[140px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                            <img 
                              src={line.product.image} 
                              alt={line.product.name}
                              className="w-full h-[120px] md:h-[140px] object-cover" 
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[15px] font-bold text-gray-900 leading-snug mb-1">
                                  {line.product.name}
                                </h4>
                                <p className="text-[12px] text-gray-400 font-medium mb-1">
                                  {line.product.tag || 'Wall Art'}
                                </p>
                                <p className="text-[12px] text-gray-500">
                                  Colour: <span className="font-semibold text-gray-700">{line.product.color || 'Default'}</span>
                                </p>
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0">
                                <div className="text-[18px] font-extrabold leading-none mb-1">
                                  <GradText>{symbol}{itemTotal.toFixed(0)}</GradText>
                                </div>
                                <div className="text-[12px] text-gray-400 line-through">
                                  {symbol}{(mrpValue * line.quantity).toFixed(0)}
                                </div>
                                <div className="text-[12px] font-semibold text-green-600 mt-0.5">
                                  Saved {symbol}{saved.toFixed(0)}
                                </div>
                              </div>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button 
                                  onClick={() => handleQtyChange(line.product.id, line.quantity - 1)}
                                  disabled={isLoading || line.quantity <= 1}
                                  className="w-9 h-9 flex items-center justify-center text-[16px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                  −
                                </button>
                                <span className="w-10 text-center text-[14px] font-bold text-gray-800 border-x border-gray-200 py-2">
                                  {line.quantity}
                                </span>
                                <button 
                                  onClick={() => handleQtyChange(line.product.id, line.quantity + 1)}
                                  disabled={isLoading}
                                  className="w-9 h-9 flex items-center justify-center text-[16px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-gray-300">|</span>

                              <button 
                                onClick={() => handleRemove(line.product.id)} 
                                disabled={isLoading}
                                className="text-[13px] font-semibold text-gray-500 hover:text-red-500 transition disabled:opacity-40"
                              >
                                Remove
                              </button>

                              <span className="text-gray-300">|</span>

                              <button 
                                className="text-[13px] font-semibold transition"
                                style={{ 
                                  background: BRAND, 
                                  WebkitBackgroundClip: 'text', 
                                  WebkitTextFillColor: 'transparent', 
                                  backgroundClip: 'text' 
                                }}
                              >
                                Move to Favourites
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: Order Summary */}
              <div className="lg:w-[380px] flex-shrink-0">
                <div className="sticky top-24 space-y-5">

                  {/* Pincode Check */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h4 className="text-[15px] font-bold text-gray-900 mb-3">📍 Delivery Check</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit pincode" 
                        value={pincode}
                        onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#5B4FBE] transition" 
                      />
                      <button 
                        onClick={handlePincodeCheck}
                        className="px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold"
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

                  {/* Price Breakdown */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h4 className="text-[15px] font-bold text-gray-900 mb-4">Price Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-gray-500">Total MRP ({cart.lines.length} item{cart.lines.length !== 1 ? 's' : ''})</span>
                        <span className="text-[14px] font-semibold text-gray-700">{currencySymbol}{totalMRP.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-green-600 font-medium">Offer Discount</span>
                        <span className="text-[14px] font-bold text-green-600">−{currencySymbol}{offerDiscount.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-gray-500">Shipping (Large Items)</span>
                        <span className="text-[14px] font-semibold text-gray-700">{currencySymbol}{shipping}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-gray-500">Platform Fee</span>
                        <span className="text-[14px] font-semibold text-gray-700">{currencySymbol}{platformFee}</span>
                      </div>

                      {appliedOffer && (
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] text-green-600 font-medium">Coupon ({appliedOffer.code})</span>
                          <span className="text-[14px] font-bold text-green-600">−{currencySymbol}{appliedOffer.discount.toFixed(0)}</span>
                        </div>
                      )}

                      <div className="border-t border-gray-100 pt-3 mt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[15px] font-bold text-gray-900">Total Amount</span>
                          <span className="text-[18px] font-extrabold">
                            <GradText>{currencySymbol}{total.toFixed(0)}</GradText>
                          </span>
                        </div>
                        <p className="text-[11px] text-green-600 font-medium mt-1">
                          You save {currencySymbol}{offerDiscount.toFixed(0)} on this order 🎉
                        </p>
                      </div>
                    </div>

                    <Link 
                      to="/checkout"
                      className="w-full block text-center mt-5 py-3.5 rounded-xl text-white text-[15px] font-bold tracking-wide transition hover:opacity-90"
                      style={{ background: BRAND }}
                    >
                      Proceed to Checkout →
                    </Link>
                    <p className="text-[11px] text-gray-400 text-center mt-2">🔒 Secure & Encrypted Payment</p>
                  </div>

                  {/* Offers Section */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h4 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🏷️ Offers for You
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-gray-800 mb-0.5">10% off on prepaid orders</p>
                          <p className="text-[11px] text-gray-400">Use code:</p>
                          <span className="inline-block mt-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider border border-dashed border-[#5B4FBE] bg-[#f3f1ff] text-[#5B4FBE]">
                            PREPAID10
                          </span>
                        </div>
                        <button 
                          onClick={() => applyOffer('PREPAID10', subtotal * 0.1)}
                          className="flex-shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-lg text-white"
                          style={{ background: BRAND }}
                        >
                          Apply
                        </button>
                      </div>

                      <div className="flex justify-between items-start gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-gray-800 mb-0.5">Free Shipping above $50,000</p>
                          <p className="text-[11px] text-gray-400">Auto-applied at checkout</p>
                        </div>
                        <span className="flex-shrink-0 text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                          ✓ Active
                        </span>
                      </div>
                    </div>

                    {appliedOffer && (
                      <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200">
                        <p className="text-[12px] font-semibold text-green-700">
                          ✓ "{appliedOffer.code}" applied — {currencySymbol}{appliedOffer.discount.toFixed(0)} saved!
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}