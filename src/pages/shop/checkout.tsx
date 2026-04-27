// src/pages/Checkout.tsx
// ══════════════════════════════════════════════════════════════════════
//  CHECKOUT — Updated
//  ✦ Free shipping above ₹3,000 (matches Cart.tsx)
//  ✦ COD flow: posts order directly to /api/place-order
//  ✦ Card flow: Razorpay → verify → place order
//  ✦ Edit/Delete address with pencil + trash icons
//  ✦ 2-column layout: LEFT = billing + shipping + payment | RIGHT = order summary
//  ✦ Consistent pricing with Cart page
// ══════════════════════════════════════════════════════════════════════

import { Link, useNavigate }                        from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth }                                  from '../../hooks/useAuth'
import Aos                                          from 'aos'

import NavbarOne   from '../../components/navbar/navbar-one'
import FooterOne   from '../../components/footer/footer-one'
import ScrollToTop from '../../components/scroll-to-top'
import bg          from '../../assets/img/shortcode/breadcumb.jpg'
import placeholder from '../../assets/img/thumb/shop-card.jpg'

import type { CartState } from '../../api/cart.api'
import { getCheckout }    from '../../api/cart.api'
import { apiClient }      from '../../api/client'

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND = 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)'
const PRI   = '#5B4FBE'
const FONT  = "'DM Sans', sans-serif"

