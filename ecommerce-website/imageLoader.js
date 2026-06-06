/**
 * Cloudflare R2 Image Loader for Next.js
 * Handles dynamic image resizing and optimization
 */

export default function cloudflareLoader({ src, width, quality }) {
	// Remove domain if src is a full URL
	let path = src;
	if (src.startsWith("http")) {
		const url = new URL(src);
		path = url.pathname;
	}

	// Cloudflare Image Resizing parameters
	// https://developers.cloudflare.com/images/image-resizing/url-format/
	const params = new URLSearchParams({
		width: width.toString(),
		height: width.toString(), // Square images
		fit: "cover", // Crop to fit without distortion
		quality: (quality || 75).toString(),
		format: "webp", // Serve as WebP for better compression
	});

	return `https://cdn.babiesnbaba.com${path}?${params.toString()}`;
}
