// src/pages/Checkout.tsx
// ══════════════════════════════════════════════════════════════════════
//  Updated for confirmed API shapes:
//
//  GET /api/checkout returns:
//    { status, cart_items: [{
//        cart_id, quantity, price,
//        product: { product_id, name, image }
//    }] }
//
//  CartLine shape from new cart.api.ts:
//    line.id         = cart_id
//    line.productId  = actual product_id (from product.product_id)
//    line.product    = { id, name, price, image }
//    line.subtotal   = price × quantity
//    line.quantity   = qty
//
//  All fixes from previous version preserved:
//    - POST/PUT/DELETE addresses to /api/addresses
//    - POST /api/orders for order placement
//    - Razorpay integration
//    - Auth guard
//    - Indian cities
// ══════════════════════════════════════════════════════════════════════

import { Link, useNavigate }              from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth }                        from '../../hooks/useAuth';
import Aos                                from 'aos';

import NavbarOne   from '../../components/navbar/navbar-one';
import FooterOne   from '../../components/footer/footer-one';
import ScrollToTop from '../../components/scroll-to-top';
import bg          from '../../assets/img/shortcode/breadcumb.jpg';
import placeholder from '../../assets/img/thumb/shop-card.jpg';

import type { CartLine, CartState } from '../../api/cart.api';
import { getCheckout } from '../../api/cart.api';
import { apiClient }   from '../../api/client';

// ── Brand tokens ──────────────────────────────────────────────────────────
const BRAND = 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)';
const PRI   = '#5B4FBE';
const FONT  = "'DM Sans', sans-serif";

// ── Helpers ───────────────────────────────────────────────────────────────
function parseMoney(price: unknown): number {
  const n = parseFloat(String(price ?? '').replace(/,/g, '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function fmtINR(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function authHeaders(): Record<string, string> {
  const token = window.localStorage.getItem('access_token');
  const sid   = window.localStorage.getItem('SessionId') || window.localStorage.getItem('session-id') || '';
  const h: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Session-Id': sid,
    'session-id': sid,
    'SessionId':  sid,
    'x-session-id': sid,
  };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// ── Types ─────────────────────────────────────────────────────────────────
interface BillingInfo {
  fullName: string; email: string; phone: string; city: string;
  pincode: string; addressLine1: string; addressLine2: string; note: string;
}
interface SavedAddress extends BillingInfo { id: number }

const EMPTY_BILLING: BillingInfo = {
  fullName: '', email: '', phone: '', city: 'Mumbai',
  pincode: '', addressLine1: '', addressLine2: '', note: '',
};

const INDIAN_CITIES = [
  'Mumbai','Delhi','Bengaluru','Hyderabad','Ahmedabad','Chennai',
  'Kolkata','Surat','Pune','Jaipur','Lucknow','Kanpur','Nagpur',
  'Indore','Thane','Bhopal','Visakhapatnam','Pimpri-Chinchwad',
  'Patna','Vadodara','Aurangabad','Nashik','Meerut','Faridabad',
  'Rajkot','Varanasi','Agra','Amritsar','Coimbatore','Kochi',
];

const COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number; label: string }> = {
  SAVE10:   { type: 'percent', value: 0.10, label: '10% off' },
  WELCOME5: { type: 'percent', value: 0.05, label: '5% off' },
  FLAT150:  { type: 'fixed',   value: 150,  label: '₹150 off (min ₹999)' },
};

// ── Sub-components ────────────────────────────────────────────────────────
function GradText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: BRAND, WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block',
    }}>{children}</span>
  );
}

function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
           style={{ borderColor: PRI, borderTopColor: 'transparent' }} />
      <p className="text-sm text-gray-400 font-medium" style={{ fontFamily: FONT }}>{label}</p>
    </div>
  );
}

