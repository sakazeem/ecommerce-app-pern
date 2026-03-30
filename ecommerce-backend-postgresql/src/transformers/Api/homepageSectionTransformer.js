const { transformCategory } = require('./categoryTransformer');
const { extractLangField } = require('./productTransformer');

function transformHomepageSection(product, lang) {
	if (product.config.categories) {
		product.config.categories = product.config.categories.map((cat) =>
			transformCategory(cat, lang)
		);
	} else if (product.config.tabs) {
		product.config.tabs = product.config.tabs.map((cat) =>
			transformCategory(cat, lang)
		);
	} else if (product.config.category) {
		product.config.category = transformCategory(
			product.config.category,
			lang
		);
	} else if (product.config.images) {
		// images is now [{imageId: mediaObj, categoryId, category}]
		// Transform to [{imageId: url, categoryId, categorySlug}] for the website
		product.config.images = product.config.images.map((slide) => {
			const transformed = {
				imageId: slide.imageId?.url || slide.imageId,
				categoryId: slide.categoryId || null,
			};
			// Also resolve slug from the hydrated category if available
			if (slide.category) {
				const cat = transformCategory(slide.category, lang);
				transformed.categorySlug = cat?.slug || null;
			}
			return transformed;
		});
	} else if (product.config.image) {
		product.config.image = product.config.image.url;
	}

	if (product.title) {
		product.title = extractLangField(product.title, lang);
	}

	return {
		...product,
	};
}

function transformHomepageSectionsResponse(response, lang = 'en') {
	return response.map((section) => transformHomepageSection(section, lang));
}

module.exports = {
	transformHomepageSectionsResponse,
};
