import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Aos from "aos";

import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
import bg from '../../assets/img/shortcode/breadcumb.jpg';

import type { CartState } from "../../api/cart.api";
import { getCart, removeFromCartItem, updateCartItem } from "../../api/cart.api";

// Helper to parse price strings
const parseMoney = (price: string): { value: number; symbol: string } => {
  const s = price ?? '';
  const symbol = s.includes('₹') ? '₹' : s.includes('$') ? '$' : '₹';
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
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => {
    Aos.init({ once: true, duration: 600 });

    let alive = true;
    setLoading(true);
    const refresh = () => {
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
    };

    refresh();
    window.addEventListener('cart:changed', refresh as EventListener);

    return () => { alive = false; };
  }, []);

  const currencySymbol = useMemo(() => {
    if (cart.lines[0]?.product?.price) return parseMoney(cart.lines[0].product.price).symbol || '₹';
    return '₹';
  }, [cart.lines]);

  // Calculate subtotal, total MRP, offer discount, etc.
  const subtotal = useMemo(() => {
    return cart.lines.reduce((acc, line) => {
      const { value } = parseMoney(line.product.price);
      return acc + value * line.quantity;
    }, 0);
  }, [cart.lines]);

  // Mock original MRP (assume 50% higher for demo – replace with real data)
  const totalMRP = useMemo(() => {
    return cart.lines.reduce((acc, line) => {
      const { value } = parseMoney(line.product.price);
      // Assume MRP is double the selling price (50% off)
      const mrp = value * 2;
      return acc + mrp * line.quantity;
    }, 0);
  }, [cart.lines]);

  const offerDiscount = totalMRP - subtotal;
  const shipping = 699; // Fixed furniture shipping (example)
  const platformFee = 10;
  const total = subtotal + shipping + platformFee;

  const handleQtyChange = async (productId: number, newQty: number) => {
    const qty = Math.max(1, Math.floor(newQty));
    setActionLoadingId(productId);
    try {
      const next = await updateCartItem(productId, qty);
      setCart(next);
    } catch (err) {
      console.error("Update failed", err);
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
      console.error("Remove failed", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePincodeCheck = () => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryMsg("Please enter a valid 6-digit pincode");
      return;
    }
    // Mock delivery check
    setTimeout(() => {
      setDeliveryMsg("✓ Delivery available to this pincode. Standard delivery in 5-7 days.");
    }, 500);
  };

  const applyOffer = (code: string, discount: number) => {
    setAppliedOffer({ code, discount });
  };

  const primaryColor = "#96865d";

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb */}
      <div className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70" style={{ backgroundImage: `url(${bg})` }}>
        <div className="text-center w-full">
          <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">Your Shopping Basket</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li className="text-primary">Cart</li>
          </ul>
        </div>
      </div>

      <div className="s-py-100">
        <div className="container mx-auto px-4">
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-500">Loading your basket...</p>
            </div>
          )}
          {!loading && error && (
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
          )}
          {!loading && !error && cart.lines.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-dark-secondary rounded-xl">
              <p className="text-gray-500">Your basket is empty.</p>
              <Link to="/shop" className="inline-block mt-4 text-primary hover:underline">Continue Shopping</Link>
            </div>
          )}
          {!loading && !error && cart.lines.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Basket Items */}
              <div className="flex-1">
                <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">{cart.lines.length} Product{cart.lines.length !== 1 ? 's' : ''}</h3>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.lines.map((line) => {
                      const { value, symbol } = parseMoney(line.product.price);
                      const itemTotal = value * line.quantity;
                      const mrpValue = value * 2; // mock MRP
                      const saved = (mrpValue - value) * line.quantity;
                      return (
                        <div key={line.product.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4">
                          {/* Product Image - larger */}
                          <div className="sm:w-32 md:w-40 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={line.product.image}
                              alt={line.product.name}
                              className="w-full h-32 sm:h-36 object-cover"
                            />
                          </div>
                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex flex-wrap justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white">{line.product.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{line.product.tag || "Furniture"}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{symbol}{itemTotal.toFixed(0)}</div>
                                <div className="text-sm text-gray-400 line-through">{symbol}{mrpValue.toFixed(0)}</div>
                                <div className="text-xs text-green-600">You saved {symbol}{saved.toFixed(0)}</div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Colour: {line.product.color || "Beige"}
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                              [Choose delivery date at checkout]
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-4">
                              {/* Quantity Selector */}
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => handleQtyChange(line.product.id, line.quantity - 1)}
                                  disabled={actionLoadingId === line.product.id || line.quantity <= 1}
                                  className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 min-w-[40px] text-center">{line.quantity}</span>
                                <button
                                  onClick={() => handleQtyChange(line.product.id, line.quantity + 1)}
                                  disabled={actionLoadingId === line.product.id}
                                  className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemove(line.product.id)}
                                className="text-sm text-gray-500 hover:text-red-500 transition"
                              >
                                Remove
                              </button>
                              <button className="text-sm text-gray-500 hover:text-primary transition">
                                Move to favourites
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Order Summary & Offers */}
              <div className="lg:w-96">
                <div className="sticky top-24 space-y-6">
                  {/* Delivery Pincode Card */}
                  <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm p-5">
                    <h4 className="font-semibold mb-3">Delivering to</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter pin code"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      />
                      <button
                        onClick={handlePincodeCheck}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                      >
                        Check
                      </button>
                    </div>
                    {deliveryMsg && (
                      <p className={`text-xs mt-2 ${deliveryMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
                        {deliveryMsg}
                      </p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm p-5">
                    <h4 className="font-semibold mb-3">Price Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total MRP</span>
                        <span>{currencySymbol}{totalMRP.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Offer discount</span>
                        <span>-{currencySymbol}{offerDiscount.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Furniture & Large Items Shipping</span>
                        <span>{currencySymbol}{shipping}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform fee Details</span>
                        <span>{currencySymbol}{platformFee}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-base">
                          <span>Total</span>
                          <span className="text-primary">{currencySymbol}{total.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/checkout"
                      className="w-full block text-center mt-5 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Checkout now
                    </Link>
                  </div>

                  {/* Offers for you */}
                  <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm p-5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      🏷️ Offers for you!
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">10% off on prepaid orders</p>
                          <p className="text-xs text-gray-500">Use code: PREPAID10</p>
                        </div>
                        <button
                          onClick={() => applyOffer("PREPAID10", subtotal * 0.1)}
                          className="text-xs px-3 py-1 border border-primary text-primary rounded hover:bg-primary hover:text-white transition"
                        >
                          Select
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Free Shipping on orders above ₹50,000</p>
                          <p className="text-xs text-gray-500">Auto-applied</p>
                        </div>
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                    {appliedOffer && (
                      <p className="text-xs text-green-600 mt-3">
                        Coupon "{appliedOffer.code}" applied! {currencySymbol}{appliedOffer.discount.toFixed(0)} off.
                      </p>
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