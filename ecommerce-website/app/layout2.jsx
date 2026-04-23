import "@/app/styles/headings.css";
import "@/app/styles/layout.css";
import "@/app/styles/paragraphs.css";
import { Geist, Inter, Roboto } from "next/font/google";
import Script from "next/script";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./globals.css";

import localFont from "next/font/local";
import RouteTrackerProvider from "./providers/RouteTrackerProvider";
import Image from "next/image";
import { getTheme } from "./lib/getTheme";
import backgroundPattern from "@/app/assets/themes/kidsTheme/background-pattern.png";

const champagne = localFont({
	//changing font family its not champagne itlaic
	src: [
		{
			path: "./fonts/Champagne-and-Limousines/Champagne-and-Limousines-Bold-Italic.ttf",
			weight: "700",
			style: "italic",
		},
		{
			path: "./fonts/Champagne-and-Limousines/Champagne-and-Limousines-Bold.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "./fonts/Champagne-and-Limousines/Champagne-and-Limousines-Bold-Italic.ttf",
			weight: "400",
			style: "italic",
		},
		{
			path: "./fonts/Champagne-and-Limousines/Champagne-and-Limousines-Bold.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/Champagne-and-Limousines/Champagne-and-Limousines-Italic.ttf",
			weight: "300",
			style: "italic",
		},
		{
			path: "./fonts/Champagne-and-Limousines/Champagne-and-Limousines.ttf",
			weight: "300",
			style: "normal",
		},
	],
	variable: "--font-champagne", // CSS Variable
	display: "swap",
});

const konnect = localFont({
	//changing font family its not konnect itlaic
	src: [
		{
			path: "./fonts/Konnect/KonnectRegular.otf",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/Konnect/KonnectItalic.otf",
			weight: "400",
			style: "italic",
		},
		{
			path: "./fonts/Konnect/KonnectMedium.otf",
			weight: "500",
			style: "normal",
		},
		{
			path: "./fonts/Konnect/KonnectMediumItalic.otf",
			weight: "500",
			style: "italic",
		},
		{
			path: "./fonts/Konnect/KonnectLight.otf",
			weight: "300",
			style: "normal",
		},
		{
			path: "./fonts/Konnect/KonnectLightItalic.otf",
			weight: "300",
			style: "italic",
		},
		{
			path: "./fonts/Konnect/KonnectSemiBold.otf",
			weight: "600",
			style: "normal",
		},
		{
			path: "./fonts/Konnect/KonnectSemiBoldItalic.otf",
			weight: "600",
			style: "italic",
		},
		{
			path: "./fonts/Konnect/KonnectBold.otf",
			weight: "700",
			style: "normal",
		},
		{
			path: "./fonts/Konnect/KonnectBoldItalic.otf",
			weight: "700",
			style: "italic",
		},
	],
	variable: "--font-konnect", // CSS Variable
	display: "swap",
});

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist",
});

const roboto = Roboto({
	subsets: ["latin"],
	variable: "--font-roboto",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

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
			images: meta.ogImage ? [meta.ogImage] : [store.content.logo],
		},
		twitter: {
			card: "summary_large_image",
			title: meta.twitterTitle || meta.title || defaultMetaTags.title,
			description:
				meta.twitterDescription ||
				meta.description ||
				defaultMetaTags.description,
			images: meta.twitterImage ? [meta.twitterImage] : [store.content.logo],
		},
		icons: {
			icon: store.favicon || "/favicon.ico", // fallback
		},
	};
}

export default async function RootLayout({ children }) {
	const store = await getCachedTheme();
	const fontMap = {
		geist: geist.variable,
		roboto: roboto.variable,
		inter: inter.variable,
		champagne: champagne.variable,
		konnect: konnect.variable,
	};

	const fontClasses = [fontMap.champagne, fontMap.konnect].join(" ");

	const colors = store.theme || {
		primary: "#1E40AF",
		secondary: "#9333EA",
		background: "#F9FAFB",
		text: "#111827",
	};
	// const fontClasses =
	// 	fontMap[store?.fontFamily?.toLowerCase()] || fontMap.inter;

	return (
		<html lang="en">
			<head>
				<meta
					name="facebook-domain-verification"
					content="7gy9rr0f107zjr8thk3ggeebs7v3ty"
				/>
				<Script
					src="https://www.googletagmanager.com/gtag/js?id=G-V6M9W091WE"
					strategy="afterInteractive"
				/>
				<Script id="google-analytics" strategy="afterInteractive">
					{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', 'G-V6M9W091WE');
					`}
				</Script>

				{/* Meta Pixel */}
				<Script id="meta-pixel" strategy="afterInteractive">
					{`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1371248501158222');
            fbq('track', 'PageView');
          `}
				</Script>
			</head>
			<body
				className={`${fontClasses} antialiased`}
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
				{/* Meta Pixel noscript */}
				{/* <noscript>
					<Image
						height="1"
						width="1"
						style={{ display: "none" }}
						alt="facebook-icon"
						src="https://www.facebook.com/tr?id=1371248501158222&ev=PageView&noscript=1"
					/>
				</noscript> */}
				<RouteTrackerProvider />

				{children}
			</body>
		</html>
	);
}
