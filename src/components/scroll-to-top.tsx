import { useState, useEffect, useRef, useCallback } from "react";
import { FiArrowUp } from "react-icons/fi";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const isVisibleRef = useRef<boolean>(false);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const nextVisible = window.scrollY > 300;
      // Avoid re-renders on every scroll tick by only updating when the boolean flips.
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
            <button onClick={scrollToTop} className="bg-[#BB976D] text-white hover:bg-black p-3 shadow-lg transition duration-300">
              <FiArrowUp/>
            </button>
        )}
    </div>
  );
};

export default ScrollToTop;
