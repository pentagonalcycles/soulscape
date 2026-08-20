"use client";

import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      
      // Mobile: small screen OR (touch device AND small screen)
      setIsMobile(width < 768);
      // Tablet: medium screen (768-1024px)
      setIsTablet(width >= 768 && width < 1024);
    };
    
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return { isMobile, isTablet };
}
