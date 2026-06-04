"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/app/providers/StoreProvider";
import BaseImage from "../../BaseComponents/BaseImage";
import BaseLink from "../../BaseComponents/BaseLink";
import { ENV_VARIABLES } from "@/app/constants/env_variables";

const CategoriesSection = ({ data = [], isSlider = true }) => {
	const store = useStore();
	const rawData =
		data.length > 0 ? [...data, ...data] : store.content.categories;
	const slidesData = rawData || [];

	return (
		<section className="container-layout">
			{isSlider ? (
				<CustomCategorySlider slidesData={slidesData} />
			) : (
				<section className="grid grid-cols-6 max-md:grid-cols-3 gap-5 items-center">
					{slidesData.slice(0, 6).map((category, idx) => (
						<CategoryCard key={idx} category={category} />
					))}
				</section>
			)}
		</section>
	);
};

export default CategoriesSection;

function CustomCategorySlider({ slidesData }) {
	// ✅ Start with undefined — resolved after mount
	const [slidesPerView, setSlidesPerView] = useState(undefined);
	const [currentIndex, setCurrentIndex] = useState(0);
	const dragStart = useRef(null);

	const DESKTOP_SPV = 7;
	const MOBILE_SPV = 3;
	const SPG = 2;
	const GAP = 20; // px, matches spaceBetween

	// ✅ Set slidesPerView only on client after mount — no flash
	useEffect(() => {
		function update() {
			setSlidesPerView(window.innerWidth >= 768 ? DESKTOP_SPV : MOBILE_SPV);
		}
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	// Reset index on breakpoint change
	const prevSPV = useRef(slidesPerView);
	useEffect(() => {
		if (prevSPV.current !== slidesPerView) {
			setCurrentIndex(0);
			prevSPV.current = slidesPerView;
		}
	}, [slidesPerView]);

	const maxIndex = slidesPerView
		? Math.max(0, slidesData.length - slidesPerView)
		: 0;

	const showNavigation =
		slidesPerView === DESKTOP_SPV && slidesData.length > DESKTOP_SPV;

	const next = useCallback(() => {
		setCurrentIndex((prev) => (prev + SPG > maxIndex ? 0 : prev + SPG));
	}, [maxIndex]);

	const prev = useCallback(() => {
		setCurrentIndex((prev) => (prev - SPG < 0 ? maxIndex : prev - SPG));
	}, [maxIndex]);

	const onDragStart = (e) => {
		dragStart.current = e.clientX ?? e.touches?.[0]?.clientX;
	};

	const onDragEnd = (e) => {
		if (dragStart.current === null) return;
		const endX = e.clientX ?? e.changedTouches?.[0]?.clientX;
		const diff = dragStart.current - endX;
		if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
		dragStart.current = null;
	};

	// ✅ Don't render slider until we know the screen size
	if (!slidesPerView)
		return (
			<div className="flex gap-5">
				{Array.from({ length: 7 }).map((_, i) => (
					<div key={i} className="flex-1">
						<div className="w-full aspect-square rounded-full bg-gray-100 animate-pulse" />
						<div className="h-3 mt-2 mx-auto w-3/4 rounded bg-gray-100 animate-pulse" />
					</div>
				))}
			</div>
		);

	// ✅ Correct translateX: each slide is (100% / SPV) wide + gap
	// total offset = index * (slideWidth + gap)
	// slideWidth in px = (containerWidth - gap*(SPV-1)) / SPV
	// But we use % trick: each slide is 100/SPV %, offset per step = 100/SPV % + gap/SPV
	const slideWidthPercent = 100 / slidesPerView;
	const translateX = currentIndex * (slideWidthPercent + GAP / slidesPerView);

	return (
		<div className="relative w-full">
			<div
				className="overflow-hidden"
				onMouseDown={onDragStart}
				onMouseUp={onDragEnd}
				onTouchStart={onDragStart}
				onTouchEnd={onDragEnd}
				style={{ cursor: "grab" }}>
				<div
					style={{
						display: "flex",
						gap: `${GAP}px`,
						transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
						transform: `translateX(-${translateX}%)`,
						willChange: "transform",
					}}>
					{slidesData.map((category, idx) => (
						<div
							key={idx}
							style={{
								flex: `0 0 calc(${slideWidthPercent}% - ${(GAP * (slidesPerView - 1)) / slidesPerView}px)`,
								minWidth: 0,
							}}>
							<CategoryCard category={category} />
						</div>
					))}
				</div>
			</div>

			{showNavigation && (
				<>
					<button
						onClick={prev}
						aria-label="Previous"
						className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 select-none">
						<ChevronRight className="rotate-180 size-6" />
					</button>
					<button
						onClick={next}
						aria-label="Next"
						className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 select-none">
						<ChevronRight className="size-6" />
					</button>
				</>
			)}
		</div>
	);
}

function CategoryCard({ category }) {
	return (
		<BaseLink href={`/products?category=${category.slug}`}>
			<BaseImage
				src={
					category.icons
						? ENV_VARIABLES.IMAGE_BASE_URL + category.icons
						: category.icon
				}
				className="w-full rounded-full h-auto"
				alt={category.title}
			/>
			<p className="text-center capitalize mt-2 font-medium">
				{category.title}
			</p>
		</BaseLink>
	);
}
