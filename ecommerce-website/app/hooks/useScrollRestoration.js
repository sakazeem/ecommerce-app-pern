"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useScrollRestoration(key) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollKey =
    key ??
    pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
  const restored = useRef(false);
  
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = sessionStorage.getItem(`scroll:${scrollKey}`);
    if (!saved) return;
    const y = parseInt(saved, 10);
    if (!Number.isFinite(y) || y <= 0) return;
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "instant" });
    });
    return () => cancelAnimationFrame(raf);
  }, [scrollKey]);
  
  useEffect(() => {
    return () => {
      sessionStorage.setItem(
        `scroll:${scrollKey}`,
        String(Math.round(window.scrollY)),
      );
    };
  }, [scrollKey]);
}
