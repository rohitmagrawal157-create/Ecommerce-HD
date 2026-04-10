import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Aos from "aos";

import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
import bg from '../../assets/img/shortcode/breadcumb.jpg';

import type { CartState } from "../../api/cart.api";
import { getCart } from "../../api/cart.api";

// Helper to parse price strings
const parseMoney = (price: string): { value: number; symbol: string } => {
  const s = price ?? '';
  const symbol = s.includes('₹') ? '₹' : s.includes('$') ? '$' : '₹';
  const normalized = s.replace(/,/g, '');
  const match = normalized.match(/(\d+(\.\d+)?)/);
  const value = match ? parseFloat(match[1]) : 0;
  return { value, symbol };
};

interface BillingInfo {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  zipCode: string;
  addressLine1: string;
  addressLine2: string;
  additionalText: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartState>({ lines: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<"free" | "fast" | "pickup">("free");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Billing form state
  const [billing, setBilling] = useState<BillingInfo>({
    fullName: "",
    email: "",
    phone: "",
    city: "Sylhet",
    zipCode: "",
    addressLine1: "",
    addressLine2: "",
    additionalText: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<BillingInfo>>({});

  useEffect(() => {
    Aos.init({ once: true, duration: 600 });

    let alive = true;
    setLoading(true);
    getCart()
      .then((c) => {
        if (!alive) return;
        setCart(c);
      })
      .catch((e: any) => {
        if (!alive) return;
        setError(e?.message ?? 'Failed to load cart.');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => { alive = false; };
  }, []);

  // Currency symbol
  const currencySymbol = useMemo(() => {
    if (cart.lines[0]?.product?.price) return parseMoney(cart.lines[0].product.price).symbol || '₹';
    return '₹';
  }, [cart.lines]);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    return cart.lines.reduce((acc, line) => {
      const { value } = parseMoney(line.product.price);
      return acc + value * line.quantity;
    }, 0);
  }, [cart.lines]);

  // Shipping cost
  const shippingCost = useMemo(() => {
    if (shippingMethod === "free") return 0;
    if (shippingMethod === "fast") return 10;
    return 15; // pickup
  }, [shippingMethod]);

  // Total after coupon and shipping
  const total = useMemo(() => {
    return subtotal - couponDiscount + shippingCost;
  }, [subtotal, couponDiscount, shippingCost]);

  // Apply coupon (mock)
  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === "SAVE10") {
      setCouponDiscount(10);
      setAppliedCoupon(couponCode.toUpperCase());
    } else if (couponCode.toUpperCase() === "WELCOME5") {
      setCouponDiscount(5);
      setAppliedCoupon(couponCode.toUpperCase());
    } else {
      alert("Invalid coupon code");
    }
  };

  // Validate billing form
  const validateForm = (): boolean => {
    const errors: Partial<BillingInfo> = {};
    if (!billing.fullName.trim()) errors.fullName = "Full name is required";
    if (!billing.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(billing.email)) errors.email = "Email is invalid";
    if (!billing.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\d{10,}$/.test(billing.phone.replace(/\D/g, ''))) errors.phone = "Phone must be at least 10 digits";
    if (!billing.zipCode.trim()) errors.zipCode = "Zip code is required";
    if (!billing.addressLine1.trim()) errors.addressLine1 = "Address is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0 && termsAccepted;
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (cart.lines.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }
    setIsPlacingOrder(true);
    setOrderError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOrderSuccess(true);
      setTimeout(() => navigate("/payment-success"), 500);
    } catch (err) {
      setOrderError("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  

  if (orderSuccess) {
    return (
      <>
        <NavbarOne />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
            <p className="mt-2 text-gray-600">Redirecting to confirmation page...</p>
          </div>
        </div>
        <FooterOne />
        <ScrollToTop />
      </>
    );
  }

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb */}
      <div 
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70" 
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          <h2 className="text-white text-3xl md:text-[40px] font-normal leading-none text-center">Checkout</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4 flex-wrap">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li className="text-[#96865d]">Checkout</li>
          </ul>
        </div>
      </div>

      <div className="py-24">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-[#96865d] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-500">Loading checkout...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
          ) : cart.lines.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <p className="text-gray-500">Your cart is empty.</p>
              <Link to="/shop" className="inline-block mt-4 text-[#96865d] hover:underline">Continue Shopping</Link>
            </div>
          ) : (
            <div className="max-w-[1220px] mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* LEFT COLUMN – Billing Information */}
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8" data-aos="fade-up" data-aos-delay="100">
                {/* Coupon Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-600">
                    Are you missing your coupon code?{" "}
                    <button
                      onClick={() => setCouponOpen(!couponOpen)}
                      className="text-[#96865d] underline font-medium"
                    >
                      Click here to add
                    </button>
                  </p>
                  {couponOpen && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-5 py-2 bg-[#96865d] text-white rounded-lg hover:bg-[#96865d]/90 transition"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 mt-2">
                      Coupon {appliedCoupon} applied! -{currencySymbol}{couponDiscount}
                    </p>
                  )}
                </div>

                <h4 className="font-semibold text-xl md:text-2xl mb-6 text-gray-900">Billing Information</h4>
                <div className="grid gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={billing.fullName}
                      onChange={(e) => setBilling({ ...billing, fullName: e.target.value })}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none"
                      placeholder="John Doe"
                    />
                    {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={billing.email}
                      onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none"
                      placeholder="you@example.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone No. *</label>
                    <input
                      type="tel"
                      value={billing.phone}
                      onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none"
                      placeholder="9876543210"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Town / City</label>
                      <select
                        value={billing.city}
                        onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none"
                      >
                        <option>Sylhet</option>
                        <option>Dhaka</option>
                        <option>Chittagong</option>
                        <option>Rajshahi</option>
                        <option>Bogura</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                      <input
                        type="text"
                        value={billing.zipCode}
                        onChange={(e) => setBilling({ ...billing, zipCode: e.target.value })}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none"
                        placeholder="1217"
                      />
                      {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      value={billing.addressLine1}
                      onChange={(e) => setBilling({ ...billing, addressLine1: e.target.value })}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none"
                      placeholder="House No, Street"
                    />
                    {formErrors.addressLine1 && <p className="text-red-500 text-xs mt-1">{formErrors.addressLine1}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={billing.addressLine2}
                      onChange={(e) => setBilling({ ...billing, addressLine2: e.target.value })}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none"
                      placeholder="Apartment, Floor, Landmark"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Text (Optional)</label>
                    <textarea
                      value={billing.additionalText}
                      onChange={(e) => setBilling({ ...billing, additionalText: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#96865d] focus:border-[#96865d] outline-none resize-y"
                      placeholder="Delivery instructions, etc."
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN – Order Summary & Payment */}
              <div>
                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6" data-aos="fade-up" data-aos-delay="100">
                  <h4 className="font-semibold text-xl md:text-2xl mb-6 text-gray-900">Order Summary</h4>
                  <div className="space-y-4">
                    {cart.lines.map((line) => {
                      const { value, symbol } = parseMoney(line.product.price);
                      const itemTotal = value * line.quantity;
                      return (
                        <div key={line.product.id} className="flex justify-between items-start gap-4">
                          <div className="flex gap-3">
                            <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                              <img src={line.product.image} alt={line.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{line.product.name}</p>
                              <p className="text-xs text-gray-500">Qty: {line.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">{symbol}{itemTotal.toFixed(0)}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{currencySymbol}{subtotal.toFixed(0)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount</span>
                        <span>-{currencySymbol}{couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>{currencySymbol}{shippingCost}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-[#96865d]">{currencySymbol}{total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6" data-aos="fade-up" data-aos-delay="150">
                  <h4 className="font-semibold text-xl mb-4 text-gray-900">Shipping Method</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="free"
                          checked={shippingMethod === "free"}
                          onChange={() => setShippingMethod("free")}
                          className="accent-[#96865d]"
                        />
                        <span>Free Shipping (5-7 days)</span>
                      </div>
                      <span className="text-gray-600">{currencySymbol}0</span>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="fast"
                          checked={shippingMethod === "fast"}
                          onChange={() => setShippingMethod("fast")}
                          className="accent-[#96865d]"
                        />
                        <span>Fast Shipping (2-3 days)</span>
                      </div>
                      <span className="text-gray-600">{currencySymbol}10</span>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="pickup"
                          checked={shippingMethod === "pickup"}
                          onChange={() => setShippingMethod("pickup")}
                          className="accent-[#96865d]"
                        />
                        <span>Local Pickup</span>
                      </div>
                      <span className="text-gray-600">{currencySymbol}15</span>
                    </label>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6" data-aos="fade-up" data-aos-delay="200">
                  <h4 className="font-semibold text-xl mb-4 text-gray-900">Payment Method</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-[#96865d]"
                      />
                      <span>Cash on Delivery</span>
                      <span className="text-xs text-gray-500 ml-auto">(Extra ₹50)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="accent-[#96865d]"
                      />
                      <span>Debit / Credit Card</span>
                    </label>
                  </div>
                </div>

                {/* Terms & Place Order */}
                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8" data-aos="fade-up" data-aos-delay="250">
                  <label className="flex items-start gap-3 cursor-pointer mb-6">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#96865d]"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to all{" "}
                      <Link to="/terms-and-conditions" className="text-[#96865d] underline">Terms & Conditions</Link>
                    </span>
                  </label>

                  {orderError && <p className="text-red-600 text-sm mb-4">{orderError}</p>}

                  <div className="flex flex-wrap gap-4">
                    <Link 
                      to="/cart" 
                      className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex-1 text-center"
                    >
                      Back to Cart
                    </Link>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-500 transition flex-1 text-center"
                    >
                      {isPlacingOrder ? "Placing Order..." : "Place Order"}
                    </button>
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