// FeaturedProducts.tsx
import { Link } from 'react-router-dom';
import { LuHeart, LuEye } from 'react-icons/lu';
import { RiShoppingBag2Line } from 'react-icons/ri';
import { GoStarFill } from 'react-icons/go';
// import bedIcon from '../assets/img/svg/bed.svg';
 // adjust path to your actual icon

// Sample product data – replace with your own
interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
}

const productList: Product[] = [
  {
    id: 1,
    name: "Premium Canvas Print – Abstract Waves",
    price: "$129.99",
    image: "https://imgs.search.brave.com/xFTkEltVU-Fcai1S5B6E96-71Q6WDcSLGbEv3mJDxsc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDIzLzEw/LzM1MTU4NDYwMC9R/US9HTS9WWC8xOTc4/OTQwMDkvcHJpbnRl/ZC1jYW52YXMtNTAw/eDUwMC5qcGc",
  },
  
  // {
  //   id: 3,
  //   name: "Temple Art – Handmade Painting",
  //   price: "$149.99",
  //   image: "https://imgs.search.brave.com/iSJDT4eaWXl9svug-yyvq083ZbpszVix4vJplcwZp_I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvaG9tZS10ZW1w/bGUveS9qL3MvMzUt/NjAtMzYtc2h0NC1z/aGl2b2phLTEzMC1v/cmlnaW5hbC1pbWFo/amRmOWF1eHp3ZGIy/LmpwZWc_cT03MA",
  // },
  {
    id: 4,
    name: "Portrait Sketch – Charcoal Drawing",
    price: "$89.99",
    image: "https://imgs.search.brave.com/pO3_geDNJr-PHRVvzlSlXdVEI8SCMrHvO8C_TPKAtpE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rb3Rh/cnQuaW4vY2RuL3No/b3AvZmlsZXMvZWZm/ZWN0MDFfNS5qcGc_/dj0xNzIxMjU0NDA2/JndpZHRoPTUzMw",
  },
  {
    id: 2,
    name: "Customizable Wood Blind",
    price: "$159.99",
    image: "http://imgs.search.brave.com/8pvxihMVVfCFrOag3N0XXUlhAiCEuXmOgqEdPrDfxjA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudGhkc3RhdGlj/LmNvbS9wcm9kdWN0/SW1hZ2VzLzc2NWIy/ZTNhLTcwYjctNGVk/ZC1hNTY2LWNmYjBi/MjY5MWI3Yy9zdm4v/YXNzb3J0ZWQtY29s/b3JzLWJhbGktd29v/ZC1ibGluZHMtNTM0/ODk4LTY0XzYwMC5q/cGc",
  },
  {
    id: 3,
    name: "Neon Signage – Custom LED",
    price: "$249.99",
    image: "https://imgs.search.brave.com/HmDJxfWjB5hRZqdcv4eGpsgJOCgBDwZ33VWtzjD2DAU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NjUyMDY1OTU2NDAt/NmNmZDkwZTBhZTA5/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZhdXRv/PWZvcm1hdCZmaXQ9/Y3JvcCZpeGxpYj1y/Yi00LjEuMCZpeGlk/PU0zd3hNakEzZkRC/OE1IeHpaV0Z5WTJo/OE1UaDhmRzVsYjI0/bE1qQnphV2R1ZkdW/dWZEQjhmREI4Zkh3/dw",
  },
  {
    id: 5,
    name: "Temple Art – Handmade Painting",
    price: "$149.99",
    image: "https://imgs.search.brave.com/iSJDT4eaWXl9svug-yyvq083ZbpszVix4vJplcwZp_I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvaG9tZS10ZW1w/bGUveS9qL3MvMzUt/NjAtMzYtc2h0NC1z/aGl2b2phLTEzMC1v/cmlnaW5hbC1pbWFo/amRmOWF1eHp3ZGIy/LmpwZWc_cT03MA",
  },
  
  {
    id: 6,
    name: "Wall Mural – Large Format",
    price: "$199.99",
    image: "https://imgs.search.brave.com/WRQWwv92NnMS5xJ59lU6PMBKvVKPoPoAHRkS1FId_ZA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/OTE3LURaOGU3TEwu/anBn",
  },
];

