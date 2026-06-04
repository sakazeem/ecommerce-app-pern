"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
	Autoplay,
	EffectCoverflow,
	Navigation,
	Pagination,
} from "swiper/modules";

import noImage from "../assets/no-image.webp";
import { ENV_VARIABLES } from "../constants/env_variables";
import BaseImage from "./BaseComponents/BaseImage";
import BaseLink from "./BaseComponents/BaseLink";
import { useState } from "react";
import SpinLoader from "@/app/components/Shared/SpinLoader";
import SmallSpinLoader from "@/app/components/Shared/SmallSpinLoader";

export default function CategorySliderClient({ categories = [], isStoreData }) {
	// IMPORTANT FIX: prevent duplicate rendering glitch
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);
	// 👇 BLOCK RENDER UNTIL MOUNTED
	if (!mounted || !categories?.length) return <SmallSpinLoader />;
	const slidesData = categories.length > 0 ? categories : [];

	// ❌ REMOVE THIS HACK (it causes glitch)
	// [...slidesData, ...slidesData]

	if (!slidesData.length) return null;

	return (
		<Swiper
			loop={slidesData.length > 5}
			observer={true}
			observeParents={true}
			speed={600}
			effect={"coverflow"}
			grabCursor={true}
			centeredSlides={true}
			// slidesPerView={"auto"}
			autoplay={{
				delay: 2500,
				disableOnInteraction: false,
			}}
			coverflowEffect={{
				rotate: 0,
				stretch: 0,
				depth: 150,
				modifier: 1,
				slideShadows: false,
			}}
			pagination={{ clickable: true }}
			navigation={true}
			modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
			className="flat-coverflow-slider mt-4">
			{slidesData.map((category) => (
				<SwiperSlide key={category.id}>
					<div className="bg-white shadow-xl rounded-xl pb-3">
						<BaseLink href={`/products?category=${category.slug}`}>
							<BaseImage
								src={
									isStoreData
										? category.icon
										: category.icons
											? ENV_VARIABLES.IMAGE_BASE_URL + category.icons
											: noImage
								}
								width={300}
								height={300}
								className="w-full h-auto object-cover rounded-t-xl"
							/>

							<h3 className="text-center mt-2 font-medium">{category.title}</h3>
						</BaseLink>
					</div>
				</SwiperSlide>
			))}
		</Swiper>
	);
}
