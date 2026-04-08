// src/components/footer/footer-one.tsx

/**
 * FooterOne — Professional Footer
 * ────────────────────────────────
 * Column sequence (left → right):
 *   1. Top Categories
 *   2. About Us
 *   3. Brand column (logo · newsletter · email · phone · social)  ← CENTRE
 *   4. Quick Links
 *   5. Help
 *
 * Background: wallpaper image with dark overlay (opacity-controlled)
 * so all text remains fully readable at any screen size.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaPinterest,
} from 'react-icons/fa';
import { LuMail, LuPhone, LuSend, LuShield } from 'react-icons/lu';

// ─────────────────────────────────────────────────────────────────────────────
// BRAND CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT       = '#C6A15B';   // warm gold
const ACCENT_DARK  = '#AD8A4A';
const TEXT_LIGHT   = 'rgba(255,255,255,0.90)';
const TEXT_MUTED   = 'rgba(255,255,255,0.58)';
const BORDER_COL   = 'rgba(255,255,255,0.12)';

// Background image — wallpaper with chinoiserie/botanical feel
const BG_IMAGE = `https://imgs.search.brave.com/sJldnUuNYOe-tPZhqqXG8yt4o72tO-hVGzZdU_0wYS8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saWZl/bmNvbG9ycy5pbi9j/ZG4vc2hvcC9maWxl/cy9yb3NhLWNoaW5v/aXNlcmllLXdhbGxw/YXBlci1saXZpbmct/cm9vbS1jbGF5LWJl/aWdlLndlYnA_dj0x/NzY1ODgwNTk3Jndp/ZHRoPTMyMA`;
// Overlay opacity: 0 = fully transparent (show image), 1 = fully opaque (hide image)
// 0.82 keeps the pattern subtly visible while text is fully legible
const OVERLAY_OPACITY = 0.84;

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL LINKS
// ─────────────────────────────────────────────────────────────────────────────

const SOCIAL = [
  { Icon: FaFacebookF, href: 'https://facebook.com',  label: 'Facebook'  },
  { Icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { Icon: FaPinterest, href: 'https://pinterest.com', label: 'Pinterest' },
//   { Icon: FaTwitter,   href: 'https://twitter.com',   label: 'Twitter'   },
  { Icon: FaYoutube,   href: 'https://youtube.com',   label: 'YouTube'   },
  { Icon: FaLinkedin,  href: 'https://linkedin.com',  label: 'LinkedIn'  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION COLUMNS — in exact display order
// ─────────────────────────────────────────────────────────────────────────────

// Column 1 — Top Categories
const COL_CATEGORIES = {
  heading: 'Top Categories',
  links: [
    { name: 'Dining',           href: '/categories/dining'          },
    { name: 'Kitchen',          href: '/categories/kitchen'         },
    { name: 'Décor',            href: '/categories/decor'           },
    { name: 'Bath + Storage',   href: '/categories/bath-storage'    },
    { name: 'Gifts',            href: '/categories/gifts'           },
    { name: 'Bag',              href: '/categories/bag'             },
    { name: 'Luxe',             href: '/categories/luxe'            },
    { name: 'Soft Furnishing',  href: '/categories/soft-furnishing' },
    { name: 'Stationery',       href: '/categories/stationery'      },
  ],
};

// Column 2 — About Us
const COL_ABOUT = {
  heading: 'About Us',
  links: [
    { name: 'Our Story',                  href: '/about'          },
    { name: 'Store Locator',              href: '/store-locator'  },
    { name: 'Infinity Board',             href: '/board'          },
    { name: 'Blog',                       href: '/blog-v1'        },
    { name: 'Careers',                    href: '/careers'        },
    { name: 'Designer Affiliate Program', href: '/affiliate'      },
    { name: 'Infinity Store Events',      href: '/events'         },
  ],
};

// Column 4 — Quick Links
const COL_QUICK = {
  heading: 'Quick Links',
  links: [
    { name: 'Shop All',            href: '/shop-v1'          },
    { name: 'Sale',                href: '/sale'             },
    { name: 'Gifts For Christmas', href: '/gifts/christmas'  },
    { name: 'Gifts For New Year',  href: '/gifts/new-year'   },
    { name: 'Gift Cards',          href: '/gift-cards'       },
    { name: 'Offers',              href: '/offers'           },
  ],
};

// Column 5 — Help
const COL_HELP = {
  heading: 'Help',
  links: [
    { name: 'Create a Return',    href: '/returns/create'  },
    { name: 'Shipping',           href: '/shipping-method' },
    { name: 'Privacy Policy',     href: '/privacy'         },
    { name: 'Return Policy',      href: '/returns-policy'  },
    { name: 'Terms & Conditions', href: '/terms-and-conditions' },
    { name: 'Contact Us',         href: '/contact'         },
    { name: 'FAQs',               href: '/faq'             },
  ],
};

const PAYMENT_METHODS = ['Visa', 'MasterCard', 'Amex', 'Discover', 'PayPal', 'UPI'];

// ─────────────────────────────────────────────────────────────────────────────
// INJECTED CSS
// ─────────────────────────────────────────────────────────────────────────────

const FOOTER_CSS = `
  /* ── Link hover ──────────────────────────────────────────────────── */
  .fo-link {
    color:           ${TEXT_MUTED};
    font-size:       13.5px;
    line-height:     1.45;
    text-decoration: none;
    display:         inline-block;
    transition:      color 0.18s ease, padding-left 0.18s ease;
  }
  .fo-link:hover {
    color:        ${ACCENT};
    padding-left: 4px;
  }

  /* ── Section heading ─────────────────────────────────────────────── */
  .fo-heading {
    font-size:      11px;
    font-weight:    700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color:          ${TEXT_LIGHT};
    margin-bottom:  18px;
    padding-bottom: 10px;
    border-bottom:  1px solid ${BORDER_COL};
    display:        block;
  }

  /* ── Social icons ────────────────────────────────────────────────── */
  .fo-social {
    width:           36px;
    height:          36px;
    border-radius:   50%;
    border:          1px solid ${BORDER_COL};
    display:         flex;
    align-items:     center;
    justify-content: center;
    color:           ${TEXT_MUTED};
    text-decoration: none;
    transition:      background 0.2s, border-color 0.2s,
                     color 0.2s, transform 0.2s;
    flex-shrink:     0;
  }
  .fo-social:hover {
    background:   ${ACCENT};
    border-color: ${ACCENT};
    color:        #fff;
    transform:    translateY(-3px);
  }

  /* ── Newsletter input ────────────────────────────────────────────── */
  .fo-nl-wrap {
    display:      flex;
    align-items:  stretch;
    border:       1px solid ${BORDER_COL};
    border-radius:6px;
    overflow:     hidden;
    background:   rgba(255,255,255,0.08);
    transition:   border-color 0.2s;
  }
  .fo-nl-wrap:focus-within {
    border-color: ${ACCENT};
  }
  .fo-nl-input {
    flex:       1;
    background: transparent;
    border:     none;
    outline:    none;
    color:      #fff;
    font-size:  13px;
    padding:    0 14px;
    height:     44px;
    min-width:  0;
    font-family: inherit;
  }
  .fo-nl-input::placeholder { color: rgba(255,255,255,0.35); }
  .fo-nl-btn {
    height:         44px;
    padding:        0 18px;
    background:     ${ACCENT};
    border:         none;
    color:          #fff;
    font-size:      13px;
    font-weight:    600;
    cursor:         pointer;
    display:        flex;
    align-items:    center;
    gap:            7px;
    white-space:    nowrap;
    letter-spacing: 0.04em;
    transition:     background 0.18s;
    font-family:    inherit;
    flex-shrink:    0;
  }
  .fo-nl-btn:hover     { background: ${ACCENT_DARK}; }
  .fo-nl-btn:disabled  { opacity: 0.65; cursor: not-allowed; }

  /* ── Payment pill ────────────────────────────────────────────────── */
  .fo-pay-pill {
    border:         1px solid ${BORDER_COL};
    border-radius:  4px;
    padding:        4px 12px;
    font-size:      11.5px;
    font-weight:    500;
    color:          ${TEXT_MUTED};
    background:     rgba(255,255,255,0.06);
    transition:     background 0.18s, color 0.18s, border-color 0.18s;
    white-space:    nowrap;
  }
  .fo-pay-pill:hover {
    background:   ${ACCENT};
    color:        #fff;
    border-color: ${ACCENT};
  }

  @media (prefers-reduced-motion: reduce) {
    .fo-link, .fo-social, .fo-nl-btn, .fo-pay-pill { transition: none; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: NavColumn
// ─────────────────────────────────────────────────────────────────────────────

function NavColumn({ col }: { col: { heading: string; links: { name: string; href: string }[] } }) {
  return (
    <div>
      <span className="fo-heading">{col.heading}</span>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {col.links.map(({ name, href }) => (
          <li key={name}>
            <Link to={href} className="fo-link">{name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: Newsletter
// ─────────────────────────────────────────────────────────────────────────────

function Newsletter() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle'|'sending'|'done'>('idle');
  const [touched, setTouched] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setStatus('sending');
    setTimeout(() => { setStatus('done'); setEmail(''); }, 1000);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 12, lineHeight: 1.55 }}>
        Sign up for exclusive offers, original stories, events and more.
      </p>

      {status === 'done' ? (
        <div style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`, borderRadius: 6, padding: '11px 14px', color: ACCENT, fontSize: 13, fontWeight: 500 }}>
          ✓ Thanks! Check your inbox for updates.
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="fo-nl-wrap">
            <input
              type="email"
              className="fo-nl-input"
              placeholder="Enter your email"
              value={email}
              onChange={e => { setEmail(e.target.value); setTouched(false); }}
              aria-label="Email for newsletter"
            />
            <button type="submit" className="fo-nl-btn" disabled={status === 'sending'}>
              <LuSend size={13} />
              {status === 'sending' ? 'Sending…' : 'Subscribe'}
            </button>
          </div>
          {touched && !isValid && (
            <p style={{ fontSize: 11.5, color: '#FCD34D', marginTop: 7 }}>
              Please enter a valid email address.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FOOTER
// ─────────────────────────────────────────────────────────────────────────────

export default function FooterOne() {

  // Inject CSS once
  useEffect(() => {
    const ID = 'footer-one-styles';
    if (document.getElementById(ID)) return;
    const tag = document.createElement('style');
    tag.id          = ID;
    tag.textContent = FOOTER_CSS;
    document.head.appendChild(tag);
  }, []);

  return (
    <footer
      style={{
        position:   'relative',
        overflow:   'hidden',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* ── Background image layer ──────────────────────────────────────
          The wallpaper image renders at natural size + cover.
          An absolutely-positioned overlay div sits on top at
          OVERLAY_OPACITY to darken it so all white text is legible.  */}
      <div
        aria-hidden="true"
        style={{
          position:           'absolute',
          inset:              0,
          backgroundImage:    `url(${BG_IMAGE})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'repeat',
          zIndex:             0,
        }}
      />
      {/* Dark overlay — adjust OVERLAY_OPACITY constant above */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset:    0,
          background: `rgba(18, 14, 10, ${OVERLAY_OPACITY})`,
          zIndex:   1,
        }}
      />

      {/* ── All footer content sits above the overlay (z-index: 2) ──── */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ══════════════════════════════════════════════════════════════
            MAIN BODY
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ padding: 'clamp(48px,5vw,72px) 0 0' }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>

            {/*
              5-COLUMN GRID (desktop)
              ┌──────────────┬──────────────┬───────────────────┬──────────────┬──────────────┐
              │ Top          │ About Us     │  BRAND (centre)   │ Quick Links  │ Help         │
              │ Categories   │              │  logo+NL+contact  │              │              │
              └──────────────┴──────────────┴───────────────────┴──────────────┴──────────────┘
              Mobile: stacks to 2-col, brand column goes full width
            */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
              gap:                 'clamp(32px, 4vw, 48px)',
              alignItems:          'start',
            }}>

              {/* ── COLUMN 1: Top Categories ──────────────────────────── */}
              <NavColumn col={COL_CATEGORIES} />

              {/* ── COLUMN 2: About Us ────────────────────────────────── */}
              <NavColumn col={COL_ABOUT} />

              {/* ── COLUMN 3: Brand / Centre ──────────────────────────── */}
              <div>
                {/* Logo mark */}
                <div style={{ marginBottom: 20 }}>
                  <span style={{
                    fontSize:      32,
                    fontWeight:    700,
                    letterSpacing: '-0.5px',
                    color:         '#fff',
                    fontFamily:    'Georgia, serif',
                    lineHeight:    1,
                    display:       'block',
                  }}>
                    Infinity
                  </span>
                  <span style={{ fontSize: 11.5, color: TEXT_MUTED, letterSpacing: '0.08em', display: 'block', marginTop: 5 }}>
                    Home of thoughtful decor
                  </span>
                  {/* Gold accent bar under logo */}
                  <div style={{ width: 40, height: 2, background: ACCENT, borderRadius: 1, marginTop: 10 }} />
                </div>

                {/* Stay in Touch heading */}
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.1px' }}>
                  Stay In Touch
                </h3>

                {/* Newsletter */}
                <Newsletter />

                {/* Contact info */}
                <div style={{ marginBottom: 24 }}>
                  <span className="fo-heading">Contact us</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                    <a
                      href="mailto:info@Infinity.in"
                      className="fo-link"
                      style={{ display: 'flex', alignItems: 'center', gap: 9 }}
                    >
                      <LuMail size={14} style={{ color: ACCENT, flexShrink: 0 }} />
                      info@Infinity.in
                    </a>
                    <a
                      href="tel:+919903504754"
                      className="fo-link"
                      style={{ display: 'flex', alignItems: 'center', gap: 9 }}
                    >
                      <LuPhone size={14} style={{ color: ACCENT, flexShrink: 0 }} />
                      +91 99035 04754
                    </a>
                  </div>
                </div>

                {/* Social icons */}
                <div>
                  <span className="fo-heading">Follow Us</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {SOCIAL.map(({ Icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        className="fo-social"
                      >
                        <Icon size={13} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── COLUMN 4: Quick Links ─────────────────────────────── */}
              <NavColumn col={COL_QUICK} />

              {/* ── COLUMN 5: Help ────────────────────────────────────── */}
              <NavColumn col={COL_HELP} />

            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            BOTTOM BAR — payments + copyright
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ borderTop: `1px solid ${BORDER_COL}`, marginTop: 'clamp(40px,5vw,64px)' }}>
          <div style={{ maxWidth: 1720, margin: '0 auto', padding: 'clamp(20px,3vw,28px) clamp(20px,4vw,56px)' }}>

            {/* Payment methods row */}
            <div style={{
              display:        'flex',
              flexWrap:       'wrap',
              alignItems:     'center',
              justifyContent: 'space-between',
              gap:            '12px 20px',
              marginBottom:   20,
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11.5, color: TEXT_MUTED, fontWeight: 600, marginRight: 4, letterSpacing: '0.04em' }}>
                  WE ACCEPT
                </span>
                {PAYMENT_METHODS.map(pm => (
                  <span key={pm} className="fo-pay-pill">{pm}</span>
                ))}
              </div>

              {/* Secure badge */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                gap:            6,
                color:          TEXT_MUTED,
                fontSize:       12,
                border:         `1px solid ${BORDER_COL}`,
                padding:        '5px 12px',
                borderRadius:   30,
                background:     'rgba(255,255,255,0.04)',
              }}>
                <LuShield size={13} color={ACCENT} />
                <span>Secure Checkout</span>
              </div>
            </div>

            {/* Copyright + legal links */}
            <div style={{
              borderTop:      `1px solid ${BORDER_COL}`,
              paddingTop:     18,
              display:        'flex',
              flexWrap:       'wrap',
              alignItems:     'center',
              justifyContent: 'space-between',
              gap:            12,
            }}>
              <p style={{ fontSize: 12.5, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', margin: 0 }}>
                © Copyright {new Date().getFullYear()} Infinity. All rights reserved.
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Designed & Developed by <FaHeart size={9} style={{ color: ACCENT }} /> Invictus Web Solutions Pvt Ltd. 
                </span>
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
                {[
                  { name: 'Privacy Policy',  href: '/privacy'         },
                  { name: 'Terms of Use',    href: '/terms-and-conditions' },
                  { name: 'Shipping Policy', href: '/shipping-method'  },
                  { name: 'Returns',         href: '/returns-policy'   },
                ].map(({ name, href }) => (
                  <Link
                    key={name}
                    to={href}
                    style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: 'none', transition: 'color 0.18s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
                    onMouseLeave={e => (e.currentTarget.style.color = TEXT_MUTED)}
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
        {/* END BOTTOM BAR */}

      </div>
      {/* END z-index:2 content wrapper */}

    </footer>
  );
}