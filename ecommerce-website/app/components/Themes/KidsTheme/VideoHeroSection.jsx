"use client";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { useEffect, useRef } from "react";
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
  }, [slides]);

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
          slidesPerView={1}
          spaceBetween={30}
          loop={slides.length > 1}
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
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <VideoCard slide={slide} idx={idx} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination */}
        <div className="reel-swiper-pagination" />

        {/* Nav buttons */}
        <div className="reel-swiper-button-prev reel-swiper-slide-button" />
        <div className="reel-swiper-button-next reel-swiper-slide-button" />
      </div>
    </section>
  );
}

function VideoCard({ slide, idx }) {
  const videoRef = useRef(null);

  return (
    <a
      data-fancybox="reel-gallery"
      data-src={slide.videoUrl}
      data-type="html5video"
      href={slide.videoUrl}
      onClick={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        src={slide.videoUrl}
        poster={slide.poster}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay
        className="reel-video"
      />
    </a>
  );
}
