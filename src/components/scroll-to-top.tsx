// src/components/scroll-to-top.tsx (extended)
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom"; // 👈 add
import { FiArrowUp } from "react-icons/fi";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const { pathname } = useLocation(); // 👈 get route

  // 👇 Auto-scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // ... rest of your existing code (scroll button logic)
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const nextVisible = window.scrollY > 300;
      if (nextVisible !== isVisibleRef.current) {
        isVisibleRef.current = nextVisible;
        setIsVisible(nextVisible);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{ background: "linear-gradient(135deg, #6B3FA0 10%, #DC2626 50%, #F97316 100%" }}
          className="text-white hover:opacity-90 p-3 shadow-lg transition duration-300 rounded-full"
          aria-label="Scroll to top"
        >
          <FiArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;