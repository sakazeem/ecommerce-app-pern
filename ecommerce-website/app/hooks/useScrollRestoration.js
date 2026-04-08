"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function useScrollRestoration(key) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollKey =
    key ??
    pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

  const saveTargetProduct = (productId) => {
    sessionStorage.setItem(`target-product:${scrollKey}`, String(productId));
  };

  const getTargetProduct = () =>
    sessionStorage.getItem(`target-product:${scrollKey}`);

  const clearTargetProduct = () =>
    sessionStorage.removeItem(`target-product:${scrollKey}`);

  // Retries every 50ms until the element appears in DOM, then scrolls to it
  const scrollToProduct = (productId, onDone) => {
    let attempts = 0;
    const tryScroll = () => {
      const el = document.querySelector(`[data-product-id="${productId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        onDone?.();
        return;
      }
      if (attempts++ < 40) setTimeout(tryScroll, 50); // retry for ~2s
    };
    requestAnimationFrame(tryScroll);
  };

  return {
    saveTargetProduct,
    getTargetProduct,
    clearTargetProduct,
    scrollToProduct,
  };
}
