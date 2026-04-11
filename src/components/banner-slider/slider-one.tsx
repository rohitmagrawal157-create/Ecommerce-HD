// @ts-nocheck
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import summerIcon from '../../assets/img/shortcode/carousel/Summer.png';

const canvasImage1 = "https://imgs.search.brave.com/WEdU6KHpGXMeUDzMhfeJvg4NoCteBx72XHFrfk-uxxg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmlu/dHBvc3RlcnMuaW4v/cHVibGljL2Fzc2V0/cy9pbWFnZXMvZ2Fs/bGVyeS0xLndlYnA";
const canvasImage2 = "https://imgs.search.brave.com/UKSqaNioaNxdkHvzbYEgZ_55FW6s-EceZV01-dxOXus/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI0Lzgv/NDQ2NjEyMTQxL0RN/L0hDL1FXLzM4NjAx/NDE5L2NhbnZhc3Mt/cHJpbnRpbmctc2Vy/dmljZXMtNTAweDUw/MC5qcGc";
const canvasImage3 = "https://imgs.search.brave.com/se-nsSwzE5mh3RgF8f4hHbiHMS9RZMBqfs6KgSJiEAs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pay5p/bWFnZWtpdC5pby9w/aWNzaW4vaW1nL2Nv/bW1vbnMvY2FudmFz/LXByaW50cy9wcm9k/dWN0LXBpY3R1cmUv/dHI6dy0wLjcyL2Nh/bnZhcy13YWxsLWRp/c3BsYXkuanBn";

