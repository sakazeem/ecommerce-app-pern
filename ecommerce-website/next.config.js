const createNextIntlPlugin = require("next-intl/plugin");
// import './app/i18n/request'

const withNextIntl = createNextIntlPlugin("./app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/collection/:category",
				destination: "/products?category=:category",
				permanent: true,
			},
			{
				source: "/brand/:brand",
				destination: "/products?brand=:brand",
				permanent: true,
			},
			{
				source: "/collection/:category/",
				destination: "/products?category=:category",
				permanent: true,
			},
			{
				source: "/brand/:brand/",
				destination: "/products?brand=:brand",
				permanent: true,
			},
			{
				source: "/:locale/collection/:category",
				destination: "/:locale/products?category=:category",
				permanent: true,
			},
			{
				source: "/:locale/brand/:brand",
				destination: "/:locale/products?brand=:brand",
				permanent: true,
			},
			{
				source: "/:locale/collection/:category/",
				destination: "/:locale/products?category=:category",
				permanent: true,
			},
			{
				source: "/:locale/brand/:brand/",
				destination: "/:locale/products?brand=:brand",
				permanent: true,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
				pathname: "/**",
				search: "",
			},
			{
				protocol: "https",
				hostname: "api.babiesnbaba.com",
				port: "",
				pathname: "/**",
				search: "",
			},
			{
				protocol: "https",
				hostname: "cdn.babiesnbaba.com",
				port: "",
				pathname: "/**",
				search: "",
			},
			{
				protocol: "https",
				hostname: "www.facebook.com",
				port: "",
				pathname: "/**",
				search: "",
			},
			{
				protocol: "http",
				hostname: "72.61.149.213",
				port: "4000",
				pathname: "/**",
				search: "",
			},
			{
				protocol: "http",
				hostname: "localhost",
				port: "4000",
				pathname: "/**",
				search: "",
			},
		],
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 60 * 60 * 24 * 365, // ✅ 1 year cache
		deviceSizes: [320, 375, 425, 640, 750, 1024, 1280],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	experimental: {
		optimizeCss: true,
		optimizePackageImports: [
			"lucide-react", // you're already using this
			"@radix-ui/react-*", // add any UI lib you use
			"framer-motion",
		],
	},
	// ✅ reduces JS/CSS bundle sizes
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	// ✅ Output as standalone (smaller bundle)
	output: "standalone",
	// ✅ Compress static files
	compress: true,
	// ✅ PoweredBy header removal (security)
	poweredByHeader: false,

	// ✅ React strict mode
	reactStrictMode: true,

	// ✅ SWC minification (faster)
	swcMinify: true,
};

module.exports = withNextIntl(nextConfig);
