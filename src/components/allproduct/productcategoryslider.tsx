// src/components/ProductCategorySlider.tsx
import { Link } from 'react-router-dom';
import TinySlider from 'tiny-slider-react';
import 'tiny-slider/dist/tiny-slider.css';
import { useRef } from 'react';

// Brand gradient tokens
const BRAND  = 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)';
const CTA    = 'linear-gradient(90deg,#2563EB,#06B6D4,#22C55E)';

const categoryOne = [
  {
    id: 1, name: 'Temple Art', item: 'Canvas Print',
    tag: 'NEW', tagGrad: 'linear-gradient(90deg,#5B4FBE,#EC4899)',
    image: 'https://imgs.search.brave.com/Fh0bVSoFNZGyejmBi2ixP5KzMV2l1ZBscvJnOqPIBww/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzErMlNPUUoyWUwu/anBn',
  },
  {
    id: 2, name: 'Portrait Sketch', item: 'Charcoal Drawing',
    tag: 'HOT', tagGrad: 'linear-gradient(90deg,#E8314A,#F97316)',
    image: 'https://imgs.search.brave.com/xvRRFzB3ffBI183PkWbEf-qU-mcKpIOVeEo032IKxxs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rb3Rh/cnQuaW4vY2RuL3No/b3AvZmlsZXMvZWZm/ZWN0MjZfMC5qcGc_/dj0xNzI0NjQ2MTM5/JndpZHRoPTUzMw',
  },
  {
    id: 3, name: 'Wall Mural', item: 'Large Format',
    tag: 'SALE', tagGrad: 'linear-gradient(90deg,#2563EB,#06B6D4)',
    image: 'https://imgs.search.brave.com/QvITnnte9GaQQ3pX4RFyfZTQmlfWYWj83s7xthIUQKY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudXdhbGxzLmNv/bS9wcm9kdWN0cy8x/NTMwMDAvMTUzNzE5/L2MwMDAwN3BpZzEx/bXNfOTAwLndlYnA',
  },
  {
    id: 4, name: 'Wallpaper', item: 'Modern Design',
    tag: 'NEW', tagGrad: 'linear-gradient(90deg,#5B4FBE,#EC4899)',
    image: 'https://imgs.search.brave.com/sJldnUuNYOe-tPZhqqXG8yt4o72tO-hVGzZdU_0wYS8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saWZl/bmNvbG9ycy5pbi9j/ZG4vc2hvcC9maWxl/cy9yb3NhLWNoaW5v/aXNlcmllLXdhbGxw/YXBlci1saXZpbmct/cm9vbS1jbGF5LWJl/aWdlLndlYnA_dj0x/NzY1ODgwNTk3Jndp/ZHRoPTMyMA',
  },
  {
    id: 5, name: 'Curtains', item: 'Premium Fabric',
    tag: 'HOT', tagGrad: 'linear-gradient(90deg,#E8314A,#F97316)',
    image: 'https://imgs.search.brave.com/-SXqLkKCRCTqOJjsLlRijKyb2n6MKh3slcXykgLqXWU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFhSy1JenFaRkwu/anBn',
  },
];

const settings = {
  items: 1, slideBy: 1, controls: false, nav: false,
  autoplay: true, autoplayTimeout: 3000, autoplayHoverPause: true,
  speed: 800, loop: true, mouseDrag: true, gutter: 24,
  responsive: {
    640:  { items: 2, gutter: 20 },
    768:  { items: 2, gutter: 24 },
    1024: { items: 3, gutter: 28 },
    1280: { items: 3, gutter: 30 },
  },
};

