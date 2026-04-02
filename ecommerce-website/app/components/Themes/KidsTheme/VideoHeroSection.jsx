"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

export default function VideoHeroSection({
  slides = [],
  autoplay = false,
  title = "",
}) {
  const router = useRouter();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef({});

  // Reinit nav after mount
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

  // Play active video, pause others
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idx, video]) => {
      if (!video) return;
      if (Number(idx) === activeIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex]);

  if (!slides.length) return null;

  return (
    <section className="py-10 px-4 w-full max-w-6xl mx-auto">
      {/* Title */}
      {title && (
        <h2 className="text-center h3 font-bold text-primary uppercase mb-5">
          {title}
        </h2>
      )}

      <div className="relative">
        {/* Prev Arrow */}
        <button
          ref={prevRef}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
            w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center
            hover:bg-gray-50 transition disabled:opacity-30"
          aria-label="Previous"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Next Arrow */}
        <button
          ref={nextRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
            w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center
            hover:bg-gray-50 transition disabled:opacity-30"
          aria-label="Next"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          slidesPerView={1.5}
          centeredSlides={true}
          centerInsufficientSlides={true}
          spaceBetween={16}
          loop={true}
          speed={600}
          navigation={false}
          pagination={{ clickable: true }}
          autoplay={
            autoplay ? { delay: 4000, disableOnInteraction: false } : false
          }
          breakpoints={{
            640: { slidesPerView: 2.5, spaceBetween: 20 },
            1024: { slidesPerView: 3.5, spaceBetween: 24 },
          }}
          className="!pb-10"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx} className="!h-auto">
              {({ isActive }) => (
                <VideoCard
                  slide={slide}
                  idx={idx}
                  isActive={isActive}
                  videoRefs={videoRefs}
                  activeIndex={activeIndex}
                  onClick={() =>
                    slide.categorySlug &&
                    router.push(`/products?category=${slide.categorySlug}`)
                  }
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function VideoCard({ slide, idx, isActive, videoRefs, activeIndex, onClick }) {
  const [duration, setDuration] = useState(null);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl transition-all border-2 border-gray-200 duration-500 select-none
        ${slide.categorySlug ? "cursor-pointer" : ""}
        ${isActive ? "z-10" : "scale-95 opacity-80"}
      `}
      style={{ aspectRatio: "9/16" }}
    >
      <video
        ref={(el) => {
          videoRefs.current[idx] = el;
        }}
        src={slide.videoUrl}
        poster={slide.poster}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
