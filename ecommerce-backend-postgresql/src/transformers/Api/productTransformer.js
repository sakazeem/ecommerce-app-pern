const { extractTranslation } = require('../../utils/transformerHelpers');

function extractLangField(obj, lang) {
	if (!obj || typeof obj !== 'object') return obj;
	return obj[lang] || Object.values(obj)[0] || null;
}

function transformCategory(category, lang) {
	const translation = extractTranslation(category.translations, lang);
	return {
		id: category.id,
		title: translation.title,
		description: translation.description,
		slug: translation.slug,
	};
}

function transformUSP(usp, lang) {
	const translation = extractTranslation(usp.translations, lang);
	return {
		id: usp.id,
		title: translation.title,
		description: translation.description,
		slug: translation.slug,
	};
}

function transformVendor(vendor, lang) {
	return {
		id: vendor.id,
		name: extractLangField(vendor.name, lang),
		address: extractLangField(vendor.address, lang),
		country: extractLangField(vendor.country, lang),
	};
}

function transformVariant(variant, lang, multipleProducts = false) {
	// return variant;
	const branches = (variant.branches || []).map((b) => ({
		// name: extractLangField(b.name, lang),
		// address: extractLangField(b.address, lang),
		// country: extractLangField(b.country, lang),
		// cost_price: b.pvb?.cost_price,
		// sale_price: b.pvb?.sale_price,
		stock: b.pvb?.stock,
		sale_price: b.pvb?.sale_price,
		// low_stock: b.pvb?.low_stock,
		discount_percentage: b.pvb?.discount_percentage,
	}));
	return {
		id: variant.id,
		sku: variant.sku,
		image: variant.medium ? variant.medium.url : null,
		stock: branches[0]?.stock,
		price: branches[0]?.sale_price,
		discount_percentage: branches[0]?.discount_percentage,
		// stock: branches[0]?.stock || 200,

		attributes: multipleProducts
			? (variant.product_variant_to_attributes || []).map((a) => {
					return {
						id: a.id,
						variant_id: a.id,
						attribute_id: a.attribute_id,
						value: extractLangField(a.value, lang),
						name: extractLangField(a.attribute?.name, lang),
					};
			  })
			: (variant.attributes || []).map((a) => {
					// return a;
					return {
						id: a.id,
						value: extractLangField(a.pva?.value, lang),
						name: extractLangField(a.name, lang),
					};
			  }),
	};
}

function transformProduct(product, lang, multipleProducts = false) {
	const translation = extractTranslation(product.product_translations, lang);

	return {
		id: product.id,
		sku: product.sku,
		title: translation.title,
		excerpt: translation.excerpt,
		description: translation.description,
		slug: translation.slug,
		meta_title: product.meta_title,
		meta_description: product.meta_description,
		base_price: product.base_price,
		base_discount_percentage: product.base_discount_percentage,
		avg_rating: product.avg_rating,
		total_reviews: product.total_reviews,
		is_featured: product.is_featured,
		thumbnail: product.thumbnailImage ? product.thumbnailImage.url : null,
		images: [
			...(product.thumbnailImage ? [product.thumbnailImage.url] : []),
			...product.images?.map((v) => v.url),
		],
		similarProducts: product.similar_products?.map((v) => {
			const t = extractTranslation(v.product_translations, lang);
			return {
				id: v.id,
				thumbnail: v.thumbnailImage?.url || null,
				title: t.title,
				slug: t.slug,
			};
		}),

		categories: (product.categories || []).map((cat) =>
			transformCategory(cat, lang)
		),

		// usps: (product.usps || []).map((u) => transformUSP(u, lang)),
		usps: [],

		vendors: (product.vendors || []).map((v) => transformVendor(v, lang)),

		variants: (product.product_variants || []).map((v) =>
			transformVariant(v, lang, multipleProducts)
		),

		...(multipleProducts
			? {}
			: {
					reviews: (product.reviews || []).map((review) => ({
						id: review.id,
						rating: review.rating,
						comment: review.comment,
						user:
							review.user?.name ||
							review.guest_name ||
							'Anonymous',
					})),
			  }),
		created_at: product.created_at,
	};
}
function transformProductSuggestion(product, lang, multipleProducts = false) {
	const translation = extractTranslation(product.product_translations, lang);

	return {
		id: product.id,
		sku: product.sku,
		title: translation.title,
		excerpt: translation.excerpt,
		slug: translation.slug,
		base_price: product.base_price,
		base_discount_percentage: product.base_discount_percentage,
		is_featured: product.is_featured,
		thumbnail: product.thumbnailImage ? product.thumbnailImage.url : null,
		created_at: product.created_at,
	};
}

function transformProductsResponse(response, lang = 'en') {
	return {
		...response,
		// records: (response.records || []).map((product) => product),
		records: (response.records || []).map((product) =>
			transformProduct(product, lang, true)
		),
	};
}
function transformProductsSuggestionResponse(response, lang = 'en') {
	return {
		...response,
		// records: (response.records || []).map((product) => product),
		records: (response.records || []).map((product) =>
			transformProductSuggestion(product, lang, true)
		),
	};
}

module.exports = {
	transformProductsResponse,
	transformProduct,
	transformCategory,
	extractLangField,
	transformProductsSuggestionResponse,
};
