import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavbarOne from '../../components/navbar/navbar-one';
import bg from '../../assets/img/shortcode/breadcumb.jpg';
import AccountTab from '../../components/account/account-tab';
import FooterOne from '../../components/footer/footer-one';
import ScrollToTop from '../../components/scroll-to-top';
import { fetchMyOrders, fetchOrderDetails } from '../../api/orders.api';
import Aos from 'aos';
import {
  LuPackage, LuCircle, LuClock,
  LuSearch, LuEye, LuDownload, LuRefreshCw, LuFilter, LuLoader
} from 'react-icons/lu';

const BRAND = 'linear-gradient(90deg,#5B4FBE,#E8314A,#F97316)';
const CTA   = 'linear-gradient(90deg,#2563EB,#06B6D4,#22C55E)';

function GradText({ children, grad = BRAND, className = '' }: {
  children: React.ReactNode; grad?: string; className?: string
}) {
  return (
    <span className={className} style={{
      background: grad,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
}

interface CartData { 
  image: string; 
  tag: string; 
  name: string; 
  price: string; 
  status: string;
  orderId?: string;
  createdAt?: string;
  fullOrder?: any;
}

const STATUS_CONFIG = {
  Completed: { 
    icon: <LuCircle size={12}/>, 
    bg: '#f0fdf4', 
    text: '#16a34a', 
    border: '#bbf7d0' 
  },
  Pending:   { 
    icon: <LuClock size={12}/>, 
    bg: '#fff7ed', 
    text: '#ea580c', 
    border: '#fed7aa' 
  },
  Confirmed: { 
    icon: <LuClock size={12}/>, 
    bg: '#fff7ed', 
    text: '#ea580c', 
    border: '#fed7aa' 
  },
  Shipped:   { 
    icon: <LuClock size={12}/>, 
    bg: '#fef3f2', 
    text: '#f59e0b', 
    border: '#fcd34d' 
  },
  Cancelled:    { 
    icon: <LuCircle size={12}/>, 
    bg: '#fef2f2', 
    text: '#dc2626', 
    border: '#fecaca' 
  },
};

const STATS = [
  { label: 'Total Orders', key: 'all',       icon: <LuPackage size={18}/>, grad: BRAND },
  { label: 'Completed',    key: 'Completed', icon: <LuCircle size={18}/>, grad: CTA   },
  { label: 'Pending',      key: 'Pending',   icon: <LuClock size={18}/>, grad: 'linear-gradient(90deg,#F97316,#EC991D)' },
  { label: 'Cancelled',    key: 'Cancel',    icon: <LuCircle size={18}/>, grad: 'linear-gradient(90deg,#E8314A,#dc2626)' },
];

export default function OrderHistory() {
  useEffect(() => { 
    Aos.init({ once: true, duration: 600 }) 
  }, []);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchMyOrders();
      
      // Map API response to CartData format
      const mappedOrders: CartData[] = data.map((order) => {
        const firstProduct = order.lines?.[0];
        const statusMap: Record<string, string> = {
          'Pending': 'Pending',
          'Confirmed': 'Pending',
          'Shipped': 'Pending',
          'Completed': 'Completed',
          'Cancelled': 'Cancel'
        };
        
        return {
          image: firstProduct?.image || '',
          tag: firstProduct?.productName || 'Order',
          name: `Order #${order.id}`,
          price: `$${order.total?.toFixed(2) || '0.00'}`,
          status: statusMap[order.status] || order.status,
          orderId: String(order.id),
          createdAt: order.createdAt,
          fullOrder: order
        };
      });
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fallback to empty state if API fails
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetailsHandler = async (orderId: string) => {
    try {
      const response = await fetchOrderDetails(orderId);
      console.log('Order Details:', response);
      alert(`Order Details loaded. Check console for details.`);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      alert('Failed to load order details');
    }
  };

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'All' || o.status === activeTab;
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
                        o.tag.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const countFor = (key: string) =>
    key === 'all' ? orders.length : orders.filter(o => o.status === key).length;

  return (
    <>
      <NavbarOne />

      {/* Breadcrumb */}
      <div className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bg})` }}>
        <div className="text-center w-full">
          <h2 className="text-white md:text-[40px] font-normal leading-none">Order History</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Home</Link></li>
            <li>/</li>
            <li><Link to="/account">Account</Link></li>
            <li>/</li>
            <li><GradText>Orders</GradText></li>
          </ul>
        </div>
      </div>

      <div className="s-py-100">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex items-start gap-8 md:gap-12 2xl:gap-20 flex-col md:flex-row my-profile-navtab">

            {/* Sidebar */}
            <div className="w-full md:w-[200px] lg:w-[240px] flex-none" data-aos="fade-up" data-aos-delay="100">
              <AccountTab />
            </div>

            {/* Main Content */}
            <div className="w-full md:flex-1 space-y-5" data-aos="fade-up" data-aos-delay="200">

              {/* Stats Cards */}
              <div className="w-full max-w-[951px] grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(({ label, key, icon, grad }) => (
                  <button 
                    key={key}
                    onClick={() => setActiveTab(key === 'all' ? 'All' : key)}
                    className="bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-3 text-left transition hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      borderColor: (activeTab === key || (activeTab === 'All' && key === 'all')) 
                        ? '#5B4FBE55' : '#f0f0f4',
                      boxShadow: (activeTab === key || (activeTab === 'All' && key === 'all')) 
                        ? '0 0 0 2px #5B4FBE22' : undefined
                    }}
                  >
                    <div className="w-[44px] h-[44px] rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: grad }}>
                      {icon}
                    </div>
                    <div>
                      <div className="text-[22px] font-extrabold leading-none">
                        <GradText grad={grad}>{countFor(key)}</GradText>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-widest uppercase">{label}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Order History Table Card */}
            {/* Order History Table Card - FIXED */}
<div className="w-full max-w-[951px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  
  {/* Header with search */}
  <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h4 className="text-[16px] font-extrabold text-gray-800 flex items-center gap-2">
        All Orders
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: '#f3f1ff', color: '#5B4FBE' }}>
          {filtered.length}
        </span>
      </h4>
      <p className="text-[12px] text-gray-400 mt-0.5">Track and manage your purchases</p>
    </div>
    <div className="relative">
      <LuSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input 
        value={search} 
        onChange={e => setSearch(e.target.value)}
        placeholder="Search orders…" 
        className="h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#5B4FBE] transition bg-gray-50 w-full sm:w-[200px]" 
      />
    </div>
  </div>

  {/* Filter tabs */}
  <div className="px-6 py-4 border-b border-gray-100 flex gap-2 flex-wrap">
    {['All','Completed','Pending','Cancel'].map(tab => (
      <button 
        key={tab} 
        onClick={() => setActiveTab(tab)}
        className="px-4 py-1.5 rounded-full text-[12px] font-bold transition"
        style={activeTab === tab
          ? { background: BRAND, color: '#fff' }
          : { background: '#f3f4f6', color: '#6b7280' }}
      >
        {tab} 
        <span className="opacity-60 ml-1">
          {tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length}
        </span>
      </button>
    ))}
  </div>

  {/* ========== TABLE HEADER (visible from md upwards) ========== */}
  <div className="hidden md:grid grid-cols-[minmax(180px,1fr)_100px_140px_130px] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/80">
    <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Product</span>
    <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Price</span>
    <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Status</span>
    <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Actions</span>
  </div>

  {/* ========== TABLE ROWS ========== */}
  {loading ? (
    <div className="text-center py-16">
      <div className="flex justify-center mb-3">
        <LuLoader size={32} className="text-[#5B4FBE] animate-spin" />
      </div>
      <p className="text-[15px] font-bold text-gray-700">Loading orders...</p>
    </div>
  ) : filtered.length === 0 ? (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">📦</div>
      <p className="text-[15px] font-bold text-gray-700 mb-1">No orders found</p>
      <p className="text-[13px] text-gray-400">Try adjusting your search or filter.</p>
    </div>
  ) : (
    <div className="divide-y divide-gray-100">
      {filtered.map((item, i) => {
        const st = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
        return (
          <div key={i} className="px-6 py-4 hover:bg-gray-50 transition">
            
            {/* Desktop/Tablet layout (md and above) - ONE LINE */}
            <div className="hidden md:grid grid-cols-[minmax(180px,1fr)_100px_140px_130px] gap-4 items-center">
              
              {/* Product */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-0.5">{item.tag}</span>
                  <h5 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h5>
                </div>
              </div>

              {/* Price */}
              <div>
                <GradText className="text-base font-extrabold whitespace-nowrap">{item.price}</GradText>
              </div>

              {/* Status - with nowrap to prevent line break */}
              {st && (
                <div>
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                    style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}
                  >
                    {st.icon} {item.status}
                  </span>
                </div>
              )}

              {/* Actions - fixed width, flex nowrap */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <button 
                  onClick={() => fetchOrderDetailsHandler((item as any).orderId)}
                  title="View Order" 
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400 hover:border-[#5B4FBE] hover:text-[#5B4FBE] transition">
                  <LuEye size={13}/>
                </button>
                <button title="Download Invoice" className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition">
                  <LuDownload size={13}/>
                </button>
                {item.status === 'Pending' && (
                  <button title="Track Order" className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition">
                    <LuRefreshCw size={13}/>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile layout (below md) - still shows all info in a clean vertical stack */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">{item.tag}</span>
                  <h5 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h5>
                </div>
                <GradText className="text-base font-extrabold whitespace-nowrap">{item.price}</GradText>
              </div>
              <div className="flex items-center justify-between">
                {st && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                    style={{ background: st.bg, color: st.text }}>
                    {st.icon} {item.status}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fetchOrderDetailsHandler((item as any).orderId)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-400">
                    <LuEye size={13} />
                  </button>
                  <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400">
                    <LuDownload size={13} />
                  </button>
                  {item.status === 'Pending' && (
                    <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400">
                      <LuRefreshCw size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}

  {/* Footer */}
  {filtered.length > 0 && (
    <div className="px-6 sm:px-8 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[12px] text-gray-400">
        Showing <span className="font-bold text-gray-700">{filtered.length}</span> of{' '}
        <span className="font-bold text-gray-700">{orders.length}</span> orders
      </p>
      <button className="text-[12px] font-semibold flex items-center gap-1.5 hover:opacity-80 transition"
        style={{ background: BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        <LuFilter size={12} style={{ color: '#5B4FBE' }}/> More Filters
      </button>
    </div>
  )}
</div>

            </div>
          </div>
        </div>
      </div>

      <FooterOne />
      <ScrollToTop />
    </>
  );
}