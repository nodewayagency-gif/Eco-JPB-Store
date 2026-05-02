import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll directly to top without smooth behavior to avoid weird jumping
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
