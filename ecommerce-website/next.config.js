const createNextIntlPlugin = require("next-intl/plugin");
// import './app/i18n/request'

const withNextIntl = createNextIntlPlugin("./app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
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
		minimumCacheTTL: 60 * 60 * 24 * 30,
	},
	// experimental: {
	// 	optimizeCss: true,
	// },
};

module.exports = withNextIntl(nextConfig);