export default function ProductCollection() {
  return (
    <div className="s-py-100-50" data-aos="fade-up">
      <div className="container-fluid">
        
        {/* Header Section */}
        <div className="max-w-xl mx-auto mb-8 md:mb-12 text-center">
          <div>
            <img 
              // src={bedIcon} x
              className="mx-auto w-14 sm:w-24" 
              alt="Featured Products" 
            />
          </div>
          <h3 className="leading-none mt-4 md:mt-6 text-2xl md:text-3xl">
            Featured Products
          </h3>
          <p className="mt-3">
            Discover our handpicked selection of standout products. 
            Elevate your lifestyle with our top picks that combine quality, style, and innovation.
          </p>
        </div>

        {/* Main Products Container */}
        <div 
          className="max-w-[1720px] mx-auto flex gap-5 sm:gap-8 flex-col lg:flex-row" 
          data-aos="fade-up" 
          data-aos-delay="100"
        >
          
          {/* Left Side - 2x2 Grid (4 Products) */}
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:max-w-[766px] w-full">
            {productList.slice(0, 4).map((item) => (
              <div className="group flex flex-col" key={item.id}>
                <div className="relative overflow-hidden rounded-2xl">
                  <Link to={`/product-details/${item.id}`}>
                    <img 
                      className="w-full sm:max-h-[340px] object-cover transform group-hover:scale-110 duration-500 transition-transform" 
                      src={item.image} 
                      alt={item.name}
                    />
                  </Link>

                  {/* Hover Action Buttons */}
                  <div className="absolute z-10 top-1/2 right-4 transform -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1/2 flex flex-col items-end gap-3">
                    <Link 
                      to="#" 
                      className="bg-white dark:bg-navy dark:text-white flex items-center gap-3 px-4 py-2 text-sm rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
                    >
                      <LuHeart className="h-4 w-4" />
                      <span>Wishlist</span>
                    </Link>
                    <Link 
                      to="#" 
                      className="bg-white dark:bg-navy dark:text-white flex items-center gap-3 px-4 py-2 text-sm rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
                    >
                      <RiShoppingBag2Line className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </Link>
                    <button 
                      className="bg-white dark:bg-navy dark:text-white flex items-center gap-3 px-4 py-2 text-sm rounded-full shadow-lg hover:bg-primary hover:text-white transition-all quick-view"
                    >
                      <LuEye className="h-4 w-4" />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="lg:pt-6 pt-5 flex gap-3 md:gap-4 flex-col">
                  <h4 className="font-medium text-xl text-primary">
                    {item.price} 
                    <span className="text-title/50 line-through pl-3 text-base">$189.99</span>
                  </h4>
                  <h5 className="font-medium text-[19px] leading-tight dark:text-white">
                    <Link 
                      to={`/product-details/${item.id}`} 
                      className="hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  </h5>
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <GoStarFill key={i} className="text-yellow-500 size-4" />
                    ))}
                    <GoStarFill className="text-slate-300 size-4" />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(1,230)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - 2 Tall Products */}
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 lg:max-w-[925px] w-full">
            {productList.slice(4, 6).map((item) => (
              <div className="group flex flex-col" key={item.id}>
                <div className="relative overflow-hidden flex-1 rounded-2xl">
                  <Link to={`/product-details/${item.id}`}>
                    <img 
                      className="w-full h-full object-cover transform group-hover:scale-110 duration-500 transition-transform" 
                      src={item.image} 
                      alt={item.name}
                    />
                  </Link>

                  {/* Hover Action Buttons */}
                  <div className="absolute z-10 top-1/2 right-4 transform -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1/2 flex flex-col items-end gap-3">
                    <Link 
                      to="#" 
                      className="bg-white dark:bg-navy dark:text-white flex items-center gap-3 px-4 py-2 text-sm rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
                    >
                      <LuHeart className="h-4 w-4" />
                      <span>Wishlist</span>
                    </Link>
                    <Link 
                      to="#" 
                      className="bg-white dark:bg-navy dark:text-white flex items-center gap-3 px-4 py-2 text-sm rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
                    >
                      <RiShoppingBag2Line className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </Link>
                    <button 
                      className="bg-white dark:bg-navy dark:text-white flex items-center gap-3 px-4 py-2 text-sm rounded-full shadow-lg hover:bg-primary hover:text-white transition-all quick-view"
                    >
                      <LuEye className="h-4 w-4" />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="lg:pt-6 pt-5 flex gap-3 md:gap-4 flex-col">
                  <h4 className="font-medium text-xl text-primary">
                    {item.price} 
                    <span className="text-title/50 line-through pl-3 text-base">$189.99</span>
                  </h4>
                  <h5 className="font-medium text-[19px] leading-tight dark:text-white">
                    <Link 
                      to={`/product-details/${item.id}`} 
                      className="hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  </h5>
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <GoStarFill key={i} className="text-yellow-500 size-4" />
                    ))}
                    <GoStarFill className="text-slate-300 size-4" />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(1,230)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}