"use client";
import homeSmallBanner from "@/app/assets/themes/kidsTheme/home-small-banner.jpg";
import BaseImage from "@/app/components/BaseComponents/BaseImage";
import BaseLink from "@/app/components/BaseComponents/BaseLink";
import CategorySlider from "@/app/components/CategorySlider";
import HomepageSection from "@/app/components/home/HomepageSection";
import Loader from "@/app/components/Shared/Loader";
import { loadThemeComponents } from "@/app/components/Themes/autoLoader";
import AboutUsSection from "@/app/components/Themes/KidsTheme/AboutUsSection";
import CategoriesSection from "@/app/components/Themes/KidsTheme/CategoriesSection";
import HeroSection from "@/app/components/Themes/KidsTheme/HeroSection";
import Newsletter from "@/app/components/Themes/KidsTheme/Newsletter";
import ParentCategoriesGrid from "@/app/components/Themes/KidsTheme/ParentCategoriesGrid";
import PopularCatTabs from "@/app/components/Themes/KidsTheme/PopularCatTabs";
import ProductsSlider from "@/app/components/Themes/KidsTheme/ProductsSlider";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import { useStore } from "@/app/providers/StoreProvider";
import HomepageService from "@/app/services/HomepageServices";
import ParentCategoryServices from "@/app/services/ParentCategoryServices";
import ProductServices from "@/app/services/ProductServices";

const HomePage = () => {
	const store = useStore();
	const {
		// HeroSection,
		// CategoriesSection,
		// PopularCatTabs,
		TrendingCategoriesSection,
		// ProductsSlider,
		FeaturesSection,
		// AboutUsSection,
		// ParentCategoriesGrid,
		// Newsletter,
	} = loadThemeComponents(store.themeName);

	const { data: homepageSections, isLoading: homepageSectionsLoading } =
		useFetchReactQuery(
			() => HomepageService.getHomepageSections(),
			["homepageSections"],
			{ enabled: true },
		);
	const { data: parentCategories, isLoading: parentCategoriesLoading } =
		useFetchReactQuery(
			() => ParentCategoryServices.getParentCategories(store.themeName),
			["parentCategory", store.themeName],
			{ enabled: !!store.themeName },
		);
	const { data: latestProducts, isLoading: latestProdductsLoading } =
		useFetchReactQuery(
			() => ProductServices.getLatestProducts(store.themeName),
			["latestProducts", store.themeName],
			{ enabled: !!store.themeName },
		);

	if (
		parentCategoriesLoading ||
		latestProdductsLoading ||
		homepageSectionsLoading
	)
		return <Loader />;

	return (
		<main>
			{/* <HeroSection images={store.content.heroSlider?.map((img) => img.img)} /> */}
			<section className="flex flex-col gap-18 section-layout-top/ max-md:gap-10">
				{homepageSections?.map((section, idx) => {
					return <HomepageSection section={section} key={idx} />;
				})}
				<hr />
				<CategoriesSection data={parentCategories} />

				<PopularCatTabs />
				<BaseLink href="/products">
					<BaseImage
						src={homeSmallBanner}
						alt="special-sale"
						className="w-full h-auto max-md:min-h-[16vh] object-cover md:object-contain cursor-pointer"
					/>
				</BaseLink>

				<ParentCategoriesGrid
					// title="FOOTWEAR"
					data={store.content.bestSellingCategories}
					bgColor="bg-primary/80"
					showTitle={false}
				/>

				{/* <TrendingCategoriesSection /> */}
				<section className="container-layout">
					<ProductsSlider
						title="best selling products"
						slug=""
						productsData={
							latestProducts?.records?.length > 0
								? latestProducts?.records.slice(60, 70)
								: store.content.bestSellingProducts
						}
					/>
				</section>

				{/* <ParentCategoriesGrid
					title="FOOTWEAR"
					data={store.content.parentCatgores}
				/> */}

				<section>
					<h3 className="mb-4 container-layout h3 font-bold text-center text-primary uppercase">
						More To Explore
					</h3>
					<CategorySlider data={parentCategories} isStoreData />
					{/* <CategoriesSection data={parentCategories || []} isSlider={false} /> */}
				</section>
				<section className="container-layout">
					<ProductsSlider
						title="sale"
						slug=""
						// productsData={store.content.saleProducts}
						productsData={
							latestProducts?.records?.length > 0
								? latestProducts?.records.slice(30, 40)
								: store.content.saleProducts
						}
					/>
				</section>

				<FeaturesSection />
				<AboutUsSection />
			</section>
			<Newsletter />
		</main>
	);
};

export default HomePage;
