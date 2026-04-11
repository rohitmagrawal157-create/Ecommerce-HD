// src/pages/home/Index.tsx
// ══════════════════════════════════════════════════════════════════
//  ALL logic, imports, components, and structure UNCHANGED.
//
//  CHANGED (colors only — brand palette from infinity logo):
//
//  "New Products" heading      → gradient text (purple→red→orange)
//  "Why you Choose Us" heading → gradient text
//  "Trusted Partner" heading   → gradient text
//  Section body text size      → 15px (was implicit default)
//  "All Products" CTA button   → gradient background
//  Section icon imgs           → subtle drop-shadow with brand color
//  Section top accent line     → 3px gradient rule above each heading
// ══════════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import NavbarOne from '../../components/navbar/navbar-one'
import SliderOne from '../../components/banner-slider/slider-one';
import LayoutOne from '../../components/product/layout-one';
import FooterOne from '../../components/footer/footer-one';
import PartnerOne from '../../components/partner-one';
import ScrollToTop from '../../components/scroll-to-top';

import { featureOne, productList } from '../../data/data';
import 'tiny-slider/dist/tiny-slider.css';

// import sofa from '../../assets/img/svg/sofa.svg'
import shape1 from '../../assets/img/home-v1/shape-01.png'
import like from '../../assets/img/svg/like.svg'
import hand from '../../assets/img/svg/hand.svg'

import AOS from 'aos';
import FeaturedProducts from '../../components/allproduct/FeaturedProducts.tsx';
import ProductCategorySlider from '../../components/allproduct/productcategoryslider.tsx';
import ProductCollection from '../../components/allproduct/productcollection.tsx';

// ── Brand color tokens ────────────────────────────────────────────
const BRAND_GRAD   = 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)';
const CTA_GRAD     = 'linear-gradient(135deg,#2563EB 0%,#06B6D4 50%,#22C55E 100%)';
const BRAND_GRAD_H = 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)';

// Gradient text helper
const gradTxt = {
  backgroundImage: BRAND_GRAD,
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
};

interface Feature { image: string; title: string; desc: string; }
interface Product { id: number; image: string; tag: string; price: string; name: string; }

function Index() {
  useEffect(() => { AOS.init(); }, []);   // unchanged

  return (
    <>
      <div className="overflow-x-hidden w-full">
        <NavbarOne />
        <SliderOne />
        <ProductCategorySlider />
        <FeaturedProducts />

        {/* ── New Products ─────────────────────────────────────────── */}
        <div className="s-py-50-100">
          <div className="container-fluid">

            <div className="max-w-xl mx-auto mb-8 md:mb-12 text-center" data-aos="fade-up">
              {/* <div>
                <img
                  src={sofa}
                  alt="New Products"
                  className="mx-auto w-14 sm:w-24"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(91,79,190,0.25))' }}
                />
              </div> */}
              {/* 3px gradient rule above heading */}
              <div style={{ width: 48, height: 3, background: BRAND_GRAD_H, margin: '20px auto 16px', borderRadius: 2 }} />
              {/* Gradient heading */}
              <h3
                className="leading-none text-2xl md:text-3xl"
                style={gradTxt}
              >
                New Products
              </h3>
              <p className="mt-3" style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7 }}>
                Be the first to experience innovation with our latest arrivals.
                Stay ahead of the curve and discover what's new in style, technology, and more.
              </p>
            </div>

            {/* Products Grid */}
            <div
              className="max-w-[1720px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {productList.slice(0, 4).map((item: Product, index: number) => (
                <LayoutOne item={item} key={index} />
              ))}
            </div>

            {/* CTA — brand gradient button */}
            <div className="text-center mt-10 md:mt-14">
              <Link
                to="/shop-v1"
                data-text="All Products"
                style={{
                  display: 'inline-block',
                  padding: '14px 40px',
                  background: BRAND_GRAD,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s, transform 0.2s',
                  borderRadius: 0,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                }}
              >
                All Products
              </Link>
            </div>
          </div>
        </div>

        {/* ── Why Choose Us ────────────────────────────────────────── */}
        <div
          className="s-py-100 bg-overlay dark:before:bg-title dark:before:bg-opacity-80"
          style={{
            backgroundImage: `url('https://imgs.search.brave.com/9Dl10qoCUIwVLoDqAJtW_2thzI_lVv0UQ1L3B3BCR9E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z2lmZnl3YWxscy5p/bi9jZG4vc2hvcC9m/aWxlcy90cm9waWNh/bC10cmVlcy13aGl0/ZS10b25lLW11cmFs/LXdhbGxwYXBlci01/NjQ2NjY1LmpwZz9x/dWFsaXR5PTkwJnY9/MTc3MzQwMDkzNSZ3/aWR0aD0xMzI2')`
          }}
          data-aos="fade-up"
        >
          <img className="absolute top-0 right-0 w-[20%] z-[-1]" src={shape1} alt="shape" />
          <div className="container-fluid">
            <div className="max-w-[1720px] mx-auto">
              <div className="max-w-[1186px] ml-auto">

                <div className="max-w-xl mb-8 md:mb-12">
                  <div>
                    <img
                      src={like}
                      className="w-14 sm:w-24"
                      alt=""
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(91,79,190,0.3))' }}
                    />
                  </div>
                  {/* Gradient rule */}
                  <div style={{ width: 48, height: 3, background: BRAND_GRAD_H, margin: '20px 0 16px', borderRadius: 2 }} />
                  <h3
                    className="leading-none text-2xl md:text-3xl"
                    style={{ ...gradTxt, display: 'inline-block' }}
                  >
                    Why you Choose Us
                  </h3>
                  <p className="mt-3" style={{ fontSize: 15, lineHeight: 1.7 }}>
                    Choose us for unparalleled quality, exceptional service, and a commitment to your satisfaction.
                    Join countless others who rely on us for reliability.
                  </p>
                </div>

               {/* Feature cards – professional theme */}
<div
  className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
  data-aos="fade-up"
  data-aos-delay="100"
>
  {featureOne.slice(0, 4).map((item: Feature, index: number) => (
    <div
      key={index}
      className="group bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Icon with gradient background */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, #e7e6ef 0%, #f5f5f5 50%, #58dfcf 100%)',
        }}
      >
        <img src={item.image} alt={item.title} className="w-7 h-7 brightness-0 invert" />
      </div>

      {/* Title */}
      <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
    </div>
  ))}
</div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Product Collection ────────────────────────────────────── */}
        <ProductCollection />

        {/* ── Trusted Partner ──────────────────────────────────────── */}
        <div className="s-py-50-100" data-aos="fade-up">
          <div className="container-fluid">
            <div className="max-w-xl mx-auto mb-8 md:mb-12 text-center" data-aos="fade-up" data-aos-delay="100">
              <div>
                <img
                  src={hand}
                  className="mx-auto w-14 sm:w-24"
                  alt=""
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(37,99,235,0.25))' }}
                />
              </div>
              {/* CTA gradient rule (blue→green for this section) */}
              <div style={{ width: 48, height: 3, background: CTA_GRAD, margin: '20px auto 16px', borderRadius: 2 }} />
              <h3
                className="leading-none text-2xl md:text-3xl"
                style={{
                  backgroundImage: CTA_GRAD,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Trusted Partner
              </h3>
              <p className="mt-3" style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7 }}>
                Count on our trusted partnerships to deliver excellence. Collaborating with industry leaders
                ensures top-quality products and services for your satisfaction.
              </p>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <PartnerOne />
            </div>
          </div>
        </div>

        <FooterOne />
        <ScrollToTop />
      </div>
    </>
  );
}

export default Index;