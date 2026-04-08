// @ts-nocheck
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import summerIcon from '../../assets/img/shortcode/carousel/Summer.png';
// Canvas print images (external)
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
      {/* SLIDE 1 */}
      <SwiperSlide>
        <div className="relative w-full min-h-[620px] md:min-h-[680px] lg:min-h-[720px] bg-[#F8F7F4] overflow-hidden flex items-center">
          
          {/* Background Animation */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e0d8_1px,transparent_1px)] [background-size:50px_50px] animate-slow-drift opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7F4] via-[#F0ECE4] to-[#E8E2D6]"></div>

          <div className="container mx-auto px-5 lg:px-12 py-10 md:py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 h-full">

              {/* LEFT TEXT - Bigger & Better */}
              <div className="lg:w-5/12 text-center lg:text-left">
                <div className="flex items-end justify-center lg:justify-start gap-3">
                  <span className="font-black text-[72px] md:text-[92px] lg:text-[118px] leading-none text-gray-900 tracking-[-4px]">
                    2025
                  </span>
                  <img 
                    src={summerIcon} 
                    alt="Summer" 
                    className="w-[110px] md:w-[145px] lg:w-[185px] -mb-2" 
                  />
                </div>

                <h1 className="mt-4 text-4xl md:text-5xl lg:text-[52px] font-semibold text-gray-900 leading-[1.1]">
                  Premium Canvas Prints
                </h1>

                <p className="mt-6 text-[17px] md:text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
                  High-quality museum-grade canvas with vibrant fade-resistant inks. 
                  Solid wood frames for a timeless look.
                </p>

                <div className="mt-9 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link to="/shop/canvas" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-9 py-4 rounded-2xl text-lg transition-all">
                    Shop Now
                  </Link>
                  <Link to="/custom-canvas" className="border-2 border-gray-900 text-gray-900 font-semibold px-9 py-4 rounded-2xl hover:bg-gray-900 hover:text-white transition-all text-lg">
                    Custom Order
                  </Link>
                </div>
              </div>

              {/* RIGHT IMAGE - Bigger & Centered */}
              <div className="lg:w-7/12 flex justify-center">
                <div className="relative group max-w-[580px] w-full">
                  <img
                    src={canvasImage1}
                    alt="Premium Canvas Wall Art"
                    className="w-full h-auto rounded-3xl shadow-2xl transition-transform duration-1000 group-hover:scale-[1.04]"
                  />

                  {/* Price Tag - Bigger & Closer to Image */}
                  <div className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-2xl px-8 py-5 text-center border border-gray-100 z-20">
                    <div className="text-4xl font-bold text-emerald-600">$89</div>
                    <div className="text-sm text-gray-500 line-through">$105</div>
                    <div className="text-xs font-semibold text-emerald-600 mt-1 tracking-wide">SAVE 15%</div>
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute -bottom-6 -right-6 bg-emerald-700 text-white font-bold w-24 h-24 flex flex-col items-center justify-center rounded-full shadow-2xl z-20">
                    <span className="text-3xl">-15%</span>
                    <span className="text-xs tracking-[1px] mt-[-3px]">OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      {/* SLIDE 2 - Custom Canvas */}
      <SwiperSlide>
        <div className="relative w-full min-h-[620px] md:min-h-[680px] lg:min-h-[720px] bg-[#F5F3EF] overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(#d1d1d1_1px,transparent_1px)] [background-size:45px_45px] animate-slow-drift opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3EF] via-[#EBE7E0] to-[#E0D9CF]"></div>

          <div className="container mx-auto px-5 lg:px-12 py-10 md:py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 h-full">

              <div className="lg:w-5/12 text-center lg:text-left">
                <div className="flex items-end justify-center lg:justify-start gap-3">
                  <span className="font-black text-[72px] md:text-[92px] lg:text-[118px] leading-none text-gray-900 tracking-[-4px]">
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
                  <Link to="/custom-canvas" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-9 py-4 rounded-2xl text-lg transition-all">Start Your Order</Link>
                  <Link to="/gallery" className="border-2 border-gray-900 text-gray-900 font-semibold px-9 py-4 rounded-2xl hover:bg-gray-900 hover:text-white transition-all text-lg">View Gallery</Link>
                </div>
              </div>

              <div className="lg:w-7/12 flex justify-center">
                <div className="relative group max-w-[580px] w-full">
                  <img src={canvasImage2} alt="Custom Canvas" className="w-full h-auto rounded-3xl shadow-2xl transition-transform duration-1000 group-hover:scale-[1.04]" />
                  
                  <div className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-2xl px-8 py-5 text-center border border-gray-100 z-20">
                    <div className="text-4xl font-bold text-emerald-600">$120</div>
                    <div className="text-sm text-gray-500 line-through">$133</div>
                    <div className="text-xs font-semibold text-emerald-600 mt-1 tracking-wide">SAVE 10%</div>
                  </div>

                  <div className="absolute -bottom-6 -right-6 bg-emerald-700 text-white font-bold w-24 h-24 flex flex-col items-center justify-center rounded-full shadow-2xl z-20">
                    <span className="text-3xl">-10%</span>
                    <span className="text-xs tracking-[1px] mt-[-3px]">OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      {/* SLIDE 3 - Professional Canvas */}
      <SwiperSlide>
        <div className="relative w-full min-h-[620px] md:min-h-[680px] lg:min-h-[720px] bg-[#F9F6F2] overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(#e8d9c2_1px,transparent_1px)] [background-size:55px_55px] animate-slow-drift opacity-55"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#F9F6F2] via-[#F0E9DD] to-[#E6D9C7]"></div>

          <div className="container mx-auto px-5 lg:px-12 py-10 md:py-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 h-full">

              <div className="lg:w-5/12 text-center lg:text-left">
                <div className="flex items-end justify-center lg:justify-start gap-3">
                  <span className="font-black text-[72px] md:text-[92px] lg:text-[118px] leading-none text-gray-900 tracking-[-4px]">
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
                  <Link to="/pro-canvas" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-9 py-4 rounded-2xl text-lg transition-all">Explore Canvas</Link>
                  <Link to="/contact" className="border-2 border-gray-900 text-gray-900 font-semibold px-9 py-4 rounded-2xl hover:bg-gray-900 hover:text-white transition-all text-lg">Get Quote</Link>
                </div>
              </div>

              <div className="lg:w-7/12 flex justify-center">
                <div className="relative group max-w-[580px] w-full">
                  <img src={canvasImage3} alt="Professional Canvas" className="w-full h-auto rounded-3xl shadow-2xl transition-transform duration-1000 group-hover:scale-[1.04]" />
                  
                  <div className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-2xl px-8 py-5 text-center border border-gray-100 z-20">
                    <div className="text-4xl font-bold text-emerald-600">$99</div>
                    <div className="text-sm text-gray-500 line-through">$124</div>
                    <div className="text-xs font-semibold text-emerald-600 mt-1 tracking-wide">SAVE 20%</div>
                  </div>

                  <div className="absolute -bottom-6 -right-6 bg-emerald-700 text-white font-bold w-24 h-24 flex flex-col items-center justify-center rounded-full shadow-2xl z-20">
                    <span className="text-3xl">-20%</span>
                    <span className="text-xs tracking-[1px] mt-[-3px]">OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      {/* Styles */}
      <style>{`
        .canvas-print-swiper .swiper-button-prev,
        .canvas-print-swiper .swiper-button-next {
          color: #333;
          background: white;
          width: 52px; height: 52px;
          border-radius: 50%;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        .canvas-print-swiper .swiper-button-prev:hover,
        .canvas-print-swiper .swiper-button-next:hover {
          background: #333; color: white;
        }

        @keyframes slowDrift {
          0% { background-position: 0 0; }
          100% { background-position: 80px 80px; }
        }
        .animate-slow-drift {
          animation: slowDrift 40s linear infinite;
        }
      `}</style>
    </Swiper>
  );
}