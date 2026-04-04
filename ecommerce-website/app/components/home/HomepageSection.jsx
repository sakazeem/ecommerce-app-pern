"use client";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import BaseImage from "../BaseComponents/BaseImage";
import BaseLink from "../BaseComponents/BaseLink";
import CategorySlider from "../CategorySlider";
import CategoriesSection from "../Themes/KidsTheme/CategoriesSection";
import HeroSection from "../Themes/KidsTheme/HeroSection";
import PopularCatTabs from "../Themes/KidsTheme/PopularCatTabs";
import ProductsSlider from "../Themes/KidsTheme/ProductsSlider";
import ParentCategoriesGrid from "../Themes/KidsTheme/ParentCategoriesGrid";
import VideoHeroSection from "../Themes/KidsTheme/VideoHeroSection";

export default function HomepageSection({ section }) {
  const { type, config, title } = section;

  switch (type) {
    case "slider":
      return (
        config.images.length > 0 && (
          <HeroSection
            slides={config.images.map((img) => ({
              // After transformer: img = { imageId: url_string, categoryId, categorySlug }
              src: ENV_VARIABLES.IMAGE_BASE_URL + img.imageId,
              // Use slug for cleaner URL if available, else fall back to id
              categorySlug: img.categorySlug || img.categoryId || null,
            }))}
            autoplay={config.autoplay}
          />
        )
      );

    case "video_slider":
      return (
        config.slides?.length > 0 && (
          <VideoHeroSection
            title={title}
            slides={config.slides.map((s) => ({
              videoUrl: ENV_VARIABLES.IMAGE_BASE_URL + s.videoUrl,
              poster: s.poster
                ? ENV_VARIABLES.IMAGE_BASE_URL + s.poster
                : undefined,
            }))}
            autoplay={config.autoplay}
          />
        )
      );

    case "categories":
      return config.layout === "slider" ? (
        config.design === "square" ? (
          <CategorySlider data={config.categories} />
        ) : (
          <CategoriesSection data={config.categories} isSlider={true} />
        )
      ) : config.design === "circle" ? (
        <CategoriesSection data={config.categories} isSlider={false} />
      ) : (
        <ParentCategoriesGrid
          title={title}
          data={config.categories}
          bgColor={config.color}
          showTitle={true}
        />
      );

    case "banner":
      return (
        config.image && (
          <BaseLink href={config.link || "/"}>
            <BaseImage
              src={ENV_VARIABLES.IMAGE_BASE_URL + config.image}
              alt="banner"
              className="w-full h-auto max-md:min-h-[16vh] object-cover md:object-contain cursor-pointer"
            />
          </BaseLink>
        )
      );

    case "tab":
      return (
        <PopularCatTabs
          title={title}
          tabs={config.tabs}
          productsPerTab={config.products_per_tab}
        />
      );

    case "products":
      return (
        <section className="container-layout">
          <ProductsSlider
            title={title}
            slug=""
            limit={config.limit}
            isSlider={config.layout === "slider"}
            isFetchProducts
            categoryId={config.category?.id}
            categorySlug={config.category?.slug}
            query={config.category_id}
          />
        </section>
      );

    default:
      return null;
  }
}
