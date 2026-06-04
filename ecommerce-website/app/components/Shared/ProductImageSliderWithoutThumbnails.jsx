import { useEffect, useMemo, useRef } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/pagination";

// import required modules
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { Navigation } from "swiper/modules";
import BaseImage from "../BaseComponents/BaseImage";
import SliderArrows from "../BaseComponents/SliderArrows";

export default function ProductImageSliderWithoutThumbnails({
	images,
	selectedVariant,
}) {
	const prevRef = useRef(null);
	const nextRef = useRef(null);
	const swiperRef = useRef(null);

	const uniqueImages = useMemo(() => {
		return [...new Set(images || [])];
	}, [images]);

	const variantImage = selectedVariant?.image;

	useEffect(() => {
		if (!swiperRef.current) return;
		if (!variantImage) {
			swiperRef.current.slideToLoop(0);
		}
		const index = uniqueImages.findIndex((img) => img === variantImage);

		if (index !== -1) {
			// because loop is enabled
			swiperRef.current.slideToLoop(index);
		}
	}, [variantImage, uniqueImages]);

	useEffect(() => {
		if (swiperRef.current && prevRef.current && nextRef.current) {
			const swiper = swiperRef.current;
			swiper.params.navigation.prevEl = prevRef.current;
			swiper.params.navigation.nextEl = nextRef.current;

			swiper.navigation.destroy();
			swiper.navigation.init();
			swiper.navigation.update();
		}
	}, []);
	return (
		<section className="relative md:flex md:w-1/2 md:shrink-0 md:!h-fit md:rounded-l-2xl max-md:rounded-t-2xl overflow-hidden min-h-[300px] items-center">
			<Swiper
				spaceBetween={0}
				onSwiper={(swiper) => (swiperRef.current = swiper)} // ✅ save swiper instance
				effect="fade"
				// fadeEffect={{ crossFade: true }}
				loop
				modules={[Navigation]}
				className="mySwiper2 w-full md:!h-fit">
				{uniqueImages?.map((v, idx) => {
					return (
						<SwiperSlide key={`product-images-${idx}`}>
							<div className="h-full w-full bg-light/">
								<BaseImage
									src={v ? ENV_VARIABLES.IMAGE_BASE_URL + v : null}
									className="w-full h-auto max-h-[80vh] object-contain"
									alt="Product"
									width={600}
									height={600}
								/>
							</div>
						</SwiperSlide>
					);
				})}
			</Swiper>
			<SliderArrows prevRef={prevRef} nextRef={nextRef} position={"inside"} />
		</section>
	);
}
