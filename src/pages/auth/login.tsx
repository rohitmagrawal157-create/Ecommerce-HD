// src/pages/auth/Login.tsx
// ══════════════════════════════════════════════════════════════════════
//  ALL LOGIC UNCHANGED:
//  · handleSubmit validation (email/password required, email format)
//  · localStorage.setItem("access_token", "demo_token")
//  · navigate("/my-account") on success
//  · isLoading / error / rememberMe state
//  · Google / Facebook onClick handlers
//
//  CHANGED: Visual design updated to brand gradient system
//  Brand: #5B4FBE → #E8314A → #F97316 (purple→red→orange)
//  CTA:   #2563EB → #06B6D4 → #22C55E (blue→cyan→green)
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Aos from "aos";

import NavbarOne from "../../components/navbar/navbar-one";
import FooterOne from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";
import bg from '../../assets/img/bg/login.jpg';

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { LuMail, LuLock, LuArrowRight } from "react-icons/lu";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND      = 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)'
const CTA        = 'linear-gradient(135deg,#2563EB 0%,#06B6D4 50%,#22C55E 100%)'
const BRAND_SOLID = '#5B4FBE'
const FONT       = "'DM Sans', sans-serif"

// ── Reusable styled input ─────────────────────────────────────────────────────
function AuthInput({
  type, value, onChange, placeholder, icon: Icon, id,
}: {
  type: string; value: string; placeholder: string; id: string;
  icon: React.ElementType;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      position: 'relative',
      border: `1.5px solid ${focused ? BRAND_SOLID : '#E5E7EB'}`,
      borderRadius: 10,
      background: focused ? '#FAFAFC' : '#fff',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: focused ? `0 0 0 3px rgba(91,79,190,0.10)` : 'none',
      display: 'flex', alignItems: 'center',
    }}>
      <Icon size={16} style={{
        position: 'absolute', left: 14, flexShrink: 0,
        color: focused ? BRAND_SOLID : '#9CA3AF',
        transition: 'color 0.2s',
      }} />
      <input
        id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 48, paddingLeft: 42, paddingRight: 16,
          background: 'transparent', border: 'none', outline: 'none',
          fontFamily: FONT, fontSize: 14, color: '#111827',
        }}
      />
    </div>
  )
}

// ── Gradient submit button ────────────────────────────────────────────────────
function GradButton({
  children, loading, type = 'submit', onClick,
}: {
  children: React.ReactNode; loading?: boolean;
  type?: 'submit' | 'button'; onClick?: () => void;
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type={type} onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', height: 50, border: 'none', borderRadius: 10,
        background: hov ? CTA : BRAND,
        color: '#fff', fontFamily: FONT, fontSize: 14, fontWeight: 700,
        letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.75 : 1,
        transition: 'background 0.35s ease, transform 0.15s',
        transform: hov && !loading ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hov ? '0 8px 24px rgba(91,79,190,0.28)' : '0 4px 14px rgba(91,79,190,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      {children}
      {!loading && <LuArrowRight size={16} />}
    </button>
  )
}

// ── Social button ─────────────────────────────────────────────────────────────
function SocialBtn({ icon: Icon, label, onClick, iconColor }: {
  icon: React.ElementType; label: string; onClick: () => void; iconColor?: string;
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 46, border: `1.5px solid ${hov ? BRAND_SOLID : '#E5E7EB'}`,
        borderRadius: 10, background: hov ? '#FAFAFC' : '#fff',
        fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#374151',
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: hov ? `0 0 0 2px rgba(91,79,190,0.08)` : 'none',
      }}
    >
      <Icon size={18} color={iconColor} />
      {label}
    </button>
  )
}

