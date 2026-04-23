// @ts-nocheck
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import summerIcon from '../../assets/img/shortcode/carousel/Summer.png';

// ─── API base URL – adjust if needed ────────────────────────────────────────
const API_BASE = 'https://lightsteelblue-stinkbug-893971.hostingersite.com/Shopping-Cart/public';

// ─── Gradient configs (cycle through slides) ────────────────────────────────
const GRADIENTS = [
  {
    main:    'linear-gradient(135deg, #f3f1ff 0%, #fff1f3 50%, #fff7f0 100%)',
    accent:  'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)',
    accent2: 'linear-gradient(135deg,#5B4FBE,#E8314A,#F97316)',
    dot:     '#5B4FBE22',
  },
  {
    main:    'linear-gradient(135deg, #eff6ff 0%, #ecfeff 50%, #f0fdf4 100%)',
    accent:  'linear-gradient(90deg,#2563EB,#06B6D4,#22C55E)',
    accent2: 'linear-gradient(135deg,#2563EB,#06B6D4,#22C55E)',
    dot:     '#2563EB22',
  },
  {
    main:    'linear-gradient(135deg, #fff5f5 0%, #fff7f0 50%, #fffbf0 100%)',
    accent:  'linear-gradient(90deg,#E8314A,#F97316)',
    accent2: 'linear-gradient(135deg,#E8314A,#F97316)',
    dot:     '#E8314A22',
  },
];

function getGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}

