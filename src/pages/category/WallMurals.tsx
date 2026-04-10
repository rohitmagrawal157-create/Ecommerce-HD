// src/pages/category/WallMurals.tsx
// Route: /category/wall-murals
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import bg from '../../assets/img/shortcode/breadcumb.jpg'
import cardImg from '../../assets/img/thumb/shop-card.jpg'
import SelectOne from '../../components/product/select-one'
import NavbarOne from '../../components/navbar/navbar-one'
import LayoutOne from '../../components/product/layout-one'
import FooterOne from '../../components/footer/footer-one'
import ScrollToTop from '../../components/scroll-to-top'
import MultiRangeSlider from 'multi-range-slider-react'
import Aos from 'aos'
import { FourSquare } from 'react-loading-indicators'
import { CATEGORIES } from '../../data/categoryData'

const ACCENT   = '#2E8B57'
const PER_PAGE = 9
const cfg      = CATEGORIES['wall-murals']

export default function WallMurals() {
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(500)
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [sort,     setSort]     = useState('default')

  useEffect(() => {
    Aos.init()
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    let list = cfg.products.filter(p => {
      const price = parseFloat(p.price.replace('$', ''))
      return price >= minValue && (maxValue === 0 || price <= maxValue)
    })
    if (sort === 'price-asc')  list = [...list].sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')))
    if (sort === 'price-desc') list = [...list].sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')))
    return list
  }, [minValue, maxValue, sort])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <>
      <NavbarOne />

      {/* ── Hero Breadcrumb ── */}
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="text-center w-full">
          <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">
            Wall Murals
          </h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li><Link to="/shop-v2">Shop</Link></li>
            <li>/</li>
            <li className="text-primary">Wall Murals</li>
          </ul>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="s-py-100">
        <div className="container">
          <div className="max-w-[1477px] mx-auto flex items-start justify-between gap-8 md:gap-10 flex-col lg:flex-row">

            {/* Sidebar */}
            <div
              className="grid gap-[15px] lg:max-w-[300px] w-full sm:grid-cols-2 lg:grid-cols-1"
              data-aos="fade-up" data-aos-delay="100"
            >
              {/* Categories */}
              <div className="bg-[#F8F8F9] dark:bg-dark-secondary p-5 sm:p-[30px]">
                <h4 className="font-medium leading-none text-xl sm:text-2xl mb-5 sm:mb-6">Categories</h4>
                <div className="grid gap-5">
                                    <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="checkbox" name="categories" />
                    <span className="w-4 h-4 rounded-[5px] border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="9" height="8" viewBox="0 0 9 8" fill="none">
                        <path d="M3.05203 7.04122C2.87283 7.04122 2.69433 6.97322 2.5562 6.83864L0.532492 4.8553C0.253409 4.58189 0.249159 4.13351 0.522576 3.85372C0.796701 3.57393 1.24578 3.57039 1.52416 3.84309L3.05203 5.34122L7.61512 0.868804C7.89491 0.595387 8.34328 0.59822 8.6167 0.87872C8.89082 1.1578 8.88657 1.60689 8.60749 1.8803L3.54787 6.83864C3.40974 6.97322 3.23124 7.04122 3.05203 7.04122Z" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Nature</span>
                  </label>
                  <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="checkbox" name="categories" />
                    <span className="w-4 h-4 rounded-[5px] border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="9" height="8" viewBox="0 0 9 8" fill="none">
                        <path d="M3.05203 7.04122C2.87283 7.04122 2.69433 6.97322 2.5562 6.83864L0.532492 4.8553C0.253409 4.58189 0.249159 4.13351 0.522576 3.85372C0.796701 3.57393 1.24578 3.57039 1.52416 3.84309L3.05203 5.34122L7.61512 0.868804C7.89491 0.595387 8.34328 0.59822 8.6167 0.87872C8.89082 1.1578 8.88657 1.60689 8.60749 1.8803L3.54787 6.83864C3.40974 6.97322 3.23124 7.04122 3.05203 7.04122Z" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Urban</span>
                  </label>
                  <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="checkbox" name="categories" />
                    <span className="w-4 h-4 rounded-[5px] border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="9" height="8" viewBox="0 0 9 8" fill="none">
                        <path d="M3.05203 7.04122C2.87283 7.04122 2.69433 6.97322 2.5562 6.83864L0.532492 4.8553C0.253409 4.58189 0.249159 4.13351 0.522576 3.85372C0.796701 3.57393 1.24578 3.57039 1.52416 3.84309L3.05203 5.34122L7.61512 0.868804C7.89491 0.595387 8.34328 0.59822 8.6167 0.87872C8.89082 1.1578 8.88657 1.60689 8.60749 1.8803L3.54787 6.83864C3.40974 6.97322 3.23124 7.04122 3.05203 7.04122Z" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Abstract</span>
                  </label>
                  <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="checkbox" name="categories" />
                    <span className="w-4 h-4 rounded-[5px] border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="9" height="8" viewBox="0 0 9 8" fill="none">
                        <path d="M3.05203 7.04122C2.87283 7.04122 2.69433 6.97322 2.5562 6.83864L0.532492 4.8553C0.253409 4.58189 0.249159 4.13351 0.522576 3.85372C0.796701 3.57393 1.24578 3.57039 1.52416 3.84309L3.05203 5.34122L7.61512 0.868804C7.89491 0.595387 8.34328 0.59822 8.6167 0.87872C8.89082 1.1578 8.88657 1.60689 8.60749 1.8803L3.54787 6.83864C3.40974 6.97322 3.23124 7.04122 3.05203 7.04122Z" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Tropical</span>
                  </label>
                  <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="checkbox" name="categories" />
                    <span className="w-4 h-4 rounded-[5px] border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="9" height="8" viewBox="0 0 9 8" fill="none">
                        <path d="M3.05203 7.04122C2.87283 7.04122 2.69433 6.97322 2.5562 6.83864L0.532492 4.8553C0.253409 4.58189 0.249159 4.13351 0.522576 3.85372C0.796701 3.57393 1.24578 3.57039 1.52416 3.84309L3.05203 5.34122L7.61512 0.868804C7.89491 0.595387 8.34328 0.59822 8.6167 0.87872C8.89082 1.1578 8.88657 1.60689 8.60749 1.8803L3.54787 6.83864C3.40974 6.97322 3.23124 7.04122 3.05203 7.04122Z" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Galaxy</span>
                  </label>
                  <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="checkbox" name="categories" />
                    <span className="w-4 h-4 rounded-[5px] border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="9" height="8" viewBox="0 0 9 8" fill="none">
                        <path d="M3.05203 7.04122C2.87283 7.04122 2.69433 6.97322 2.5562 6.83864L0.532492 4.8553C0.253409 4.58189 0.249159 4.13351 0.522576 3.85372C0.796701 3.57393 1.24578 3.57039 1.52416 3.84309L3.05203 5.34122L7.61512 0.868804C7.89491 0.595387 8.34328 0.59822 8.6167 0.87872C8.89082 1.1578 8.88657 1.60689 8.60749 1.8803L3.54787 6.83864C3.40974 6.97322 3.23124 7.04122 3.05203 7.04122Z" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Vintage</span>
                  </label>
                </div>
              </div>

              {/* Item Type */}
              <div className="bg-[#F8F8F9] dark:bg-dark-secondary p-5 sm:p-[30px]">
                <h4 className="font-medium leading-none text-xl sm:text-2xl mb-5 sm:mb-6">Item Type</h4>
                <div className="grid gap-5">
                                    <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="radio" name="item-type" />
                    <span className="w-[18px] h-[18px] rounded-full border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <rect width="10" height="10" rx="5" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Peel & Stick</span>
                  </label>
                  <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="radio" name="item-type" />
                    <span className="w-[18px] h-[18px] rounded-full border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <rect width="10" height="10" rx="5" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Traditional</span>
                  </label>
                  <label className="categoryies-iteem flex items-center gap-[10px]">
                    <input className="appearance-none hidden" type="radio" name="item-type" />
                    <span className="w-[18px] h-[18px] rounded-full border border-title dark:border-white flex items-center justify-center duration-300">
                      <svg className="duration-300 opacity-0" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <rect width="10" height="10" rx="5" fill="#2E8B57" />
                      </svg>
                    </span>
                    <span className="text-title dark:text-white block sm:leading-none transform translate-y-[1px] duration-300 select-none">Removable</span>
                  </label>
                </div>
              </div>

              {/* Brand */}
              <div className="bg-[#F8F8F9] dark:bg-dark-secondary p-5 sm:p-[30px]">
                <h4 className="font-medium leading-none text-xl sm:text-2xl mb-5 sm:mb-6">Choose Brand</h4>
                <SelectOne />
              </div>

              {/* Price */}
              <div className="bg-[#F8F8F9] dark:bg-dark-secondary p-5 sm:p-[30px]">
                <h4 className="font-medium leading-none text-xl sm:text-2xl mb-5 sm:mb-6">Price Range</h4>
                <div className="price-filter">
                  <div id="slider-container">
                    <MultiRangeSlider
                      ruler={false} label={false}
                      onInput={(e) => { setMinValue(e.minValue); setMaxValue(e.maxValue); setPage(1) }}
                    />
                  </div>
                  <div className="price-filter-content">
                    <div className="flex items-center gap-1">
                      <span className="text-[15px] leading-none">Price:</span>
                      <input
                        className="text-[15px] text-paragraph placeholder:text-paragraph dark:text-white-light dark:placeholder:text-white-light leading-none bg-transparent focus:border-none outline-none"
                        type="text" readOnly
                        placeholder={`$${minValue} - $${maxValue}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="bg-[#F8F8F9] dark:bg-dark-secondary p-5 sm:p-[30px]">
                <h4 className="font-medium leading-none text-xl sm:text-2xl mb-5 sm:mb-6">Sort By</h4>
                <select
                  value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-secondary text-title dark:text-white px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="default">Default Sorting</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
              </div>

              <Link to="/shop-v1" className="hidden lg:block">
                <img className="w-full" src={cardImg} alt="shop-card" />
              </Link>
            </div>

            {/* Product Grid */}
            <div className="lg:max-w-[1100px] w-full" data-aos="fade-up" data-aos-delay="300">

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{' '}
                  <strong className="text-title dark:text-white">{paginated.length}</strong>
                  {' '}of{' '}
                  <strong className="text-title dark:text-white">{filtered.length}</strong>
                  {' '}products
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <FourSquare color={ACCENT} size="medium" />
                </div>
              ) : paginated.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-title dark:text-white text-lg font-medium mb-2">No products found</p>
                  <p className="text-gray-500 text-sm">Try adjusting the price range or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-8">
                  {paginated.map((item) => (
                    <LayoutOne item={item} key={item.id} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 md:mt-12 flex items-center justify-center gap-[10px]">
                  <button
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    disabled={page === 1}
                    className="text-title dark:text-white text-xl disabled:opacity-30 hover:opacity-70 transition-opacity"
                  >
                    <span className="lnr lnr-arrow-left" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center leading-none text-base sm:text-lg font-medium transition-all duration-300"
                      style={{
                        backgroundColor: page === p ? ACCENT : 'transparent',
                        color:           page === p ? '#ffffff' : undefined,
                        border:          `1px solid ${page === p ? ACCENT : '#e5e7eb'}`,
                      }}
                    >
                      {String(p).padStart(2, '0')}
                    </button>
                  ))}

                  <button
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    disabled={page === totalPages}
                    className="text-title dark:text-white text-xl disabled:opacity-30 hover:opacity-70 transition-opacity"
                  >
                    <span className="lnr lnr-arrow-right" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  )
}