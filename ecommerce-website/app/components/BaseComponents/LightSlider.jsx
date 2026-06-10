"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LightSlider = ({
	slides = [],
	renderSlide,
	slidesPerView = 1,
	slidesPerGroup = 1,
	spaceBetween = 10,
	autoPlay = false,
	autoPlayDelay = 3000,
	loop = true,
	speed = 400,
	breakpoints = {},
}) => {
	const trackRef = useRef(null);
	const intervalRef = useRef(null);

	const [index, setIndex] = useState(0);
	const [perView, setPerView] = useState(slidesPerView);

	const total = slides.length;

	// ---------------- RESIZE BREAKPOINTS ----------------
	useEffect(() => {
		const update = () => {
			const width = window.innerWidth;
			let matched = slidesPerView;

			Object.keys(breakpoints || {}).forEach((bp) => {
				if (width >= bp) {
					matched = breakpoints[bp].slidesPerView || matched;
				}
			});

			setPerView(matched);
		};

		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, [breakpoints, slidesPerView]);

	// ---------------- NEXT / PREV ----------------
	const next = () => {
		if (!loop && index >= total - perView) return;
		setIndex((prev) => prev + slidesPerGroup);
	};

	const prev = () => {
		if (!loop && index <= 0) return;
		setIndex((prev) => Math.max(0, prev - slidesPerGroup));
	};

	// ---------------- LOOP FIX ----------------
	useEffect(() => {
		if (!loop) return;

		if (index > total - perView) {
			setTimeout(() => setIndex(0), speed);
		}
	}, [index, total, perView, loop]);

	// ---------------- AUTOPLAY ----------------
	useEffect(() => {
		if (!autoPlay) return;

		intervalRef.current = setInterval(() => {
			next();
		}, autoPlayDelay);

		return () => clearInterval(intervalRef.current);
	}, [index, autoPlay, autoPlayDelay]);

	// ---------------- TRANSFORM ----------------
	useEffect(() => {
		if (!trackRef.current) return;

		trackRef.current.style.transition = `transform ${speed}ms ease-out`;
		trackRef.current.style.transform = `translateX(-${
			index * (100 / perView)
		}%)`;
	}, [index, perView]);

	if (!total) return null;

	return (
		<div className="relative w-full overflow-hidden">
			<div
				ref={trackRef}
				className="flex"
				style={{
					gap: `${spaceBetween}px`,
				}}>
				{slides.map((item, i) => (
					<div
						key={i}
						style={{
							minWidth: `calc(${100 / perView}% - ${spaceBetween}px)`,
						}}>
						{renderSlide(item, i)}
					</div>
				))}
			</div>

			{/* NAV BUTTONS */}
			{/* <button
				onClick={prev}
				className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-2 py-1 rounded">
				‹
			</button> */}
			<button
				onClick={prev}
				className={`absolute ${
					"outside" === "outside" ? "-left-12" : "left-6 max-md:left-2"
				} top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 max-md:p-0.5 text-xl select-none`}>
				<ChevronRight className="rotate-180 size-6 max-md:size-5" />
			</button>
			<button
				onClick={next}
				className={`absolute ${
					"outside" === "outside" ? "-right-12" : "right-6 max-md:right-2"
				} top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 max-md:p-0.5 text-xl select-none`}>
				<ChevronRight className="size-6 max-md:size-5" />
			</button>

			{/* <button
				onClick={next}
				className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-2 py-1 rounded">
				›
			</button> */}
		</div>
	);
};

export default LightSlider;
