import logo from "@/app/assets/themes/kidsTheme/logo/logo-bnb-color.svg";
import logoWhite from "@/app/assets/themes/kidsTheme/logo/logo-bnb-white.svg";
import logoBlack from "@/app/assets/themes/kidsTheme/logo/logo-bnb-black.svg";
import footerBg from "@/app/assets/themes/kidsTheme/footer-bg.png";
import heroBanner from "@/app/assets/themes/furnitureTheme/hero-banner.png";

// category images
import golfBat from "@/app/assets/themes/sportsTheme/categories/golf-bat.png";
import golfBall from "@/app/assets/themes/sportsTheme/categories/golf-ball.png";
import golfBag from "@/app/assets/themes/sportsTheme/categories/golf-bag.png";
import tshirt from "@/app/assets/themes/sportsTheme/categories/t-shirt.png";
import shoes from "@/app/assets/themes/sportsTheme/categories/shoes.png";
import gloves from "@/app/assets/themes/sportsTheme/categories/gloves.png";
import { KIDSTHEME_DATA } from "./KidsTheme/data";

export const storeSettingsKidsTheme = {
	themeName: "KidsTheme",
	name: "Babiesnbaba",
	companyName: "B. Babies n Baba",
	currency: "Rs.",
	theme: {
		header: "#E95CA7",
		headerText: "#f5f5f5",
		footer: "#5DABEA",
		light: "#f5f5f5",
		dark: "#000000",
		cardsBg: "#F3F5F7",
		primary: "#5DABEA",
		secondary: "#E95CA7",
		// secondary: "#9333EA",
		// background: "#F9FAFB",
		// text: "#111827",
	},
	content: {
		header: {
			text: "Free Shipping over 3000 | Excluding Sale & Deals",
			link: "/shop",
		},
		logo,
		heroSection: {
			image: heroBanner,
			heading: "Simply Unique Simply Better.",
			text: "3legant is a gift & decorations store based in HCMC, Vietnam. Est since 2019.",
			button: "Shop Now",
			link: "/shop",
		},
		nav: [
			{
				link: "/",
				text: "Home",
			},
			{
				link: "/fashion",
				text: "Fashion",
			},
			{
				link: "/gear",
				text: "Gear",
			},
			{
				link: "/feeding",
				text: "feeding",
			},
			{
				link: "/bath-and-shower",
				text: "bath & shower",
			},
			{
				link: "/safety-toys",
				text: "safety toys",
			},
			{
				link: "/diapering",
				text: "diapering",
			},
			{
				link: "/nursery",
				text: "nursery",
			},
			{
				link: "/moms",
				text: "moms",
			},
			{
				link: "/sale",
				text: "sale",
			},
			{
				link: "/new-arrival",
				text: "new arrival",
			},
		],
		footer: {
			logo: logoWhite,
			text: "More than just a game. It's a lifestyle.",
			background: footerBg,
			sections: [
				// {
				// 	title: "Contact",
				// 	links: [
				// 		{
				// 			text: "Monday to Friday 8 a.m - 5 p.m",
				// 		},
				// 		{
				// 			text: "+01 456 789",
				// 		},
				// 		{
				// 			text: "+01 456 789",
				// 		},
				// 		{
				// 			text: "contact@kidify.com",
				// 			link: "mailto:contact@kidify.com",
				// 		},
				// 	],
				// },
				{
					title: "Customers",
					links: [
						{
							text: "shipping policy",
							link: "/shipping-policy",
						},
						{
							text: "track order",
							link: "/order-tracking",
							// target: "_blank",
						},
						{
							text: "payment methods",
							link: "/payment-methods",
						},
						{
							text: "return and exchange",
							link: "/return-and-exchange",
						},
						{
							text: "terms and conditions",
							link: "/terms-and-conditions",
						},
					],
				},
				{
					title: "Support",
					links: [
						{
							text: "about us",
							link: "/about-us",
						},
						{
							text: "contact us",
							link: "/contact-us",
						},
					],
				},
			],
		},

		...KIDSTHEME_DATA,
	},
	socialLinks: {
		// instagram: "https://www.instagram.com",
		// facebook: "https://www.facebook.com",
		// youtube: "https://www.youtube.com",
		// email: "example@gmail.com",
		// pinterest: "https://www.pinterest.com/",

		facebook: "https://www.facebook.com/babiesandbaba",
		instagram: "https://www.instagram.com/babiesnbaba/",
		tiktok: "https://www.tiktok.com/@babiesnbaba",
		pinterest: "https://www.pinterest.com/babiesnbaba/",
		youtube: "https://www.youtube.com/@Babiesnbaba",
		linktree: "https://linktr.ee/babiesnbaba",
		// website: "http://babiesnbaba.com",
		// whatsapp: "https://wa.me/923340002625",
	},
	details: {
		address: "43111 Hai Trieu street, District 1, HCMC Vietnam",
		contact: "84-756-3237",
	},
};

export const categories = [
	{
		title: "Golf Clubs",
		image: golfBat,
	},
	{
		title: "Golf Balls",
		image: golfBall,
	},
	{
		title: "Golf Bags",
		image: golfBag,
	},
	{
		title: "Clothing & Rainwear",
		image: tshirt,
	},
	{
		title: "Footwaer",
		image: shoes,
	},
	{
		title: "Accessories",
		image: gloves,
	},
];
