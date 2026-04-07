// @ts-nocheck
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Canvas print images (external)
const canvasImage1 = "https://imgs.search.brave.com/WEdU6KHpGXMeUDzMhfeJvg4NoCteBx72XHFrfk-uxxg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmlu/dHBvc3RlcnMuaW4v/cHVibGljL2Fzc2V0/cy9pbWFnZXMvZ2Fs/bGVyeS0xLndlYnA";
const canvasImage2 = "https://imgs.search.brave.com/UKSqaNioaNxdkHvzbYEgZ_55FW6s-EceZV01-dxOXus/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI0Lzgv/NDQ2NjEyMTQxL0RN/L0hDL1FXLzM4NjAx/NDE5L2NhbnZhc3Mt/cHJpbnRpbmctc2Vy/dmljZXMtNTAweDUw/MC5qcGc";
const canvasImage3 = "https://imgs.search.brave.com/se-nsSwzE5mh3RgF8f4hHbiHMS9RZMBqfs6KgSJiEAs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pay5p/bWFnZWtpdC5pby9w/aWNzaW4vaW1nL2Nv/bW1vbnMvY2FudmFz/LXByaW50cy9wcm9k/dWN0LXBpY3R1cmUv/dHI6dy0wLjcyL2Nh/bnZhcy13YWxsLWRp/c3BsYXkuanBn";

// Summer icon (local asset – replace with your path or remove)
import summerIcon from '../../assets/img/shortcode/carousel/Summer.png';

