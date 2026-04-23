import { getTheme } from "@/app/lib/getTheme";
import { StoreProvider } from "@/app/providers/StoreProvider";
import "@/app/styles/headings.css";
import "@/app/styles/layout.css";
import "@/app/styles/paragraphs.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// Import some common Google Fonts (extend this list as needed)

import dynamic from "next/dynamic";
const ToastContainer = dynamic(
	() => import("react-toastify").then((mod) => mod.ToastContainer),
	{ ssr: false },
);

import backgroundPattern from "@/app/assets/themes/kidsTheme/background-pattern.png";

let cachedTheme = null;

// to avoid duplicate API calls
async function getCachedTheme() {
	if (!cachedTheme) cachedTheme = await getTheme();
	return cachedTheme;
}

const defaultMetaTags = {
	title: "BabiesNBaba - Online Baby Store for Clothes, Toys & Essentials",
	description:
		"Discover a wide range of baby products at BabiesNBaba. From cute clothes to toys and essentials, shop quality items for your little one with ease.",
};

export async function generateMetadata() {
	const store = await getCachedTheme();

	const meta = store?.metaTags || {};

	return {
		title: meta.title || defaultMetaTags.title,
		description: meta.description || defaultMetaTags.description,
		keywords: meta.keywords || "shop, ecommerce, default",
		openGraph: {
			title: meta.ogTitle || meta.title || defaultMetaTags.title,
			description:
				meta.ogDescription || meta.description || defaultMetaTags.description,
			images: meta.ogImage ? [meta.ogImage] : [],
		},
		twitter: {
			card: "summary_large_image",
			title: meta.twitterTitle || meta.title || defaultMetaTags.title,
			description:
				meta.twitterDescription ||
				meta.description ||
				defaultMetaTags.description,
			images: meta.twitterImage ? [meta.twitterImage] : [],
		},
		icons: {
			icon: store.favicon || "/favicon.ico", // fallback
		},
	};
}

export default async function RootLayout({ children }) {
	const store = await getCachedTheme();

	// const fontClasses =
	// 	fontMap[store?.fontFamily?.toLowerCase()] || fontMap.inter;

	const colors = store.theme || {
		primary: "#1E40AF",
		secondary: "#9333EA",
		background: "#F9FAFB",
		text: "#111827",
	};

	return (
		<div
			style={{
				// need to define theme colors here and in app/globals.css in @theme <-- for new colors
				["--color-header"]: colors.header,
				["--color-headerText"]: colors.headerText,
				["--color-primary"]: colors.primary,
				["--color-footer"]: colors.footer,
				["--color-cardsBg"]: colors.cardsBg,
				["--color-secondary"]: colors.secondary,
				["--color-background"]: colors.background,
				["--color-text"]: colors.text,
				backgroundImage: `url(${backgroundPattern.src})`,
				backgroundRepeat: "repeat",
				backgroundSize: "contain",
			}}>
			<ToastContainer />
			<StoreProvider value={store}>{children}</StoreProvider>
		</div>
	);
}
