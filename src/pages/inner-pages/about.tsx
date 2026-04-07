// src/pages/inner-pages/about.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { Link } from "react-router-dom";

import bg   from '../../assets/img/shortcode/breadcumb.jpg';
import bg1  from '../../assets/img/about/about-banner-01.jpg';
import bg4  from '../../assets/img/about/video-bg.jpg';
import about from '../../assets/img/svg/about.svg';
import like  from '../../assets/img/svg/like.svg';
import hand  from '../../assets/img/svg/hand.svg';

import NavbarOne   from "../../components/navbar/navbar-one";
import PartnerOne  from "../../components/partner-one";
import FooterOne   from "../../components/footer/footer-one";
import ScrollToTop from "../../components/scroll-to-top";

import { featureOne } from "../../data/data";
import Aos from "aos";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Feature {
  image: string;
  title: string;
  desc:  string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

// Services offered — shown in the company intro strip
const SERVICES = [
  { icon: '🖨️', label: 'Digital Printing'      },
  { icon: '🪟', label: 'Signage & Displays'    },
  { icon: '🏷️', label: 'Branding & Packaging'  },
  { icon: '📐', label: 'Large Format Printing'  },
  { icon: '🎨', label: 'Graphic Design'         },
  { icon: '🏗️', label: 'Installation Services' },
];

// Expert team stats — shown in the team section
const TEAM_STATS = [
  { value: '15+', label: 'Years Experience'   },
  { value: '200+', label: 'Projects Completed' },
  { value: '50+',  label: 'Expert Specialists' },
  { value: '98%',  label: 'Client Satisfaction'},
];

// Key of success pillars
const SUCCESS_KEYS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Client Satisfaction',
    desc:  'Unwavering commitment to exceeding client expectations on every single project we undertake.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Talented Team',
    desc:  'A collaborative team of skilled professionals bringing unique expertise and diverse perspectives.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Continuous Improvement',
    desc:  'A culture of innovation and learning that keeps us ahead of industry trends and technology.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Integrity & Transparency',
    desc:  'A strong foundation of honest communication, ethical practices, and trustworthy partnerships.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function About() {

  useEffect(() => {
    Aos.init({ once: true, duration: 600 });
  }, []);

  return (
    <>
      <NavbarOne />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">
            About Us
          </h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4 flex-wrap">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li className="text-primary">About</li>
          </ul>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — Company Intro (replaces "Our Story Journey")
          Left: image | Right: who we are + services grid
      ════════════════════════════════════════════════════════════════════ */}
      <div className="s-pb-100 pt-12 md:pt-16">
        <div className="container-fluid" data-aos="fade-up" data-aos-delay="100">
          <div className="max-w-[1720px] mx-auto flex flex-col-reverse lg:grid lg:grid-cols-2">

            {/* Left — image */}
            <div className="lg:bg-[#F8F8F9] lg:dark:bg-dark-secondary lg:pr-10 2xl:pr-0 relative">
              <div>
                <img
                  className="object-cover w-full h-full min-h-[400px]"
                  src=	"	https://theinfinityprint.com/wp-content/uploads/2024/05/canvas-frame-1-1.jpg"
                  alt="Infinity Print and Signage"
                />
              </div>
              {/* Floating badge over image */}
              <div className="absolute bottom-6 left-6 bg-primary text-white px-5 py-3 rounded-[6px] shadow-lg hidden md:block">
                <div className="text-2xl font-bold leading-none">15+</div>
                <div className="text-xs font-medium mt-1 opacity-90 tracking-wide">Years of Excellence</div>
              </div>
            </div>

            {/* Right — company intro */}
            <div className="flex items-center py-8 sm:py-12 px-5 sm:px-12 md:px-8 lg:pr-12 lg:pl-16 2xl:pl-[160px] bg-[#F8F8F9] dark:bg-dark-secondary">
              <div className="lg:max-w-[600px]">

                <div>
                  <img src={about} alt="" className="size-16" />
                </div>

                {/* Eyebrow label */}
                <p className="text-primary text-sm font-semibold tracking-[0.12em] uppercase mt-4">
                  Who We Are
                </p>

                <h3 className="font-medium leading-tight mt-2 text-2xl md:text-3xl">
                  Infinity Print &amp; Signage Industries
                </h3>

                <p className="mt-4 text-base sm:text-lg leading-relaxed">
                  At <strong>Infinity Print and Signage Industries</strong>, we are a dynamic and innovative
                  Printing and Signage company committed to providing exceptional service to our valued clients.
                  With a strong foundation built on years of experience, we have established ourselves as a
                  trusted name in the industry.
                </p>

                <p className="mt-3 text-base sm:text-lg leading-relaxed">
                  We deliver comprehensive print and signage solutions — all under one roof. From concept to
                  installation, our expert team ensures every project reflects your brand's identity with
                  precision, quality, and creativity.
                </p>

                {/* Services grid */}
                <div className="mt-6 md:mt-8">
                  <p className="text-sm font-semibold text-title dark:text-white uppercase tracking-[0.1em] mb-3">
                    Our Services
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SERVICES.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 bg-white dark:bg-dark border border-[#ececec] dark:border-[#2a2a2a] rounded-[6px] px-3 py-2.5"
                      >
                        <span className="text-lg leading-none">{s.icon}</span>
                        <span className="text-sm font-medium text-title dark:text-white leading-tight">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — Expert Team + Key of Success  (NEW)
          Two-column: left = team, right = key of success
      ════════════════════════════════════════════════════════════════════ */}
      <div className="s-pb-100">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto">

            {/* Section header */}
            <div className="max-w-xl mx-auto mb-10 md:mb-14 text-center" data-aos="fade-up" data-aos-delay="100">
              <img src={hand} className="mx-auto size-16" alt="" />
              <h3 className="font-medium leading-none mt-4 md:mt-6 text-2xl md:text-3xl">
                Our Team &amp; Success Formula
              </h3>
              <p className="mt-3">
                The people behind our excellence and the values that drive every project we deliver.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 xl:gap-14" data-aos="fade-up" data-aos-delay="150">

              {/* ── LEFT: Expert Team ──────────────────────────────────── */}
              <div className="bg-[#F8F8F9] dark:bg-dark-secondary rounded-[12px] p-8 sm:p-10">

                {/* Label */}
                <p className="text-primary text-sm font-semibold tracking-[0.12em] uppercase mb-3">
                  Expert Team
                </p>
                <h4 className="font-semibold text-xl md:text-2xl leading-tight mb-4">
                  About Our Expert Team
                </h4>
                <p className="text-base leading-relaxed mb-3">
                  Our team comprises highly skilled individuals with diverse backgrounds and a wealth of
                  knowledge in their respective fields. Each team member brings unique expertise and
                  experiences, allowing us to tackle complex challenges from multiple perspectives.
                </p>
                <p className="text-base leading-relaxed">
                  From design specialists and print technicians to project managers and installation
                  experts — every member of our team is dedicated to delivering outstanding results
                  that speak for themselves.
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#e8e8e8] dark:border-[#2a2a2a]">
                  {TEAM_STATS.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-primary leading-none">
                        {stat.value}
                      </div>
                      <div className="text-xs text-paragraph dark:text-white/60 mt-1.5 leading-tight font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* ── RIGHT: Key of Success ──────────────────────────────── */}
              <div>
                <p className="text-primary text-sm font-semibold tracking-[0.12em] uppercase mb-3">
                  Key of Success
                </p>
                <h4 className="font-semibold text-xl md:text-2xl leading-tight mb-2">
                  What Drives Our Success
                </h4>
                <p className="text-base leading-relaxed mb-6">
                  Our key to success stems from our unwavering commitment to client satisfaction, a talented
                  and collaborative team, a culture of continuous improvement, and a strong foundation of
                  integrity and transparency.
                </p>

                {/* Success pillars */}
                <div className="flex flex-col gap-5">
                  {SUCCESS_KEYS.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-start p-5 bg-[#F8F8F9] dark:bg-dark-secondary rounded-[10px] border border-[#ececec] dark:border-[#2a2a2a] hover:border-primary transition-colors duration-200 group"
                    >
                      {/* Icon circle */}
                      <div className="w-12 h-12 min-w-[48px] rounded-full bg-white dark:bg-dark border border-[#e4e4e4] dark:border-[#333] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200">
                        {item.icon}
                      </div>
                      <div>
                        <h6 className="font-semibold text-base text-title dark:text-white mb-1">
                          {item.title}
                        </h6>
                        <p className="text-sm leading-relaxed text-paragraph dark:text-white/70">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — Why You Choose Us  (unchanged structure)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="s-pb-100">
        <div className="container-fluid">
          <div className="max-w-xl mx-auto mb-8 md:mb-12 text-center" data-aos="fade-up" data-aos-delay="100">
            <div>
              <img src={like} className="mx-auto size-16" alt="" />
            </div>
            <h3 className="font-medium leading-none mt-4 md:mt-6 text-2xl md:text-3xl">
              Why You Choose Us
            </h3>
            <p className="mt-3">
              Choose us for exceptional quality. We prioritise your satisfaction by offering premium
              products and a seamless experience — from brief to final delivery.
            </p>
          </div>

          <div
            className="max-w-sm sm:max-w-[1720px] mx-auto grid sm:grid-cols-2 md:grid-cols-3 xl:flex lg:justify-between gap-7 flex-wrap lg:flex-nowrap"
            data-aos="fade-up"
            data-aos-delay="103"
          >
            {featureOne.map((item: Feature, index: number) => (
              <div className="p-6 pb-0 rounded-[10px] relative" key={index}>
                <div
                  className={`w-[1px] h-[120px] absolute right-0 top-[30%] ${
                    index === 4 ? '' : 'hidden 2xl:block border-l border-dashed border-primary'
                  }`}
                />
                <img src={item.image} alt="" className="size-12" />
                <h5 className="font-semibold text-xl md:text-2xl mt-3 md:mt-7">{item.title}</h5>
                <p className="mt-2 sm:mt-3">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — Video Banner  (unchanged)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="container-fluid" data-aos="fade-up" data-aos-delay="300">
        <div
          className="bg-overlay before:bg-title before:bg-opacity-20 h-64 sm:h-96 lg:h-[650px] flex items-center justify-center max-w-[1720px] mx-auto"
          style={{ backgroundImage: `url(${bg4})` }}
        >
          <Link
            to="#"
            className="popup-video w-12 sm:w-[70px] h-12 sm:h-[70px] rounded-full bg-white dark:bg-title flex items-center justify-center"
          >
            <svg
              className="fill-current text-title dark:text-white"
              width="15" height="17"
              viewBox="0 0 15 17" fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.58357 0.369445C1.15676 -0.497057 0 0.212792 0 1.95367V14.8006C0 16.5432 1.15676 17.2521 2.58357 16.3864L13.1895 9.94678C14.6168 9.07997 14.6168 7.67561 13.1895 6.80901L2.58357 0.369445Z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — Trusted Partners  (unchanged)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="s-py-100">
        <div className="container-fluid">
          <div className="max-w-xl mx-auto mb-8 md:mb-12 text-center" data-aos="fade-up" data-aos-delay="100">
            <div>
              <img src={hand} className="mx-auto size-16" alt="" />
            </div>
            <h3 className="font-medium leading-none mt-4 md:mt-6 text-2xl md:text-3xl">
              Trusted Partner
            </h3>
            <p className="mt-3">
              Count on our trusted partnerships to deliver excellence. Collaborating with industry
              leaders ensures top-quality products and results.
            </p>
          </div>
          <div data-aos="fade-up" data-aos-delay="300">
            <PartnerOne />
          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}