// ─── Fetch sliders from API ──────────────────────────────────────────────────
async function fetchSliders() {
  const res = await fetch(`${API_BASE}/api/sliders`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.status) throw new Error('API returned status: false');

  // Normalise: ensure image_url is absolute
  return (json.data ?? []).map((s) => ({
    id:          s.id,
    title:       s.title       ?? '',
    subTitle:    s.sub_title   ?? '',
    description: s.description ?? '',
    imageUrl:    s.image_url   ?? '',
  }));
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function SliderOne() {
  const [slides, setSlides]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const swiperRef             = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchSliders();
        if (!cancelled) {
          setSlides(data);
          setError(null);
        }
      } catch (err) {
        console.error('[SliderOne] Failed to load sliders:', err);
        if (!cancelled) setError('Failed to load slider content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handlePrev = () => swiperRef.current?.swiper?.slidePrev();
  const handleNext = () => swiperRef.current?.swiper?.slideNext();

  // ── Shared wrapper style for loading / error states ──
  const placeholderWrap = {
    background: GRADIENTS[0].main,
  };

  return (
    <div className="relative">
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={false}
        pagination={{ clickable: true }}
        speed={1000}
        loop={slides.length > 1}
        className="canvas-print-swiper w-full"
      >
        {/* ── Loading state ── */}
        {loading && (
          <SwiperSlide>
            <div
              className="relative w-full min-h-[460px] md:min-h-[500px] lg:min-h-[520px] overflow-hidden flex items-center"
              style={placeholderWrap}
            >
              <div className="container mx-auto px-5 lg:px-12 py-8 relative z-10 flex items-center justify-center">
                <div className="animate-pulse space-y-4 text-center">
                  <div className="h-12 bg-gray-300 rounded w-64 mx-auto" />
                  <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
                </div>
              </div>
            </div>
          </SwiperSlide>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <SwiperSlide>
            <div
              className="relative w-full min-h-[460px] md:min-h-[500px] lg:min-h-[520px] overflow-hidden flex items-center"
              style={placeholderWrap}
            >
              <div className="container mx-auto px-5 lg:px-12 py-8 relative z-10 flex items-center justify-center">
                <p className="text-red-600 text-lg font-semibold">{error}</p>
              </div>
            </div>
          </SwiperSlide>
        )}

        {/* ── Slides ── */}
        {!loading && !error && slides.map((slide, index) => {
          const g = getGradient(index);
          return (
            <SwiperSlide key={slide.id ?? index}>
              <div
                className="relative w-full min-h-[460px] md:min-h-[500px] lg:min-h-[520px] overflow-hidden flex items-center"
                style={{ background: g.main }}
              >
                {/* Animated dot pattern */}
                <div
                  className="absolute inset-0 animate-slow-drift opacity-40"
                  style={{
                    backgroundImage: `radial-gradient(${g.dot} 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                  }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0" style={{ background: g.main }} />

                <div className="container mx-auto px-5 lg:px-12 py-8 md:py-12 relative z-10">
                  <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 h-full">

                    {/* ── LEFT TEXT ── */}
                    <div className="lg:w-5/12 text-center lg:text-left">

                      {/* Year + summer icon */}
                      <div className="flex items-end justify-center lg:justify-start gap-2">
                        <span
                          className="font-black text-[52px] md:text-[68px] lg:text-[80px] leading-none tracking-[-2px]"
                          style={{
                            background:              g.accent,
                            WebkitBackgroundClip:    'text',
                            WebkitTextFillColor:     'transparent',
                            backgroundClip:          'text',
                          }}
                        >
                          2026
                        </span>
                        <img
                          src={summerIcon}
                          alt="Summer"
                          className="w-[80px] md:w-[100px] lg:w-[120px] -mb-2"
                        />
                      </div>

                      {/* Title (from API) */}
                      <h1 className="mt-3 text-3xl md:text-4xl lg:text-[38px] font-semibold text-gray-900 leading-[1.1]">
                        {slide.title}
                      </h1>

                      {/* Sub-title (from API) */}
                      {slide.subTitle && (
                        <p
                          className="mt-2 text-base md:text-lg font-medium"
                          style={{
                            background:           g.accent,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor:  'transparent',
                            backgroundClip:       'text',
                          }}
                        >
                          {slide.subTitle}
                        </p>
                      )}

                      {/* Description (from API) */}
                      <p className="mt-4 text-[15px] md:text-base text-gray-600 max-w-md mx-auto lg:mx-0">
                        {slide.description}
                      </p>

                      {/* CTA button */}
                      <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
                        <Link
                          to="/shop"
                          className="relative text-white font-semibold px-6 py-3 rounded-xl text-base transition-all overflow-hidden group"
                          style={{ background: g.accent }}
                        >
                          <span className="relative z-10">Shop Now</span>
                          <span
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: g.accent2 }}
                          />
                        </Link>
                      </div>
                    </div>

                    {/* ── RIGHT IMAGE ── */}
                    <div className="lg:w-7/12 flex justify-center">
                      <div className="relative group max-w-[480px] w-full">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-auto rounded-2xl shadow-xl transition-transform duration-1000 group-hover:scale-[1.04] object-cover"
                          style={{ maxHeight: '420px' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/480x420?text=Slide+Image';
                          }}
                        />

                        {/* Decorative badge */}
                        <div
                          className="absolute -bottom-4 -right-4 text-white font-bold w-20 h-20 flex flex-col items-center justify-center rounded-full shadow-xl z-20"
                          style={{ background: g.accent2 }}
                        >
                          <span className="text-[11px] font-bold tracking-wide text-center leading-tight px-1">
                            NEW ARRIVALS
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* ── Custom Prev button ── */}
      <button
        onClick={handlePrev}
        className="custom-swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ── Custom Next button ── */}
      <button
        onClick={handleNext}
        className="custom-swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <style>{`
        .canvas-print-swiper .swiper-pagination-bullet {
          background: #5B4FBE;
          opacity: 0.35;
          width: 8px;
          height: 8px;
        }
        .canvas-print-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: linear-gradient(90deg, #5B4FBE, #E8314A);
          width: 24px;
          border-radius: 4px;
        }
        @keyframes slowDrift {
          0%   { background-position: 0 0; }
          100% { background-position: 80px 80px; }
        }
        .animate-slow-drift {
          animation: slowDrift 40s linear infinite;
        }
        .custom-swiper-prev:hover,
        .custom-swiper-next:hover {
          background: linear-gradient(135deg, #5B4FBE, #E8314A, #F97316) !important;
        }
        .custom-swiper-prev:hover svg,
        .custom-swiper-next:hover svg {
          color: white;
        }
      `}</style>
    </div>
  );
}