export default function Login() {
  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
  }, []);

  // ── STATE (unchanged) ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const [email,      setEmail]      = useState("")
  const [password,   setPassword]   = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState("")

  // ── HANDLER (unchanged) ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim())    { setError("Email is required"); return }
    if (!password.trim()) { setError("Password is required"); return }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Please enter a valid email address"); return }
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem("access_token", "demo_token")
      navigate("/my-account")
    } catch {
      setError("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <NavbarOne />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 200px)', fontFamily: FONT }}>

        {/* ── Left: Image with overlay text ── */}
        <div style={{
          flex: '0 0 45%', position: 'relative',
          display: window.innerWidth < 768 ? 'none' : 'block',
        }} className="hidden md:block md:w-[45%]">
          <img
            src={bg} alt="login"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Dark gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg,rgba(91,79,190,0.75) 0%,rgba(14,14,20,0.80) 100%)',
          }} />
          {/* Overlay content */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end', padding: '56px 48px',
          }}>
            {/* Logo on image */}
            <div style={{
              backgroundImage: 'linear-gradient(90deg,#fff,rgba(255,255,255,0.7))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1,
            }}>
              Infinity
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4, marginBottom: 32 }}>
              printing &amp; signage
            </div>
            <h3 style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px' }}>
              Welcome back to<br />your creative space
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, margin: 0, maxWidth: 300 }}>
              Sign in to manage your orders, track deliveries, and discover new designs crafted just for you.
            </p>
            {/* Decorative gradient bar */}
            <div style={{ width: 48, height: 3, borderRadius: 2, background: BRAND, marginTop: 24 }} />
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#fff', padding: '48px 24px',
        }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* Heading */}
            <div data-aos="fade-up" data-aos-delay="100" style={{ marginBottom: 32 }}>
              {/* Mini gradient pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(91,79,190,0.08)', borderRadius: 20,
                padding: '5px 12px', marginBottom: 14,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: BRAND }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: BRAND_SOLID }}>
                  Welcome Back
                </span>
              </div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: '#111827', margin: '0 0 8px', lineHeight: 1.2 }}>
                Sign in to your account
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
                Continue your creative journey with Infinity.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div data-aos="fade-up" data-aos-delay="200" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Email Address
                </label>
                <AuthInput id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" icon={LuMail} />
              </div>

              {/* Password */}
              <div data-aos="fade-up" data-aos-delay="300" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
                  <Link to="/forgot-password" style={{
                    fontSize: 12, fontWeight: 600, textDecoration: 'none',
                    backgroundImage: BRAND, WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    Forgot password?
                  </Link>
                </div>
                <AuthInput id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" icon={LuLock} />
              </div>

              {/* Remember me */}
              <div data-aos="fade-up" data-aos-delay="400" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <input
                  type="checkbox" id="remember"
                  checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: BRAND_SOLID, cursor: 'pointer' }}
                />
                <label htmlFor="remember" style={{ fontSize: 13, color: '#6B7280', cursor: 'pointer', userSelect: 'none' }}>
                  Remember me
                </label>
              </div>

              {/* Error */}
              {error && (
                <div data-aos="fade-up" style={{
                  marginTop: 12, padding: '10px 14px',
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 8, fontSize: 13, color: '#DC2626',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 15 }}>⚠</span> {error}
                </div>
              )}

              {/* Submit */}
              <div data-aos="fade-up" data-aos-delay="500" style={{ marginTop: 20 }}>
                <GradButton loading={isLoading}>
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </GradButton>
              </div>
            </form>

            {/* Divider */}
            <div data-aos="fade-up" data-aos-delay="600" style={{ margin: '24px 0', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
              <span style={{ padding: '0 14px', fontSize: 12, color: '#9CA3AF', background: '#fff', whiteSpace: 'nowrap' }}>
                Or continue with
              </span>
              <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
            </div>

            {/* Social */}
            <div data-aos="fade-up" data-aos-delay="700" style={{ display: 'flex', gap: 12 }}>
              <SocialBtn icon={FcGoogle} label="Google" onClick={() => console.log("Google login")} />
              <SocialBtn icon={FaFacebook} label="Facebook" onClick={() => console.log("Facebook login")} iconColor="#1877F2" />
            </div>

            {/* Register link */}
            <p data-aos="fade-up" data-aos-delay="800" style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{
                fontWeight: 700, textDecoration: 'none',
                backgroundImage: BRAND, WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Create an account
              </Link>
            </p>

          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  )
}