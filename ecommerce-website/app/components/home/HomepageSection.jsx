import { ENV_VARIABLES } from "@/app/constants/env_variables";
import CategorySlider from "../CategorySlider";
import CategoriesSection from "../Themes/KidsTheme/CategoriesSection";
import HeroSection from "../Themes/KidsTheme/HeroSection";
import ParentCategoriesGrid from "../Themes/KidsTheme/ParentCategoriesGrid";
import PopularCatTabs from "../Themes/KidsTheme/PopularCatTabs";
import ProductsSlider from "../Themes/KidsTheme/ProductsSlider";
import VideoHeroSection from "../Themes/KidsTheme/VideoHeroSection";
import ProductsSliderClient from "../Themes/KidsTheme/ServerSideComponents/ProductsSliderComp/ProductsSlider.server";

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
		// case "video_slider":
		// return null;
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
			return config.image && <HomeBanner config={config} />;

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
					<ProductsSliderClient
						title={title}
						slug=""
						limit={config.limit}
						isSlider={config.layout === "slider"}
						isFetchProducts
						categoryId={config.category?.id}
						categorySlug={config.category?.slug}
						query={config.category_id}
						poolCategoryIds={
							config.pool_categories?.map((cat) => cat.id) || undefined
						}
						selectedProductIds={
							config.selected_product_ids?.length
								? config.selected_product_ids
								: undefined
						}
						columns="grid-cols-5"
					/>
				</section>
			);

		default:
			return null;
	}
}
