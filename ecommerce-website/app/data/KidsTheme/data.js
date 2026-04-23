import heroSliderSlide1 from "@/app/assets/themes/kidsTheme/hero-slider-slide1.jpg";
import heroSliderSlide2 from "@/app/assets/themes/kidsTheme/hero-slider-slide2.jpg";
import heroSliderSlide3 from "@/app/assets/themes/kidsTheme/hero-slider-slide3.jpg";
import babaCat from "@/app/assets/themes/kidsTheme/categories/baba.png";
import babyCat from "@/app/assets/themes/kidsTheme/categories/baby.png";
import bathCat from "@/app/assets/themes/kidsTheme/categories/bath.png";
import feedingCat from "@/app/assets/themes/kidsTheme/categories/feeding.png";
import softToysCat from "@/app/assets/themes/kidsTheme/categories/soft-toys.png";
import nurseryCat from "@/app/assets/themes/kidsTheme/categories/nursery.png";
import shoesCat from "@/app/assets/themes/kidsTheme/categories/shoes.png";
import socksCat from "@/app/assets/themes/kidsTheme/categories/socks.jpeg";
import bootiesCat from "@/app/assets/themes/kidsTheme/categories/booties.webp";
import sandalsCat from "@/app/assets/themes/kidsTheme/categories/sandals.png";
import accessoriesCat from "@/app/assets/themes/kidsTheme/categories/Accessories.webp";
import blanketsCat from "@/app/assets/themes/kidsTheme/categories/blankets.webp";
import bodysuits___rompersCat from "@/app/assets/themes/kidsTheme/categories/bodysuits___rompers.webp";
import carry_nestsCat from "@/app/assets/themes/kidsTheme/categories/carry_nests.webp";
import diaper_bagsCat from "@/app/assets/themes/kidsTheme/categories/diaper_bags.webp";
import gift_setsCat from "@/app/assets/themes/kidsTheme/categories/gift_sets.webp";
import Lunch_boxes___bottlesCat from "@/app/assets/themes/kidsTheme/categories/Lunch_boxes___bottles.webp";
import sleepsuitsCat from "@/app/assets/themes/kidsTheme/categories/sleepsuits.png";
import swaddlesCat from "@/app/assets/themes/kidsTheme/categories/swaddles.webp";
import Sweaters___mock_necksCat from "@/app/assets/themes/kidsTheme/categories/Sweaters___mock_necks.webp";
import towelsCat from "@/app/assets/themes/kidsTheme/categories/towels.webp";
import Wrapping_sheetsCat from "@/app/assets/themes/kidsTheme/categories/Wrapping_sheets.webp";
import p1 from "@/app/assets/themes/kidsTheme/products/p1.png";
import p2 from "@/app/assets/themes/kidsTheme/products/p2.png";
import p3 from "@/app/assets/themes/kidsTheme/products/p3.png";
import p4 from "@/app/assets/themes/kidsTheme/products/p4.png";
import p5 from "@/app/assets/themes/kidsTheme/products/p5.png";
import p6 from "@/app/assets/themes/kidsTheme/products/p6.png";
import p7 from "@/app/assets/themes/kidsTheme/products/p7.png";
import p8 from "@/app/assets/themes/kidsTheme/products/p8.png";
import p9 from "@/app/assets/themes/kidsTheme/products/p9.png";
import p10 from "@/app/assets/themes/kidsTheme/products/p10.png";
import p11 from "@/app/assets/themes/kidsTheme/products/p11.png";
import p12 from "@/app/assets/themes/kidsTheme/products/p12.png";
import p13 from "@/app/assets/themes/kidsTheme/products/p13.png";
import p14 from "@/app/assets/themes/kidsTheme/products/p14.png";
import p15 from "@/app/assets/themes/kidsTheme/products/p5.png";
import p16 from "@/app/assets/themes/kidsTheme/products/p16.png";

import returnFeatureIcon from "@/app/assets/themes/kidsTheme/return.webp";
import securePaymentFeatureIcon from "@/app/assets/themes/kidsTheme/secure-payment.webp";
import certifiedFeatureIcon from "@/app/assets/themes/kidsTheme/certified.webp";
import shippingFeatureIcon from "@/app/assets/themes/kidsTheme/fast-shipping.webp";
import trendingCategory from "@/app/assets/themes/kidsTheme/trending-category.png";
import bestSellerCategory from "@/app/assets/themes/kidsTheme/best-seller-category.png";
import comfortableClothesCategory from "@/app/assets/themes/kidsTheme/comfortable-clothes-category.png";

