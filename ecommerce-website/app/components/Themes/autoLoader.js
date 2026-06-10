// components/Themes/autoLoader.js
import dynamic from "next/dynamic";

/**
 * Automatically loads a theme folder and memoizes the result
 * @param {string} theme - theme name (e.g., "Theme1", "Theme2")
 */
const cache = {}; // store components by theme so we don't recreate them

export function loadThemeComponents(theme) {
	if (cache[theme]) {
		return cache[theme]; // return memoized components if already loaded
	}

	let components;

	try {
		components = {
			HeroSection: dynamic(() => import(`./${theme}/HeroSection`)),
			Footer: dynamic(() => import(`./${theme}/Footer`)),
			Navbar: dynamic(() => import(`./${theme}/Navbar`)),
			CategoriesSection: dynamic(() => import(`./${theme}/CategoriesSection`)),
			PopularCatTabs: dynamic(() => import(`./${theme}/PopularCatTabs`)),
			ProductsSlider: dynamic(() => import(`./${theme}/ProductsSlider`)),
			FeaturesSection: dynamic(() => import(`./${theme}/FeaturesSection`)),
			AboutUsSection: dynamic(() => import(`./${theme}/AboutUsSection`)),
			ParentCategoriesGrid: dynamic(
				() => import(`./${theme}/ParentCategoriesGrid`),
			),
			TrendingCategoriesSection: dynamic(
				() => import(`./${theme}/TrendingCategoriesSection`),
			),
			Newsletter: dynamic(() => import(`./${theme}/Newsletter`)),
		};
	} catch (err) {
		console.error(
			`Theme "${theme}" not found, falling back to FurnitureTheme`,
			err,
		);
		// default theme
		components = {
			HeroSection: dynamic(() => import("./KidsTheme/HeroSection")),
			Footer: dynamic(() => import("./KidsTheme/Footer")),
			Navbar: dynamic(() => import("./KidsTheme/Navbar")),
			CategoriesSection: dynamic(() => import("./KidsTheme/CategoriesSection")),
			PopularCatTabs: dynamic(() => import("./KidsTheme/PopularCatTabs")),
			ProductsSlider: dynamic(() => import("./KidsTheme/ProductsSlider")),
			FeaturesSection: dynamic(() => import("./KidsTheme/FeaturesSection")),
			TrendingCategoriesSection: dynamic(
				() => import("./KidsTheme/TrendingCategoriesSection"),
			),
		};
	}

	// store in cache so we reuse the same references
	cache[theme] = components;

	return components;
}
