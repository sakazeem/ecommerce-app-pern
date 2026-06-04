"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const HeroSection = ({
	slides = [],
	autoPlay = true,
	autoPlayDelay = 4000,
	speed = 500,
	showNavigation = true,
	showPagination = true,
}) => {
	const router = useRouter();

	const [index, setIndex] = useState(1);
	const [isPaused, setIsPaused] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const trackRef = useRef(null);
	const intervalRef = useRef(null);

	const slidesCount = slides.length;
	if (!slidesCount) return null;

	const extendedSlides = [
		slides[slidesCount - 1], // last clone
		...slides,
		slides[0], // first clone
	];

	// ✅ REMOVED mounted/setTimeout delay — no longer needed

	// ---------------------------
	// AUTOPLAY
	// ---------------------------
	useEffect(() => {
		if (!autoPlay || isPaused || isAnimating) return; // ✅ removed mounted check

		intervalRef.current = setInterval(() => {
			next();
		}, autoPlayDelay);

		return () => clearInterval(intervalRef.current);
	}, [isPaused, index, isAnimating]);

	// ---------------------------
	// SLIDE LOGIC
	// ---------------------------
	const next = () => {
		if (isAnimating) return;
		setIndex((prev) => prev + 1);
	};

	const prev = () => {
		if (isAnimating) return;
		setIndex((prev) => prev - 1);
	};

	// ---------------------------
	// HANDLE LOOP RESET
	// ---------------------------
	useEffect(() => {
		if (!trackRef.current) return;
		setIsAnimating(true);

		trackRef.current.style.transition = `transform ${speed}ms ease-out`;

		const timeout = setTimeout(() => {
			if (index === slidesCount + 1) {
				trackRef.current.style.transition = "none";
				setIndex(1);
			}
			if (index === 0) {
				trackRef.current.style.transition = "none";
				setIndex(slidesCount);
			}
			setIsAnimating(false);
		}, speed);

		return () => clearTimeout(timeout);
	}, [index]);

	// ---------------------------
	// CLICK HANDLER
	// ---------------------------
	const handleClick = (slide) => {
		if (slide?.categorySlug) {
			router.push(`/products?category=${slide.categorySlug}`);
		}
	};

	// ---------------------------
	// RENDER
	// ---------------------------
	return (
		<div
			className="relative w-full overflow-hidden"
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}>
			{/* TRACK */}
			<div
				ref={trackRef}
				className="flex w-full"
				style={{
					transform: `translateX(-${index * 100}%)`,
				}}>
				{extendedSlides.map((slide, i) => (
					<div
						key={i}
						className="min-w-full cursor-pointer"
						onClick={() => handleClick(slide)}>
						<img
							src={slide.src}
							width={1920}
							height={550}
							// Only the first real slide is LCP
							loading={i === 1 ? "eager" : "lazy"}
							fetchPriority={i === 1 ? "high" : "auto"}
							className="w-full h-auto"
							alt={slide.alt || `Banner ${i}`}
						/>
						{/* <img
							src={slide.src}
							// width={1920}
							// height={550}
							// ✅ i === 1 is the real first visible slide (index starts at 1)
							// ✅ Also mark i === 0 (last-clone) as it may flash during loop reset
							priority={i === 1}
							// ✅ Only eager-load first 3 slides; lazy-load the rest
							loading={i <= 2 ? "eager" : "lazy"}
							// ✅ Tell browser this is full-width for correct srcset selection
							// sizes="100vw"
							className="w-full h-auto"
							alt={slide.alt || `Banner ${i}`}
							// ✅ Boost fetch priority on the actual LCP image
							fetchPriority={i === 1 ? "high" : "low"}
						/> */}
					</div>
				))}
			</div>

			{/* NAVIGATION */}
			{showNavigation && (
				<>
					<button
						onClick={prev}
						className="absolute left-6 max-md:left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 max-md:p-0.5 select-none">
						<ChevronRight className="rotate-180 size-6 max-md:size-5" />
					</button>

					<button
						onClick={next}
						className="absolute right-6 max-md:right-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 max-md:p-0.5 select-none">
						<ChevronRight className="size-6 max-md:size-5" />
					</button>
				</>
			)}

			{/* DOTS */}
			{showPagination && (
				<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
					{slides.map((_, i) => {
						const activeIndex =
							index === 0
								? slidesCount - 1
								: index === slidesCount + 1
									? 0
									: index - 1;

						return (
							<button
								key={i}
								onClick={() => setIndex(i + 1)}
								className={`w-2 h-2 rounded-full transition-all ${
									activeIndex === i ? "bg-white w-4" : "bg-white/50"
								}`}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default HeroSection;