export const KIDSTHEME_DATA = {
	navCategories: [
		{
			to: "/",
			title: "Home",
		},
		{
			id: 1,
			slug: "fashion",
			title: "Fashion",
			children: [
				{
					id: 2,
					slug: "baby-accessories",
					title: "Baby Accessories",
					children: [
						{ id: 3, slug: "swaddles", title: "Swaddles" },
						{ id: 4, slug: "blankets", title: "Blankets" },
						{ id: 5, slug: "wrapping-sheets", title: "Wrapping Sheets" },
						{ id: 6, slug: "towels", title: "Towels" },
						{ id: 7, slug: "bibs-caps-hats", title: "Bibs, Caps & Hats" },
						{ id: 8, slug: "mittens-gloves", title: "Mittens & Gloves" },
						{ id: 9, slug: "socks-booties", title: "Socks & Booties" },
						{ id: 10, slug: "gift-sets", title: "Gift Sets" },
					],
				},
				{
					id: 11,
					slug: "baby",
					title: "Baby",
					children: [
						{ id: 12, slug: "bodysuits-rompers", title: "Bodysuits & Rompers" },
						{ id: 13, slug: "sleepwear", title: "Sleepwear" },
						{ id: 14, slug: "tops", title: "Tops" },
						{ id: 15, slug: "bottoms", title: "Bottoms" },
						{ id: 16, slug: "dresses", title: "Dresses" },
						{ id: 17, slug: "innerwear", title: "Innerwear" },
						{ id: 18, slug: "outerwear", title: "Outerwear" },
						{ id: 19, slug: "costumes", title: "Costumes" },
						{ id: 20, slug: "accessories", title: "Accessories" },
					],
				},
				{
					id: 21,
					slug: "footwear",
					title: "Footwear",
					children: [
						{ id: 22, slug: "socks", title: "Socks" },
						{ id: 23, slug: "booties", title: "Booties" },
						{ id: 24, slug: "casual-wear", title: "Casual Wear" },
						{ id: 25, slug: "sandals", title: "Sandals" },
					],
				},
			],
		},

		{
			id: 26,
			slug: "gear",
			title: "Gear",
			children: [
				{
					id: 27,
					slug: "shop-by-category",
					title: "Shop By Category",
					children: [
						{ id: 28, slug: "strollers-prams", title: "Strollers & Prams" },
						{
							id: 29,
							slug: "walkers-push-along",
							title: "Walkers & Push Along",
						},
						{
							id: 30,
							slug: "car-seats-carrycots-carriers",
							title: "Car Seats Carrycots & Carriers",
						},
						{
							id: 31,
							slug: "bouncers-rockers-swings",
							title: "Bouncers Rockers & Swings",
						},
						{
							id: 32,
							slug: "highchair-booster-seats",
							title: "Highchair & Booster Seats",
						},
						{ id: 33, slug: "playmats-playgyms", title: "Playmats & Playgyms" },
						{
							id: 34,
							slug: "tricycles-bicycles",
							title: "Tricycles & Bicycles",
						},
						{ id: 35, slug: "rideons-scooters", title: "Rideons & Scooters" },
						{ id: 36, slug: "travel-bags", title: "Travel Bags" },
					],
				},
				{
					id: 37,
					slug: "popular-brands",
					title: "Popular Brands",
					children: [
						{ id: 38, slug: "sunshine", title: "Sunshine" },
						{ id: 39, slug: "ingenuity", title: "Ingenuity" },
						{ id: 40, slug: "junior", title: "Junior" },
						{ id: 41, slug: "tinnies", title: "Tinnies" },
						{ id: 42, slug: "mastela", title: "Mastela" },
						{ id: 43, slug: "infantes", title: "Infantes" },
						{ id: 44, slug: "little-sparks", title: "Little Sparks" },
					],
				},
			],
		},

		{ id: 45, slug: "feeding", title: "Feeding", children: [] },
		{ id: 46, slug: "bath-and-shower", title: "Bath & Shower", children: [] },
		{ id: 47, slug: "safety-toys", title: "Safety Toys", children: [] },
		{ id: 48, slug: "diapering", title: "Diapering", children: [] },
		{ id: 49, slug: "nursery", title: "Nursery", children: [] },
		{ id: 50, slug: "moms", title: "Moms", children: [] },
		{ id: 51, slug: "sale", title: "Sale", children: [] },
	],

	heroSlider: [
		{
			img: heroSliderSlide1,
		},
		{
			img: heroSliderSlide2,
		},
		{
			img: heroSliderSlide3,
		},
		// {
		// 	img: heroSliderSlide,
		// },
	],

	features: [
		{
			icon: returnFeatureIcon,
			title: "15 DAY RETURNS",
			description: "No-nonsense return policy if you are not happy",
		},
		{
			icon: shippingFeatureIcon,
			title: "FAST SHIPING",
			description: "Your precious package is expedited",
		},
		{
			icon: certifiedFeatureIcon,
			title: "GLOBAL CERTIFIED",
			description: "5 star reviews from reputable units around the world",
		},
		{
			icon: securePaymentFeatureIcon,
			title: "SECURE PAYMENT",
			description: "Pay with the smartest and most secure apps",
		},
	],

	categories: [
		{ title: "baba", icon: babaCat, slug: "baba" },
		{ title: "baby", icon: babyCat, slug: "baby" },
		{ title: "bath", icon: bathCat, slug: "bath" },
		{ title: "feeding", icon: feedingCat, slug: "feeding" },
		{ title: "shoes", icon: shoesCat, slug: "shoes" },
		{ title: "nursery", icon: nurseryCat, slug: "nursery" },
		{ title: "soft toys", icon: softToysCat, slug: "toys" },
	],

	parentCatgores: [
		{ title: "booties", icon: bootiesCat, slug: "booties" },
		{ title: "shoes", icon: shoesCat, slug: "shoes" },
		{ title: "socks", icon: socksCat, slug: "socks" },
		{ title: "sandals", icon: sandalsCat, slug: "sandals" },
	],

	bestSellingCategories: [
		{ title: "booties", icon: accessoriesCat, slug: "booties" },
		{ title: "shoes", icon: blanketsCat, slug: "shoes" },
		{ title: "socks", icon: bodysuits___rompersCat, slug: "socks" },
		{ title: "sandals", icon: carry_nestsCat, slug: "sandals" },
		{ title: "booties", icon: diaper_bagsCat, slug: "booties" },
		{ title: "shoes", icon: gift_setsCat, slug: "shoes" },
		{ title: "socks", icon: Lunch_boxes___bottlesCat, slug: "socks" },
		{ title: "sandals", icon: sleepsuitsCat, slug: "sandals" },
		{ title: "booties", icon: swaddlesCat, slug: "booties" },
		{ title: "shoes", icon: Sweaters___mock_necksCat, slug: "shoes" },
		{ title: "socks", icon: towelsCat, slug: "socks" },
		{ title: "sandals", icon: Wrapping_sheetsCat, slug: "sandals" },
	],

	popularTabs: [
		{
			id: 2,
			title: "Baby Accessories",
			description: null,
			slug: "baby-accessories",
			icons: null,
		},
		{
			id: 3,
			title: "Swaddles",
			description: null,
			slug: "swaddles",
			icons: null,
		},

		{
			id: 66,
			title: "Toys",
			description: null,
			slug: "toys",
			icons: null,
		},
	],
	// popularTabs: [
	// 	{
	// 		label: "Kidzo",
	// 		id: 164,
	// 		title: "baby care",
	// 		products: [
	// 			{
	// 				id: 106,
	// 				sku: "100078",
	// 				title: "Baby adjustable swaddle doted blue | Kidzo",
	// 				excerpt:
	// 					"Soft, breathable, and adjustable blue swaddle by Kidzo—designed to keep your baby safe, cozy, and comfortably wrapped all night.",
	// 				slug: "baby-adjustable-swaddle-blue-kidzo",
	// 				base_price: 400,
	// 				base_discount_percentage: 25,
	// 				thumbnail:
	// 					"/image/upload/v1766382009/baby-adjustable-swaddle-blue-kidzo_1_vf8ndr.jpg",
	// 				images: [
	// 					"/image/upload/v1766382009/baby-adjustable-swaddle-blue-kidzo_1_vf8ndr.jpg",
	// 					"/image/upload/v1766382010/baby-adjustable-swaddle-blue-kidzo_2_owhmul.jpg",
	// 					"/image/upload/v1766382008/baby-adjustable-swaddle-blue-kidzo_3_pd298y.jpg",
	// 				],
	// 			},
	// 			{
	// 				id: 107,
	// 				title: "Baby adjustable swaddle doted white | Kidzo",
	// 				slug: "baby-adjustable-swaddle-white-kidzo",
	// 				base_price: 400,
	// 				base_discount_percentage: 25,
	// 				thumbnail:
	// 					"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_1_uo8qmz.jpg",

	// 				price: 400,
	// 				discount: 25,
	// 				sku: "100077",

	// 				images: [
	// 					"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_1_uo8qmz.jpg",
	// 					"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_2_uvkzkq.jpg",
	// 					"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_3_abjnfw.jpg",
	// 					"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_4_y90i7c.jpg",
	// 				],
	// 			},
	// 			{
	// 				id: 108,
	// 				title: "Baby adjustable swaddle doted pink | Kidzo",
	// 				slug: "baby-adjustable-swaddle-pink-kidzo",
	// 				base_price: 400,
	// 				base_discount_percentage: 25,
	// 				thumbnail:
	// 					"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_3_vak8x3.jpg",

	// 				price: 400,
	// 				discount: 25,
	// 				sku: "100075",
	// 				images: [
	// 					"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_3_vak8x3.jpg",
	// 					"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_2_vdmy9b.jpg",
	// 					"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_1_t79laq.jpg",
	// 				],
	// 			},
	// 			{
	// 				id: 109,
	// 				title: "Baby adjustable swaddle bear white | Kidzo",
	// 				slug: "baby-adjustable-swaddle-bear-white-kidzo",
	// 				base_price: 400,
	// 				base_discount_percentage: 25,
	// 				thumbnail:
	// 					"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_1_qbopwg.jpg",

	// 				price: 400,
	// 				discount: 25,
	// 				sku: "100078",
	// 				images: [
	// 					"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_1_qbopwg.jpg",
	// 					"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_2_bg8g2c.jpg",
	// 					"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_3_qzmzrb.jpg",
	// 					"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_4_cfclk3.jpg",
	// 					"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_5_wse9cv.jpg",
	// 					"/image/upload/v1766384743/Baby-adjustable-swaddle-bear-white-Kidzo_6_p0rcp9.jpg",
	// 					"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_7_jg3vvj.jpg",
	// 				],
	// 			},
	// 			{
	// 				id: 110,
	// 				title: "Baby adjustable swaddle box baby pink | Kidzo",
	// 				slug: "baby-adjustable-swaddle-box-baby-pink-kidzo",
	// 				sku: "100083",
	// 				base_price: 400,
	// 				base_discount_percentage: 25,
	// 				thumbnail:
	// 					"/image/upload/v1766384962/baby-adjustable-swaddle-box-baby-pink-kidzo_1_xjoztl.jpg",

	// 				price: 400,
	// 				discount: 25,
	// 				images: [
	// 					"/image/upload/v1766384962/baby-adjustable-swaddle-box-baby-pink-kidzo_1_xjoztl.jpg",
	// 					"/image/upload/v1766384962/baby-adjustable-swaddle-box-baby-pink-kidzo_2_gm5jjl.jpg",
	// 				],
	// 			},
	// 			{
	// 				id: 1,
	// 				image: p1,
	// 				title: "Little Stars Dress",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 2,
	// 				image: p2,
	// 				title: "Baby Bear Hoodie",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 3,
	// 				image: p3,
	// 				title: "Junior Jogger Pants",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 4,
	// 				image: p4,
	// 				title: "Mini Denim Jacket",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 5,
	// 				image: p5,
	// 				title: "Petite Plaid Skirt",
	// 				base_price: 16.0,
	// 			},
	// 			// // {
	// 			// // 	id: 6,
	// 			// // 	image: p6,
	// 			// // 	title: "Little Ladybug Overalls",
	// 			// // 	base_price: 16.0,
	// 			// // },
	// 			// {
	// 			// 	id: 7,
	// 			// 	image: p7,
	// 			// 	title: "Junior Jersey Dress",
	// 			// 	base_price: 16.0,
	// 			// },
	// 		],
	// 	},
	// 	{
	// 		label: "Boys' Clothing",
	// 		products: [
	// 			{
	// 				id: 1,
	// 				image: p1,
	// 				title: "Little Stars Dress",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 2,
	// 				image: p2,
	// 				title: "Baby Bear Hoodie",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 3,
	// 				image: p3,
	// 				title: "Junior Jogger Pants",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 4,
	// 				image: p4,
	// 				title: "Mini Denim Jacket",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 5,
	// 				image: p5,
	// 				title: "Petite Plaid Skirt",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 6,
	// 				image: p6,
	// 				title: "Little Ladybug Overalls",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 7,
	// 				image: p7,
	// 				title: "Junior Jersey Dress",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 8,
	// 				image: p8,
	// 				title: "Toddler Tutu Dress",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 4,
	// 				image: p4,
	// 				title: "Mini Denim Jacket",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 5,
	// 				image: p5,
	// 				title: "Petite Plaid Skirt",
	// 				base_price: 16.0,
	// 			},
	// 		],
	// 	},
	// 	{
	// 		label: "Accessories",
	// 		products: [
	// 			{
	// 				id: 1,
	// 				image: p1,
	// 				title: "Little Stars Dress",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 2,
	// 				image: p2,
	// 				title: "Baby Bear Hoodie",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 3,
	// 				image: p3,
	// 				title: "Junior Jogger Pants",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 4,
	// 				image: p4,
	// 				title: "Mini Denim Jacket",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 5,
	// 				image: p5,
	// 				title: "Petite Plaid Skirt",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 6,
	// 				image: p6,
	// 				title: "Little Ladybug Overalls",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 7,
	// 				image: p7,
	// 				title: "Junior Jersey Dress",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 8,
	// 				image: p8,
	// 				title: "Toddler Tutu Dress",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 3,
	// 				image: p3,
	// 				title: "Junior Jogger Pants",
	// 				base_price: 16.0,
	// 			},
	// 			{
	// 				id: 4,
	// 				image: p4,
	// 				title: "Mini Denim Jacket",
	// 				base_price: 16.0,
	// 			},
	// 		],
	// 	},
	// ],
	trendingCategories: [
		{
			title: "Latest Trending",
			description: "Holiday Deals On Fashion Clothes",
			query: "trending",
			image: trendingCategory,
		},
		{
			title: "Best Seller",
			description: "Spring & Summer Accessories Trend",
			query: "best-seller",
			image: bestSellerCategory,
		},
		{
			title: "Comfortable Clothes",
			description: "Practical Clothes For Your Kids",
			query: "clothes",
			image: comfortableClothesCategory,
		},
	],
	bestSellingProducts: [
		{
			id: 106,
			sku: "100078",
			title: "Baby adjustable swaddle doted blue | Kidzo",
			excerpt:
				"Soft, breathable, and adjustable blue swaddle by Kidzo—designed to keep your baby safe, cozy, and comfortably wrapped all night.",
			slug: "baby-adjustable-swaddle-blue-kidzo",
			base_price: 400,
			base_discount_percentage: 25,
			thumbnail:
				"/image/upload/v1766382009/baby-adjustable-swaddle-blue-kidzo_1_vf8ndr.jpg",
			images: [
				"/image/upload/v1766382009/baby-adjustable-swaddle-blue-kidzo_1_vf8ndr.jpg",
				"/image/upload/v1766382010/baby-adjustable-swaddle-blue-kidzo_2_owhmul.jpg",
				"/image/upload/v1766382008/baby-adjustable-swaddle-blue-kidzo_3_pd298y.jpg",
			],
		},
		{
			id: 107,
			title: "Baby adjustable swaddle doted white | Kidzo",
			slug: "baby-adjustable-swaddle-white-kidzo",
			base_price: 400,
			base_discount_percentage: 25,
			thumbnail:
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_1_uo8qmz.jpg",

			price: 400,
			discount: 25,
			sku: "100077",

			images: [
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_1_uo8qmz.jpg",
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_2_uvkzkq.jpg",
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_3_abjnfw.jpg",
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_4_y90i7c.jpg",
			],
		},
		{
			id: 108,
			title: "Baby adjustable swaddle doted pink | Kidzo",
			slug: "baby-adjustable-swaddle-pink-kidzo",
			base_price: 400,
			base_discount_percentage: 25,
			thumbnail:
				"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_3_vak8x3.jpg",

			price: 400,
			discount: 25,
			sku: "100075",
			images: [
				"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_3_vak8x3.jpg",
				"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_2_vdmy9b.jpg",
				"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_1_t79laq.jpg",
			],
		},
		{
			id: 109,
			title: "Baby adjustable swaddle bear white | Kidzo",
			slug: "baby-adjustable-swaddle-bear-white-kidzo",
			base_price: 400,
			base_discount_percentage: 25,
			thumbnail:
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_1_qbopwg.jpg",

			price: 400,
			discount: 25,
			sku: "100078",
			images: [
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_1_qbopwg.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_2_bg8g2c.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_3_qzmzrb.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_4_cfclk3.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_5_wse9cv.jpg",
				"/image/upload/v1766384743/Baby-adjustable-swaddle-bear-white-Kidzo_6_p0rcp9.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_7_jg3vvj.jpg",
			],
		},
		{
			id: 110,
			title: "Baby adjustable swaddle box baby pink | Kidzo",
			slug: "baby-adjustable-swaddle-box-baby-pink-kidzo",
			sku: "100083",
			base_price: 400,
			base_discount_percentage: 25,
			thumbnail:
				"/image/upload/v1766384962/baby-adjustable-swaddle-box-baby-pink-kidzo_1_xjoztl.jpg",

			price: 400,
			discount: 25,
			images: [
				"/image/upload/v1766384962/baby-adjustable-swaddle-box-baby-pink-kidzo_1_xjoztl.jpg",
				"/image/upload/v1766384962/baby-adjustable-swaddle-box-baby-pink-kidzo_2_gm5jjl.jpg",
			],
		},
		{
			id: 1,
			image: p9,
			title: "Little Stars Dress",
			base_price: 16.0,
		},
		{
			id: 2,
			image: p10,
			title: "Baby Bear Hoodie",
			base_price: 16.0,
		},
		{
			id: 3,
			image: p11,
			title: "Junior Jogger Pants",
			base_price: 16.0,
		},
		{
			id: 4,
			image: p12,
			title: "Mini Denim Jacket",
			base_price: 16.0,
		},
		{
			id: 5,
			image: p13,
			title: "Petite Plaid Skirt",
			base_price: 16.0,
		},
		{
			id: 6,
			image: p14,
			title: "Little Ladybug Overalls",
			base_price: 16.0,
		},
		{
			id: 7,
			image: p15,
			title: "Junior Jersey Dress",
			base_price: 16.0,
		},
		{
			id: 8,
			image: p16,
			title: "Toddler Tutu Dress",
			base_price: 16.0,
		},
	],
	saleProducts: [
		{
			id: 5,
			image: p13,
			title: "Petite Plaid Skirt",
			base_price: 16.0,
		},
		{
			id: 6,
			image: p14,
			title: "Little Ladybug Overalls",
			base_price: 16.0,
		},
		{
			id: 7,
			image: p15,
			title: "Junior Jersey Dress",
			base_price: 16.0,
		},
		{
			id: 8,
			image: p16,
			title: "Toddler Tutu Dress",
			base_price: 16.0,
		},
		{
			id: 1,
			image: p9,
			title: "Little Stars Dress",
			base_price: 16.0,
		},
		{
			id: 2,
			image: p10,
			title: "Baby Bear Hoodie",
			base_price: 16.0,
		},
		{
			id: 3,
			image: p11,
			title: "Junior Jogger Pants",
			base_price: 16.0,
		},
		{
			id: 4,
			image: p12,
			title: "Mini Denim Jacket",
			base_price: 16.0,
		},
	],
	allProducts: [
		{
			id: 1,
			image: p1,
			title: "Little Stars Dress",
			base_price: 16.0,
		},
		{
			id: 2,
			image: p2,
			title: "Baby Bear Hoodie",
			base_price: 16.0,
		},
		{
			id: 3,
			image: p3,
			title: "Junior Jogger Pants",
			base_price: 16.0,
		},
		{
			id: 4,
			image: p4,
			title: "Mini Denim Jacket",
			base_price: 16.0,
		},
		{
			id: 5,
			image: p5,
			title: "Petite Plaid Skirt",
			base_price: 16.0,
		},
		{
			id: 6,
			image: p6,
			title: "Little Ladybug Overalls",
			base_price: 16.0,
		},
		{
			id: 7,
			image: p7,
			title: "Junior Jersey Dress",
			base_price: 16.0,
		},
		{
			id: 8,
			image: p8,
			title: "Toddler Tutu Dress",
			base_price: 16.0,
		},
		{
			id: 9,
			image: p13,
			title: "Petite Plaid Skirt",
			base_price: 16.0,
		},
		{
			id: 10,
			image: p14,
			title: "Little Ladybug Overalls",
			base_price: 16.0,
		},
		{
			id: 11,
			image: p15,
			title: "Junior Jersey Dress",
			base_price: 16.0,
		},
		{
			id: 12,
			image: p16,
			title: "Toddler Tutu Dress",
			base_price: 16.0,
		},
		{
			id: 13,
			image: p9,
			title: "Little Stars Dress",
			base_price: 16.0,
		},
		{
			id: 14,
			image: p10,
			title: "Baby Bear Hoodie",
			base_price: 16.0,
		},
		{
			id: 15,
			image: p11,
			title: "Junior Jogger Pants",
			base_price: 16.0,
		},
	],
	filters: {
		categories: [
			{
				id: 1,
				title: "girls",
			},
			{
				id: 2,
				title: "boys clothing",
			},
			{
				id: 3,
				title: "baby care",
			},
			{
				id: 4,
				title: "safety equipment",
			},
			{
				id: 5,
				title: "activity and gear",
			},
			{
				id: 6,
				title: "baby shoes",
			},
			{
				id: 7,
				title: "children's shoes",
			},
			{
				id: 8,
				title: "family outlet",
			},
		],
		prize: [
			{ id: 1, title: "Rs. 100 - Rs. 200", min: 100, max: 200 },
			{ id: 2, title: "Rs. 200 - Rs. 400", min: 200, max: 400 },
			{ id: 3, title: "Rs. 400 - Rs. 600", min: 400, max: 600 },
			{ id: 4, title: "Rs. 600 - Rs. 800", min: 600, max: 800 },
			{ id: 5, title: "over Rs. 1000", min: 1000, max: 0 },
		],
		size: [
			{ id: 1, title: "XS" },
			{ id: 2, title: "S" },
			{ id: 3, title: "M" },
			{ id: 4, title: "L" },
			{ id: 5, title: "XL" },
		],
	},
	productDetails: [
		{
			id: 106,
			title: "Baby adjustable swaddle doted blue | Kidzo",
			slug: "baby-adjustable-swaddle-blue-kidzo",
			description:
				"The Kidzo Baby Adjustable Swaddle in Blue is made with ultra-soft, breathable cotton to provide your newborn with maximum comfort and security. Its adjustable Velcro wings ensure a perfect fit, helping prevent startle reflex and promoting longer, more peaceful sleep. Ideal for newborns and infants, this swaddle keeps your baby snug, warm, and safely wrapped throughout the night.",
			price: 400,
			discount: 25,
			rating: 4.7,
			reviewsCount: 86,
			sku: "100078",
			categories: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			tags: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			// tags: ["modern", "black", "metal", "round table"],
			images: [
				"/image/upload/v1766382009/baby-adjustable-swaddle-blue-kidzo_1_vf8ndr.jpg",
				"/image/upload/v1766382010/baby-adjustable-swaddle-blue-kidzo_2_owhmul.jpg",
				"/image/upload/v1766382008/baby-adjustable-swaddle-blue-kidzo_3_pd298y.jpg",
			],
			// additionalInfo: {
			// 	material: "Metal Frame + MDF Top",
			// 	dimensions: "45 x 45 x 50 cm",
			// 	weight: "5.2 kg",
			// 	color: "Black",
			// 	madeIn: "Turkey",
			// },
			reviews: [
				{
					user: "Sarah Ahmed",
					rating: 5,
					comment: "Perfect size for my living room! Sturdy and stylish.",
				},
				{
					user: "Ali Raza",
					rating: 4,
					comment: "Good value for money. Easy to assemble.",
				},
			],
		},
		{
			id: 108,
			title: "Baby adjustable swaddle doted pink | Kidzo",
			slug: "baby-adjustable-swaddle-pink-kidzo",
			description:
				"The Kidzo Baby Adjustable Swaddle in Pink is made from ultra-soft, breathable cotton to provide maximum comfort for newborns. Its adjustable Velcro wings offer a snug and secure fit, helping reduce the startle reflex and allowing babies to enjoy longer, peaceful sleep. Ideal for everyday use, this swaddle keeps your little one warm, cozy, and safely wrapped.",
			price: 400,
			discount: 25,
			rating: 4.7,
			reviewsCount: 86,
			sku: "100075",
			categories: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			tags: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			// tags: ["modern", "black", "metal", "round table"],
			images: [
				"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_3_vak8x3.jpg",
				"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_2_vdmy9b.jpg",
				"/image/upload/v1766384414/baby-adjustable-swaddle-pink-kidzo_1_t79laq.jpg",
			],
			// additionalInfo: {
			// 	material: "Metal Frame + MDF Top",
			// 	dimensions: "45 x 45 x 50 cm",
			// 	weight: "5.2 kg",
			// 	color: "Black",
			// 	madeIn: "Turkey",
			// },
			reviews: [
				{
					user: "Sarah Ahmed",
					rating: 5,
					comment: "Perfect size for my living room! Sturdy and stylish.",
				},
				{
					user: "Ali Raza",
					rating: 4,
					comment: "Good value for money. Easy to assemble.",
				},
			],
		},
		{
			id: 107,
			title: "Baby adjustable swaddle doted white | Kidzo",
			slug: "baby-adjustable-swaddle-white-kidzo",
			description:
				"The Kidzo Baby Adjustable Swaddle in White is crafted from gentle, breathable cotton to ensure maximum comfort for newborns. Its adjustable Velcro wings provide a secure and customized fit, reducing the startle reflex and helping babies sleep longer and more peacefully. Perfect for daily use, this swaddle keeps your baby snug, warm, and safely wrapped throughout the night.",
			price: 400,
			discount: 25,
			rating: 4.7,
			reviewsCount: 86,
			sku: "100077",
			categories: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			tags: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			// tags: ["modern", "black", "metal", "round table"],
			images: [
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_1_uo8qmz.jpg",
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_2_uvkzkq.jpg",
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_3_abjnfw.jpg",
				"/image/upload/v1766383549/baby-adjustable-swaddle-white-kidzo_4_y90i7c.jpg",
			],
			// additionalInfo: {
			// 	material: "Metal Frame + MDF Top",
			// 	dimensions: "45 x 45 x 50 cm",
			// 	weight: "5.2 kg",
			// 	color: "Black",
			// 	madeIn: "Turkey",
			// },
			reviews: [
				{
					user: "Sarah Ahmed",
					rating: 5,
					comment: "Perfect size for my living room! Sturdy and stylish.",
				},
				{
					user: "Ali Raza",
					rating: 4,
					comment: "Good value for money. Easy to assemble.",
				},
			],
		},
		{
			id: 109,
			title: "Baby adjustable swaddle bear white | Kidzo",
			slug: "baby-adjustable-swaddle-bear-white-kidzo",
			description:
				"The Kidzo Baby Adjustable Swaddle in Bear White features a soft, breathable cotton fabric with an adorable bear print, offering comfort and style together. Its adjustable Velcro wings allow a secure and customized fit, helping reduce the startle reflex and promoting longer, peaceful sleep. Perfect for newborns, this swaddle keeps your baby warm, snug, and safely wrapped throughout the night.",
			price: 400,
			discount: 25,
			rating: 4.7,
			reviewsCount: 86,
			sku: "100078",
			categories: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			tags: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			// tags: ["modern", "black", "metal", "round table"],
			images: [
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_1_qbopwg.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_2_bg8g2c.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_3_qzmzrb.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_4_cfclk3.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_5_wse9cv.jpg",
				"/image/upload/v1766384743/Baby-adjustable-swaddle-bear-white-Kidzo_6_p0rcp9.jpg",
				"/image/upload/v1766384742/Baby-adjustable-swaddle-bear-white-Kidzo_7_jg3vvj.jpg",
			],
			// additionalInfo: {
			// 	material: "Metal Frame + MDF Top",
			// 	dimensions: "45 x 45 x 50 cm",
			// 	weight: "5.2 kg",
			// 	color: "Black",
			// 	madeIn: "Turkey",
			// },
			reviews: [
				{
					user: "Sarah Ahmed",
					rating: 5,
					comment: "Perfect size for my living room! Sturdy and stylish.",
				},
				{
					user: "Ali Raza",
					rating: 4,
					comment: "Good value for money. Easy to assemble.",
				},
			],
		},
		{
			id: 110,
			title: "Baby adjustable swaddle box baby pink | Kidzo",
			slug: "baby-adjustable-swaddle-box-baby-pink-kidzo",
			description:
				"The Kidzo Baby Adjustable Swaddle in Box Baby Pink is made from soft, breathable cotton and features a charming box pattern for a sweet and stylish look. Its adjustable Velcro wings provide a secure and customized fit that helps reduce the startle reflex, allowing babies to enjoy longer, peaceful sleep. Ideal for everyday use, this swaddle keeps your little one warm, snug, and safely wrapped throughout the night.",
			price: 400,
			discount: 25,
			rating: 4.7,
			reviewsCount: 86,
			sku: "100083",
			categories: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			tags: ["Baby Care", "Baby Accessories", "Swaddles", "Kidzo"],
			// tags: ["modern", "black", "metal", "round table"],
			images: [
				"/image/upload/v1766384962/baby-adjustable-swaddle-box-baby-pink-kidzo_1_xjoztl.jpg",
				"/image/upload/v1766384962/baby-adjustable-swaddle-box-baby-pink-kidzo_2_gm5jjl.jpg",
			],
			// additionalInfo: {
			// 	material: "Metal Frame + MDF Top",
			// 	dimensions: "45 x 45 x 50 cm",
			// 	weight: "5.2 kg",
			// 	color: "Black",
			// 	madeIn: "Turkey",
			// },
			reviews: [
				{
					user: "Sarah Ahmed",
					rating: 5,
					comment: "Perfect size for my living room! Sturdy and stylish.",
				},
				{
					user: "Ali Raza",
					rating: 4,
					comment: "Good value for money. Easy to assemble.",
				},
			],
		},
	],
	cartData: {
		items: [
			{
				id: 6,
				sku: "PRD1",
				title: "Test Product 1",
				excerpt: "Test product excerpt",
				description: "adasdas",
				slug: "product-1",
				meta_title: "sample product 3 meta title",
				meta_description: "test product meta description",
				base_price: 150,
				base_discount_percentage: null,
				thumbnail: "ecommerce/uploads/tshirt_1755265091408.jpg",

				// id: 1,
				// name: "Little Stars Dress",
				// price: 120,
				// discount: 50,
				// quantity: 1,
				// image: p1,
			},
			{
				id: 1,
				name: "Little Stars Dress",
				price: 120,
				discount: 50,
				quantity: 1,
				image: p1,
			},
			{
				id: 2,
				name: "Baby Bear Hoodie",
				price: 80,
				discount: 0,
				quantity: 2,
				image: p2,
			},
		],
		shipping: 10,
	},
};
