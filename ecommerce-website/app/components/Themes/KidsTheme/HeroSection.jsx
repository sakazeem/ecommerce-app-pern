"use client";
import BaseImage from "../../BaseComponents/BaseImage";
import BaseSlider from "../../BaseComponents/BaseSlider";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HeroSection = ({ slides = [], autoplay = false }) => {
  const router = useRouter();

  return (
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
        const img = (
          // <BaseImage
          //   src={slide.src}
          //   key={idx}
          //   className="w-full h-auto max-md:min-h-[25vh] max-md:object-cover"
          // />

          <Image
            key={idx}
            src={slide.src}
            width={600}
            height={600}
            className="w-full h-auto max-md:min-h-[25vh] max-md:object-cover"
            alt={""}
            unoptimized
          />
        );

        if (slide.categorySlug) {
          return (
            <div
              key={idx}
              className="cursor-pointer"
              onClick={() =>
                router.push(`/products?category=${slide.categorySlug}`)
              }
            >
              {img}
            </div>
          );
        }

        return img;
      }}
    />
  );
};

export default HeroSection;
