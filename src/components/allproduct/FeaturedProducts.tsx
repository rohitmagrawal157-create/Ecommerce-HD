import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PickItem {
  href: string;
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  label: string;
}

// ─── Updated Data – Canvas & Art Collection (8 items for 2x4 layout) ───────────
const TOP_PICKS: PickItem[] = [
  {
    href: '/product/portrait-frames',
    desktopSrc: 'https://imgs.search.brave.com/pO3_geDNJr-PHRVvzlSlXdVEI8SCMrHvO8C_TPKAtpE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rb3Rh/cnQuaW4vY2RuL3No/b3AvZmlsZXMvZWZm/ZWN0MDFfNS5qcGc_/dj0xNzIxMjU0NDA2/JndpZHRoPTUzMw',
    mobileSrc: 'https://imgs.search.brave.com/pO3_geDNJr-PHRVvzlSlXdVEI8SCMrHvO8C_TPKAtpE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rb3Rh/cnQuaW4vY2RuL3No/b3AvZmlsZXMvZWZm/ZWN0MDFfNS5qcGc_/dj0xNzIxMjU0NDA2/JndpZHRoPTUzMw',
    alt: 'Elegant Portrait Frames',
    label: 'Portrait Frames',
  },
  {
    href: '/product/canvas-painting',
    desktopSrc: 'https://imgs.search.brave.com/xFTkEltVU-Fcai1S5B6E96-71Q6WDcSLGbEv3mJDxsc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDIzLzEw/LzM1MTU4NDYwMC9R/US9HTS9WWC8xOTc4/OTQwMDkvcHJpbnRl/ZC1jYW52YXMtNTAw/eDUwMC5qcGc',
    mobileSrc: 'https://imgs.search.brave.com/xFTkEltVU-Fcai1S5B6E96-71Q6WDcSLGbEv3mJDxsc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDIzLzEw/LzM1MTU4NDYwMC9R/US9HTS9WWC8xOTc4/OTQwMDkvcHJpbnRl/ZC1jYW52YXMtNTAw/eDUwMC5qcGc',
    alt: 'Handmade Canvas Painting',
    label: 'Canvas Painting',
  },
  {
    href: '/product/temple-art',
    desktopSrc: 'https://imgs.search.brave.com/iSJDT4eaWXl9svug-yyvq083ZbpszVix4vJplcwZp_I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvaG9tZS10ZW1w/bGUveS9qL3MvMzUt/NjAtMzYtc2h0NC1z/aGl2b2phLTEzMC1v/cmlnaW5hbC1pbWFo/amRmOWF1eHp3ZGIy/LmpwZWc_cT03MA',
    mobileSrc: 'https://imgs.search.brave.com/iSJDT4eaWXl9svug-yyvq083ZbpszVix4vJplcwZp_I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvaG9tZS10ZW1w/bGUveS9qL3MvMzUt/NjAtMzYtc2h0NC1z/aGl2b2phLTEzMC1v/cmlnaW5hbC1pbWFo/amRmOWF1eHp3ZGIy/LmpwZWc_cT03MA',
    alt: 'Temple Art Print',
    label: 'Temple Art',
  },
  {
    href: '/product/wall-murals',
    desktopSrc: 'https://imgs.search.brave.com/WRQWwv92NnMS5xJ59lU6PMBKvVKPoPoAHRkS1FId_ZA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/OTE3LURaOGU3TEwu/anBn',
    mobileSrc: 'https://imgs.search.brave.com/WRQWwv92NnMS5xJ59lU6PMBKvVKPoPoAHRkS1FId_ZA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/OTE3LURaOGU3TEwu/anBn',
    alt: 'Large Wall Murals',
    label: 'Wall Murals',
  },
  {
    href: '/product/wallpapers',
    desktopSrc: 'https://imgs.search.brave.com/FaPylEVXEQAg2Jj09k4z7mjQwyEC4ANjHucK95wN9Xs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saWZl/bmNvbG9ycy5pbi9j/ZG4vc2hvcC9maWxl/cy9LdXN1bS1JbmRp/YW4tRmxvcmFsLUpo/YXJva2hhLTExMTEu/d2VicD92PTE3NTM2/MjE3MDAmd2lkdGg9/MzIw',
    mobileSrc: 'https://imgs.search.brave.com/FaPylEVXEQAg2Jj09k4z7mjQwyEC4ANjHucK95wN9Xs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saWZl/bmNvbG9ycy5pbi9j/ZG4vc2hvcC9maWxl/cy9LdXN1bS1JbmRp/YW4tRmxvcmFsLUpo/YXJva2hhLTExMTEu/d2VicD92PTE3NTM2/MjE3MDAmd2lkdGg9/MzIw',
    alt: 'Modern Wallpapers',
    label: 'Wallpapers',
  },
  {
    href: '/product/customize-blind',
    desktopSrc: 'https://imgs.search.brave.com/UMY9_2-06fuMpicI-QsTkC8Ofik_dK-K95NZBmJVsF0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YmxpbmRzdGVyLmNv/bS9jZG4tY2dpL2lt/YWdlL2Zvcm1hdD1h/dXRvLHdpZHRoPTM4/NDAvc2l0ZS91cGxv/YWRzL2NhdGVnb3Jp/ZXMvd29vZC1ibGlu/ZHMvSE9NRVBBR0Ut/Q0FURU9HUlktV09P/RC1ST0xMT1ZFUi5q/cGc',
    mobileSrc: 'https://imgs.search.brave.com/UMY9_2-06fuMpicI-QsTkC8Ofik_dK-K95NZBmJVsF0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YmxpbmRzdGVyLmNv/bS9jZG4tY2dpL2lt/YWdlL2Zvcm1hdD1h/dXRvLHdpZHRoPTM4/NDAvc2l0ZS91cGxv/YWRzL2NhdGVnb3Jp/ZXMvd29vZC1ibGlu/ZHMvSE9NRVBBR0Ut/Q0FURU9HUlktV09P/RC1ST0xMT1ZFUi5q/cGc',
    alt: 'Customizable Wood Blinds',
    label: 'Customize Blind',
  },
  {
    href: '/product/neon-signage',
    desktopSrc: 'https://imgs.search.brave.com/HmDJxfWjB5hRZqdcv4eGpsgJOCgBDwZ33VWtzjD2DAU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NjUyMDY1OTU2NDAt/NmNmZDkwZTBhZTA5/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZhdXRv/PWZvcm1hdCZmaXQ9/Y3JvcCZpeGxpYj1y/Yi00LjEuMCZpeGlk/PU0zd3hNakEzZkRC/OE1IeHpaV0Z5WTJo/OE1UaDhmRzVsYjI0/bE1qQnphV2R1ZkdW/dWZEQjhmREI4Zkh3/dw',
    mobileSrc: 'https://imgs.search.brave.com/HmDJxfWjB5hRZqdcv4eGpsgJOCgBDwZ33VWtzjD2DAU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NjUyMDY1OTU2NDAt/NmNmZDkwZTBhZTA5/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZhdXRv/PWZvcm1hdCZmaXQ9/Y3JvcCZpeGxpYj1y/Yi00LjEuMCZpeGlk/PU0zd3hNakEzZkRC/OE1IeHpaV0Z5WTJo/OE1UaDhmRzVsYjI0/bE1qQnphV2R1ZkdW/dWZEQjhmREI4Zkh3/dw',
    alt: 'Custom Neon Signs',
    label: 'Neon Signage',
  },
  {
    href: '/product/back-lit',
    desktopSrc: 'https://imgs.search.brave.com/hFfkLA9JoRsvLL0HcTsKldXpRoKuGwhQsggD2SzBHLo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2FtZWxiYWNrZGlz/cGxheXMuY29tL3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDIzLzA3/L1ZlY3Rvci1GcmFt/ZS1Fc3NlbnRpYWwt/MDEtTGVmdC1EYXJr/LWxpZ2h0aW5nLnBu/Zw',
    mobileSrc: 'https://imgs.search.brave.com/hFfkLA9JoRsvLL0HcTsKldXpRoKuGwhQsggD2SzBHLo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2FtZWxiYWNrZGlz/cGxheXMuY29tL3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDIzLzA3/L1ZlY3Rvci1GcmFt/ZS1Fc3NlbnRpYWwt/MDEtTGVmdC1EYXJr/LWxpZ2h0aW5nLnBu/Zw',
    alt: 'Backlit LED Art',
    label: 'Back Lit',
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
      <span
        className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full flex items-center justify-center 
                   text-xs font-bold text-white shadow-md select-none"
        style={{ background: 'linear-gradient(135deg,#c49a6c,#a07040)' }}
      >
        {index + 1}
      </span>

      <div className="relative w-full aspect-square overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <span className="text-xs">Image not available</span>
          </div>
        ) : (
          <img
            loading="lazy"
            src={item.desktopSrc}
            alt={item.alt}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-sm font-semibold leading-tight">
            {item.label}
          </span>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm font-medium text-gray-700 line-clamp-2">{item.label}</p>
      </div>
    </a>
  );
}

