import { useEffect, useMemo, useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { ImEnlarge } from "react-icons/im";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// import required modules
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import BaseImage from "../BaseComponents/BaseImage";
import SideZoomImage from "./ImageZoom";
import SliderArrows from "../BaseComponents/SliderArrows";

export default function ProductImageSlider({ images, selectedVariant }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
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

  useEffect(() => {
    Fancybox.bind("[data-fancybox='product-gallery']", {
      Thumbs: {
        type: "classic",
      },
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: [],
          right: ["zoomIn", "zoomOut", "fullscreen", "close"],
        },
      },
    });
    return () => Fancybox.unbind("[data-fancybox='product-gallery']");
  }, [uniqueImages]);

  return (
    <section className="md:flex flex-row-reverse gap-4 md:col-span-3 relative">
      <div className="md:flex/ flex-1 mb-2 flex-row-reverse gap-4 md:col-span-3 relative md:w-[calc(100%-112px)]">
        <Swiper
          style={{
            "--swiper-navigation-color": "#525252",
            "--swiper-pagination-color": "#000000",
          }}
          spaceBetween={10}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)} // ✅ save swiper instance
          effect={"fade"}
          loop
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiper2 flex-1 mb-2 md:h-[568px]/"
        >
          {uniqueImages?.map((v, idx) => {
            return (
              <SwiperSlide key={`product-images-${idx}`}>
                <div className="h-full w-full bg-light/ relative">
                  <SideZoomImage
                    src={v ? ENV_VARIABLES.IMAGE_BASE_URL + v : null}
                  />
                  <a
                    href={v ? ENV_VARIABLES.IMAGE_BASE_URL + v : null}
                    data-fancybox="product-gallery"
                    data-caption={`Image ${idx + 1}`}
                    className="group/btn flex items-center justify-center gap-1.5 py-2 px-3 text-xs text-gray-600 hover:text-gray-900 transition-all duration-300 bg-white/90 cursor-pointer select-none absolute bottom-3 right-3 rounded-full border shadow-sm w-8 h-8 md:hover:w-36 md:hover:px-3 overflow-hidden whitespace-nowrap"
                  >
                    <span className="max-w-0 opacity-0 md:group-hover/btn:max-w-xs md:group-hover/btn:opacity-100 transition-all duration-300 overflow-hidden">
                      Click to enlarge
                    </span>
                    <ImEnlarge className="shrink-0 ml-[-5px] md:group-hover/btn:ml-0" />
                  </a>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <SliderArrows prevRef={prevRef} nextRef={nextRef} position={"inside"} />
      </div>

      <Swiper
        onSwiper={setThumbsSwiper}
        direction="horizontal"
        spaceBetween={6}
        slidesPerView={3}
        freeMode={true}
        watchSlidesProgress={true}
        breakpoints={{
          768: {
            direction: "vertical",
            slidesPerView: Math.min(uniqueImages?.length || 1, 8),
            spaceBetween: 6,
          },
          768: {
            direction: "vertical",
            slidesPerView: Math.min(uniqueImages?.length || 1, 5),
            spaceBetween: 3,
          },
        }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper mySwiperThumbnails"
      >
        {uniqueImages?.map((v, idx) => (
          <SwiperSlide key={`product-images-${idx}`}>
            <BaseImage
              src={v ? ENV_VARIABLES.IMAGE_BASE_URL + v : null}
              width={450}
              height={300}
              className="w-full object-cover cursor-pointer border border-transparent hover:border-gray-400 transition-colors"
              style={{ aspectRatio: "1 / 1" }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
