// src/components/account/account-tab.tsx
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LuUser, LuCircle,  LuClock, LuHeart, LuLogOut,
} from 'react-icons/lu'

// Brand gradient   
const BRAND_GRADIENT = 'linear-gradient(135deg, #5B4FBE 0%, #E8314A 50%, #F97316 100%)'
const BRAND_SOLID = '#5B4FBE'

export default function AccountTab() {
  const location = useLocation()
  const [current, setCurrent] = useState(location.pathname)

  useEffect(() => {
    setCurrent(location.pathname)
  }, [location.pathname])

  const navItems = [
    { path: '/my-profile', label: 'My Profile', icon: <LuUser size={18} /> },
    { path: '/my-account', label: 'My Account', icon: <LuCircle size={18} /> },
    { path: '/edit-account', label: 'Edit Account', icon: <LuClock size={18} /> },
    { path: '/order-history', label: 'Order History', icon: <LuClock size={18} /> },
    { path: '/wishlist', label: 'Wishlist', icon: <LuHeart size={18} /> },
    { path: '/login', label: 'Logout', icon: <LuLogOut size={18} /> },
  ]

  return (
    <ul className="flex flex-col gap-1">
      {navItems.map(({ path, label, icon }) => {
        const isActive = current === path
        return (
          <li key={path}>
            <Link
              to={path}
              className={`
                flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-gradient-to-r from-[#5B4FBE]/10 to-[#E8314A]/10 text-[#5B4FBE] font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#5B4FBE]'
                }
              `}
            >
              <span className={`${isActive ? 'text-[#5B4FBE]' : 'text-gray-400 group-hover:text-[#5B4FBE]'}`}>
                {icon}
              </span>
              <span className="text-sm md:text-base font-medium">
                {label}
              </span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-6 rounded-full"
                  style={{ background: BRAND_GRADIENT }}
                />
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}