import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
// import AccountTab from "../../components/account/account-tab";

import bg from '../../assets/img/shortcode/breadcumb.jpg'
import placeholderImg from '../../assets/img/thumb/shop-card.jpg'
import type { Product } from "../../api/products";
import { addToCart } from "../../api/cart.api";
import { getWishlist, removeFromWishlist, type WishlistState } from "../../api/wishlist.api";

import { RiShoppingBag2Line, RiDeleteBinLine } from "react-icons/ri";
import { GoStarFill } from "react-icons/go";
import { LuHeart } from "react-icons/lu";
import { BsCheckLg } from "react-icons/bs";

import Aos from "aos";

// Helper to compute MRP for sale items
function computeMrp(price: string, discountPct = 20): string {
  const num = parseFloat(price.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '';
  const mrp = num / (1 - discountPct / 100);
  return `$${mrp.toFixed(2)}`;
}

const SALE_TAGS = new Set(['Sale', 'Hot Sale', '10% OFF', 'Hot']);

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistState>({ productIds: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyCart, setBusyCart] = useState<number | null>(null);
  const [cartAdded, setCartAdded] = useState<number | null>(null);
  const [busyRemove, setBusyRemove] = useState<number | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Aos.init();
    let alive = true;
    const refresh = () => {
      setLoading(true);
      getWishlist()
        .then((w) => { if (alive) setWishlist(w); })
        .catch((e: any) => { if (alive) setError(e?.message ?? 'Failed to load wishlist.'); })
        .finally(() => { if (alive) setLoading(false); });
    };
    refresh();
    window.addEventListener('wishlist:changed', refresh as EventListener);
    return () => {
      alive = false;
      window.removeEventListener('wishlist:changed', refresh as EventListener);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleRemove = async (productId: number) => {
    if (busyRemove === productId) return;
    setBusyRemove(productId);
    try {
      const next = await removeFromWishlist(productId);
      setWishlist(next);
    } catch (err) {
      console.error(err);
    } finally {
      setBusyRemove(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // UPDATED: handleAddToCart
  // Logic: Add to Cart → If Success → Remove from Wishlist ("Shift to Cart")
  // ─────────────────────────────────────────────────────────────────────
  const handleAddToCart = async (productId: number) => {
    if (busyCart === productId) return;
    setBusyCart(productId);
    try {
      // 1. Add to cart API
      await addToCart(productId, 1);
      
      // 2. Show success visual feedback
      setCartAdded(productId);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setCartAdded(null), 1600);

      // 3. Remove from wishlist (Shift logic)
      // We call removeFromWishlist which updates the state automatically
      await removeFromWishlist(productId); 
      
    } catch (err) {
      console.error("Failed to add to cart or remove from wishlist", err);
      // Note: If addToCart fails, we do NOT remove from wishlist
    } finally {
      setBusyCart(null);
    }
  };

  // Inject global styles
  useEffect(() => {
    if (document.getElementById('wishlist-styles')) return;
    const style = document.createElement('style');
    style.id = 'wishlist-styles';
    style.textContent = `
      @keyframes infPop {
        0% { transform: scale(1); }
        38% { transform: scale(1.52); }
        65% { transform: scale(0.86); }
        100% { transform: scale(1); }
      }
      .inf-pop { animation: infPop 0.36s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
      .wishlist-card .hover-overlay {
        transform: translateY(100%);
        opacity: 0;
        transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.26s ease;
      }
      .wishlist-card:hover .hover-overlay {
        transform: translateY(0%);
        opacity: 1;
      }
      .wishlist-card .hover-btn {
        opacity: 0;
        transform: translateY(5px);
        transition: opacity 0.22s ease, transform 0.22s ease;
      }
      .wishlist-card:hover .hover-btn {
        opacity: 1;
        transform: translateY(0);
      }
      .wishlist-card:hover .hover-btn:nth-child(1) { transition-delay: 0ms; }
      .wishlist-card:hover .hover-btn:nth-child(2) { transition-delay: 58ms; }
      .wishlist-card .img-zoom {
        transition: transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      .wishlist-card:hover .img-zoom {
        transform: scale(1.07);
      }
      .wishlist-card {
        transition: box-shadow 0.28s ease, transform 0.28s ease, border-color 0.2s ease;
      }
      .wishlist-card:hover {
        box-shadow: 0 8px 32px rgba(107, 63, 160, 0.16);
        transform: translateY(-2px);
        border-color: rgba(107, 63, 160, 0.18);
      }
      .inf-price {
        background: linear-gradient(135deg, #6B3FA0 0%, #DC2626 50%, #F97316 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .inf-mrp {
        text-decoration: line-through;
        color: #9CA3AF;
        font-size: 11px;
        font-weight: 400;
      }
      .inf-disc {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 6px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #fff;
        background: linear-gradient(135deg, #DC2626, #F97316);
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <NavbarOne />

      {/* Hero Banner */}
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">Wishlist</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li className="text-primary">wishlist</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="s-py-100">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex items-start gap-8 md:gap-12 2xl:gap-24 flex-col md:flex-row my-profile-navtab">
            <div className="w-full md:w-auto md:flex-1" data-aos="fade-up" data-aos-delay="300">
              {loading ? (
                <div className="text-center text-sm text-gray-500 py-10">Loading wishlist...</div>
              ) : error ? (
                <div className="text-center text-sm text-red-600 py-10">{error}</div>
              ) : wishlist.products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
                  <LuHeart size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-500 mb-6">Save your favorite items here.</p>
                  <Link
                    to="/shop-v1"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-red-500 text-white rounded-md hover:shadow-lg transition"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {wishlist.products.map((item: Product) => {
                    const isSaleTag = item.tag ? SALE_TAGS.has(item.tag.trim()) : false;
                    const discPct = item.discount ?? (isSaleTag ? 20 : 0);
                    const mrp = item.originalPrice ?? (discPct > 0 ? computeMrp(item.price, discPct) : '');
                    const showPricing = discPct > 0 && mrp !== '';
                    const ratingNum = item.rating ?? 4;
                    const ratingLabel = ratingNum.toFixed(1);

                    return (
                      <div
                        key={item.id}
                        className="wishlist-card relative flex flex-col overflow-hidden bg-white border border-gray-100 rounded-lg"
                      >
                        {/* Image Zone */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                          <Link to={`/product-details/${item.id}`} className="block absolute inset-0">
                            <img
                              src={item.image && String(item.image).trim() ? item.image : placeholderImg}
                              alt={item.name}
                              loading="lazy"
                              className="img-zoom w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImg; }}
                            />
                          </Link>

                          {/* Bottom vignette */}
                          <div
                            className="absolute inset-x-0 bottom-0 pointer-events-none"
                            style={{ height: '46%', background: 'linear-gradient(to top, rgba(0,0,0,0.34), transparent)' }}
                          />

                          {/* Tag badge */}
                          {item.tag && (
                            <span
                              className="absolute top-0 left-0 z-20 text-white text-[8px] font-bold tracking-[0.14em] uppercase px-[8px] py-[3px] leading-none select-none"
                              style={{ background: `linear-gradient(135deg, #6B3FA0, #DC2626)` }}
                            >
                              {item.tag}
                            </span>
                          )}

                          {/* Discount badge */}
                          {showPricing && (
                            <span
                              className="absolute z-20 text-white text-[7px] font-bold tracking-[0.1em] uppercase px-[8px] py-[3px] leading-none select-none"
                              style={{ background: 'linear-gradient(135deg,#DC2626,#F97316)', top: 18, left: 0 }}
                            >
                              -{discPct}% OFF
                            </span>
                          )}

                          {/* Hover Overlay */}
                          <div className="hover-overlay absolute inset-x-0 bottom-0 z-20">
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.42) 100%)' }}
                            />
                            <div className="relative flex items-stretch">
                              <button
                                type="button"
                                onClick={() => handleAddToCart(item.id)}
                                disabled={busyCart === item.id}
                                className="hover-btn flex-1 flex flex-col items-center justify-center gap-[4px] py-[9px] border-r border-white/15 disabled:opacity-50"
                              >
                                {cartAdded === item.id ? (
                                  <BsCheckLg className="text-green-300" size={13} />
                                ) : (
                                  <RiShoppingBag2Line className="text-white" size={13} />
                                )}
                                <span className="text-[7px] font-bold tracking-[0.12em] uppercase text-white">
                                  {cartAdded === item.id ? 'Moved!' : 'Add Cart'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemove(item.id)}
                                disabled={busyRemove === item.id}
                                className="hover-btn flex-1 flex flex-col items-center justify-center gap-[4px] py-[9px] disabled:opacity-50"
                              >
                                <RiDeleteBinLine className="text-white" size={13} />
                                <span className="text-[7px] font-bold tracking-[0.12em] uppercase text-white">
                                  Remove
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Info Zone */}
                        <div className="p-3">
                          {/* Product Name */}
                          <Link to={`/product-details/${item.id}`} className="block mb-2">
                            <h5
                              className="text-[13px] font-medium text-gray-800 line-clamp-2 hover:text-purple-600 transition"
                              style={{ lineHeight: 1.4 }}
                            >
                              {item.name}
                            </h5>
                          </Link>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center gap-[1px]">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <GoStarFill
                                  key={s}
                                  size={10}
                                  className={s <= ratingNum ? 'text-yellow-500' : 'text-gray-200'}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-gray-700">{ratingLabel}</span>
                          </div>

                          {/* Price Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inf-price text-[15px] font-bold">{item.price}</span>
                              {showPricing && <span className="inf-mrp">{mrp}</span>}
                              {showPricing && <span className="inf-disc">-{discPct}%</span>}
                            </div>
                            {/* Desktop quick cart button */}
                            <button
                              onClick={() => handleAddToCart(item.id)}
                              disabled={busyCart === item.id}
                              className="hidden sm:flex items-center justify-center w-6 h-6 border border-gray-200 rounded-full hover:bg-teal-500 hover:border-teal-500 transition group"
                            >
                              {cartAdded === item.id ? (
                                <BsCheckLg size={10} className="text-green-600" />
                              ) : (
                                <RiShoppingBag2Line size={10} className="text-gray-500 group-hover:text-white" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}