// ─── Main Component – 2 Rows × 4 Boxes ───────────────────────────────────────
export default function TopPicks() {
  // Split into 2 rows of 4 items each
  const row1 = TOP_PICKS.slice(0, 4);
  const row2 = TOP_PICKS.slice(4, 8);

  return (
    <section className="w-full bg-white py-10 md:py-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">

        {/* Heading */}
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1e1e2a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Top 8 Art & Canvas Picks
          </h2>
          <p className="mt-3 text-gray-600">Handpicked premium collection for your space</p>
        </div>

        {/* Desktop Layout - 2 Rows × 4 Columns */}
        <div className="hidden md:grid grid-cols-4 gap-6 lg:gap-8">
          {/* First Row - 4 Boxes */}
          {row1.map((item, index) => (
            <DesktopCard key={item.href} item={item} index={index} />
          ))}

          {/* Second Row - 4 Boxes */}
          {row2.map((item, index) => (
            <DesktopCard key={item.href} item={item} index={index + 4} />
          ))}
        </div>

        {/* Mobile Layout - Horizontal Scroll (2 rows) */}
        <div className="block md:hidden space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {row1.map((item, index) => (
              <div key={item.href} className="flex-shrink-0 w-[72%] snap-center">
                <DesktopCard item={item} index={index} />
              </div>
            ))}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {row2.map((item, index) => (
              <div key={item.href} className="flex-shrink-0 w-[72%] snap-center">
                <DesktopCard item={item} index={index + 4} />
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <a
            href="https://nestasia.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-semibold
                       border-2 border-[#c49a6c] text-[#c49a6c] hover:bg-[#c49a6c] hover:text-white
                       transition-all duration-300 active:scale-95"
          >
            Shop All Products
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}