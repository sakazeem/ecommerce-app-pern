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

	const [index, setIndex] = useState(1); // start at 1 because of clone
	const [isPaused, setIsPaused] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const trackRef = useRef(null);
	const intervalRef = useRef(null);

	const slidesCount = slides.length;

	if (!slidesCount) return null;

	// ---------------------------
	// CREATE CLONES (for infinite loop)
	// ---------------------------
	const extendedSlides = [
		slides[slidesCount - 1], // last clone
		...slides,
		slides[0], // first clone
	];

	// ---------------------------
	// INIT (LCP safe)
	// ---------------------------
	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 50);
		return () => clearTimeout(t);
	}, []);

	// ---------------------------
	// AUTOPLAY
	// ---------------------------
	useEffect(() => {
		if (!mounted || !autoPlay || isPaused || isAnimating) return;

		intervalRef.current = setInterval(() => {
			next();
		}, autoPlayDelay);

		return () => clearInterval(intervalRef.current);
	}, [mounted, isPaused, index, isAnimating]);

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
		// trackRef.current.style.transform = `translateX(-${index * 100}%)`;

		// reset logic (infinite loop illusion)
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
	// LCP FAST FIRST LOAD
	// ---------------------------
	if (!mounted) {
		const first = slides[0];

		return (
			<div onClick={() => handleClick(first)}>
				<Image
					src={first?.src}
					width={1920}
					height={550}
					priority
					className="w-full h-auto"
					alt=""
				/>
			</div>
		);
	}

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
						<Image
							src={slide.src}
							width={1920}
							height={550}
							priority={i === 1}
							className="w-full h-auto"
							alt=""
						/>
					</div>
				))}
			</div>

			{/* ---------------- NAVIGATION ---------------- */}
			{showNavigation && (
				<>
					<button
						onClick={prev}
						className={`absolute ${
							false === "outside" ? "-left-12" : "left-6 max-md:left-2"
						} top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 max-md:p-0.5 text-xl select-none`}>
						<ChevronRight className="rotate-180 size-6 max-md:size-5" />
					</button>

					<button
						onClick={next}
						className={`absolute ${
							false === "outside" ? "-right-12" : "right-6 max-md:right-2"
						} top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 max-md:p-0.5 text-xl select-none`}>
						<ChevronRight className="size-6 max-md:size-5" />
					</button>
				</>
			)}

			{/* ---------------- DOTS ---------------- */}
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
