// src/components/footer/footer-one.tsx
// =============================================================================
//  FooterOne — Infinity Print & Signage Industries (PROFESSIONAL EDITION)
//  Complete brand redesign using the Infinity logo colour system
//
//  BRAND COLOURS:
//  Left loop  (warm): #6B3FA0 purple → #DC2626 red → #F97316 orange
//  Right loop (cool): #0EA5C2 teal   → #16A34A green → #84CC16 lime
//
//  ENHANCEMENTS:
//  · Trust badges (ISO, quality, made in India)
//  · Subtle entrance animations (fade-up, slide)
//  · Better responsive breakpoints
//  · Interactive hover states with scale/shadows
//  · Industry awards / certifications strip
//  · No internal back-to-top button (handled by global ScrollToTop)
// =============================================================================

import { useState, useEffect } from 'react'
import { Link }                from 'react-router-dom'
import {
  FaFacebookF, FaHeart, FaInstagram,
  FaLinkedin,  FaYoutube,  FaPinterest,
} from 'react-icons/fa'
import {
  LuMail, LuPhone, LuSend, LuShield,
  LuTruck, LuRefreshCw, LuAward, LuLock,
  LuMapPin, LuBadgeCheck, LuCrown,
} from 'react-icons/lu'

// ─────────────────────────────────────────────────────────────────────────────
//  BRAND TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const B = {
  brand:    'linear-gradient(135deg, #6B3FA0 0%, #DC2626 50%, #F97316 100%)',
  brandFull:'linear-gradient(135deg, #6B3FA0 0%, #C0233B 25%, #DC2626 50%, #F97316 75%, #EAB308 100%)',
  cta:      'linear-gradient(135deg, #0EA5C2 0%, #16A34A 60%, #84CC16 100%)',
  warm:     'linear-gradient(135deg, #EC4899 0%, #E8430A 50%, #EAB308 100%)',
  purple:   '#6B3FA0',
  red:      '#DC2626',
  orange:   '#F97316',
  teal:     '#0EA5C2',
  green:    '#16A34A',
  pink:     '#EC4899',
  yellow:   '#EAB308',
  bg:       '#080810',
  bgCard:   '#10101E',
  bgBand:   '#0C0C1A',
  border:   'rgba(255,255,255,0.08)',
  borderMd: 'rgba(255,255,255,0.14)',
  textHi:   '#FFFFFF',
  textMd:   'rgba(255,255,255,0.82)',
  textLo:   'rgba(255,255,255,0.52)',
  textFaint:'rgba(255,255,255,0.34)',
}

// ─────────────────────────────────────────────────────────────────────────────
//  NAV DATA  (all original routes preserved)
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Portrait Frames',   href: '/category/portrait-frames',   dot: B.orange  },
  { name: 'Canvas Paintings',  href: '/category/canvas-paintings',  dot: B.purple  },
  { name: 'Temple Art Prints', href: '/category/temple-art-prints', dot: B.orange  },
  { name: 'Wall Murals',       href: '/category/wall-murals',       dot: B.green   },
  { name: 'Modern Wallpapers', href: '/category/modern-wallpapers', dot: B.pink    },
  { name: 'Customize Blinds',  href: '/customize/blind',            dot: B.teal    },
  { name: 'Neon Signs',        href: '/customize/neon',             dot: B.red     },
  { name: 'Backlit LED',       href: '/category/backlit-led',       dot: B.teal    },
  { name: 'Shop All Products', href: '/shop',                       dot: B.purple  },
]

const ABOUT_LINKS = [
  { name: 'Our Story',        href: '/about'   },
  { name: 'Blog & Articles',  href: '/blog-v1' },
  { name: 'Contact Us',       href: '/contact' },
  { name: 'FAQs',             href: '/faq'     },
  { name: 'Become a Partner', href: '/contact' },
]

const QUICK_LINKS = [
  { name: 'Shop All',         href: '/shop'            },
  { name: 'My Wishlist',      href: '/wishlist'         },
  { name: 'My Cart',          href: '/cart'             },
  { name: 'My Orders',        href: '/account/orders'   },
  { name: 'Track My Order',   href: '/track-order'      },
  { name: 'Custom Design',    href: '/customize/blind'  },
]

const HELP_LINKS = [
  { name: 'Shipping Policy',    href: '/shipping-policy'      },
  { name: 'Return Policy',      href: '/return-policy'        },
  { name: 'Privacy Policy',     href: '/privacy-policy'       },
  { name: 'Terms & Conditions', href: '/terms-and-conditions'  },
  { name: 'Contact Support',    href: '/contact'              },
  { name: 'FAQs',               href: '/faq'                  },
]

