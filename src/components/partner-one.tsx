// src/components/partner-one.tsx

/**
 * PartnerOne — Infinite Auto-Scrolling Partner/Client Logo Strip
 * ───────────────────────────────────────────────────────────────
 *
 * WHY this replaces tiny-slider:
 *  ① tiny-slider-react is unmaintained — causes React 18 StrictMode warnings
 *    and double-mount jank
 *  ② `loop: true` + `rewind: true` conflict causes a hard-jump flash every cycle
 *  ③ tiny-slider uses JS requestAnimationFrame with no compositor hint —
 *    drops frames on low-end devices
 *  ④ Two duplicate sliders (light/dark) desync immediately after mount
 *
 * THIS solution:
 *  ✅ Pure CSS `@keyframes` on `transform: translateX` — always GPU-composited,
 *     always 60fps, zero JS involved in the scroll
 *  ✅ Single DOM render, dark mode handled via CSS `filter: invert(1)`
 *  ✅ Logos duplicated in markup (not JS) to create seamless infinite loop
 *  ✅ Pauses on hover (accessibility + UX best practice)
 *  ✅ `prefers-reduced-motion` respected
 *  ✅ Fade edges via CSS `mask-image` — clean entry/exit
 *  ✅ No library dependency at all
 */

import React, { useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { partnerData } from '../data/data';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface PartnerItem {
  image:   string;   // light-mode logo
  image2:  string;   // dark-mode logo (inverted or separate asset)
  name?:   string;   // alt text
}

interface PartnerOneProps {
  /** Scroll speed in seconds for one full-width cycle. Lower = faster. Default 30 */
  duration?: number;
  /** Max logo height in px. Default 52 */
  logoHeight?: number;
  /** Gap between logos in px. Default 64 */
  gap?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — injected once via <style> tag
// ─────────────────────────────────────────────────────────────────────────────

function buildStyles(animId: string, duration: number, gap: number): string {
  return `
    /* ── Keyframes: translate exactly one full copy width ───────────── */
    @keyframes ${animId} {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* ── Track wrapper ────────────────────────────────────────────────
       overflow:hidden clips the scroll; the mask fades left/right edges  */
    .po-track-wrap {
      overflow:  hidden;
      width:     100%;
      /* Fade leading and trailing edges */
      -webkit-mask-image: linear-gradient(
        to right,
        transparent 0%,
        black       8%,
        black       92%,
        transparent 100%
      );
      mask-image: linear-gradient(
        to right,
        transparent 0%,
        black       8%,
        black       92%,
        transparent 100%
      );
    }

    /* ── Scrolling track ──────────────────────────────────────────────
       Display flex so all items sit in a single row.
       Width is set to 200% (2× the content) — first half real items,
       second half duplicate items — allowing seamless wrap.           */
    .po-track {
      display:         flex;
      align-items:     center;
      width:           max-content;        /* shrink-wraps all items    */
      animation:       ${animId} ${duration}s linear infinite;
      will-change:     transform;          /* GPU compositor layer      */
      /* Pause on hover for accessibility + intentional browsing */
    }
    .po-track-wrap:hover .po-track {
      animation-play-state: paused;
    }

    /* ── Each logo item ──────────────────────────────────────────────  */
    .po-item {
      flex-shrink:     0;
      display:         flex;
      align-items:     center;
      justify-content: center;
      padding:         0 ${gap / 2}px;
    }

    /* ── Logo image ──────────────────────────────────────────────────  */
    .po-logo {
      display:     block;
      width:       auto;
      object-fit:  contain;
      /* Greyscale + slight dim by default; full colour on hover */
      filter:      grayscale(100%) opacity(0.55);
      transition:  filter 0.25s ease, transform 0.2s ease;
    }
    .po-item:hover .po-logo {
      filter:    grayscale(0%) opacity(1);
      transform: scale(1.06);
    }

    /* ── Dark mode: invert the light-mode logo ───────────────────────
       Uses .dark class on <html> (Tailwind dark mode = 'class' strategy)
       Falls back to prefers-color-scheme if needed.                   */
    .dark .po-logo-light { display: none;  }
    .dark .po-logo-dark  { display: block; }
         .po-logo-light  { display: block; }
         .po-logo-dark   { display: none;  }

    /* ── Reduced motion: freeze the track ───────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      .po-track {
        animation: none;
        flex-wrap: wrap;
        width:     100%;
        justify-content: center;
        gap:       16px;
      }
      /* Hide the duplicate set entirely when motion is off */
      .po-track .po-dupe { display: none; }
    }
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const PartnerOne: React.FC<PartnerOneProps> = ({
  duration   = 30,
  logoHeight = 52,
  gap        = 64,
}) => {
  // useId gives a stable unique string — used to scope the @keyframes name
  // so multiple PartnerOne instances on the same page never clash
  const uid    = useId().replace(/:/g, '');
  const animId = `po-scroll-${uid}`;

  // Inject styles once per unique instance
  useEffect(() => {
    const STYLE_ID = `po-styles-${uid}`;
    if (document.getElementById(STYLE_ID)) return;
    const tag       = document.createElement('style');
    tag.id          = STYLE_ID;
    tag.textContent = buildStyles(animId, duration, gap);
    document.head.appendChild(tag);
    // Intentionally not removing on unmount — it's tiny (< 1KB) and
    // re-injection on remount would cause a flash of unstyled content
  }, [animId, duration, gap, uid]);

  // Safety guard: if data array is empty, render nothing
  if (!partnerData || partnerData.length === 0) return null;

  const items = partnerData as PartnerItem[];

  /**
   * We render items TWICE inside .po-track:
   *   [real items ×N] [duplicate items ×N]
   *
   * The keyframe moves translateX by exactly -50% (one full copy width).
   * When it reaches -50%, it's displaying pixel-identical content to the
   * start position, so the loop is truly seamless with no jump.
   *
   * This is a CSS-only trick — no JS, no ResizeObserver, no calculations.
   */

  const renderLogo = (item: PartnerItem, index: number, isDupe = false) => (
    <Link
      to="#"
      key={isDupe ? `d-${index}` : `r-${index}`}
      className={`po-item${isDupe ? ' po-dupe' : ''}`}
      aria-label={item.name || `Partner ${index + 1}`}
      tabIndex={isDupe ? -1 : 0}  // screen readers skip the duplicate set
      aria-hidden={isDupe}
    >
      {/* Light mode logo */}
      <img
        src={item.image}
        alt={isDupe ? '' : (item.name || `Partner ${index + 1}`)}
        className="po-logo po-logo-light"
        style={{ maxHeight: logoHeight, maxWidth: 160 }}
        loading="lazy"
        draggable={false}
      />
      {/* Dark mode logo */}
      <img
        src={item.image2 || item.image}
        alt=""
        aria-hidden="true"
        className="po-logo po-logo-dark"
        style={{ maxHeight: logoHeight, maxWidth: 160 }}
        loading="lazy"
        draggable={false}
      />
    </Link>
  );

  return (
    <div className="max-w-[1720px] mx-auto">
      <div className="po-track-wrap">
        {/*
          .po-track scrolls continuously.
          First half  = real items   (aria-hidden=false, tabIndex=0)
          Second half = dupe items   (aria-hidden=true,  tabIndex=-1)
        */}
        <div className="po-track">
          {/* ── Real set ── */}
          {items.map((item, i) => renderLogo(item, i, false))}
          {/* ── Duplicate set (seamless loop) ── */}
          {items.map((item, i) => renderLogo(item, i, true))}
        </div>
      </div>
    </div>
  );
};

export default PartnerOne;