function StepBadge({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'opacity-100' : 'opacity-40'}`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
           style={{ background: active ? BRAND : '#D1D5DB' }}>{n}</div>
      <span className="text-sm font-semibold text-gray-700 hidden sm:block" style={{ fontFamily: FONT }}>{label}</span>
    </div>
  );
}

function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-600 mb-1.5" style={{ fontFamily: FONT }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

const inputCls = `w-full h-12 px-4 border border-gray-200 rounded-xl text-[14px] text-gray-900
  outline-none transition focus:border-[#5B4FBE] focus:shadow-[0_0_0_3px_rgba(91,79,190,0.10)]
  bg-white placeholder-gray-300`;

// ── Main Component ────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const { isAuth, loading: authLoading } = useAuth();

  // Cart state — CartLine now has productId field
  const [cart,        setCart]        = useState<CartState & { apiCartTotal: number }>({ lines: [], apiCartTotal: 0 });
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError,   setCartError]   = useState<string | null>(null);

  const [billing,      setBilling]      = useState<BillingInfo>(EMPTY_BILLING);
  const [formErrors,   setFormErrors]   = useState<Partial<Record<keyof BillingInfo, string>>>({});
  const [addresses,    setAddresses]    = useState<SavedAddress[]>([]);
  const [addrLoading,  setAddrLoading]  = useState(false);
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);
  const [addrMode,     setAddrMode]     = useState<'view' | 'add' | 'edit'>('view');
  const [addrSaving,   setAddrSaving]   = useState(false);
  const [addrMsg,      setAddrMsg]      = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saveMsg,      setSaveMsg]      = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [couponInput,    setCouponInput]    = useState('');
  const [appliedCoupon,  setAppliedCoupon]  = useState<{ code: string; discount: number } | null>(null);
  const [couponErr,      setCouponErr]      = useState<string | null>(null);

  const [shippingMethod,  setShippingMethod]  = useState<'free' | 'fast' | 'pickup'>('free');
  const [paymentMethod,   setPaymentMethod]   = useState<'cod' | 'card'>('card');
  const [termsAccepted,   setTermsAccepted]   = useState(false);
  const [isPlacingOrder,  setIsPlacingOrder]  = useState(false);
  const [orderError,      setOrderError]      = useState<string | null>(null);
  const [orderSuccess,    setOrderSuccess]    = useState(false);
  const [pincodeMsg,      setPincodeMsg]      = useState<string | null>(null);

  const alive = useRef(true);

  // Auth guard
  useEffect(() => {
    console.log('[Checkout] Auth guard check:', { authLoading, isAuth });
    if (!authLoading && !isAuth) {
      console.log('[Checkout] Redirecting to login - not authenticated');
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [authLoading, isAuth, navigate]);

  useEffect(() => {
    Aos.init({ once: true, duration: 500 });
    alive.current = true;
    const saved = localStorage.getItem('savedBillingInfo');
    if (saved) { try { setBilling(JSON.parse(saved)); } catch {} }
    return () => { alive.current = false; };
  }, []);

  // Load cart from GET /api/checkout
  // Response: { status, data: [{ cart_id, quantity, price, product: { product_id, name, image } }] }
  useEffect(() => {
    // CRITICAL: Don't skip if !isAuth during authLoading because useAuth is still initializing
    // Only skip if we've finished loading AND determined user is not authenticated
    if (authLoading) {
      console.log('[Checkout] Auth still loading, skipping cart load...');
      return;
    }
    
    if (!isAuth) {
      console.log('[Checkout] Not authenticated, cart load skipped');
      return;
    }

    console.log('[Checkout] ═══════════════════════════════════════');
    console.log('[Checkout] Loading cart from /api/checkout...');
    console.log('[Checkout] ═══════════════════════════════════════');
    setCartLoading(true);
    setCartError(null);
    
    getCheckout()
      .then(res => {
        console.log('[Checkout] ═══════════════════════════════════════');
        console.log('[Checkout] Cart loaded successfully');
        console.log('[Checkout] Response:', res);
        console.log('[Checkout] Lines received:', res.lines.length);
        console.log('[Checkout] Total:', res.cart_total);
        console.log('[Checkout] ═══════════════════════════════════════');
        
        if (alive.current) {
          setCart({ lines: res.lines, apiCartTotal: res.cart_total });
          console.log('[Checkout] Cart state updated:', { 
            lineCount: res.lines.length, 
            total: res.cart_total 
          });
        }
      })
      .catch(e => {
        console.error('[Checkout] ═══════════════════════════════════════');
        console.error('[Checkout] Cart load FAILED');
        console.error('[Checkout] Error:', e);
        console.error('[Checkout] ═══════════════════════════════════════');
        if (alive.current) {
          const errorMsg = e?.message ?? 'Failed to load cart.';
          setCartError(errorMsg);
        }
      })
      .finally(() => {
        if (alive.current) setCartLoading(false);
      });
  }, [isAuth, authLoading]);

  // Load saved addresses
  const loadAddresses = useCallback(async () => {
    if (!isAuth) return;
    setAddrLoading(true);
    try {
      const res = await apiClient.get('/api/addresses', { headers: authHeaders() } as any);
      const raw = Array.isArray(res.data?.data) ? res.data.data
                : Array.isArray(res.data?.items) ? res.data.items
                : Array.isArray(res.data) ? res.data : [];
      const normalized: SavedAddress[] = raw.map((a: any) => ({
        id:           a.id ?? a.address_id ?? 0,
        fullName:     a.full_name ?? a.fullName ?? a.name ?? '',
        email:        a.email ?? a.contact_email ?? '',
        phone:        a.mobile ?? a.phone ?? a.contact ?? '',
        city:         a.city ?? a.town ?? a.district ?? '',
        pincode:      a.pincode ?? a.postcode ?? a.zip ?? '',
        addressLine1: a.address1 ?? a.addressLine1 ?? a.line1 ?? '',
        addressLine2: a.address2 ?? a.addressLine2 ?? a.line2 ?? '',
        note:         a.note ?? a.additional ?? '',
      }));
      if (alive.current) setAddresses(normalized);
    } catch { /* silently ignore */ }
    finally { if (alive.current) setAddrLoading(false); }
  }, [isAuth]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  // Derived totals — use API cart_total as source of truth
  const subtotal = cart.apiCartTotal > 0
    ? cart.apiCartTotal
    : cart.lines.reduce((s, l) => s + (l.subtotal > 0 ? l.subtotal : parseMoney(l.product.price) * l.quantity), 0);

  const shippingCost   = shippingMethod === 'fast' ? 99 : shippingMethod === 'pickup' ? 149 : 0;
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const total          = Math.max(0, subtotal + shippingCost - couponDiscount);

  // Address helpers
  function selectAddress(id: number) {
    setSelectedAddrId(id);
    const addr = addresses.find(a => a.id === id);
    if (addr) setBilling({ ...addr });
  }

  async function handleSaveBilling() {
    const errors = validateBilling(billing);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSaveMsg({ type: 'err', text: 'Please fill all required fields before saving.' });
      return;
    }
    setAddrSaving(true); setSaveMsg(null);
    const payload = buildAddressPayload(billing);
    try {
      if (selectedAddrId) {
        await apiClient.put(`/api/addresses/${selectedAddrId}`, payload, { headers: authHeaders() } as any);
        setSaveMsg({ type: 'ok', text: '✅ Address updated in your account.' });
      } else {
        const res = await apiClient.post('/api/addresses', payload, { headers: authHeaders() } as any);
        const newId = res.data?.data?.id ?? res.data?.id;
        if (newId) setSelectedAddrId(Number(newId));
        setSaveMsg({ type: 'ok', text: '✅ Address saved to your account.' });
      }
      localStorage.setItem('savedBillingInfo', JSON.stringify(billing));
      await loadAddresses();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Save failed.';
      setSaveMsg({ type: 'err', text: `❌ ${msg}` });
    } finally {
      setAddrSaving(false);
      setTimeout(() => { if (alive.current) setSaveMsg(null); }, 4000);
    }
  }

  async function handleDeleteAddress(id: number) {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      await apiClient.delete(`/api/addresses/${id}`, { headers: authHeaders() } as any);
      setAddrMsg({ type: 'ok', text: 'Address deleted.' });
      if (selectedAddrId === id) { setSelectedAddrId(null); setBilling(EMPTY_BILLING); }
      await loadAddresses();
    } catch (e: any) {
      setAddrMsg({ type: 'err', text: e?.message ?? 'Delete failed.' });
    }
    setTimeout(() => { if (alive.current) setAddrMsg(null); }, 3000);
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponErr('Enter a coupon code.'); return; }
    const c = COUPONS[code];
    if (!c) { setCouponErr('Invalid coupon code.'); return; }
    if (c.type === 'fixed' && c.value === 150 && subtotal < 999) {
      setCouponErr('Minimum order ₹999 required for FLAT150.'); return;
    }
    const discount = c.type === 'percent' ? subtotal * c.value : c.value;
    setAppliedCoupon({ code, discount });
    setCouponErr(null); setCouponInput('');
  }

  function checkPincode() {
    if (!/^\d{6}$/.test(billing.pincode)) {
      setPincodeMsg('❌ Enter a valid 6-digit pincode.'); return;
    }
    setTimeout(() => {
      setPincodeMsg(parseInt(billing.pincode[0]) > 2
        ? '✅ Delivery available — standard 5–7 days.'
        : '❌ Delivery not available at this pincode.');
    }, 400);
  }

  function validateBilling(b: BillingInfo) {
    const e: Partial<Record<keyof BillingInfo, string>> = {};
    if (!b.fullName.trim())     e.fullName     = 'Full name is required';
    if (!b.email.trim())        e.email        = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(b.email)) e.email = 'Enter a valid email';
    if (!b.phone.trim())        e.phone        = 'Phone is required';
    else if (b.phone.replace(/\D/g,'').length < 10) e.phone = 'Must be at least 10 digits';
    if (!/^\d{6}$/.test(b.pincode)) e.pincode  = 'Enter a valid 6-digit pincode';
    if (!b.addressLine1.trim()) e.addressLine1 = 'Address is required';
    return e;
  }

  function buildAddressPayload(b: BillingInfo) {
    return {
      full_name: b.fullName, email: b.email, mobile: b.phone,
      city: b.city, state: b.city, pincode: b.pincode,
      address1: b.addressLine1, address2: b.addressLine2, note: b.note,
    };
  }

  // POST /api/orders
  async function placeOrderOnServer(paymentRef?: string) {
    const orderPayload = {
      billing_address:   buildAddressPayload(billing),
      shipping_method:   shippingMethod,
      payment_method:    paymentMethod,
      coupon_code:       appliedCoupon?.code ?? null,
      items: cart.lines.map(l => ({
        cart_id:    l.id,         // cart_id from API
        product_id: l.productId,  // real product_id from checkout response
        variant_id: l.variantId ?? null,
        quantity:   l.quantity,
        price:      parseMoney(l.product.price),
      })),
      subtotal,
      shipping_cost:     shippingCost,
      coupon_discount:   couponDiscount,
      total,
      payment_reference: paymentRef ?? null,
    };
    const res = await apiClient.post('/api/orders', orderPayload, { headers: authHeaders() } as any);
    return res.data;
  }

  async function handlePlaceOrder() {
    const errors = validateBilling(billing);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setOrderError('Please complete all required billing fields.');
      return;
    }
    if (!termsAccepted) { setOrderError('Please accept the Terms & Conditions.'); return; }
    if (cart.lines.length === 0) { setOrderError('Your cart is empty.'); return; }

    setIsPlacingOrder(true); setOrderError(null);

    try {
      if (paymentMethod === 'card') {
        const sdkReady = await new Promise<boolean>(resolve => {
          if ((window as any).Razorpay) return resolve(true);
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve(true); s.onerror = () => resolve(false);
          document.body.appendChild(s);
        });
        if (!sdkReady) throw new Error('Failed to load payment gateway. Try COD.');

        let rzpOrderId: string | undefined;
        try {
          const r = await fetch('/api/razorpay/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ amount: Math.round(total * 100) }),
          });
          if (r.ok) { const d = await r.json(); rzpOrderId = d?.id; }
        } catch { /* non-fatal */ }

        await new Promise<void>((resolve, reject) => {
          const opts: any = {
            key:      import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SBdvJaJvWcsKUc',
            amount:   Math.round(total * 100),
            currency: 'INR',
            name:     'Infinity Printing & Signage',
            description: 'Order Payment',
            prefill:  { name: billing.fullName, email: billing.email, contact: billing.phone },
            theme:    { color: PRI },
            handler: async (response: any) => {
              try {
                await fetch('/api/razorpay/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...authHeaders() },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id:   response.razorpay_order_id ?? rzpOrderId,
                    razorpay_signature:  response.razorpay_signature,
                  }),
                });
                await placeOrderOnServer(response.razorpay_payment_id);
                resolve();
              } catch (e) { reject(e); }
            },
          };
          if (rzpOrderId) opts.order_id = rzpOrderId;
          const rzp = new (window as any).Razorpay(opts);
          rzp.on('payment.failed', (r: any) => reject(new Error(r?.error?.description ?? 'Payment failed')));
          rzp.open();
        });
      } else {
        await placeOrderOnServer();
      }
      setOrderSuccess(true);
      setTimeout(() => navigate('/payment-success'), 600);
    } catch (err: any) {
      setOrderError(err?.message ?? 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (orderSuccess) {
    return (
      <>
        <NavbarOne />
        <div className="flex items-center justify-center min-h-[70vh]" style={{ fontFamily: FONT }}>
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 text-white"
                 style={{ background: BRAND }}>✓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 text-sm">Redirecting to confirmation…</p>
          </div>
        </div>
        <FooterOne />
      </>
    );
  }

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb */}
      <div className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})`, fontFamily: FONT }}>
        <div className="text-center w-full">
          <h2 className="text-white text-3xl md:text-[40px] font-bold leading-none">Checkout</h2>
          <ul className="flex items-center justify-center gap-[10px] text-sm leading-none font-normal text-white mt-3">
            <li><Link to="/" className="hover:text-white/70 transition">Home</Link></li>
            <li>/</li>
            <li><GradText>Checkout</GradText></li>
          </ul>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-[1220px] flex items-center gap-6 sm:gap-10">
          <StepBadge n={1} label="Billing"  active={true} />
          <div className="h-px flex-1 bg-gray-200" />
          <StepBadge n={2} label="Payment"  active={true} />
          <div className="h-px flex-1 bg-gray-200" />
          <StepBadge n={3} label="Confirm"  active={false} />
        </div>
      </div>

      <div className="py-10 md:py-16 bg-gray-50 min-h-screen" style={{ fontFamily: FONT }}>
        <div className="container mx-auto px-4 max-w-[1220px]">

          {(cartLoading || authLoading) && <Spinner label="Loading checkout…" />}

          {!cartLoading && cartError && (
            <div className="text-center bg-red-50 border border-red-200 text-red-600 p-5 rounded-xl text-sm font-medium">
              {cartError}
            </div>
          )}

          {!cartLoading && !cartError && cart.lines.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-gray-700 font-semibold text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-500 text-sm mb-4">
                {authLoading ? 'Loading authentication...' : !isAuth ? 'Please log in to view your cart' : 'Add items to your cart to proceed'}
              </p>
              <Link to={!isAuth ? '/login' : '/shop-v1'} className="inline-block mt-3 text-sm font-semibold text-[#5B4FBE] hover:underline">
                {!isAuth ? 'Go to Login →' : 'Continue Shopping →'}
              </Link>
              
              {/* Debug Info - Always visible */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-left bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg max-w-md mx-auto">
                <h4 className="font-bold text-blue-900 mb-3 text-sm">🔍 Debug Information:</h4>
                <div className="space-y-1.5 text-xs font-mono text-blue-900">
                  <div className="flex justify-between">
                    <span>Auth Loading:</span>
                    <span className={authLoading ? 'text-yellow-600' : 'text-green-600'}>{String(authLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Is Authenticated:</span>
                    <span className={!isAuth ? 'text-red-600' : 'text-green-600'}>{String(isAuth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cart Loading:</span>
                    <span className={cartLoading ? 'text-yellow-600' : 'text-green-600'}>{String(cartLoading)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cart Lines:</span>
                    <span className={cart.lines.length === 0 ? 'text-red-600' : 'text-green-600'}>{cart.lines.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cart Total:</span>
                    <span>₹{cart.apiCartTotal}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-blue-800 text-xs mb-2 font-semibold">Next Steps:</p>
                  <ol className="space-y-1 text-xs text-blue-800 list-decimal list-inside">
                    <li>Open DevTools: Press <span className="font-bold">F12</span></li>
                    <li>Go to <span className="font-bold">Console</span> tab</li>
                    <li>Look for blue logs with <span className="font-bold">[Checkout]</span> and <span className="font-bold">[cart.api]</span></li>
                    <li>Check if API response has <span className="font-bold">data: []</span> (empty) or has items</li>
                    <li>Share the full response with your developer</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {!cartLoading && !cartError && cart.lines.length > 0 && (
            <div className="grid lg:grid-cols-[1fr_420px] gap-8">

              {/* ── LEFT: Billing ──────────────────────────────────────── */}
              <div className="space-y-6" data-aos="fade-up">

                {/* Coupon */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg">🏷️</span>
                    <span className="font-bold text-gray-800 text-[15px]">Have a coupon?</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter coupon code" value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(null); }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      className={`${inputCls} uppercase`} />
                    <button onClick={applyCoupon}
                      className="px-5 py-2 rounded-xl text-white text-sm font-bold transition hover:opacity-90 flex-shrink-0"
                      style={{ background: BRAND }}>Apply</button>
                  </div>
                  {couponErr && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{couponErr}</p>}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                      <p className="text-green-700 text-[12px] font-semibold">
                        ✓ "{appliedCoupon.code}" — {fmtINR(appliedCoupon.discount)} off applied!
                      </p>
                      <button onClick={() => setAppliedCoupon(null)}
                        className="text-[11px] text-red-500 font-bold hover:underline ml-2">Remove</button>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(COUPONS).map(([code, c]) => (
                      <button key={code} onClick={() => { setCouponInput(code); setCouponErr(null); }}
                        className="text-[11px] px-2.5 py-1 border border-dashed border-[#5B4FBE] text-[#5B4FBE] rounded-lg font-bold hover:bg-[#f3f1ff] transition">
                        {code} <span className="font-normal opacity-70">({c.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Billing form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-xl text-gray-900">Billing Information</h4>
                    {addrLoading && <span className="text-xs text-gray-400 animate-pulse">Loading addresses…</span>}
                  </div>

                  {addresses.length > 0 && addrMode === 'view' && (
                    <div className="mb-6">
                      <p className="text-[13px] font-semibold text-gray-600 mb-2">Saved Addresses</p>
                      <div className="grid gap-2">
                        {addresses.map(addr => (
                          <div key={addr.id} onClick={() => selectAddress(addr.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition text-[13px] flex items-start justify-between gap-3 ${
                              selectedAddrId === addr.id ? 'border-[#5B4FBE] bg-[#f3f1ff]' : 'border-gray-200 hover:border-[#5B4FBE]/40 bg-gray-50'
                            }`}>
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedAddrId === addr.id ? 'border-[#5B4FBE] bg-[#5B4FBE]' : 'border-gray-300'}`} />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{addr.fullName}</p>
                                <p className="text-gray-500 truncate">{addr.addressLine1}{addr.city ? `, ${addr.city}` : ''}{addr.pincode ? ` — ${addr.pincode}` : ''}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={e => { e.stopPropagation(); selectAddress(addr.id); setAddrMode('edit'); }}
                                className="text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-600 hover:bg-[#5B4FBE] hover:text-white transition font-semibold">Edit</button>
                              <button onClick={e => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                                className="text-[11px] px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition font-semibold">Del</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {addrMsg && <p className={`text-[12px] mt-2 font-medium ${addrMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{addrMsg.text}</p>}
                      <button onClick={() => { setAddrMode('add'); setBilling(EMPTY_BILLING); setSelectedAddrId(null); }}
                        className="mt-3 text-[13px] font-semibold text-[#5B4FBE] hover:underline flex items-center gap-1">
                        + Add New Address
                      </button>
                    </div>
                  )}

                  {addresses.length === 0 && !addrLoading && (
                    <p className="text-[13px] text-gray-400 mb-4">No saved addresses yet.</p>
                  )}

                  <div className="grid gap-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField label="Full Name" required error={formErrors.fullName}>
                        <input type="text" value={billing.fullName}
                          onChange={e => setBilling({ ...billing, fullName: e.target.value })}
                          className={inputCls} placeholder="Rajesh Kumar" />
                      </FormField>
                      <FormField label="Email" required error={formErrors.email}>
                        <input type="email" value={billing.email}
                          onChange={e => setBilling({ ...billing, email: e.target.value })}
                          className={inputCls} placeholder="you@email.com" />
                      </FormField>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField label="Phone" required error={formErrors.phone}>
                        <input type="tel" value={billing.phone}
                          onChange={e => setBilling({ ...billing, phone: e.target.value })}
                          className={inputCls} placeholder="9876543210" />
                      </FormField>
                      <FormField label="Town / City">
                        <select value={billing.city}
                          onChange={e => setBilling({ ...billing, city: e.target.value })}
                          className={inputCls}>
                          {INDIAN_CITIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </FormField>
                    </div>
                    <FormField label="Pincode" required error={formErrors.pincode}>
                      <div className="flex gap-2">
                        <input type="text" value={billing.pincode}
                          onChange={e => setBilling({ ...billing, pincode: e.target.value.replace(/\D/g,'').slice(0,6) })}
                          className={`${inputCls} flex-1`} placeholder="6-digit pincode"
                          onKeyDown={e => e.key === 'Enter' && checkPincode()} />
                        <button onClick={checkPincode}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition flex-shrink-0">
                          Check
                        </button>
                      </div>
                      {pincodeMsg && <p className={`text-[12px] mt-1.5 font-medium ${pincodeMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{pincodeMsg}</p>}
                    </FormField>
                    <FormField label="Address Line 1" required error={formErrors.addressLine1}>
                      <input type="text" value={billing.addressLine1}
                        onChange={e => setBilling({ ...billing, addressLine1: e.target.value })}
                        className={inputCls} placeholder="House No., Street Name" />
                    </FormField>
                    <FormField label="Address Line 2 (Optional)">
                      <input type="text" value={billing.addressLine2}
                        onChange={e => setBilling({ ...billing, addressLine2: e.target.value })}
                        className={inputCls} placeholder="Apartment, Floor, Landmark" />
                    </FormField>
                    <FormField label="Delivery Notes (Optional)">
                      <textarea value={billing.note}
                        onChange={e => setBilling({ ...billing, note: e.target.value })}
                        rows={3} className={`${inputCls} h-auto py-3 resize-y`}
                        placeholder="Any special delivery instructions…" />
                    </FormField>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                    <button onClick={handleSaveBilling} disabled={addrSaving}
                      className="px-6 py-2.5 rounded-xl text-white text-[14px] font-bold transition hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                      style={{ background: BRAND }}>
                      {addrSaving
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Saving…</>
                        : (selectedAddrId ? '💾 Update Address' : '💾 Save Address')
                      }
                    </button>
                    {addrMode !== 'view' && addresses.length > 0 && (
                      <button onClick={() => setAddrMode('view')}
                        className="text-sm text-gray-500 hover:text-gray-800 font-medium transition">Cancel</button>
                    )}
                    {saveMsg && (
                      <p className={`text-[13px] font-semibold ${saveMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{saveMsg.text}</p>
                    )}
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" data-aos="fade-up" data-aos-delay="50">
                  <h4 className="font-bold text-[17px] text-gray-900 mb-4">Shipping Method</h4>
                  <div className="space-y-3">
                    {([
                      { value: 'free',   label: 'Standard Shipping (5–7 days)', cost: 0   },
                      { value: 'fast',   label: 'Express Shipping (2–3 days)',  cost: 99  },
                      { value: 'pickup', label: 'Local Pickup',                 cost: 149 },
                    ] as const).map(opt => (
                      <label key={opt.value}
                        className={`flex items-center justify-between cursor-pointer p-4 border rounded-xl transition ${shippingMethod === opt.value ? 'border-[#5B4FBE] bg-[#f3f1ff]' : 'border-gray-200 hover:border-[#5B4FBE]/40'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shipping" value={opt.value}
                            checked={shippingMethod === opt.value}
                            onChange={() => setShippingMethod(opt.value)}
                            className="accent-[#5B4FBE]" />
                          <span className="text-[14px] font-medium text-gray-700">{opt.label}</span>
                        </div>
                        <span className={`text-[14px] font-bold ${opt.cost === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                          {opt.cost === 0 ? 'FREE' : fmtINR(opt.cost)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" data-aos="fade-up" data-aos-delay="80">
                  <h4 className="font-bold text-[17px] text-gray-900 mb-4">Payment Method</h4>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 cursor-pointer p-4 border rounded-xl transition ${paymentMethod === 'card' ? 'border-[#5B4FBE] bg-[#f3f1ff]' : 'border-gray-200 hover:border-[#5B4FBE]/40'}`}>
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')} className="accent-[#5B4FBE]" />
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-gray-800">💳 Debit / Credit Card</p>
                        <p className="text-[12px] text-gray-400">Secured by Razorpay</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {['VISA','MC','UPI'].map(b => (
                          <span key={b} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{b}</span>
                        ))}
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 cursor-pointer p-4 border rounded-xl transition ${paymentMethod === 'cod' ? 'border-[#5B4FBE] bg-[#f3f1ff]' : 'border-gray-200 hover:border-[#5B4FBE]/40'}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')} className="accent-[#5B4FBE]" />
                      <div>
                        <p className="text-[14px] font-semibold text-gray-800">🏠 Cash on Delivery</p>
                        <p className="text-[12px] text-gray-400">Pay when your order arrives</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Order Summary ───────────────────────────────── */}
              <div className="space-y-5" data-aos="fade-up" data-aos-delay="100">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-[72px]">
                  <h4 className="font-bold text-[17px] text-gray-900 mb-5">Order Summary</h4>

                  {/* Cart items from GET /api/checkout */}
                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                    {cart.lines.map(line => {
                      // Use line.subtotal from API (price × qty returned by checkout)
                      const itemTotal = line.subtotal > 0
                        ? line.subtotal
                        : parseMoney(line.product.price) * line.quantity;
                      return (
                        // key on line.id (cart_id) — unique
                        <div key={line.id} className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                            {/* Image from API product.image via getCheckout() */}
                            <img src={line.product.image || placeholder}
                              alt={line.product.name}
                              className="w-full h-full object-cover"
                              onError={e => { (e.currentTarget as HTMLImageElement).src = placeholder; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Name from API product.name */}
                            <p className="text-[13px] font-semibold text-gray-800 leading-snug truncate">{line.product.name}</p>
                            {/* Qty from API */}
                            <p className="text-[12px] text-gray-400">Qty: {line.quantity}</p>
                            {/* Product ID for reference */}
                            <p className="text-[11px] text-gray-300">ID: {line.productId}</p>
                          </div>
                          {/* Price × qty from API subtotal */}
                          <p className="text-[14px] font-bold text-gray-900 flex-shrink-0">{fmtINR(itemTotal)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price breakdown */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
                    <div className="flex justify-between text-[13px] text-gray-500">
                      <span>Subtotal ({cart.lines.length} item{cart.lines.length !== 1 ? 's' : ''})</span>
                      <span className="font-semibold text-gray-700">{fmtINR(subtotal)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-[13px] text-green-600 font-medium">
                        <span>Coupon ({appliedCoupon?.code})</span>
                        <span>−{fmtINR(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[13px] text-gray-500">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? 'text-green-600 font-semibold' : 'font-semibold text-gray-700'}>
                        {shippingCost === 0 ? 'FREE' : fmtINR(shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[16px] font-extrabold pt-3 border-t border-gray-100">
                      <span className="text-gray-900">Total</span>
                      <GradText>{fmtINR(total)}</GradText>
                    </div>
                    {couponDiscount > 0 && (
                      <p className="text-[11px] text-green-600 font-semibold text-right">
                        🎉 You save {fmtINR(couponDiscount)} on this order
                      </p>
                    )}
                  </div>

                  {/* Terms + Place Order */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <label className="flex items-start gap-2.5 cursor-pointer mb-4">
                      <input type="checkbox" checked={termsAccepted}
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-[#5B4FBE]" />
                      <span className="text-[12px] text-gray-500">
                        I agree to the{' '}
                        <Link to="/terms-and-conditions" className="text-[#5B4FBE] hover:underline font-semibold">
                          Terms & Conditions
                        </Link>
                      </span>
                    </label>

                    {orderError && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-600 font-medium">
                        ⚠ {orderError}
                      </div>
                    )}

                    <button onClick={handlePlaceOrder} disabled={isPlacingOrder || !termsAccepted}
                      className="w-full py-4 rounded-xl text-white text-[15px] font-bold tracking-wide transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: BRAND }}>
                      {isPlacingOrder
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
                        : (paymentMethod === 'card' ? '💳 Pay & Place Order' : '📦 Place Order (COD)')
                      }
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-2">🔒 256-bit SSL Encrypted &amp; Secure</p>

                    <Link to="/cart"
                      className="mt-3 w-full block text-center py-2.5 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">
                      ← Back to Cart
                    </Link>
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