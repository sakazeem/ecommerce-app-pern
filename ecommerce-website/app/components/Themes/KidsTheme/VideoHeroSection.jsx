"use client";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const processedSlides = useMemo(() => {
    if (slides.length < 6) {
      const repeated = [];
      while (repeated.length < 9) repeated.push(...slides);
      return repeated;
    }
    return slides;
  }, [slides]);

  useEffect(() => {
    Fancybox.bind("[data-fancybox='reel-gallery']", {
      Html: { videoAutoplay: true },
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
          loop={true}
          loopAdditionalSlides={3}
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
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          onSwiper={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {processedSlides.map((slide, idx) => (
            <SwiperSlide
              style={{ marginBottom: "2rem !important" }}
              key={`${slide.videoUrl}-${idx}`}
            >
              {({ isActive }) => (
                <VideoCard
                  slide={slide}
                  idx={idx}
                  isMobileActive={isMobile && isActive}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function VideoCard({ slide, idx, isMobileActive }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (isMobileActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isMobileActive]);

  return (
    <a
      data-fancybox="reel-gallery"
      aria-label="Play video reel"
      data-src={slide.videoUrl}
      data-type="html5video"
      href={slide.videoUrl}
      onClick={(e) => e.preventDefault()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative", display: "block" }}
    >
      <video
        ref={videoRef}
        src={`${slide.videoUrl}#t=5`}
        poster={slide.poster}
        muted
        loop
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        className="reel-video"
      />

      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: isHovered ? 0 : 1,
          transition: "opacity 0.25s ease",
        }}
        className="reel-play-btn-overlay"
      >
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgb(74, 144, 226)",
            backdropFilter: "blur(4px)",
            border: "2px solid rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="white" />
          </svg>
        </span>
      </span>
    </a>
  );
}
