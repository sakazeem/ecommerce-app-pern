"use client";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

// import required modules
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
  const slidesData = data.length > 0 ? data : store.content.categories;

  return (
    <>
      <Swiper
        loop={true}
        loopAdditionalSlides={slidesData?.length ?? 0}
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
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
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
        className="flat-coverflow-slider mt-4"
      >
        {slidesData?.map((category, idx) => (
          <SwiperSlide key={`${category.slug ?? category.id ?? idx}`}>
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
    </>
  );
}
