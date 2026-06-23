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
import { useStore } from "../providers/StoreProvider";
import BaseImage from "./BaseComponents/BaseImage";
import BaseLink from "./BaseComponents/BaseLink";

export default function CategorySlider({ data = [], isStoreData }) {
  const store = useStore();
  const raw = data.length > 0 ? data : (store.content.categories ?? []);

  if (!raw.length) return null;

  // Triplicate so there are always enough slides to fill viewport + appear infinite.
  // Swiper's built-in loop + EffectCoverflow breaks with small datasets — this is
  // the reliable alternative: disable loop, let autoplay run through 3x the slides.
  const slidesData = [...raw, ...raw, ...raw];

  return (
    <Swiper
      loop={false}
      initialSlide={raw.length} // start at the middle copy so prev/next both work
      speed={600}
      effect={"coverflow"}
      grabCursor={true}
      centeredSlides={true}
      breakpoints={{
        0: { slidesPerView: 2 },
        640: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
        1280: { slidesPerView: 5 },
      }}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
        stopOnLastSlide: false,
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
      observer={true}
      observeParents={true}
      modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
      className="flat-coverflow-slider mt-4"
    >
      {slidesData.map((category, idx) => (
        <SwiperSlide key={`${category.slug ?? category.id}-${idx}`}>
          <div className="bg-white shadow-xl rounded-xl pb-3">
            <BaseLink href={`/products?category=${category.slug}`}>
              <BaseImage
                src={
                  isStoreData
                    ? category.icon
                    : category.icons
                      ? ENV_VARIABLES.IMAGE_BASE_URL +
                        "sm-image-" +
                        category.icons
                      : noImage
                }
                width={300}
                height={300}
                className="w-full h-auto object-cover rounded-t-xl"
              />
              <h3 className="max-md:hidden h4 text-center capitalize mt-2 font-medium">
                {category.title}
              </h3>
              <h4 className="md:hidden h5 text-center capitalize mt-2 font-normal">
                {category.title}
              </h4>
            </BaseLink>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
