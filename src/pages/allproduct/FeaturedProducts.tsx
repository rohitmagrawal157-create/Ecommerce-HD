import { useState, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PickItem {
  href: string;
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  label: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TOP_PICKS: PickItem[] = [
  {
    href: 'https://nestasia.in/products/non-stick-triply-induction-safe-honeycomb-dosa-tawa-32cm',
    desktopSrc: '//nestasia.in/cdn/shop/files/Jars_18b98393-caa9-42fe-b124-dc795b8707ea.webp?v=1773897715&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/Jars_18b98393-caa9-42fe-b124-dc795b8707ea.webp?v=1773897715&width=400',
    alt: 'Non-stick Triply Honeycomb Dosa Tawa 32cm',
    label: 'Honeycomb Dosa Tawa',
  },
  {
    href: 'https://nestasia.in/products/tri-ply-hammered-stainless-steel-frying-pan-1000ml',
    desktopSrc: '//nestasia.in/cdn/shop/files/Jars_2_60573fec-0ca3-4ec0-9483-c7fbe2d72ddb.webp?v=1773897715&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/Jars_2_60573fec-0ca3-4ec0-9483-c7fbe2d72ddb.webp?v=1773897715&width=400',
    alt: 'Tri-Ply Hammered Stainless Steel Frying Pan',
    label: 'Hammered Frying Pan',
  },
  {
    href: 'https://nestasia.in/products/pure-brass-embossed-handi-cooking-pot-with-lid-2300ml',
    desktopSrc: '//nestasia.in/cdn/shop/files/Jars_3_790ec13d-b007-4d10-b2ea-836a0e8b2113.webp?v=1773897715&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/Jars_3_790ec13d-b007-4d10-b2ea-836a0e8b2113.webp?v=1773897715&width=400',
    alt: 'Pure Brass Embossed Handi Cooking Pot',
    label: 'Brass Handi Pot',
  },
  {
    href: 'https://nestasia.in/products/glass-cooking-pot',
    desktopSrc: '//nestasia.in/cdn/shop/files/Jars_5_21231abe-d313-4ccf-ac99-fa8700800f9c.webp?v=1773897715&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/Jars_5_21231abe-d313-4ccf-ac99-fa8700800f9c.webp?v=1773897715&width=400',
    alt: 'Glass Cooking Pot',
    label: 'Glass Cooking Pot',
  },
  {
    href: 'https://nestasia.in/products/limonelle-ceramic-cookware-with-lid-3300ml',
    desktopSrc: '//nestasia.in/cdn/shop/files/Jars_4_69ddba3f-f826-4ea2-9964-5ffcbf84cdf8.webp?v=1773897715&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/Jars_4_69ddba3f-f826-4ea2-9964-5ffcbf84cdf8.webp?v=1773897715&width=400',
    alt: 'Limonelle Ceramic Cookware with Lid',
    label: 'Ceramic Cookware',
  },
  {
    href: 'https://nestasia.in/products/groovo-stack-on-storage-container-sage-green-set-of-7',
    desktopSrc: '//nestasia.in/cdn/shop/files/Jars_6_ff0d259c-4218-4aba-a495-37f0b0e4812b.webp?v=1773897716&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/Jars_6_ff0d259c-4218-4aba-a495-37f0b0e4812b.webp?v=1773897716&width=400',
    alt: 'Groovo Stack-On Storage Container Sage Green Set of 7',
    label: 'Stack-On Set ×7',
  },
  {
    href: 'https://nestasia.in/products/sealed-three-compartment-glass-container-lunchbox-1000ml',
    desktopSrc: '//nestasia.in/cdn/shop/files/Jars_7_297fe98e-7924-4f3b-8aaf-8f67967d09a8.webp?v=1773897715&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/Jars_7_297fe98e-7924-4f3b-8aaf-8f67967d09a8.webp?v=1773897715&width=400',
    alt: 'Sealed 3-Compartment Glass Lunchbox 1000ml',
    label: 'Glass Lunchbox',
  },
  {
    href: 'https://nestasia.in/products/leakproof-see-through-air-vent-lid-food-storage-container-set-of-3-350ml-520ml-800ml',
    desktopSrc: '//nestasia.in/cdn/shop/files/82.webp?v=1773897716&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/82.webp?v=1773897716&width=400',
    alt: 'Leakproof Air-Vent Lid Container Set of 3',
    label: 'Air-Vent Set ×3',
  },
  {
    href: 'https://nestasia.in/products/vento-storage-container-with-airtight-silicone-lid-set-of-4-370ml-930ml-2500ml-brown',
    desktopSrc: '//nestasia.in/cdn/shop/files/81.webp?v=1773897715&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/81.webp?v=1773897715&width=400',
    alt: 'Vento Airtight Silicone Lid Containers Set of 4',
    label: 'Vento Airtight ×4',
  },
  {
    href: 'https://nestasia.in/products/nestro-airtight-food-storage-square-container-set-of-5-blue',
    desktopSrc: '//nestasia.in/cdn/shop/files/80.webp?v=1773897715&width=900',
    mobileSrc:  '//nestasia.in/cdn/shop/files/80.webp?v=1773897715&width=400',
    alt: 'Nestro Airtight Square Container Set of 5 Blue',
    label: 'Nestro Square ×5',
  },
];

// ─── Desktop Card ─────────────────────────────────────────────────────────────
function DesktopCard({ item, index }: { item: PickItem; index: number }) {
  const [imgError, setImgError] = useState(false);
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#faf8f5]
                 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      {/* Rank badge */}
      <span
        className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center
                   justify-center text-[11px] font-bold text-white shadow-md select-none"
        style={{ background: 'linear-gradient(135deg,#c49a6c,#a07040)' }}
      >
        {index + 1}
      </span>

      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2">
            <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <picture>
            <source media="(min-width: 768px)" srcSet={`https:${item.desktopSrc}`} />
            <img
              loading="lazy"
              src={`https:${item.mobileSrc}`}
              alt={item.alt}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </picture>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/55
                        via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-[12px] font-semibold leading-tight line-clamp-2">
            {item.label}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="px-3 py-[10px]">
        <p className="text-[12px] font-medium text-gray-700 leading-snug line-clamp-2">{item.label}</p>
      </div>
    </a>
  );
}

// ─── Mobile Card  ─────────────────────────────────────────────────────────────
// Width = exactly 1/5 of viewport so 5 cards fill the screen perfectly — no scrolling needed.
function MobileCard({ item, index }: { item: PickItem; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      className="relative flex flex-col rounded-xl overflow-hidden bg-[#faf8f5] shadow-sm
                 active:scale-95 transition-transform duration-150 flex-shrink-0"
      // calc: (100vw - total horizontal padding 24px - 4 gaps×8px) / 5
      style={{ width: 'calc((100vw - 24px - 32px) / 5)' }}
    >
      {/* Tiny rank badge */}
      <span
        className="absolute top-[3px] left-[3px] z-10 w-[16px] h-[16px] rounded-full
                   flex items-center justify-center text-[8px] font-bold text-white shadow select-none"
        style={{ background: 'linear-gradient(135deg,#c49a6c,#a07040)' }}
      >
        {index + 1}
      </span>

      {/* Square image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            loading="lazy"
            src={`https:${item.mobileSrc}`}
            alt={item.alt}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Label — very compact */}
      <div className="px-[4px] py-[4px] bg-white">
        <p
          className="font-medium text-gray-700 leading-tight line-clamp-2 text-center"
          style={{ fontSize: '8px' }}
        >
          {item.label}
        </p>
      </div>
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TopPicks() {
  const row1 = TOP_PICKS.slice(0, 5);  // items 1–5
  const row2 = TOP_PICKS.slice(5, 10); // items 6–10
  const _scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full bg-white py-8 md:py-16">
      <div className="max-w-[1280px] mx-auto">

        {/* ── Heading ───────────────────────────────────────────────────── */}
        <div className="px-3 md:px-8 mb-5 md:mb-10">
          <a
            href="https://nestasia.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 no-underline"
          >
            <span className="hidden sm:block flex-1 h-px bg-gradient-to-r from-transparent to-[#c49a6c]/40" />
            <h2
              className="text-center text-[18px] md:text-3xl lg:text-4xl font-bold tracking-tight
                         text-[#1e1e2a] group-hover:text-[#c49a6c] transition-colors duration-200 whitespace-nowrap"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Top 10 Must Haves on Nestasia
            </h2>
            <span className="hidden sm:block flex-1 h-px bg-gradient-to-l from-transparent to-[#c49a6c]/40" />
          </a>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MOBILE LAYOUT  — visible only below md (768px)
            ┌──────────────────────────────────────────────────────────┐
            │  [1]  [2]  [3]  [4]  [5]   ← Row 1 (items 1-5)         │
            │  [6]  [7]  [8]  [9]  [10]  ← Row 2 (items 6-10)        │
            └──────────────────────────────────────────────────────────┘
            Cards sized so exactly 5 fill the screen width.
            gap-2 = 8px between cards, px-3 = 12px outer padding each side.
        ══════════════════════════════════════════════════════════════ */}
        <div className="block md:hidden px-3">

          {/* Row 1 */}
          <div className="flex gap-2 mb-2">
            {row1.map((item, i) => (
              <MobileCard key={item.href} item={item} index={i} />
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex gap-2">
            {row2.map((item, i) => (
              <MobileCard key={item.href} item={item} index={i + 5} />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="flex justify-center mt-5">
            <a
              href="https://nestasia.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-semibold
                         border border-[#c49a6c] text-[#c49a6c] hover:bg-[#c49a6c] hover:text-white
                         transition-all duration-200 active:scale-95"
            >
              View All Products
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            DESKTOP LAYOUT — visible from md (768px) upward
            5 columns × 2 rows, static grid, all 10 cards at once.
        ══════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block px-5 lg:px-8">
          <div className="grid grid-cols-5 gap-4 lg:gap-6">
            {TOP_PICKS.map((item, index) => (
              <DesktopCard key={item.href} item={item} index={index} />
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="flex justify-center mt-10 md:mt-14">
            <a
              href="https://nestasia.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-[14px] font-semibold
                         border-2 border-[#c49a6c] text-[#c49a6c] hover:bg-[#c49a6c] hover:text-white
                         transition-all duration-200 active:scale-95"
            >
              Shop All Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}