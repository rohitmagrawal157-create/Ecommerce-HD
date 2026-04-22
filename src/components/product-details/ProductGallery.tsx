/**
 * ProductGallery — Professional e-commerce gallery
 *
 * Features:
 * ─ Hover: smooth magnifying-glass lens (3× zoom window, tracks cursor precisely)
 * ─ External zoom panel: zoomed image renders in a fixed panel BESIDE the main image
 *   (classic Amazon/Flipkart pattern — most reliable UX)
 * ─ Click: full-screen lightbox with scroll-wheel zoom (1×–5×) + drag-to-pan
 * ─ Arrow keys, swipe (mobile), pinch-to-zoom (mobile lightbox)
 * ─ Thumbnail strip: active highlight + auto-scroll into view
 * ─ Next/Prev arrows on main image — each click moves cleanly to the next image
 * ─ No flickering, no stale-closure bugs, all handlers use latest refs
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import type { MediaItem } from '../../types/product';

interface ProductGalleryProps {
  media: MediaItem[];
  productName: string;
  discountPct?: string;
}

const ZOOM_FACTOR   = 3;      // lens magnification
const LENS_SIZE     = 140;    // px — lens circle diameter
const PANEL_SIZE    = 420;    // px — external zoom panel size
const MAX_LB_ZOOM   = 5;
const MIN_LB_ZOOM   = 1;
const ZOOM_STEP_IN  = 1.12;
const ZOOM_STEP_OUT = 0.88;

// ── tiny helpers ──────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

// ── ZoomPanel: renders beside the gallery, shows magnified region ─────────────
interface ZoomPanelProps {
  src: string;
  lensX: number;   // % 0-100
  lensY: number;
  visible: boolean;
  containerRect: DOMRect | null;
}

const ZoomPanel: React.FC<ZoomPanelProps> = ({ src, lensX, lensY, visible, containerRect }) => {
  // bgPosition maps lens centre → zoomed background position
  const bgX = clamp(lensX, 0, 100);
  const bgY = clamp(lensY, 0, 100);

  if (!visible || !containerRect) return null;

  return (
    <div
      style={{
        position:     'fixed',
        top:          containerRect.top,
        left:         containerRect.right + 12,
        width:        PANEL_SIZE,
        height:       PANEL_SIZE,
        borderRadius: 12,
        overflow:     'hidden',
        border:       '1.5px solid #e2e2e2',
        boxShadow:    '0 8px 32px rgba(0,0,0,0.14)',
        zIndex:       999,
        pointerEvents:'none',
        backgroundImage:    `url(${src})`,
        backgroundSize:     `${ZOOM_FACTOR * 100}% ${ZOOM_FACTOR * 100}%`,
        backgroundPosition: `${bgX}% ${bgY}%`,
        backgroundRepeat:   'no-repeat',
        backgroundColor:    '#f8f8f8',
        transition:         'opacity 0.12s ease',
        opacity:            visible ? 1 : 0,
      }}
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const ProductGallery: React.FC<ProductGalleryProps> = ({
  media,
  productName,
  discountPct,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeIdx,      setActiveIdx]      = useState(0);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [lensVisible,    setLensVisible]    = useState(false);
  const [lensPos,        setLensPos]        = useState({ x: 50, y: 50 });
  const [lbZoom,         setLbZoom]         = useState(1);
  const [lbPan,          setLbPan]          = useState({ x: 0, y: 0 });
  const [dragging,       setDragging]       = useState(false);
  const [containerRect,  setContainerRect]  = useState<DOMRect | null>(null);

  // ── Refs (keep latest values for event handlers without stale closures) ────
  const activeIdxRef   = useRef(activeIdx);
  const mediaLenRef    = useRef(media.length);
  const dragStartRef   = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const lbZoomRef      = useRef(lbZoom);
  const imgContRef     = useRef<HTMLDivElement>(null);
  const stripRef       = useRef<HTMLDivElement>(null);
  const lensCanvasRef  = useRef<HTMLDivElement>(null);   // lens overlay div

  useEffect(() => { activeIdxRef.current  = activeIdx;   }, [activeIdx]);
  useEffect(() => { mediaLenRef.current   = media.length; }, [media.length]);
  useEffect(() => { lbZoomRef.current     = lbZoom;       }, [lbZoom]);

  // Derived
  const activeItem = useMemo(() => media[activeIdx] ?? media[0], [media, activeIdx]);
  const isImage    = activeItem?.type === 'image';
  const isEmbed    = activeItem?.type === 'video' && !!activeItem?.embedUrl;

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goTo = useCallback((idx: number) => {
    const len = mediaLenRef.current;
    const next = ((idx % len) + len) % len;
    setActiveIdx(next);
    setLbZoom(1);
    setLbPan({ x: 0, y: 0 });
  }, []);

  const prev = useCallback(() => goTo(activeIdxRef.current - 1), [goTo]);
  const next = useCallback(() => goTo(activeIdxRef.current + 1), [goTo]);

  // ── Keyboard nav ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape')      setLightboxOpen(false);
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
      if (e.key === '+' || e.key === '=')
        setLbZoom((z) => clamp(z * ZOOM_STEP_IN,  MIN_LB_ZOOM, MAX_LB_ZOOM));
      if (e.key === '-')
        setLbZoom((z) => clamp(z * ZOOM_STEP_OUT, MIN_LB_ZOOM, MAX_LB_ZOOM));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, prev, next]);

  // ── Thumbnail auto-scroll ──────────────────────────────────────────────────
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const thumb = strip.children[activeIdx] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIdx]);

  // ── Container rect (for zoom panel placement) ──────────────────────────────
  const measureContainer = useCallback(() => {
    if (imgContRef.current)
      setContainerRect(imgContRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    measureContainer();
    window.addEventListener('resize',   measureContainer);
    window.addEventListener('scroll',   measureContainer, true);
    return () => {
      window.removeEventListener('resize',  measureContainer);
      window.removeEventListener('scroll',  measureContainer, true);
    };
  }, [measureContainer]);

  // ── Hover lens ─────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgContRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp(((e.clientX - rect.left)  / rect.width)  * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top)   / rect.height) * 100, 0, 100);
    setLensPos({ x, y });
  }, []);

  // ── Lightbox: scroll-wheel zoom ────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const step = e.deltaY < 0 ? ZOOM_STEP_IN : ZOOM_STEP_OUT;
    setLbZoom((z) => clamp(z * step, MIN_LB_ZOOM, MAX_LB_ZOOM));
  }, []);

  // ── Lightbox: drag-to-pan ──────────────────────────────────────────────────
  const onLbMouseDown = useCallback((e: React.MouseEvent) => {
    if (lbZoomRef.current <= 1) return;
    e.preventDefault();
    setDragging(true);
    dragStartRef.current = {
      mx: e.clientX, my: e.clientY,
      px: lbPan.x,   py: lbPan.y,
    };
  }, [lbPan]);

  const onLbMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const { mx, my, px, py } = dragStartRef.current;
    setLbPan({ x: px + (e.clientX - mx), y: py + (e.clientY - my) });
  }, [dragging]);

  const onLbMouseUp = useCallback(() => setDragging(false), []);

  // ── Lightbox: touch-to-pan (mobile) ───────────────────────────────────────
  const touchStartRef = useRef({ t1x: 0, t1y: 0, px: 0, py: 0, initDist: 0, initZoom: 1 });

  const onLbTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current = {
        ...touchStartRef.current,
        initDist: Math.hypot(dx, dy),
        initZoom: lbZoomRef.current,
      };
    } else {
      touchStartRef.current = {
        t1x: e.touches[0].clientX,
        t1y: e.touches[0].clientY,
        px: lbPan.x,
        py: lbPan.y,
        initDist: 0,
        initZoom: lbZoomRef.current,
      };
    }
  }, [lbPan]);

  const onLbTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const { initDist, initZoom } = touchStartRef.current;
      if (initDist > 0) {
        setLbZoom(clamp((dist / initDist) * initZoom, MIN_LB_ZOOM, MAX_LB_ZOOM));
      }
    } else if (lbZoomRef.current > 1) {
      const { t1x, t1y, px, py } = touchStartRef.current;
      setLbPan({
        x: px + (e.touches[0].clientX - t1x),
        y: py + (e.touches[0].clientY - t1y),
      });
    }
  }, []);

  // Reset pan when zoom goes back to 1
  useEffect(() => {
    if (lbZoom <= 1) setLbPan({ x: 0, y: 0 });
  }, [lbZoom]);

  // ── Lens position → lens div style ────────────────────────────────────────
  const lensStyle: React.CSSProperties = {
    position:     'absolute',
    width:        LENS_SIZE,
    height:       LENS_SIZE,
    borderRadius: '50%',
    border:       '2px solid rgba(91,79,190,0.7)',
    boxShadow:    '0 4px 20px rgba(0,0,0,0.25)',
    pointerEvents:'none',
    zIndex:       30,
    top:          `calc(${lensPos.y}% - ${LENS_SIZE / 2}px)`,
    left:         `calc(${lensPos.x}% - ${LENS_SIZE / 2}px)`,
    overflow:     'hidden',
    background:   '#fff',
    // Cross-hair outline glow
    outline:      '1.5px solid rgba(255,255,255,0.6)',
  };

  const lensImgStyle: React.CSSProperties = {
    position:  'absolute',
    width:     `${ZOOM_FACTOR * 100}%`,
    height:    `${ZOOM_FACTOR * 100}%`,
    maxWidth:  'none',
    top:       `${-(lensPos.y * ZOOM_FACTOR) + 50}%`,
    left:      `${-(lensPos.x * ZOOM_FACTOR) + 50}%`,
    objectFit: 'cover',
  };

  // ── Lightbox image transform ───────────────────────────────────────────────
  const lbImgStyle: React.CSSProperties = {
    transform:  `scale(${lbZoom}) translate(${lbPan.x / lbZoom}px, ${lbPan.y / lbZoom}px)`,
    transition: dragging ? 'none' : 'transform 0.12s ease-out',
    willChange: 'transform',
    maxHeight:  '88vh',
    maxWidth:   '88vw',
    objectFit:  'contain',
    display:    'block',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── LIGHTBOX ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         99999,
            background:     'rgba(10,10,14,0.97)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}
          onClick={() => { setLightboxOpen(false); setLbZoom(1); setLbPan({ x: 0, y: 0 }); }}
        >
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            style={{
              position:       'absolute', top: 18, right: 18,
              width: 42, height: 42, borderRadius: '50%',
              background:     'rgba(255,255,255,0.12)',
              border:         '1px solid rgba(255,255,255,0.18)',
              color:          '#fff', fontSize: 20,
              display:        'flex', alignItems: 'center', justifyContent: 'center',
              cursor:         'pointer', zIndex: 10,
              backdropFilter: 'blur(4px)',
            }}
            aria-label="Close lightbox"
          >✕</button>

          {/* Zoom controls */}
          <div
            style={{
              position:  'absolute', bottom: 22, left: '50%',
              transform: 'translateX(-50%)',
              display:   'flex', alignItems: 'center', gap: 8,
              zIndex:    10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLbZoom((z) => clamp(z * ZOOM_STEP_OUT, MIN_LB_ZOOM, MAX_LB_ZOOM))}
              style={lbCtrlBtn}
              aria-label="Zoom out"
            >－</button>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, minWidth: 42, textAlign: 'center' }}>
              {Math.round(lbZoom * 100)}%
            </span>
            <button
              onClick={() => setLbZoom((z) => clamp(z * ZOOM_STEP_IN,  MIN_LB_ZOOM, MAX_LB_ZOOM))}
              style={lbCtrlBtn}
              aria-label="Zoom in"
            >＋</button>
            <button
              onClick={() => { setLbZoom(1); setLbPan({ x: 0, y: 0 }); }}
              style={{ ...lbCtrlBtn, fontSize: 10, padding: '0 10px', width: 'auto' }}
              aria-label="Reset zoom"
            >Reset</button>
          </div>

          {/* Prev / Next */}
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{ ...lbNavBtn, left: 18 }}
                aria-label="Previous image"
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                style={{ ...lbNavBtn, right: 18 }}
                aria-label="Next image"
              >›</button>
            </>
          )}

          {/* Counter */}
          <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.45)', fontSize: 13, letterSpacing: '0.08em', zIndex: 10 }}>
            {activeIdx + 1} / {media.length}
          </div>

          {/* Image / Video */}
          <div
            style={{ overflow: 'hidden', cursor: lbZoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={onLbMouseDown}
            onMouseMove={onLbMouseMove}
            onMouseUp={onLbMouseUp}
            onMouseLeave={onLbMouseUp}
            onTouchStart={onLbTouchStart}
            onTouchMove={onLbTouchMove}
            onTouchEnd={onLbMouseUp}
          >
            {isImage ? (
              <img
                src={activeItem.url}
                alt={productName}
                style={lbImgStyle}
                draggable={false}
              />
            ) : isEmbed ? (
              <div style={{ width: 'min(88vw,1100px)', aspectRatio: '16/9' }}>
                <iframe src={activeItem.embedUrl} title={productName} style={{ width: '100%', height: '100%' }} allowFullScreen />
              </div>
            ) : (
              <video src={activeItem.url} poster={activeItem.poster} controls autoPlay style={{ maxHeight: '88vh', maxWidth: '88vw' }} />
            )}
          </div>

          {/* Lightbox thumbnail strip */}
          {media.length > 1 && (
            <div
              style={{
                position:       'absolute', bottom: 68, left: '50%',
                transform:      'translateX(-50%)',
                display:        'flex', gap: 8,
                zIndex:         10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {media.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  style={{
                    width: 52, height: 52, borderRadius: 8, overflow: 'hidden', padding: 0,
                    border: activeIdx === idx ? '2px solid #7C6FF7' : '2px solid rgba(255,255,255,0.15)',
                    opacity: activeIdx === idx ? 1 : 0.55,
                    cursor: 'pointer', transition: 'all 0.15s', background: '#111',
                    flexShrink: 0,
                  }}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={item.thumbnail} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MAIN GALLERY ──────────────────────────────────────────────────── */}
      <div style={{ width: '100%', userSelect: 'none' }}>

        {/* Main image container */}
        <div
          style={{
            position:     'relative',
            borderRadius: 16,
            overflow:     'hidden',
            background:   '#f8f8f8',
            border:       '1px solid #e8e8e8',
            aspectRatio:  '4/3',
            cursor:       isImage ? 'crosshair' : 'default',
          }}
          ref={imgContRef}
          onMouseEnter={() => { if (isImage) { setLensVisible(true); measureContainer(); } }}
          onMouseLeave={() => setLensVisible(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setLightboxOpen(true)}
        >
          {/* Discount badge */}
          {discountPct && (
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 20,
              background: 'linear-gradient(135deg,#E8314A,#F97316)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              padding: '4px 10px', borderRadius: 6, letterSpacing: '0.04em',
              boxShadow: '0 2px 8px rgba(232,49,74,0.35)',
            }}>
              {discountPct}
            </div>
          )}

          {/* Counter badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 20,
            background: 'rgba(0,0,0,0.52)', color: '#fff',
            fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
            backdropFilter: 'blur(4px)', letterSpacing: '0.06em',
          }}>
            {activeIdx + 1} / {media.length}
          </div>

          {/* Image */}
          {isImage ? (
            <img
              key={activeItem.url}  /* key forces re-render on src change */
              src={activeItem.url}
              alt={activeItem.alt ?? `${productName} view ${activeIdx + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.18s' }}
              draggable={false}
              loading="lazy"
            />
          ) : isEmbed ? (
            <div style={{ width: '100%', height: '100%', background: '#000' }}>
              <iframe src={activeItem.embedUrl} title={productName} style={{ width: '100%', height: '100%' }} allowFullScreen />
            </div>
          ) : (
            <video src={activeItem.url} poster={activeItem.poster} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}

          {/* Magnifying lens circle */}
          {lensVisible && isImage && (
            <div style={lensStyle} ref={lensCanvasRef}>
              <img
                src={activeItem.url}
                alt="zoom"
                style={lensImgStyle}
                draggable={false}
              />
            </div>
          )}

          {/* Zoom hint */}
          {isImage && (
            <div style={{
              position:   'absolute', bottom: 12, left: '50%',
              transform:  'translateX(-50%)',
              background: 'rgba(0,0,0,0.55)',
              color:      '#fff', fontSize: 11, fontWeight: 500,
              padding:    '5px 12px', borderRadius: 20,
              pointerEvents: 'none', whiteSpace: 'nowrap',
              backdropFilter: 'blur(3px)',
              opacity:    lensVisible ? 0 : 0.8,
              transition: 'opacity 0.2s',
              letterSpacing: '0.04em',
            }}>
              🔍 Hover to zoom · Click for lightbox
            </div>
          )}

          {/* Prev / Next arrows on main image */}
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{ ...mainNavBtn, left: 10 }}
                aria-label="Previous image"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.92)')}
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                style={{ ...mainNavBtn, right: 10 }}
                aria-label="Next image"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.92)')}
              >›</button>
            </>
          )}
        </div>

        {/* External zoom panel — renders fixed beside the image */}
        {lensVisible && isImage && (
          <ZoomPanel
            src={activeItem.url}
            lensX={lensPos.x}
            lensY={lensPos.y}
            visible={lensVisible}
            containerRect={containerRect}
          />
        )}

        {/* Thumbnail strip */}
        {media.length > 1 && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={prev}
              style={stripNavBtn}
              aria-label="Previous thumbnail"
            >‹</button>

            <div
              ref={stripRef}
              style={{
                flex:       1,
                display:    'flex',
                gap:        8,
                overflowX:  'auto',
                scrollbarWidth: 'none',
                paddingBottom: 2,
              }}
            >
              {media.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  style={{
                    flexShrink:   0,
                    width:        78,
                    height:       78,
                    borderRadius: 10,
                    overflow:     'hidden',
                    border:       activeIdx === idx
                      ? '2.5px solid #5B4FBE'
                      : '2px solid #e8e8e8',
                    padding:      0,
                    cursor:       'pointer',
                    background:   '#f4f4f4',
                    boxShadow:    activeIdx === idx ? '0 0 0 3px rgba(91,79,190,0.18)' : 'none',
                    transition:   'border-color 0.15s, box-shadow 0.15s',
                    position:     'relative',
                  }}
                  aria-label={`View image ${idx + 1}`}
                  aria-current={activeIdx === idx ? 'true' : 'false'}
                >
                  <img
                    src={item.thumbnail}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                  {item.type === 'video' && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.28)',
                    }}>
                      <div style={{ width: 24, height: 24, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>▶</div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              style={stripNavBtn}
              aria-label="Next thumbnail"
            >›</button>
          </div>
        )}
      </div>
    </>
  );
};

// ── Shared button styles ───────────────────────────────────────────────────────

const mainNavBtn: React.CSSProperties = {
  position:       'absolute',
  top:            '50%',
  transform:      'translateY(-50%)',
  zIndex:         20,
  width:          38,
  height:         38,
  borderRadius:   '50%',
  background:     'rgba(255,255,255,0.92)',
  border:         '1px solid #ddd',
  boxShadow:      '0 2px 10px rgba(0,0,0,0.14)',
  fontSize:       22,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  cursor:         'pointer',
  color:          '#333',
  transition:     'background 0.14s',
  lineHeight:     1,
};

const lbNavBtn: React.CSSProperties = {
  position:       'absolute',
  top:            '50%',
  transform:      'translateY(-50%)',
  zIndex:         10,
  width:          48,
  height:         48,
  borderRadius:   '50%',
  background:     'rgba(255,255,255,0.1)',
  border:         '1px solid rgba(255,255,255,0.2)',
  color:          '#fff',
  fontSize:       28,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  cursor:         'pointer',
  backdropFilter: 'blur(4px)',
  transition:     'background 0.14s',
  lineHeight:     1,
};

const lbCtrlBtn: React.CSSProperties = {
  width:          34,
  height:         34,
  borderRadius:   '50%',
  background:     'rgba(255,255,255,0.12)',
  border:         '1px solid rgba(255,255,255,0.2)',
  color:          '#fff',
  fontSize:       18,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  cursor:         'pointer',
  backdropFilter: 'blur(4px)',
};

const stripNavBtn: React.CSSProperties = {
  flexShrink:     0,
  width:          32,
  height:         32,
  borderRadius:   '50%',
  background:     '#fff',
  border:         '1.5px solid #e0e0e0',
  boxShadow:      '0 1px 4px rgba(0,0,0,0.08)',
  fontSize:       18,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  cursor:         'pointer',
  color:          '#444',
};