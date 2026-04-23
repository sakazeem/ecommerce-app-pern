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
	const { FeaturesSection } = loadThemeComponents(store.themeName);

	const { data: homepageSections, isLoading: homepageSectionsLoading } =
		useFetchReactQuery(
			() => HomepageService.getHomepageSections(),
			["homepageSections"],
			{ enabled: true },
		);

	if (homepageSectionsLoading) return <Loader />;

	return (
		<main>
			<section className="flex flex-col gap-18 section-layout-top/ max-md:gap-10">
				{homepageSections?.map((section, idx) => {
					return <HomepageSection section={section} key={idx} />;
				})}
				<FeaturesSection />
				<AboutUsSection />
			</section>
			<Newsletter />
		</main>
	);
};

export default HomePage;
