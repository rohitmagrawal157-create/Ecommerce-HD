import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";

import bg from '../../assets/img/shortcode/breadcumb.jpg'
import Aos from "aos";

import type { CartState } from "../../api/cart.api";
import { getCart, removeFromCartItem, updateCartItem } from "../../api/cart.api";

export default function Cart() {
  const [cart, setCart] = useState<CartState>({ lines: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    Aos.init();

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

    return () => {
      alive = false;
    };
  }, []);

  const parseMoney = (price: string): { value: number; symbol: string } => {
    const s = price ?? '';
    const symbol = s.includes('₹') ? '₹' : s.includes('$') ? '$' : '';
    const normalized = s.replace(/,/g, '');
    const match = normalized.match(/(\d+(\.\d+)?)/);
    const value = match ? parseFloat(match[1]) : 0;
    return { value, symbol };
  };

  const currencySymbol = useMemo(() => {
    if (cart.lines[0]?.product?.price) return parseMoney(cart.lines[0].product.price).symbol || '$';
    return '$';
  }, [cart.lines]);

  const subtotal = useMemo(() => {
    return cart.lines.reduce((acc, line) => {
      const { value } = parseMoney(line.product.price);
      return acc + value * line.quantity;
    }, 0);
  }, [cart.lines]);

  const handleQtyChange = async (productId: number, nextQty: number) => {
    const qty = Math.max(1, Math.floor(nextQty));
    setActionLoadingId(productId);
    try {
      const next = await updateCartItem(productId, qty);
      setCart(next);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (productId: number) => {
    setActionLoadingId(productId);
    try {
      const next = await removeFromCartItem(productId);
      setCart(next);
    } finally {
      setActionLoadingId(null);
    }
  };
  return (
    <>
        <NavbarOne/>  

        <div className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70" style={{backgroundImage:`url(${bg})`}}>
            <div className="text-center w-full">
                <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">Cart</h2>
                <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
                    <li><Link to="/">Home</Link></li>
                    <li>/</li>
                    <li className="text-primary">Cart</li>
                </ul>
            </div>
        </div>

        <div className="s-py-100">
            <div className="container ">
                <div className="flex xl:flex-row flex-col gap-[30px] lg:gap-[30px] xl:gap-[70px]">
                    <div className="flex-1 overflow-x-auto" data-aos="fade-up" data-aos-delay="100">
                        {loading && (
                          <div className="text-center text-sm text-gray-500 py-10">
                            Loading...
                          </div>
                        )}
                        {!loading && error && (
                          <div className="text-center text-sm text-red-600 py-10">
                            {error}
                          </div>
                        )}
                        {!loading && !error && (
                        <table id="cart-table" className="responsive nowrap table-wrapper" style={{width:'100%'}}>
                            <thead className="table-header">
                                <tr>
                                    <th className="text-lg md:text-xl font-semibold leading-none text-title dark:text-white">Product Info</th>
                                    <th className="text-lg md:text-xl font-semibold leading-none text-title dark:text-white">Price</th>
                                    <th className="text-lg md:text-xl font-semibold leading-none text-title dark:text-white">Quantity</th>
                                    <th className="text-lg md:text-xl font-semibold leading-none text-title dark:text-white">Total</th>
                                    <th className="text-lg md:text-xl font-semibold leading-none text-title dark:text-white">Remove</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {cart.lines.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="text-center text-sm text-gray-500 py-10">
                                      Your cart is empty.
                                    </td>
                                  </tr>
                                ) : (
                                  cart.lines.map((line) => {
                                    const { value, symbol } = parseMoney(line.product.price);
                                    const lineTotal = value * line.quantity;
                                    const showSymbol = symbol || currencySymbol || '$';

                                    return (
                                      <tr key={line.product.id}>
                                        <td className="md:w-[42%]">
                                          <div className="flex items-center gap-3 md:gap-4 lg:gap-6 cart-product my-4">
                                            <div className="w-14 sm:w-20 flex-none">
                                              <img src={line.product.image} alt={line.product.name} />
                                            </div>
                                            <div className="flex-1">
                                              <h6 className="leading-none font-medium">{line.product.tag || line.product.name}</h6>
                                              <h5 className="font-semibold leading-none mt-2">
                                                <Link to={`/product-details/${line.product.id}`}>{line.product.name}</Link>
                                              </h5>
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <h6 className="text-base md:text-lg leading-none text-title dark:text-white font-semibold">
                                            {line.product.price}
                                          </h6>
                                        </td>
                                        <td>
                                          <div className="flex items-center gap-3">
                                            <button
                                              className="w-8 h-8 bg-[#E8E9EA] dark:bg-dark-secondary flex items-center justify-center duration-300 text-title dark:text-white"
                                              onClick={() => handleQtyChange(line.product.id, line.quantity - 1)}
                                              disabled={actionLoadingId === line.product.id || line.quantity <= 1}
                                              aria-label="Decrease quantity"
                                            >
                                              -
                                            </button>
                                            <span className="text-base md:text-lg leading-none text-title dark:text-white font-semibold">
                                              {line.quantity}
                                            </span>
                                            <button
                                              className="w-8 h-8 bg-[#E8E9EA] dark:bg-dark-secondary flex items-center justify-center duration-300 text-title dark:text-white"
                                              onClick={() => handleQtyChange(line.product.id, line.quantity + 1)}
                                              disabled={actionLoadingId === line.product.id}
                                              aria-label="Increase quantity"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </td>
                                        <td>
                                          <h6 className="text-base md:text-lg leading-none text-title dark:text-white font-semibold">
                                            {showSymbol}
                                            {Number.isFinite(lineTotal) ? lineTotal.toFixed(0) : 0}
                                          </h6>
                                        </td>
                                        <td>
                                          <button
                                            className="w-8 h-8 bg-[#E8E9EA] dark:bg-dark-secondary flex items-center justify-center ml-auto duration-300 text-title dark:text-white"
                                            onClick={() => handleRemove(line.product.id)}
                                            disabled={actionLoadingId === line.product.id}
                                            aria-label="Remove item"
                                          >
                                            <svg className="fill-current" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M0.546875 1.70822L1.70481 0.550293L5.98646 4.83195L10.2681 0.550293L11.3991 1.6813L7.11746 5.96295L11.453 10.2985L10.295 11.4564L5.95953 7.12088L1.67788 11.4025L0.546875 10.2715L4.82853 5.98988L0.546875 1.70822Z" />
                                            </svg>
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                            </tbody>
                        </table>
                        )}
                    </div>

                    <div data-aos="fade-up" data-aos-delay="300">
                        <div className="mb-[30px]">
                            <h4 className="text-lg md:text-xl font-semibold leading-none text-title dark:text-white mb-[15px]">
                                Promo Code
                            </h4>
                            <div className="flex xs:flex-row flex-col gap-3">
                                <input className="h-12 md:h-14 bg-snow dark:bg-dark-secondary border border-[#E3E5E6] text-title dark:text-white focus:border-primary p-4 outline-none duration-300 placeholder:text-title dark:placeholder:text-white flex-1" type="text" placeholder="Coupon Code"/>
                                <button className="btn btn-solid" data-text="Apply">
                                    <span>Apply</span>
                                </button>
                            </div>
                        </div>
                        <div className="bg-[#FAFAFA] dark:bg-dark-secondary pt-[30px] md:pt-[40px] px-[30px] md:px-[40px] pb-[30px] border border-[#17243026] border-opacity-15 rounded-xl">   
                            <div className="text-right flex justify-end flex-col w-full ml-auto mr-0">
                                <div className="flex justify-between flex-wrap text-base sm:text-lg text-title dark:text-white font-medium">
                                    <span>Sub Total:</span>
                                    <span>
                                      {currencySymbol}
                                      {subtotal.toFixed(0)}
                                    </span>
                                </div>
                                <div className="flex justify-between flex-wrap text-base sm:text-lg text-title dark:text-white font-medium mt-3">
                                    <span>Coupon Discount:</span>
                                    <span>-{currencySymbol}0</span>
                                </div>
                                <div className="flex justify-between flex-wrap text-base sm:text-lg text-title dark:text-white font-medium mt-3">
                                    <span>VAT:</span>
                                    <span>{currencySymbol}0</span>
                                </div>
                                
                            </div>
                            <div className="mt-6 pt-6 border-t border-bdr-clr dark:border-bdr-clr-drk">
                                <div className="flex justify-between flex-wrap text-base sm:text-lg text-title dark:text-white font-medium mt-3">
                                    <div>
                                        <label className="flex items-center gap-[10px] categoryies-iteem">
                                            <input className="appearance-none hidden" type="radio" name="item-type"/>
                                            <span className="w-4 h-4 rounded-full border border-title dark:border-white flex items-center justify-center duration-300">
                                                <svg className="duration-300 opacity-0" width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="10" height="10" rx="5" fill="#BB976D"/>
                                                </svg>
                                            </span>
                                            <span className="sm:text-lg text-title dark:text-white block sm:leading-none transform translate-y-[3px] select-none">Free Shipping:</span>
                                        </label>
                                    </div>
                                    <span> $0</span>
                                </div>
                                <div className="flex justify-between flex-wrap text-base sm:text-lg text-title dark:text-white font-medium mt-3">
                                    <div>
                                        <label className="flex items-center gap-[10px] categoryies-iteem">
                                            <input className="appearance-none hidden" type="radio" name="item-type"/>
                                            <span className="w-4 h-4 rounded-full border border-title dark:border-white flex items-center justify-center duration-300">
                                                <svg className="duration-300 opacity-0" width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="10" height="10" rx="5" fill="#BB976D"/>
                                                </svg>
                                            </span>
                                            <span className="sm:text-lg text-title dark:text-white block sm:leading-none transform translate-y-[3px] select-none"> Fast Shipping:</span>
                                        </label>
                                    </div>
                                    <span>$10</span>
                                </div>
                                <div className="flex justify-between flex-wrap text-base sm:text-lg text-title dark:text-white font-medium mt-3">
                                    <div>
                                        <label className="flex items-center gap-[10px] categoryies-iteem">
                                            <input className="appearance-none hidden" type="radio" name="item-type"/>
                                            <span className="w-4 h-4 rounded-full border border-title dark:border-white flex items-center justify-center duration-300">
                                                <svg className="duration-300 opacity-0" width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="10" height="10" rx="5" fill="#BB976D"/>
                                                </svg>
                                            </span>
                                            <span className="sm:text-lg text-title dark:text-white block sm:leading-none transform translate-y-[3px] select-none"> Local Pickup:</span>
                                        </label>
                                    </div>
                                    <span>$15</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-bdr-clr dark:border-bdr-clr-drk">
                                <div className="flex justify-between flex-wrap font-semibold leading-none text-2xl">
                                    <span>Total:</span>
                                    <span>
                                      &nbsp;{currencySymbol}
                                      {subtotal.toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="sm:mt-[10px] py-5 flex items-end gap-3 flex-wrap justify-end">
                            <Link to="/shop-v1" className="btn btn-sm btn-outline !text-title hover:!text-white before:!z-[-1] dark:!text-white dark:hover:!text-title">
                                Continue Shopping
                            </Link>
                            <Link to="/checkout" className="btn btn-sm btn-theme-solid !text-white hover:!text-primary before:!z-[-1]">
                                Checkout
                            </Link>
                        </div>
                    </div>
                </div>    
            </div>
        </div>

        <FooterOne/>

        <ScrollToTop/>
    </>
  )
}
