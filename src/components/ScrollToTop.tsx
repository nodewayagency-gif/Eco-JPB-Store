import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll directly to top without smooth behavior to avoid weird jumping
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