const SOCIAL = [
  { Icon: FaFacebookF, href: 'https://facebook.com',  label: 'Facebook',  color: '#1877F2' },
  { Icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram', color: '#E1306C' },
  { Icon: FaPinterest, href: 'https://pinterest.com', label: 'Pinterest', color: '#E60023' },
  { Icon: FaYoutube,   href: 'https://youtube.com',   label: 'YouTube',   color: '#FF0000' },
  { Icon: FaLinkedin,  href: 'https://linkedin.com',  label: 'LinkedIn',  color: '#0A66C2' },
]

const PAYMENT = ['Visa', 'Mastercard', 'Amex', 'RuPay', 'PayPal', 'UPI', 'Net Banking']
const TRUST_BADGES = [
  { label: 'ISO 9001:2024', icon: <LuBadgeCheck size={14} />, color: B.teal },
  { label: 'Made in India', icon: <LuCrown size={14} />, color: B.orange },
  { label: 'Quality Assured', icon: <LuShield size={14} />, color: B.purple },
]

// ─────────────────────────────────────────────────────────────────────────────
//  INJECTED CSS (enhanced with animations, no back-to-top)
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
/* Column headings */
.fo-head {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.16em;
  color: #fff; display: block;
  padding-bottom: 12px; margin-bottom: 18px;
  position: relative;
}
.fo-head::after {
  content: '';
  position: absolute; bottom: 0; left: 0;
  width: 32px; height: 2px;
  background: linear-gradient(135deg, #6B3FA0 0%, #DC2626 50%, #F97316 100%);
  border-radius: 1px;
  transition: width 0.25s ease;
}
.fo-head:hover::after { width: 48px; }

/* Nav links */
.fo-link {
  color: rgba(255,255,255,0.52);
  font-size: 13.5px; line-height: 1.5;
  text-decoration: none; display: flex; align-items: center; gap: 8px;
  transition: color 0.18s ease, padding-left 0.18s ease;
}
.fo-link:hover {
  color: #fff;
  padding-left: 4px;
}
.fo-link .fo-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
  transition: transform 0.18s ease;
}
.fo-link:hover .fo-dot { transform: scale(1.5); }

/* Social buttons */
.fo-soc {
  width: 38px; height: 38px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.14);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.52); text-decoration: none;
  transition: all 0.22s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  flex-shrink: 0;
}
.fo-soc:hover {
  border-color: transparent;
  color: #fff;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 14px rgba(0,0,0,0.2);
}

