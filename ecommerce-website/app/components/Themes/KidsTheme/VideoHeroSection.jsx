"use client";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { useEffect, useMemo, useRef } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function VideoHeroSection({
	slides = [],
	autoplay = false,
	title = "",
}) {
	const processedSlides = useMemo(() => {
		if (slides.length === 3) {
			return [...slides, ...slides]; // duplicate
		}
		return slides;
	}, [slides]);

	useEffect(() => {
		Fancybox.bind("[data-fancybox='reel-gallery']", {
			Html: {
				videoAutoplay: true,
			},
			Toolbar: {
				display: {
					left: ["infobar"],
					middle: [],
					right: ["close"],
				},
			},
		});
		return () => Fancybox.unbind("[data-fancybox='reel-gallery']");
	}, [processedSlides]);

	return (
		<section className="py-10 px-4 w-full max-w-6xl mx-auto reel-slider-section">
			{title && (
				<h2 className="text-center h3 font-bold text-primary uppercase mb-5">
					{title}
				</h2>
			)}

			<div className="reel-slider-wrapper">
				<Swiper
					modules={[Navigation, Pagination, Autoplay]}
					slidesPerView={2}
					spaceBetween={15}
					centeredSlides={true}
					loop={processedSlides.length > 1}
					speed={600}
					navigation={true}
					pagination={true}
					autoplay={
						autoplay
							? {
									delay: 5000,
									disableOnInteraction: false,
									pauseOnMouseEnter: true,
								}
							: false
					}
					breakpoints={{
						768: { slidesPerView: 3, spaceBetween: 30 },
					}}>
					{processedSlides.map((slide, idx) => (
						<SwiperSlide style={{ marginBottom: "2rem !important" }} key={idx}>
							<VideoCard slide={slide} idx={idx} />
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
}

function VideoCard({ slide, idx }) {
	const videoRef = useRef(null);
	const handleMouseEnter = () => videoRef.current?.play();
	const handleMouseLeave = () => {
		if (videoRef.current) {
			videoRef.current.pause();
			videoRef.current.currentTime = 0;
		}
	};

	return (
		<a
			data-fancybox="reel-gallery"
			aria-label="Play video reel"
			data-src={slide.videoUrl}
			data-type="html5video"
			href={slide.videoUrl}
			onClick={(e) => e.preventDefault()}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}>
			<video
				ref={videoRef}
				src={slide.videoUrl}
				poster={slide.poster}
				muted
				loop
				playsInline
				webkit-playsinline="true"
				preload="metadata"
				className="reel-video"
			/>
		</a>
	);
}
