"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BaseSlider from "../../BaseComponents/BaseSlider";

const HeroSection = ({ slides = [], autoplay = false }) => {
	const router = useRouter();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		// Delay slider mount to avoid blocking LCP
		const timer = setTimeout(() => {
			setIsMounted(true);
		}, 100); // small delay is enough

		return () => clearTimeout(timer);
	}, []);

	const firstSlide = slides?.[0];

	const renderImage = (slide, idx, isPriority = false) => (
		// <div className="relative w-full h-auto max-md:min-h-[25vh] max-md:object-cover">
		// <div className="relative w-full h-[200px] md:h-[250px] lg:h-[550px]">
		<Image
			src={slide?.src}
			width={1920}
			height={550}
			// className="object-cover"
			alt=""
			unoptimized={!isPriority} // only priority image is optimized for better LCP
			priority={isPriority}
			sizes="100vw"
			className="w-full h-auto max-h-[550px]/ max-md:min-h-[25vh] max-sm:min-h-[20vh]"
		/>
		// </div>
	);

	const handleClick = (slide) => {
		if (slide?.categorySlug) {
			router.push(`/products?category=${slide.categorySlug}`);
		}
	};

	return (
		<div>
			{!isMounted ? (
				// 🚀 FAST INITIAL LOAD (no slider)
				firstSlide ? (
					<div
						className="cursor-pointer"
						onClick={() => handleClick(firstSlide)}>
						{renderImage(firstSlide, 0, true)}
					</div>
				) : null
			) : (
				// 🎯 FULL SLIDER AFTER LOAD
				<BaseSlider
					slides={slides}
					slidesPerView={1}
					spaceBetween={0}
					showNavigation={false}
					showPagination={false}
					autoPlay={autoplay}
					arrowsPosition="inside"
					speed={800}
					breakpoints={{
						768: {
							showNavigation: true,
						},
					}}
					renderSlide={(slide, idx) => {
						const image = renderImage(slide, idx, idx === 0);

						if (slide?.categorySlug) {
							return (
								<div
									key={idx}
									className="cursor-pointer"
									onClick={() => handleClick(slide)}>
									{image}
								</div>
							);
						}

						return <div key={idx}>{image}</div>;
					}}
				/>
			)}
		</div>
	);
};

export default HeroSection;