export default function SliderOne() {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      autoplay={{ delay: 4500, disableOnInteraction: false }}
      navigation
      pagination={{ clickable: true }}
      speed={800}
      loop
      className="canvas-print-swiper w-full"
    >
      {/* Slide 1 – Canvas Wall Art */}
      <SwiperSlide>
        <div className="relative w-full min-h-[650px] md:min-h-[750px] flex items-center bg-gradient-to-br from-[#F8F9FA] to-[#F0F2F5] dark:from-navy dark:to-navy-mid overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 py-16 md:py-20">
            <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
              {/* LEFT CONTENT */}
              <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-navy-light rounded-full px-4 py-1.5 mb-6 shadow-sm">
                  <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-navy dark:text-white/80 tracking-wide">Canvas Collection 2025</span>
                </div>
                <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-black text-navy dark:text-white leading-tight">
                  Premium Canvas Prints
                </h1>
                <p className="text-gray-700  text-lg mt-4 max-w-lg mx-auto lg:mx-0">
                  High‑quality canvas prints with vibrant, fade‑resistant inks. Museum‑grade stretching and solid wood frames. Perfect for home or office.
                </p>
                <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                  <Link to="/shop/canvas" className="bg-gold hover:bg-gold-dark text-navy font-bold px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
                    Shop Now
                  </Link>
                  <Link to="/custom-canvas" className="border-2 border-navy dark:border-white/30 text-navy dark:text-white font-semibold px-8 py-3 rounded-full hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy transition-all">
                    Custom Order
                  </Link>
                </div>
              </div>

              {/* RIGHT IMAGE (larger) */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative max-w-lg lg:max-w-2xl group">
                  <img
                    src={canvasImage1}
                    alt="Canvas print wall art"
                    className="w-full h-auto object-contain rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 border-8 border-white/20 rounded-2xl pointer-events-none" />
                </div>
              </div>
            </div>

            {/* FLOATING PRICE TAG (upper right, clean) */}
            <div className="absolute top-10 right-10 z-20 hidden lg:block">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-xl text-center border border-gold/30">
                <div className="text-3xl font-black text-gold">$89</div>
                <div className="text-sm text-gray-500 line-through">$105</div>
                <div className="text-xs font-semibold text-green-600 mt-1">Save 15%</div>
              </div>
            </div>
            {/* DISCOUNT BADGE (lower left) */}
            <div className="absolute bottom-10 left-10 z-20 hidden lg:block">
              <div className="bg-gold text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg">
                <span className="text-xl font-black">-15%</span>
                <span className="text-[10px] uppercase">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      {/* Slide 2 – Custom Canvas Printing */}
      <SwiperSlide>
        <div className="relative w-full min-h-[650px] md:min-h-[750px] flex items-center bg-gradient-to-br from-[#F8F9FA] to-[#F0F2F5] dark:from-navy dark:to-navy-mid overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 py-16 md:py-20">
            <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
              <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-navy-light rounded-full px-4 py-1.5 mb-6 shadow-sm">
                  <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-navy dark:text-white/80 tracking-wide">Made Just for You</span>
                </div>
                <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-black text-navy dark:text-white leading-tight">
                  Custom Canvas Printing
                </h1>
                <p className="text-gray-700  text-lg mt-4 max-w-lg mx-auto lg:mx-0">
                  Upload any photo or design. We'll print it on premium artist canvas with UV‑resistant inks. Ready to hang in 3–5 days.
                </p>
                <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                  <Link to="/custom-canvas" className="bg-gold hover:bg-gold-dark text-navy font-bold px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
                    Start Your Order
                  </Link>
                  <Link to="/gallery" className="border-2 border-navy dark:border-white/30 text-navy dark:text-white font-semibold px-8 py-3 rounded-full hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy transition-all">
                    View Gallery
                  </Link>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative max-w-lg lg:max-w-2xl group">
                  <img src={canvasImage2} alt="Custom canvas printing" className="w-full h-auto object-contain rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 border-8 border-white/20 rounded-2xl pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="absolute top-10 right-10 z-20 hidden lg:block">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-xl text-center border border-gold/30">
                <div className="text-3xl font-black text-gold">$120</div>
                <div className="text-sm text-gray-500 line-through">$133</div>
                <div className="text-xs font-semibold text-green-600 mt-1">Save 10%</div>
              </div>
            </div>
            <div className="absolute bottom-10 left-10 z-20 hidden lg:block">
              <div className="bg-gold text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg">
                <span className="text-xl font-black">-10%</span>
                <span className="text-[10px] uppercase">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      {/* Slide 3 – Professional Canvas Service */}
      <SwiperSlide>
        <div className="relative w-full min-h-[650px] md:min-h-[750px] flex items-center bg-gradient-to-br from-[#F8F9FA] to-[#F0F2F5] dark:from-navy dark:to-navy-mid overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 py-16 md:py-20">
            <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
              <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-navy-light rounded-full px-4 py-1.5 mb-6 shadow-sm">
                  <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-navy dark:text-white/80 tracking-wide">Museum Quality</span>
                </div>
                <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-black text-navy dark:text-white leading-tight">
                  Professional Canvas Printing
                </h1>
                <p className="text-gray-700  text-lg mt-4 max-w-lg mx-auto lg:mx-0">
                  Archival inks, hand‑stretched on kiln‑dried pine. Choose from matte, satin, or glossy finish. Free worldwide shipping on orders over $50.
                </p>
                <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                  <Link to="/pro-canvas" className="bg-gold hover:bg-gold-dark text-navy font-bold px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
                    Explore Canvas
                  </Link>
                  <Link to="/contact" className="border-2 border-navy dark:border-white/30 text-navy dark:text-white font-semibold px-8 py-3 rounded-full hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy transition-all">
                    Get Quote
                  </Link>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative max-w-lg lg:max-w-2xl group">
                  <img src={canvasImage3} alt="Professional canvas printing" className="w-full h-auto object-contain rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 border-8 border-white/20 rounded-2xl pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="absolute top-10 right-10 z-20 hidden lg:block">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-xl text-center border border-gold/30">
                <div className="text-3xl font-black text-gold">$99</div>
                <div className="text-sm text-gray-500 line-through">$124</div>
                <div className="text-xs font-semibold text-green-600 mt-1">Save 20%</div>
              </div>
            </div>
            <div className="absolute bottom-10 left-10 z-20 hidden lg:block">
              <div className="bg-gold text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg">
                <span className="text-xl font-black">-20%</span>
                <span className="text-[10px] uppercase">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      {/* Custom Swiper Styles */}
      <style>{`
        .canvas-print-swiper .swiper-button-prev,
        .canvas-print-swiper .swiper-button-next {
          color: #f5a623;
          background: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }
        .canvas-print-swiper .swiper-button-prev:hover,
        .canvas-print-swiper .swiper-button-next:hover {
          background: #f5a623;
          color: white;
          transform: scale(1.05);
        }
        .canvas-print-swiper .swiper-button-prev:after,
        .canvas-print-swiper .swiper-button-next:after {
          font-size: 20px;
          font-weight: bold;
        }
        .canvas-print-swiper .swiper-pagination-bullet {
          background: #cbd5e1;
          opacity: 0.8;
          width: 12px;
          height: 12px;
          transition: all 0.2s;
        }
        .canvas-print-swiper .swiper-pagination-bullet-active {
          background: #f5a623;
          width: 28px;
          border-radius: 6px;
        }
        @media (max-width: 1024px) {
          .canvas-print-swiper .swiper-button-prev,
          .canvas-print-swiper .swiper-button-next {
            display: none;
          }
        }
      `}</style>
    </Swiper>
  );
}