export default function ProductCategorySlider() {
  const sliderRef = useRef<any>(null);

  const handlePrev = () => {
    const s = sliderRef.current;
    if (!s) return;
    if (typeof s.goTo === 'function') return s.goTo('prev');
    if (s.slider?.goTo) return s.slider.goTo('prev');
    if (s.tns?.goTo) return s.tns.goTo('prev');
  };

  const handleNext = () => {
    const s = sliderRef.current;
    if (!s) return;
    if (typeof s.goTo === 'function') return s.goTo('next');
    if (s.slider?.goTo) return s.slider.goTo('next');
    if (s.tns?.goTo) return s.tns.goTo('next');
  };

  return (
    <div className="s-py-100-50 overflow-hidden">
      <div className="container-fluid">

        {/* Header */}
        <div className="max-w-xl mx-auto mb-8 md:mb-12 text-center" data-aos="fade-up">
          {/* Gradient icon replacement — canvas palette icon */}
          {/* <div className="mx-auto mb-4 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
            style={{ background: BRAND }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div> */}

          <h3 className="leading-none text-2xl md:text-3xl font-bold"
            style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
            Product Collection
          </h3>

          {/* Gradient accent line */}
          <div style={{ width: 48, height: 3, borderRadius: 2, margin: '10px auto 0', background: BRAND }} />

          <p className="mt-4 text-gray-500 text-sm md:text-base">
            Explore our curated selection of premium products, tailored to suit every need and taste.
          </p>
        </div>

        {/* Slider */}
        <div className="max-w-[1720px] mx-auto relative group" data-aos="fade-up" data-aos-delay="100">
          <div className="hv1-pdct-ctgry-slider">
            <TinySlider settings={settings} ref={sliderRef}>
              {categoryOne.map((item) => (
                <Link key={item.id} className="relative block px-3" to="/product-category">

                  {/* Image */}
                  <div className="overflow-hidden rounded-3xl shadow-lg" style={{ boxShadow: '0 8px 32px rgba(91,79,190,0.10)' }}>
                    <img
                      className="w-full h-[320px] md:h-[380px] lg:h-[420px] object-cover transition-transform duration-700 hover:scale-105"
                      src={item.image} alt={item.name} loading="lazy"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-20 transition-opacity duration-300"
                      style={{ background: BRAND }} />
                  </div>

                  {/* Tag badge — gradient pill */}
                  {item.tag && (
                    <div className="absolute top-4 right-6 px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-widest z-10"
                      style={{ background: item.tagGrad, boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }}>
                      {item.tag}
                    </div>
                  )}

                  {/* Label card */}
                  <div className="absolute bottom-8 left-0 px-6 w-full flex justify-start">
                    <div className="p-5 md:p-6 bg-white dark:bg-title backdrop-blur-sm rounded-2xl shadow-xl w-auto"
                      style={{ boxShadow: '0 8px 32px rgba(91,79,190,0.12)' }}>
                      {/* Item type — gradient text */}
                      <span className="text-base md:text-xl font-medium leading-none"
                        style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {item.item}
                      </span>
                      <h4 className="text-2xl md:text-3xl mt-2 font-semibold leading-tight text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </TinySlider>
          </div>

          {/* Prev button */}
          <button onClick={handlePrev} aria-label="Previous"
            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-xl absolute top-1/2 -translate-y-1/2 left-4 z-[999] transition-all duration-300 group/btn"
            style={{ background: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.background = BRAND)}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
            <svg className="fill-current text-gray-700 group-hover/btn:text-white transition-colors"
              width="20" height="12" viewBox="0 0 24 14" fill="none">
              <path d="M0.180223 7.38726L5.62434 12.8314C5.8199 13.0598 6.16359 13.0864 6.39195 12.8908C6.62031 12.6952 6.64693 12.3515 6.45132 12.1232C6.43307 12.1019 6.41324 12.082 6.39195 12.0638L1.87877 7.54516L23.4322 7.54516C23.7328 7.54516 23.9766 7.30141 23.9766 7.00072C23.9766 6.70003 23.7328 6.45632 23.4322 6.45632L1.87877 6.45632L6.39195 1.94314C6.62031 1.74758 6.64693 1.40389 6.45132 1.17553C6.25571 0.947171 5.91207 0.920551 5.68371 1.11616C5.66242 1.13441 5.64254 1.15424 5.62434 1.17553L0.180175 6.6197C-0.0308748 6.83196 -0.0308748 7.1749 0.180223 7.38726Z"/>
            </svg>
          </button>

          {/* Next button */}
          <button onClick={handleNext} aria-label="Next"
            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-xl absolute top-1/2 -translate-y-1/2 right-4 z-[999] transition-all duration-300 group/btn"
            style={{ background: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.background = CTA)}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
            <svg className="fill-current text-gray-700 group-hover/btn:text-white transition-colors"
              width="20" height="12" viewBox="0 0 24 14" fill="none">
              <path d="M23.8198 6.61958L18.3757 1.17541C18.1801 0.947054 17.8364 0.920433 17.608 1.11604C17.3797 1.31161 17.3531 1.65529 17.5487 1.88366C17.5669 1.90494 17.5868 1.92483 17.608 1.94303L22.1212 6.46168L0.567835 6.46168C0.267191 6.46168 0.0234375 6.70543 0.0234375 7.00612C0.0234375 7.30681 0.267191 7.55052 0.567835 7.55052L22.1212 7.55052L17.608 12.0637C17.3797 12.2593 17.3531 12.6029 17.5487 12.8313C17.7443 13.0597 18.0879 13.0863 18.3163 12.8907C18.3376 12.8724 18.3575 12.8526 18.3757 12.8313L23.8198 7.38714C24.0309 7.17488 24.0309 6.83194 23.8198 6.61958Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}