"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * useScrollRestoration
 *
 * Saves the window scroll position before leaving a page and restores it when
 * returning to the same URL (pathname + search params).
 *
 * Usage:
 *   useScrollRestoration();          // auto key = current URL
 *   useScrollRestoration("products") // explicit stable key
 */
export function useScrollRestoration(key) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const scrollKey = key ?? pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

	// Track whether we've already restored on this mount
	const restored = useRef(false);

	// On mount: restore saved position (after React has painted the list)
	useEffect(() => {
		if (restored.current) return;
		restored.current = true;

		const saved = sessionStorage.getItem(`scroll:${scrollKey}`);
		if (!saved) return;

		const y = parseInt(saved, 10);
		if (!Number.isFinite(y) || y <= 0) return;

		// requestAnimationFrame gives the browser one paint cycle to render
		// the list content before we jump — avoids snapping to 0.
		const raf = requestAnimationFrame(() => {
			window.scrollTo({ top: y, behavior: "instant" });
		});

		return () => cancelAnimationFrame(raf);
	}, [scrollKey]);

	// On unmount (navigating away): save current position
	useEffect(() => {
		return () => {
			sessionStorage.setItem(`scroll:${scrollKey}`, String(Math.round(window.scrollY)));
		};
	}, [scrollKey]);
}