export default function SliderOne() {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      navigation
      pagination={{ clickable: true }}
      speed={1000}
      loop
      className="canvas-print-swiper w-full"
    >

      {/* ── SLIDE 1 — Brand gradient (Purple → Red → Orange) ── */}
      <SwiperSlide>
        <div className="relative w-full min-h-[620px] md:min-h-[680px] lg:min-h-[720px] overflow-hidden flex items-center"
          style={{ background: 'linear-gradient(135deg, #f3f1ff 0%, #fff1f3 50%, #fff7f0 100%)' }}>

          {/* Dot grid — tinted purple */}
          <div className="absolute inset-0 animate-slow-drift opacity-40"
            style={{ backgroundImage: 'radial-gradient(#5B4FBE22 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          {/* Colour wash */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #f3f1ff 0%, #fff1f3 55%, #fff7f0 100%)' }} />

          <div className="container mx-auto px-5 lg:px-12 py-10 md:py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 h-full">

              {/* LEFT TEXT */}
              <div className="lg:w-5/12 text-center lg:text-left">
                <div className="flex items-end justify-center lg:justify-start gap-3">
                  {/* Year — brand gradient text */}
                  <span className="font-black text-[72px] md:text-[92px] lg:text-[118px] leading-none tracking-[-4px]"
                    style={{ background: 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    2025
                  </span>
                  <img src={summerIcon} alt="Summer" className="w-[110px] md:w-[145px] lg:w-[185px] -mb-2" />
                </div>

                <h1 className="mt-4 text-4xl md:text-5xl lg:text-[52px] font-semibold text-gray-900 leading-[1.1]">
                  Premium Canvas Prints
                </h1>

                <p className="mt-6 text-[17px] md:text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
                  High-quality museum-grade canvas with vibrant fade-resistant inks.
                  Solid wood frames for a timeless look.
                </p>

                <div className="mt-9 flex flex-wrap gap-4 justify-center lg:justify-start">
                  {/* Primary CTA — brand gradient */}
                  <Link to="/shop/canvas"
                    className="relative text-white font-semibold px-9 py-4 rounded-2xl text-lg transition-all overflow-hidden group"
                    style={{ background: 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)' }}>
                    <span className="relative z-10">Shop Now</span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg,#4a3fad,#d02040,#e86210)' }} />
                  </Link>
                  <Link to="/custom-canvas"
                    className="border-2 text-gray-900 font-semibold px-9 py-4 rounded-2xl hover:text-white transition-all text-lg group relative overflow-hidden"
                    style={{ borderColor: '#5B4FBE' }}>
                    <span className="relative z-10 group-hover:text-white transition-colors">Custom Order</span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)' }} />
                  </Link>
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="lg:w-7/12 flex justify-center">
                <div className="relative group max-w-[580px] w-full">
                  <img src={canvasImage1} alt="Premium Canvas Wall Art"
                    className="w-full h-auto rounded-3xl shadow-2xl transition-transform duration-1000 group-hover:scale-[1.04]" />

                  {/* Price tag — brand gradient border accent */}
                  <div className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-2xl px-8 py-5 text-center z-20"
                    style={{ border: '2px solid transparent', backgroundClip: 'padding-box', boxShadow: '0 0 0 2px #5B4FBE33, 0 12px 40px rgba(91,79,190,0.18)' }}>
                    <div className="text-4xl font-bold"
                      style={{ background: 'linear-gradient(90deg,#5B4FBE,#E8314A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      $89
                    </div>
                    <div className="text-sm text-gray-400 line-through">$105</div>
                    <div className="text-xs font-semibold mt-1 tracking-wide"
                      style={{ background: 'linear-gradient(90deg,#E8314A,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      SAVE 15%
                    </div>
                  </div>

                  {/* Discount badge — brand gradient */}
                  <div className="absolute -bottom-6 -right-6 text-white font-bold w-24 h-24 flex flex-col items-center justify-center rounded-full shadow-2xl z-20"
                    style={{ background: 'linear-gradient(135deg,#5B4FBE,#E8314A,#F97316)' }}>
                    <span className="text-3xl">-15%</span>
                    <span className="text-xs tracking-[1px] mt-[-3px]">OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      {/* ── SLIDE 2 — CTA gradient (Blue → Cyan → Green) ── */}
      <SwiperSlide>
        <div className="relative w-full min-h-[620px] md:min-h-[680px] lg:min-h-[720px] overflow-hidden flex items-center"
          style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ecfeff 50%, #f0fdf4 100%)' }}>

          <div className="absolute inset-0 animate-slow-drift opacity-40"
            style={{ backgroundImage: 'radial-gradient(#2563EB22 1px, transparent 1px)', backgroundSize: '45px 45px' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ecfeff 55%, #f0fdf4 100%)' }} />

          <div className="container mx-auto px-5 lg:px-12 py-10 md:py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 h-full">

              <div className="lg:w-5/12 text-center lg:text-left">
                <div className="flex items-end justify-center lg:justify-start gap-3">
                  <span className="font-black text-[72px] md:text-[92px] lg:text-[118px] leading-none tracking-[-4px]"
                    style={{ background: 'linear-gradient(90deg,#2563EB,#06B6D4,#22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    2025
                  </span>
                  <img src={summerIcon} alt="Summer" className="w-[110px] md:w-[145px] lg:w-[185px] -mb-2" />
                </div>

                <h1 className="mt-4 text-4xl md:text-5xl lg:text-[52px] font-semibold text-gray-900 leading-[1.1]">
                  Custom Canvas Printing
                </h1>

                <p className="mt-6 text-[17px] md:text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
                  Upload your favorite photo or artwork. Premium printing on artist-grade canvas.
                </p>

                <div className="mt-9 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link to="/custom-canvas"
                    className="relative text-white font-semibold px-9 py-4 rounded-2xl text-lg transition-all overflow-hidden group"
                    style={{ background: 'linear-gradient(90deg,#2563EB,#06B6D4,#22C55E)' }}>
                    <span className="relative z-10">Start Your Order</span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg,#1d4ed8,#0891b2,#16a34a)' }} />
                  </Link>
                  <Link to="/gallery"
                    className="border-2 text-gray-900 font-semibold px-9 py-4 rounded-2xl transition-all text-lg group relative overflow-hidden"
                    style={{ borderColor: '#2563EB' }}>
                    <span className="relative z-10 group-hover:text-white transition-colors">View Gallery</span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg,#2563EB,#06B6D4,#22C55E)' }} />
                  </Link>
                </div>
              </div>

              <div className="lg:w-7/12 flex justify-center">
                <div className="relative group max-w-[580px] w-full">
                  <img src={canvasImage2} alt="Custom Canvas"
                    className="w-full h-auto rounded-3xl shadow-2xl transition-transform duration-1000 group-hover:scale-[1.04]" />

                  <div className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-2xl px-8 py-5 text-center z-20"
                    style={{ boxShadow: '0 0 0 2px #2563EB33, 0 12px 40px rgba(37,99,235,0.18)' }}>
                    <div className="text-4xl font-bold"
                      style={{ background: 'linear-gradient(90deg,#2563EB,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      $120
                    </div>
                    <div className="text-sm text-gray-400 line-through">$133</div>
                    <div className="text-xs font-semibold mt-1 tracking-wide"
                      style={{ background: 'linear-gradient(90deg,#06B6D4,#22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      SAVE 10%
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -right-6 text-white font-bold w-24 h-24 flex flex-col items-center justify-center rounded-full shadow-2xl z-20"
                    style={{ background: 'linear-gradient(135deg,#2563EB,#06B6D4,#22C55E)' }}>
                    <span className="text-3xl">-10%</span>
                    <span className="text-xs tracking-[1px] mt-[-3px]">OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      {/* ── SLIDE 3 — Hot Sale gradient (Red → Orange) ── */}
      <SwiperSlide>
        <div className="relative w-full min-h-[620px] md:min-h-[680px] lg:min-h-[720px] overflow-hidden flex items-center"
          style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fff7f0 50%, #fffbf0 100%)' }}>

          <div className="absolute inset-0 animate-slow-drift opacity-40"
            style={{ backgroundImage: 'radial-gradient(#E8314A22 1px, transparent 1px)', backgroundSize: '55px 55px' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fff7f0 55%, #fffbf0 100%)' }} />

          <div className="container mx-auto px-5 lg:px-12 py-10 md:py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 h-full">

              <div className="lg:w-5/12 text-center lg:text-left">
                <div className="flex items-end justify-center lg:justify-start gap-3">
                  <span className="font-black text-[72px] md:text-[92px] lg:text-[118px] leading-none tracking-[-4px]"
                    style={{ background: 'linear-gradient(90deg,#E8314A,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    2025
                  </span>
                  <img src={summerIcon} alt="Summer" className="w-[110px] md:w-[145px] lg:w-[185px] -mb-2" />
                </div>

                <h1 className="mt-4 text-4xl md:text-5xl lg:text-[52px] font-semibold text-gray-900 leading-[1.1]">
                  Professional Canvas Service
                </h1>

                <p className="mt-6 text-[17px] md:text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
                  Archival inks, kiln-dried pine frames, multiple finishes. Gallery quality guaranteed.
                </p>

                <div className="mt-9 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link to="/pro-canvas"
                    className="relative text-white font-semibold px-9 py-4 rounded-2xl text-lg transition-all overflow-hidden group"
                    style={{ background: 'linear-gradient(90deg,#E8314A,#F97316)' }}>
                    <span className="relative z-10">Explore Canvas</span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg,#d02040,#e86210)' }} />
                  </Link>
                  <Link to="/contact"
                    className="border-2 text-gray-900 font-semibold px-9 py-4 rounded-2xl transition-all text-lg group relative overflow-hidden"
                    style={{ borderColor: '#E8314A' }}>
                    <span className="relative z-10 group-hover:text-white transition-colors">Get Quote</span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg,#E8314A,#F97316)' }} />
                  </Link>
                </div>
              </div>

              <div className="lg:w-7/12 flex justify-center">
                <div className="relative group max-w-[580px] w-full">
                  <img src={canvasImage3} alt="Professional Canvas"
                    className="w-full h-auto rounded-3xl shadow-2xl transition-transform duration-1000 group-hover:scale-[1.04]" />

                  <div className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-2xl px-8 py-5 text-center z-20"
                    style={{ boxShadow: '0 0 0 2px #E8314A33, 0 12px 40px rgba(232,49,74,0.18)' }}>
                    <div className="text-4xl font-bold"
                      style={{ background: 'linear-gradient(90deg,#E8314A,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      $99
                    </div>
                    <div className="text-sm text-gray-400 line-through">$124</div>
                    <div className="text-xs font-semibold mt-1 tracking-wide"
                      style={{ background: 'linear-gradient(90deg,#F97316,#5B4FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      SAVE 20%
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -right-6 text-white font-bold w-24 h-24 flex flex-col items-center justify-center rounded-full shadow-2xl z-20"
                    style={{ background: 'linear-gradient(135deg,#E8314A,#F97316)' }}>
                    <span className="text-3xl">-20%</span>
                    <span className="text-xs tracking-[1px] mt-[-3px]">OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      <style>{`
        .canvas-print-swiper .swiper-button-prev,
        .canvas-print-swiper .swiper-button-next {
          color: #5B4FBE;
          background: white;
          width: 52px; height: 52px;
          border-radius: 50%;
          box-shadow: 0 6px 20px rgba(91,79,190,0.15);
        }
        .canvas-print-swiper .swiper-button-prev:hover,
        .canvas-print-swiper .swiper-button-next:hover {
          background: linear-gradient(90deg,#5B4FBE,#E8314A);
          color: white;
        }
        .canvas-print-swiper .swiper-button-prev::after,
        .canvas-print-swiper .swiper-button-next::after {
          font-size: 18px;
          font-weight: 800;
        }
        .canvas-print-swiper .swiper-pagination-bullet {
          background: #5B4FBE;
          opacity: 0.35;
          width: 8px; height: 8px;
        }
        .canvas-print-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: linear-gradient(90deg,#5B4FBE,#E8314A);
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
      `}</style>
    </Swiper>
  );
}