// ─── Shipping threshold (MUST match Cart.tsx) ─────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 3000
const SHIPPING_FEE            = 99
// const PLATFORM_FEE            = 0   // not shown on checkout

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseMoney(price: unknown): number {
  const n = parseFloat(String(price ?? '').replace(/,/g, '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}
function fmtINR(n: number) { return '₹' + Math.round(n).toLocaleString('en-IN') }

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  const sid   = localStorage.getItem('SessionId') || localStorage.getItem('session-id') || ''
  const h: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json', 'session-id': sid, SessionId: sid }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface BillingInfo {
  fullName: string; email: string; phone: string; city: string
  pincode: string; addressLine1: string; addressLine2: string; note: string
}
interface SavedAddress extends BillingInfo { id: number }

const EMPTY_BILLING: BillingInfo = { fullName: '', email: '', phone: '', city: 'Mumbai', pincode: '', addressLine1: '', addressLine2: '', note: '' }

const INDIAN_CITIES = ['Mumbai','Delhi','Bengaluru','Hyderabad','Ahmedabad','Chennai','Kolkata','Surat','Pune','Jaipur','Lucknow','Kanpur','Nagpur','Indore','Thane','Bhopal','Visakhapatnam','Patna','Vadodara','Aurangabad','Nashik','Meerut','Faridabad','Rajkot','Varanasi','Agra','Amritsar','Coimbatore','Kochi']

const COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number; label: string; minOrder?: number }> = {
  SAVE10:   { type: 'percent', value: 0.10, label: '10% off' },
  WELCOME5: { type: 'percent', value: 0.05, label: '5% off' },
  FLAT150:  { type: 'fixed',   value: 150,  label: '₹150 off (min ₹999)', minOrder: 999 },
}

function normaliseAddress(a: any, fallbackEmail = ''): SavedAddress {
  return {
    id:           Number(a.id ?? a.address_id ?? 0),
    fullName:     a.full_name ?? a.fullName ?? a.name ?? '',
    email:        a.email ?? fallbackEmail,
    phone:        a.mobile ?? a.phone ?? a.contact ?? '',
    city:         a.city ?? a.town ?? '',
    pincode:      a.pincode ?? a.postcode ?? a.zip ?? '',
    addressLine1: a.address1 ?? a.line1 ?? '',
    addressLine2: a.address2 ?? a.line2 ?? '',
    note:         a.notes ?? a.note ?? '',
  }
}

function buildAddressPayload(b: BillingInfo) {
  return { full_name: b.fullName, email: b.email || null, mobile: b.phone, city: b.city, state: b.city, pincode: b.pincode, address1: b.addressLine1, address2: b.addressLine2 || null, notes: b.note || null }
}

// ─── Inline icons ─────────────────────────────────────────────────────────────
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

// ─── Sub-components ───────────────────────────────────────────────────────────
function GradText({ children }: { children: React.ReactNode }) {
  return <span style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>{children}</span>
}

function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: `4px solid ${PRI}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'chkSpin .7s linear infinite' }} />
      <p style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT }}>{label}</p>
      <style>{`@keyframes chkSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function StepBadge({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: active ? 1 : 0.35 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: active ? BRAND : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{n}</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: FONT }}>{label}</span>
    </div>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, fontFamily: FONT }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4, fontFamily: FONT }}>{error}</p>}
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', height: 46, padding: '0 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: FONT, color: '#111827', background: 'white', boxSizing: 'border-box' }

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate()
  const { isAuth, loading: authLoading } = useAuth()

  // Cart
  const [cart,        setCart]        = useState<CartState & { apiCartTotal: number }>({ lines: [], apiCartTotal: 0 })
  const [cartLoading, setCartLoading] = useState(true)
  const [cartError,   setCartError]   = useState<string | null>(null)

  // Billing
  const [billing,        setBilling]        = useState<BillingInfo>(EMPTY_BILLING)
  const [formErrors,     setFormErrors]     = useState<Partial<Record<keyof BillingInfo, string>>>({})
  const [addresses,      setAddresses]      = useState<SavedAddress[]>([])
  const [addrLoading,    setAddrLoading]    = useState(false)
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null)
  const [addrMode,       setAddrMode]       = useState<'view' | 'add' | 'edit'>('view')
  const [addrSaving,     setAddrSaving]     = useState(false)
  const [addrMsg,        setAddrMsg]        = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [saveMsg,        setSaveMsg]        = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Coupon
  const [couponInput,   setCouponInput]   = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponErr,     setCouponErr]     = useState<string | null>(null)

  // Order
  const [shippingMethod, setShippingMethod] = useState<'Delivery' | 'pickup'>('Delivery')
  const [paymentMethod,  setPaymentMethod]  = useState<'cod' | 'card'>('cod')
  const [termsAccepted,  setTermsAccepted]  = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderError,     setOrderError]     = useState<string | null>(null)
  const [orderSuccess,   setOrderSuccess]   = useState(false)
  const [pincodeMsg,     setPincodeMsg]     = useState<string | null>(null)

  const alive = useRef(true)

  function clearErr(field: keyof BillingInfo) {
    setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuth) navigate('/login', { state: { from: '/checkout' } })
  }, [authLoading, isAuth, navigate])

  useEffect(() => {
    Aos.init({ once: true, duration: 500 }); alive.current = true
    const saved = localStorage.getItem('savedBillingInfo')
    if (saved) { try { setBilling(JSON.parse(saved)) } catch {} }
    return () => { alive.current = false }
  }, [])

  // Load cart
  useEffect(() => {
    if (authLoading || !isAuth) return
    setCartLoading(true); setCartError(null)
    getCheckout()
      .then(res => { if (alive.current) setCart({ lines: res.lines, apiCartTotal: res.cart_total }) })
      .catch(e  => { if (alive.current) setCartError(e?.message ?? 'Failed to load cart.') })
      .finally(()=> { if (alive.current) setCartLoading(false) })
  }, [isAuth, authLoading])

  // Load saved addresses
  const loadAddresses = useCallback(async () => {
    if (!isAuth) return
    setAddrLoading(true)
    try {
      const res  = await apiClient.get('/api/addresses', { headers: authHeaders() } as any)
      const raw: any[] = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data) ? res.data : []
      if (alive.current) setAddresses(raw.map(a => normaliseAddress(a, billing.email)))
    } catch { /* silently ignore */ }
    finally { if (alive.current) setAddrLoading(false) }
  }, [isAuth, billing.email])

  useEffect(() => { loadAddresses() }, [loadAddresses])

  // ─── Pricing (consistent with Cart) ───────────────────────────────────────
  const subtotal = cart.apiCartTotal > 0
    ? cart.apiCartTotal
    : cart.lines.reduce((s, l) => s + parseMoney(l.product.price) * l.quantity, 0)

  const shipping       = shippingMethod === 'pickup' ? 50 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const couponDiscount = appliedCoupon?.discount ?? 0
  const total          = Math.max(0, subtotal + shipping - couponDiscount)

  // ─── Address helpers ──────────────────────────────────────────────────────
  function selectAddress(id: number) {
    const addr = addresses.find(a => a.id === id); if (!addr) return
    setSelectedAddrId(id)
    setBilling({
      fullName:     addr.fullName     || billing.fullName,
      email:        addr.email        || billing.email,
      phone:        addr.phone        || billing.phone,
      city:         addr.city         || billing.city,
      pincode:      addr.pincode      || billing.pincode,
      addressLine1: addr.addressLine1 || billing.addressLine1,
      addressLine2: addr.addressLine2 || billing.addressLine2,
      note:         addr.note         || billing.note,
    })
    setFormErrors({})
  }

  async function handleSaveBilling() {
    const errors = validateBilling(billing)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); setSaveMsg({ type: 'err', text: 'Please fill all required fields.' }); return }
    setAddrSaving(true); setSaveMsg(null)
    try {
      if (selectedAddrId) {
        await apiClient.put(`/api/addresses/${selectedAddrId}`, buildAddressPayload(billing), { headers: authHeaders() } as any)
        setSaveMsg({ type: 'ok', text: '✅ Address updated.' })
      } else {
        const res = await apiClient.post('/api/addresses', buildAddressPayload(billing), { headers: authHeaders() } as any)
        const newId = res.data?.data?.id ?? res.data?.id
        if (newId) setSelectedAddrId(Number(newId))
        setSaveMsg({ type: 'ok', text: '✅ Address saved.' })
      }
      localStorage.setItem('savedBillingInfo', JSON.stringify(billing))
      await loadAddresses()
    } catch (e: any) {
      setSaveMsg({ type: 'err', text: `❌ ${e?.response?.data?.message ?? e?.message ?? 'Save failed.'}` })
    } finally {
      setAddrSaving(false)
      setTimeout(() => { if (alive.current) setSaveMsg(null) }, 4000)
    }
  }

  async function handleDeleteAddress(id: number) {
    if (!confirm('Delete this saved address?')) return
    try {
      await apiClient.delete(`/api/addresses/${id}`, { headers: authHeaders() } as any)
      setAddrMsg({ type: 'ok', text: 'Address deleted.' })
      if (selectedAddrId === id) { setSelectedAddrId(null); setBilling(EMPTY_BILLING) }
      await loadAddresses()
    } catch (e: any) { setAddrMsg({ type: 'err', text: e?.message ?? 'Delete failed.' }) }
    setTimeout(() => { if (alive.current) setAddrMsg(null) }, 3000)
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) { setCouponErr('Enter a coupon code.'); return }
    const c = COUPONS[code]
    if (!c) { setCouponErr('Invalid coupon code.'); return }
    if (c.minOrder && subtotal < c.minOrder) { setCouponErr(`Minimum order ${fmtINR(c.minOrder)} required.`); return }
    setAppliedCoupon({ code, discount: c.type === 'percent' ? subtotal * c.value : c.value })
    setCouponErr(null); setCouponInput('')
  }

  function checkPincode() {
    if (!/^\d{6}$/.test(billing.pincode)) { setPincodeMsg('❌ Enter a valid 6-digit pincode.'); return }
    setTimeout(() => {
      setPincodeMsg(parseInt(billing.pincode[0]) > 2 ? '✅ Delivery available — standard 5–7 days.' : '❌ Delivery not available at this pincode.')
    }, 400)
  }

  function validateBilling(b: BillingInfo) {
    const e: Partial<Record<keyof BillingInfo, string>> = {}
    if (!b.fullName.trim())                           e.fullName     = 'Full name is required'
    if (!b.email.trim())                              e.email        = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(b.email))          e.email        = 'Enter a valid email'
    if (!b.phone.trim())                              e.phone        = 'Phone is required'
    else if (b.phone.replace(/\D/g,'').length < 10)  e.phone        = 'Must be at least 10 digits'
    if (!/^\d{6}$/.test(b.pincode))                  e.pincode      = 'Enter a valid 6-digit pincode'
    if (!b.addressLine1.trim())                       e.addressLine1 = 'Address is required'
    return e
  }

  // ─── Place Order ──────────────────────────────────────────────────────────
  async function placeOrderOnServer(paymentRef?: string) {
    let resolvedAddressId = selectedAddrId
    if (!resolvedAddressId) {
      const r = await apiClient.post('/api/addresses', buildAddressPayload(billing), { headers: authHeaders() } as any)
      const newId = r.data?.data?.id ?? r.data?.id
      if (!newId) throw new Error('Could not save your address. Please click "Save Address" and try again.')
      resolvedAddressId = Number(newId); setSelectedAddrId(resolvedAddressId)
    }
    const payload = {
      address_id:        resolvedAddressId,
      shipping_method:   shippingMethod,
      payment_method:    paymentMethod,
      coupon_code:       appliedCoupon?.code ?? null,
      items: cart.lines.map(l => ({ cart_id: l.id, product_id: l.product.id, variant_id: (l as any).variantId ?? null, quantity: l.quantity, price: parseMoney(l.product.price) })),
      subtotal, shipping_cost: shipping, coupon_discount: couponDiscount, total,
      payment_reference: paymentRef ?? null,
    }
    return (await apiClient.post('/api/place-order', payload, { headers: authHeaders() } as any)).data
  }

  async function handlePlaceOrder() {
    const errors = validateBilling(billing)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); setOrderError('Please complete all required billing fields.'); return }
    if (!termsAccepted) { setOrderError('Please accept the Terms & Conditions.'); return }
    if (cart.lines.length === 0) { setOrderError('Your cart is empty.'); return }

    setIsPlacingOrder(true); setOrderError(null)

    try {
      if (paymentMethod === 'card') {
        // ── Razorpay flow ──────────────────────────────────────────────────
        const sdkReady = await new Promise<boolean>(resolve => {
          if ((window as any).Razorpay) return resolve(true)
          const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = () => resolve(true); s.onerror = () => resolve(false); document.body.appendChild(s)
        })
        if (!sdkReady) throw new Error('Payment gateway failed to load. Please try Cash on Delivery.')

        let rzpOrderId: string | undefined
        try {
          const r = await fetch('/api/razorpay/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ amount: Math.round(total * 100) }) })
          if (r.ok) { const d = await r.json(); rzpOrderId = d?.id }
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
            handler:  async (resp: any) => {
              try {
                await fetch('/api/razorpay/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ razorpay_payment_id: resp.razorpay_payment_id, razorpay_order_id: resp.razorpay_order_id ?? rzpOrderId, razorpay_signature: resp.razorpay_signature }) })
                await placeOrderOnServer(resp.razorpay_payment_id)
                resolve()
              } catch (e) { reject(e) }
            },
          }
          if (rzpOrderId) opts.order_id = rzpOrderId
          const rzp = new (window as any).Razorpay(opts)
          rzp.on('payment.failed', (r: any) => reject(new Error(r?.error?.description ?? 'Payment failed')))
          rzp.open()
        })
      } else {
        // ── COD flow — directly place order, no payment gateway ────────────
        await placeOrderOnServer()
      }

      setOrderSuccess(true)
      setTimeout(() => navigate('/order-history'), 700)
    } catch (err: any) {
      setOrderError(err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Failed to place order. Please try again.')
    } finally { setIsPlacingOrder(false) }
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <>
        <NavbarOne />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', fontFamily: FONT }}>
          <div style={{ textAlign: 'center', padding: '0 24px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', margin: '0 auto 20px' }}>✓</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
              {paymentMethod === 'cod' ? 'Order Placed! 🎉' : 'Payment Successful! 🎉'}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Redirecting to your orders…</p>
          </div>
        </div>
        <FooterOne />
      </>
    )
  }

  // ─── Full render ──────────────────────────────────────────────────────────
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

      {/* Step progress */}
      <div style={{ borderBottom: '1px solid #f0f0f0', background: 'white', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <StepBadge n={1} label="Billing"  active />
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <StepBadge n={2} label="Payment"  active />
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <StepBadge n={3} label="Confirm"  active={false} />
        </div>
      </div>

      <div style={{ background: '#f7f7fa', minHeight: '100vh', padding: '40px 0', fontFamily: FONT }}>
        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 16px' }}>

          {(cartLoading || authLoading) && <Spinner label="Loading checkout…" />}

          {!cartLoading && cartError && (
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', color: '#dc2626', fontSize: 14, fontFamily: FONT }}>
              {cartError}
            </div>
          )}

          {!cartLoading && !cartError && cart.lines.length === 0 && !authLoading && (
            <div style={{ textAlign: 'center', background: 'white', borderRadius: 20, padding: '80px 24px', fontFamily: FONT }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Your cart is empty</p>
              <Link to="/shop-v1" style={{ color: '#5B4FBE', fontWeight: 600, textDecoration: 'none' }}>Continue Shopping →</Link>
            </div>
          )}

          {!cartLoading && !cartError && cart.lines.length > 0 && (
            /* ── 2-column grid ── LEFT = billing+shipping+payment | RIGHT = summary */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'flex-start' }}>

              {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} data-aos="fade-up">

                {/* Coupon */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>🏷️</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Have a coupon?</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" placeholder="Enter coupon code" value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(null) }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      style={{ ...inp, flex: 1, textTransform: 'uppercase' }} />
                    <button onClick={applyCoupon} style={{ padding: '0 18px', height: 46, borderRadius: 10, background: BRAND, color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: FONT }}>Apply</button>
                  </div>
                  {couponErr && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6, fontWeight: 500 }}>{couponErr}</p>}
                  {appliedCoupon && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>✓ "{appliedCoupon.code}" — {fmtINR(appliedCoupon.discount)} off applied!</p>
                      <button onClick={() => setAppliedCoupon(null)} style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {Object.entries(COUPONS).map(([code, c]) => (
                      <button key={code} onClick={() => { setCouponInput(code); setCouponErr(null) }}
                        style={{ fontSize: 11, padding: '4px 10px', border: '1px dashed #5B4FBE', borderRadius: 6, background: '#f3f1ff', color: '#5B4FBE', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                        {code} <span style={{ fontWeight: 400, opacity: .7 }}>({c.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Billing Form */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Billing Information</h4>
                    {addrLoading && <span style={{ fontSize: 12, color: '#9ca3af' }}>Loading…</span>}
                  </div>

                  {/* Saved addresses */}
                  {addresses.length > 0 && addrMode === 'view' && (
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Saved Addresses</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {addresses.map(addr => (
                          <div key={addr.id} onClick={() => selectAddress(addr.id)}
                            style={{ padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${selectedAddrId === addr.id ? PRI : '#e5e7eb'}`, background: selectedAddrId === addr.id ? '#f3f1ff' : '#fafafa', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, transition: 'all .15s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedAddrId === addr.id ? PRI : '#d1d5db'}`, background: selectedAddrId === addr.id ? PRI : 'transparent', flexShrink: 0 }} />
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{addr.fullName}</p>
                                <p style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {addr.addressLine1}{addr.city ? `, ${addr.city}` : ''}{addr.pincode ? ` — ${addr.pincode}` : ''}
                                </p>
                                {addr.phone && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>📞 {addr.phone}</p>}
                              </div>
                            </div>
                            {/* Icon buttons for edit and delete */}
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button onClick={e => { e.stopPropagation(); selectAddress(addr.id); setAddrMode('edit') }}
                                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B4FBE', transition: 'all .15s' }}
                                title="Edit address"
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f3f1ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5B4FBE' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb' }}>
                                <IconEdit />
                              </button>
                              <button onClick={e => { e.stopPropagation(); handleDeleteAddress(addr.id) }}
                                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', transition: 'all .15s' }}
                                title="Delete address"
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb' }}>
                                <IconTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {addrMsg && <p style={{ fontSize: 12, marginTop: 6, fontWeight: 500, color: addrMsg.type === 'ok' ? '#16a34a' : '#ef4444' }}>{addrMsg.text}</p>}
                      <button onClick={() => { setAddrMode('add'); setBilling(EMPTY_BILLING); setSelectedAddrId(null) }}
                        style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: PRI, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT }}>
                        + Add New Address
                      </button>
                    </div>
                  )}

                  {/* Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Full Name" required error={formErrors.fullName}>
                        <input type="text" value={billing.fullName} onChange={e => { setBilling({ ...billing, fullName: e.target.value }); clearErr('fullName') }} style={inp} placeholder="Rajesh Kumar" onFocus={e => (e.currentTarget.style.borderColor = PRI)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
                      </Field>
                      <Field label="Email" required error={formErrors.email}>
                        <input type="email" value={billing.email} onChange={e => { setBilling({ ...billing, email: e.target.value }); clearErr('email') }} style={inp} placeholder="you@email.com" onFocus={e => (e.currentTarget.style.borderColor = PRI)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
                      </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Phone" required error={formErrors.phone}>
                        <input type="tel" value={billing.phone} onChange={e => { setBilling({ ...billing, phone: e.target.value }); clearErr('phone') }} style={inp} placeholder="9876543210" onFocus={e => (e.currentTarget.style.borderColor = PRI)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
                      </Field>
                      <Field label="Town / City">
                        <select value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
                          {INDIAN_CITIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Pincode" required error={formErrors.pincode}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" value={billing.pincode} onChange={e => { setBilling({ ...billing, pincode: e.target.value.replace(/\D/g,'').slice(0,6) }); clearErr('pincode') }} style={{ ...inp, flex: 1 }} placeholder="6-digit pincode" onKeyDown={e => e.key === 'Enter' && checkPincode()} onFocus={e => (e.currentTarget.style.borderColor = PRI)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
                        <button onClick={checkPincode} style={{ padding: '0 14px', height: 46, background: '#111827', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, flexShrink: 0 }}>Check</button>
                      </div>
                      {pincodeMsg && <p style={{ fontSize: 12, marginTop: 4, fontWeight: 500, color: pincodeMsg.includes('✅') ? '#16a34a' : '#ef4444' }}>{pincodeMsg}</p>}
                    </Field>
                    <Field label="Address Line 1" required error={formErrors.addressLine1}>
                      <input type="text" value={billing.addressLine1} onChange={e => { setBilling({ ...billing, addressLine1: e.target.value }); clearErr('addressLine1') }} style={inp} placeholder="House No., Street Name" onFocus={e => (e.currentTarget.style.borderColor = PRI)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
                    </Field>
                    <Field label="Address Line 2 (Optional)">
                      <input type="text" value={billing.addressLine2} onChange={e => setBilling({ ...billing, addressLine2: e.target.value })} style={inp} placeholder="Apartment, Floor, Landmark" onFocus={e => (e.currentTarget.style.borderColor = PRI)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
                    </Field>
                    <Field label="Delivery Notes (Optional)">
                      <textarea value={billing.note} onChange={e => setBilling({ ...billing, note: e.target.value })} rows={2} style={{ ...inp, height: 'auto', padding: '12px 14px', resize: 'vertical' }} placeholder="Any special delivery instructions…" onFocus={e => (e.currentTarget.style.borderColor = PRI)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
                    </Field>
                  </div>

                  {/* Save button */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button type="button" onClick={handleSaveBilling} disabled={addrSaving}
                      style={{ padding: '0 22px', height: 44, borderRadius: 22, background: BRAND, color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: addrSaving ? 'not-allowed' : 'pointer', fontFamily: FONT, opacity: addrSaving ? .6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {addrSaving
                        ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'chkSpin .7s linear infinite', display: 'inline-block' }} /> Saving…</>
                        : `💾 ${selectedAddrId ? 'Update Address' : 'Save Address'}`
                      }
                    </button>
                    {addrMode !== 'view' && addresses.length > 0 && (
                      <button onClick={() => setAddrMode('view')} style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
                    )}
                    {saveMsg && <p style={{ fontSize: 12, fontWeight: 600, color: saveMsg.type === 'ok' ? '#16a34a' : '#ef4444' }}>{saveMsg.text}</p>}
                  </div>
                </div>

                {/* Shipping Method */}
                {/* <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Shipping Method</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {([
                      { value: 'Delivery', label: `Standard Delivery (5–7 days)`, cost: subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE },
                      { value: 'pickup',   label: 'Local Pickup',                   cost: 50 },
                    ] as const).map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: `1.5px solid ${shippingMethod === opt.value ? PRI : '#e5e7eb'}`, borderRadius: 10, background: shippingMethod === opt.value ? '#f3f1ff' : 'white', cursor: 'pointer', transition: 'all .15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input type="radio" name="shipping" value={opt.value} checked={shippingMethod === opt.value} onChange={() => setShippingMethod(opt.value)} style={{ accentColor: PRI }} />
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{opt.label}</span>
                            {opt.value === 'Delivery' && subtotal < FREE_SHIPPING_THRESHOLD && (
                              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Add {fmtINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping</p>
                            )}
                            {opt.value === 'Delivery' && subtotal >= FREE_SHIPPING_THRESHOLD && (
                              <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>🎉 Free shipping unlocked!</p>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: opt.cost === 0 ? '#16a34a' : '#374151' }}>
                          {opt.cost === 0 ? 'FREE' : fmtINR(opt.cost)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Payment Method */}
                {/* <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Payment Method</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}> */}
                    {/* COD */}
                    {/* <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: `1.5px solid ${paymentMethod === 'cod' ? PRI : '#e5e7eb'}`, borderRadius: 10, background: paymentMethod === 'cod' ? '#f3f1ff' : 'white', cursor: 'pointer', transition: 'all .15s' }}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: PRI }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>🏠 Cash on Delivery</p>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Pay when your order arrives — no online payment needed</p>
                      </div>
                      {paymentMethod === 'cod' && <span style={{ fontSize: 10, padding: '3px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: 20, fontWeight: 700 }}>Selected</span>}
                    </label> */}

                    {/* Card */}
                    {/* <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: `1.5px solid ${paymentMethod === 'card' ? PRI : '#e5e7eb'}`, borderRadius: 10, background: paymentMethod === 'card' ? '#f3f1ff' : 'white', cursor: 'pointer', transition: 'all .15s' }}>
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ accentColor: PRI }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>💳 Debit / Credit Card</p>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Secured by Razorpay — UPI, Cards, Net Banking</p>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['VISA','MC','UPI'].map(b => <span key={b} style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', background: '#f3f4f6', color: '#6b7280', borderRadius: 4 }}>{b}</span>)}
                      </div>
                    </label>
                  </div>
                </div> */}
              </div>

              {/* ── RIGHT COLUMN: Order Summary ──────────────────────────── */}
              <div data-aos="fade-up" data-aos-delay="80">

                 {/* Shipping Method */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Shipping Method</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {([
                      { value: 'Delivery', label: `Standard Delivery (5–7 days)`, cost: subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE },
                      { value: 'pickup',   label: 'Local Pickup',                   cost: 50 },
                    ] as const).map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: `1.5px solid ${shippingMethod === opt.value ? PRI : '#e5e7eb'}`, borderRadius: 10, background: shippingMethod === opt.value ? '#f3f1ff' : 'white', cursor: 'pointer', transition: 'all .15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input type="radio" name="shipping" value={opt.value} checked={shippingMethod === opt.value} onChange={() => setShippingMethod(opt.value)} style={{ accentColor: PRI }} />
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{opt.label}</span>
                            {opt.value === 'Delivery' && subtotal < FREE_SHIPPING_THRESHOLD && (
                              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Add {fmtINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping</p>
                            )}
                            {opt.value === 'Delivery' && subtotal >= FREE_SHIPPING_THRESHOLD && (
                              <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>🎉 Free shipping unlocked!</p>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: opt.cost === 0 ? '#16a34a' : '#374151' }}>
                          {opt.cost === 0 ? 'FREE' : fmtINR(opt.cost)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Payment Method</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* COD */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: `1.5px solid ${paymentMethod === 'cod' ? PRI : '#e5e7eb'}`, borderRadius: 10, background: paymentMethod === 'cod' ? '#f3f1ff' : 'white', cursor: 'pointer', transition: 'all .15s' }}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: PRI }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>🏠 Cash on Delivery</p>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Pay when your order arrives — no online payment needed</p>
                      </div>
                      {paymentMethod === 'cod' && <span style={{ fontSize: 10, padding: '3px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: 20, fontWeight: 700 }}>Selected</span>}
                    </label>

                    {/* Card */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: `1.5px solid ${paymentMethod === 'card' ? PRI : '#e5e7eb'}`, borderRadius: 10, background: paymentMethod === 'card' ? '#f3f1ff' : 'white', cursor: 'pointer', transition: 'all .15s' }}>
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ accentColor: PRI }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>💳 Debit / Credit Card</p>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Secured by Razorpay — UPI, Cards, Net Banking</p>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['VISA','MC','UPI'].map(b => <span key={b} style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', background: '#f3f4f6', color: '#6b7280', borderRadius: 4 }}>{b}</span>)}
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px', position: 'sticky', top: 72 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Order Summary</h4>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto', marginBottom: 16, paddingRight: 4 }}>
                    {cart.lines.map(line => {
                      const itemTotal = parseMoney(line.product.price) * line.quantity
                      return (
                        <div key={line.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, border: '1px solid #f0f0f0' }}>
                            <img src={line.product.image || placeholder} alt={line.product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { (e.currentTarget as HTMLImageElement).src = placeholder }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{line.product.name}</p>
                            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Qty: {line.quantity}</p>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', flexShrink: 0 }}>{fmtINR(itemTotal)}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Price breakdown */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>Subtotal ({cart.lines.length} item{cart.lines.length !== 1 ? 's' : ''})</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{fmtINR(subtotal)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>Coupon ({appliedCoupon?.code})</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>−{fmtINR(couponDiscount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>Shipping</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: shipping === 0 ? '#16a34a' : '#374151' }}>{shipping === 0 ? 'FREE' : fmtINR(shipping)}</span>
                    </div>
                    {subtotal < FREE_SHIPPING_THRESHOLD && shippingMethod === 'Delivery' && (
                      <p style={{ fontSize: 11, color: '#f97316', fontWeight: 500, background: '#fff7ed', padding: '6px 10px', borderRadius: 6 }}>
                        Add {fmtINR(FREE_SHIPPING_THRESHOLD - subtotal)} more to unlock free shipping!
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total</span>
                      <span style={{ fontSize: 18, fontWeight: 800, background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{fmtINR(total)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, textAlign: 'right' }}>🎉 You save {fmtINR(couponDiscount)} on this order</p>
                    )}
                  </div>

                  {/* Terms + CTA */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                      <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: 2, accentColor: PRI, width: 14, height: 14 }} />
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        I agree to the{' '}
                        <Link to="/terms-and-conditions" style={{ color: PRI, fontWeight: 600 }}>Terms & Conditions</Link>
                      </span>
                    </label>

                    {orderError && (
                      <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
                        ⚠ {orderError}
                      </div>
                    )}

                    {/* COD info banner */}
                    {paymentMethod === 'cod' && (
                      <div style={{ marginBottom: 12, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 12, color: '#166534', fontWeight: 500 }}>
                        🏠 Cash on Delivery — You'll pay when your order arrives. No online payment required.
                      </div>
                    )}

                    <button onClick={handlePlaceOrder} disabled={isPlacingOrder || !termsAccepted}
                      style={{ width: '100%', height: 50, borderRadius: 25, background: isPlacingOrder || !termsAccepted ? '#d1d5db' : BRAND, color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: isPlacingOrder || !termsAccepted ? 'not-allowed' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .18s' }}>
                      {isPlacingOrder
                        ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'chkSpin .7s linear infinite', display: 'inline-block' }} /> Processing…</>
                        : paymentMethod === 'cod' ? '📦 Place Order (COD)' : '💳 Pay & Place Order'
                      }
                    </button>
                    <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>🔒 256-bit SSL Encrypted & Secure</p>

                    <Link to="/cart" style={{ display: 'block', textAlign: 'center', marginTop: 10, padding: '10px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#6b7280', textDecoration: 'none', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#f9fafb'}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}>
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
  )
}