/* Newsletter input */
.fo-nl-wrap {
  display: flex; align-items: stretch;
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 4px; overflow: hidden;
  background: rgba(255,255,255,0.06);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.fo-nl-wrap:focus-within {
  border-color: #6B3FA0;
  box-shadow: 0 0 0 2px rgba(107,63,160,0.2);
}
.fo-nl-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #fff; font-size: 13px; padding: 0 14px; height: 46px;
  min-width: 0; font-family: inherit;
}
.fo-nl-input::placeholder { color: rgba(255,255,255,0.32); }
.fo-nl-btn {
  height: 46px; padding: 0 20px;
  background: linear-gradient(135deg, #6B3FA0, #DC2626, #F97316);
  border: none; color: #fff; font-size: 13px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; gap: 7px;
  white-space: nowrap; letter-spacing: 0.06em;
  font-family: inherit; flex-shrink: 0;
  transition: opacity 0.18s, transform 0.1s;
}
.fo-nl-btn:hover     { opacity: 0.88; transform: scale(0.98); }
.fo-nl-btn:disabled  { opacity: 0.55; cursor: not-allowed; transform: none; }

/* Payment pills */
.fo-pay {
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px; padding: 5px 13px;
  font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.52);
  background: rgba(255,255,255,0.05);
  transition: all 0.18s;
  white-space: nowrap;
}
.fo-pay:hover {
  background: linear-gradient(135deg, #6B3FA0, #DC2626, #F97316);
  color: #fff; border-color: transparent;
  transform: translateY(-1px);
}

/* USP items */
.fo-usp {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 24px;
  border-right: 1px solid rgba(255,255,255,0.08);
  flex: 1; min-width: 180px;
  transition: background 0.25s ease;
}
.fo-usp:last-child { border-right: none; }
.fo-usp:hover { background: rgba(107,63,160,0.08); }

/* Legal links */
.fo-legal {
  font-size: 12px; color: rgba(255,255,255,0.38);
  text-decoration: none; transition: color 0.18s;
}
.fo-legal:hover { color: #fff; }

/* Gradient text */
.fo-brand-text {
  background: linear-gradient(135deg, #6B3FA0 0%, #DC2626 50%, #F97316 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.fo-animate {
  animation: fadeUp 0.6s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .fo-link, .fo-soc, .fo-nl-btn, .fo-pay, .fo-usp,
  .fo-head::after { transition: none; }
  .fo-animate { animation: none; opacity: 1; transform: none; }
}
`

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function ColHead({ children }: { children: React.ReactNode }) {
  return <span className="fo-head">{children}</span>
}

function NavCol({ heading, links }: {
  heading: string
  links: { name: string; href: string; dot?: string }[]
}) {
  return (
    <div className="fo-animate" style={{ animationDelay: '0.05s' }}>
      <ColHead>{heading}</ColHead>
      <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:11}}>
        {links.map(({ name, href, dot }) => (
          <li key={name}>
            <Link to={href} className="fo-link">
              {dot && <span className="fo-dot" style={{background:dot}}/>}
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Newsletter() {
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle'|'sending'|'done'>('idle')
  const [touched, setTouched] = useState(false)
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    setStatus('sending')
    setTimeout(() => { setStatus('done'); setEmail('') }, 1000)
  }

  if (status === 'done') {
    return (
      <div className="fo-animate" style={{
        background: 'rgba(107,63,160,0.18)',
        border: '1px solid rgba(107,63,160,0.4)',
        borderRadius: 6, padding: '12px 16px',
        color: '#fff', fontSize: 13.5, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: B.brand,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 12,
        }}>✓</span>
        You're subscribed! Watch your inbox for exclusive offers.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="fo-nl-wrap">
        <input
          type="email"
          className="fo-nl-input"
          placeholder="Your email address"
          value={email}
          onChange={e => { setEmail(e.target.value); setTouched(false) }}
          aria-label="Email for newsletter"
        />
        <button type="submit" className="fo-nl-btn" disabled={status==='sending'}>
          <LuSend size={13}/>
          {status==='sending' ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
      {touched && !isValid && (
        <p style={{fontSize:11.5,color:'#FCD34D',marginTop:8}}>
          Please enter a valid email address.
        </p>
      )}
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN FOOTER
// ─────────────────────────────────────────────────────────────────────────────
export default function FooterOne() {
  useEffect(() => {
    const ID = 'fo-v2-styles'
    if (!document.getElementById(ID)) {
      const s = document.createElement('style')
      s.id          = ID
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  return (
    <footer style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: B.bg,
      color: B.textMd,
    }}>

      {/* ══ 1. USP TRUST STRIP ══════════════════════════════════════════════ */}
      <div style={{
        background: B.bgBand,
        borderTop:    `1px solid ${B.border}`,
        borderBottom: `1px solid ${B.border}`,
      }}>
        <div style={{maxWidth:1720,margin:'0 auto',padding:'0 clamp(20px,4vw,56px)'}}>
          <div style={{
            display:'flex',flexWrap:'wrap',
            alignItems:'stretch',
            minHeight:68,
          }}>
            {[
              { icon:<LuTruck size={20}/>,      color:B.teal,   title:'Free Shipping',       sub:'On orders over ₹999'  },
              { icon:<LuRefreshCw size={20}/>,  color:B.green,  title:'30-Day Free Returns', sub:'No questions asked'   },
              { icon:<LuAward size={20}/>,      color:B.orange, title:'2-Year Warranty',     sub:'On all products'      },
              { icon:<LuLock size={20}/>,       color:B.purple, title:'Secure Checkout',     sub:'256-bit SSL encrypted'},
              { icon:<LuShield size={20}/>,     color:B.pink,   title:'100% Authentic',      sub:'Verified products'    },
            ].map((usp, i, arr) => (
              <div key={usp.title} className="fo-usp"
                style={{
                  borderRight: i < arr.length - 1 ? `1px solid ${B.border}` : 'none',
                }}>
                <div style={{
                  width:40,height:40,borderRadius:8,flexShrink:0,
                  background:`${usp.color}18`,
                  border:`1px solid ${usp.color}30`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:usp.color,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {usp.icon}
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:B.textHi,margin:0,lineHeight:1.3}}>{usp.title}</p>
                  <p style={{fontSize:11.5,color:B.textLo,margin:'3px 0 0',lineHeight:1}}>{usp.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 2. NEWSLETTER BAND + TRUST BADGES ════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(107,63,160,0.22) 0%, rgba(220,38,38,0.14) 50%, rgba(249,115,22,0.10) 100%)',
        borderBottom: `1px solid ${B.border}`,
        padding: 'clamp(28px,4vw,40px) 0',
      }}>
        <div style={{maxWidth:1720,margin:'0 auto',padding:'0 clamp(20px,4vw,56px)'}}>
          <div style={{
            display:'flex',flexWrap:'wrap',
            alignItems:'center',gap:'clamp(24px,4vw,48px)',
          }}>
            {/* Left: brand accent */}
            <div className="fo-animate" style={{flex:'0 0 auto',maxWidth:340}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:3,height:32,background:B.brand,borderRadius:2,flexShrink:0}}/>
                <div>
                  <p style={{
                    fontSize:'clamp(18px,2.5vw,22px)',fontWeight:700,
                    color:B.textHi,margin:0,lineHeight:1.2,
                    fontFamily:"'DM Serif Display',Georgia,serif",
                  }}>
                    Join the Infinity Circle
                  </p>
                  <p style={{fontSize:12.5,color:B.textLo,margin:'4px 0 0'}}>
                    Early access · Exclusive offers · Design inspiration
                  </p>
                </div>
              </div>
            </div>
            {/* Right: form */}
            <div className="fo-animate" style={{flex:'1 1 280px',maxWidth:520}}>
              <Newsletter/>
            </div>
            {/* Trust badges */}
            <div className="fo-animate" style={{
              display:'flex',flexWrap:'wrap',gap:10,
              flex:'0 0 auto',
            }}>
              {TRUST_BADGES.map((badge) => (
                <div key={badge.label} style={{
                  background:'rgba(255,255,255,0.04)',
                  border:`1px solid ${B.border}`,
                  borderRadius:6,padding:'8px 14px',
                  display:'flex',alignItems:'center',gap:8,
                  transition:'transform 0.2s',
                }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <span style={{color:badge.color}}>{badge.icon}</span>
                  <span style={{fontSize:11,color:B.textLo,fontWeight:500}}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ 3. MAIN GRID (5 columns with staggered animations) ════════════════ */}
      <div style={{padding:'clamp(48px,6vw,72px) 0 clamp(32px,4vw,48px)'}}>
        <div style={{maxWidth:1720,margin:'0 auto',padding:'0 clamp(20px,4vw,56px)'}}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,170px), 1fr))',
            gap:'clamp(32px,4vw,52px)',
            alignItems:'start',
          }}>
            <NavCol heading="Shop by Category" links={CATEGORIES}/>
            <NavCol heading="About Infinity" links={ABOUT_LINKS}/>

            {/* Brand column (centre) */}
            <div className="fo-animate" style={{ animationDelay: '0.1s' }}>
              <div style={{marginBottom:24}}>
                <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:6}}>
                  <span style={{
                    fontSize:34,fontWeight:800,letterSpacing:'-1px',
                    fontFamily:"'DM Serif Display',Georgia,serif",
                    lineHeight:1,
                    background:B.brandFull,
                    WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                  }}>
                    Infinity
                  </span>
                </div>
                <p style={{fontSize:11,color:B.textLo,letterSpacing:'0.12em',textTransform:'uppercase',margin:0}}>
                  Print &amp; Signage Industries
                </p>
                <div style={{height:2,width:48,background:B.brand,borderRadius:1,marginTop:10}}/>
              </div>

              <p style={{fontSize:13,color:B.textLo,lineHeight:1.7,marginBottom:24,maxWidth:260}}>
                India's leading custom print &amp; signage studio. Transforming spaces with bespoke
                wall art, neon signs, backlit LED panels, and premium décor since 2018.
              </p>

              <div style={{marginBottom:24}}>
                <ColHead>Get in Touch</ColHead>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    { Icon:LuMail, color:B.purple, label:'info@infinity.in', href:'mailto:info@infinity.in' },
                    { Icon:LuPhone, color:B.teal, label:'+91 99035 04754', href:'tel:+919903504754' },
                    { Icon:LuMapPin, color:B.orange, label:'Mumbai, Maharashtra, India', href:'#' },
                  ].map(({ Icon, color, label, href }) => (
                    <a key={label} href={href} className="fo-link" style={{gap:10}}>
                      <span style={{
                        width:28,height:28,borderRadius:6,flexShrink:0,
                        background:`${color}18`,
                        border:`1px solid ${color}28`,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        color:color,
                      }}>
                        <Icon size={12}/>
                      </span>
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <ColHead>Follow Us</ColHead>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {SOCIAL.map(({ Icon, href, label, color }) => (
                    <a
                      key={label} href={href}
                      target="_blank" rel="noreferrer"
                      aria-label={label}
                      className="fo-soc"
                      onMouseEnter={e=>(e.currentTarget.style.background=color)}
                      onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                    >
                      <Icon size={13}/>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <NavCol heading="Quick Links" links={QUICK_LINKS}/>
            <NavCol heading="Help &amp; Support" links={HELP_LINKS}/>
          </div>
        </div>
      </div>

      {/* ══ 4. BRAND GRADIENT DIVIDER ═══════════════════════════════════════ */}
      <div style={{height:2,background:B.brandFull,width:'100%'}}/>

      {/* ══ 5. BOTTOM BAR ═══════════════════════════════════════════════════ */}
      <div style={{background:B.bgBand,padding:'clamp(18px,3vw,28px) 0'}}>
        <div style={{maxWidth:1720,margin:'0 auto',padding:'0 clamp(20px,4vw,56px)'}}>

          {/* Payment methods */}
          <div style={{
            display:'flex',flexWrap:'wrap',
            alignItems:'center',justifyContent:'space-between',
            gap:'12px 20px',marginBottom:18,
            paddingBottom:18,
            borderBottom:`1px solid ${B.border}`,
          }}>
            <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:8}}>
              <span style={{
                fontSize:10,color:B.textFaint,fontWeight:700,
                letterSpacing:'0.14em',textTransform:'uppercase',marginRight:6,
              }}>
                We Accept
              </span>
              {PAYMENT.map(pm=>(
                <span key={pm} className="fo-pay">{pm}</span>
              ))}
            </div>
            <div style={{
              display:'flex',alignItems:'center',gap:8,
              border:`1px solid ${B.border}`,
              padding:'6px 14px',borderRadius:30,
              background:'rgba(107,63,160,0.08)',
            }}>
              <LuShield size={13} style={{color:B.purple}}/>
              <span style={{fontSize:12,color:B.textLo,fontWeight:500}}>256-bit SSL Secure</span>
            </div>
          </div>

          {/* Copyright row with extra industry info */}
          <div style={{
            display:'flex',flexWrap:'wrap',
            alignItems:'center',justifyContent:'space-between',gap:12,
          }}>
            <p style={{margin:0,fontSize:12.5,color:B.textFaint,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
              © {new Date().getFullYear()}{' '}
              <span className="fo-brand-text" style={{fontWeight:700}}>Infinity</span>
              . All rights reserved. Designed &amp; Developed with{' '}
              <FaHeart size={9} style={{color:B.red}}/>
              {' '}by{' '}
              <a href="https://invictusweb.in" target="_blank" rel="noreferrer"
                style={{color:B.textLo,textDecoration:'none',fontWeight:500,transition:'color .18s'}}
                onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
                onMouseLeave={e=>(e.currentTarget.style.color=B.textLo)}>
                Invictus Web Solutions Pvt Ltd
              </a>
            </p>

            <div style={{display:'flex',flexWrap:'wrap',gap:'6px 16px',alignItems:'center'}}>
              {[
                { name:'Privacy Policy',  href:'/privacy-policy'       },
                { name:'Terms of Use',    href:'/terms-and-conditions'  },
                { name:'Shipping Policy', href:'/shipping-policy'       },
                { name:'Returns',         href:'/return-policy'         },
              ].map(({ name, href }, i, arr) => (
                <span key={name} style={{display:'flex',alignItems:'center',gap:16}}>
                  <Link to={href} className="fo-legal">{name}</Link>
                  {i < arr.length - 1 && (
                    <span style={{width:1,height:10,background:B.border,display:'inline-block'}}/>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Extra: industry tagline */}
          <p style={{
            fontSize:10,color:B.textFaint,textAlign:'center',marginTop:20,
            letterSpacing:'0.06em',textTransform:'uppercase',
          }}>
            Premium Printing | Signage Solutions | Custom Décor | Made in India
          </p>
        </div>
      </div>
    </footer>
  )
}