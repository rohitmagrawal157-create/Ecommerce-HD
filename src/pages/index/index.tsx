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
// import { Link } from 'react-router-dom';

import NavbarOne from '../../components/navbar/navbar-one'
import SliderOne from '../../components/banner-slider/slider-one';
// import LayoutOne from '../../components/product/layout-one';
import FooterOne from '../../components/footer/footer-one';
// import PartnerOne from '../../components/partner-one';
import ScrollToTop from '../../components/scroll-to-top';

// import { featureOne, productList } from '../../data/data';
import 'tiny-slider/dist/tiny-slider.css';

// import sofa from '../../assets/img/svg/sofa.svg'
// import shape1 from '../../assets/img/home-v1/shape-01.png'
// import like from '../../assets/img/svg/like.svg'
// import trust from '../../assets/img/png/trust.png'
// import thumb from '../../assets/img/thumb/thumb.png'
// import newImg from '../../assets/img/png/new.png'

import AOS from 'aos';
import FeaturedProducts from '../../components/allproduct/FeaturedProducts.tsx';
import ProductCategorySlider from '../../components/allproduct/productcategoryslider.tsx';
import ProductCollection from '../../components/allproduct/ProductCollection.tsx';
import SuggestedForYou from '../../components/allproduct/SuggestedForYou.tsx';
import WidestCollection from '../../components/allproduct/WidestCollection.tsx';
import GrabOrGone from '../../components/allproduct/GrabOrGone.tsx';
import CategoryIconsRow from '../../components/allproduct/CategoryIconsRow.tsx';
import TrendsYouMayLike from '../../components/allproduct/TrendsYouMayLike.tsx';
import NewProducts from '../../components/allproduct/NewProducts.tsx';

// ── Brand color tokens ────────────────────────────────────────────
// const BRAND_GRAD = 'linear-gradient(135deg,#5B4FBE 0%,#E8314A 50%,#F97316 100%)';
// const CTA_GRAD = 'linear-gradient(135deg,#2563EB 0%,#06B6D4 50%,#22C55E 100%)';
// const BRAND_GRAD_H = 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)';

// Gradient text helper
// const gradTxt = {
//   backgroundImage: BRAND_GRAD,
//   WebkitBackgroundClip: 'text' as const,
//   WebkitTextFillColor: 'transparent' as const,
//   backgroundClip: 'text' as const,
// };

// interface Feature { image: string; title: string; desc: string; }
// interface Product { id: number; image: string; tag: string; price: string; name: string; }

function Index() {
  useEffect(() => { AOS.init(); }, []);   // unchanged

  return (
    <>
      <div className="overflow-x-hidden w-full">
        <NavbarOne />
        <SliderOne />
         <FeaturedProducts />
        <ProductCategorySlider />
       

        {/* ── New Products ─────────────────────────────────────────── */}
       <NewProducts />

        {/* ── Why Choose Us ────────────────────────────────────────── */}
     

        {/* ── Product Collection ────────────────────────────────────── */}
        <GrabOrGone />
        <CategoryIconsRow />
        <TrendsYouMayLike />
        <WidestCollection />
        <SuggestedForYou />
        <ProductCollection />

        

        <FooterOne />
        <ScrollToTop />
      </div>
    </>
  );
}

export default Index;