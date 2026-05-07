"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton({ totalCount, skipState }: { totalCount: number, skipState: number }) {
  const [isVisible, setIsVisible] = useState(false);

  // Controlar la visibilidad basándonos en el scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    sessionStorage.setItem('last_scroll_pos', "0");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="basebutton appbutton"
        >
          Up ↑ {skipState}/{totalCount}
        </button>
      )}
    </div>
  );
}
