const { extractTranslation } = require('../../utils/transformerHelpers');

function extractLangField(obj, lang) {
	if (!obj || typeof obj !== 'object') return obj;
	return obj[lang] || Object.values(obj)[0] || null;
}

function transformBrand(brand, lang) {
	const translation = extractTranslation(brand.translations, lang);
	return {
		id: brand.id,
		title: translation.title,
		slug: translation.slug,
	};
}
function transformCategory(category, lang) {
	const translation = extractTranslation(category.translations, lang);
	return {
		id: category.id,
		title: translation.title,
		slug: translation.slug,
		attribute_type: category.attribute_type,
	};
}
function transformAttribute(category, lang) {
	const translation = extractTranslation(category.translations, lang);
	return {
		id: category.id,
		title: translation.title,
		slug: translation.slug,
	};
}

function transformFilterDataResponse(response, lang = 'en') {
	return {
		...response,
		categories: (response.categories || []).map((category) =>
			transformCategory(category, lang)
		),
		brands: (response.brands || []).map((brand) =>
			transformBrand(brand, lang)
		),
		attributes: (response.attributes || []).map((attr) => {
			const plainAttr = attr;
			// const plainAttr = attr.get({ plain: true });
			return {
				...plainAttr,
				name: extractLangField(plainAttr.name, lang),
				values: Array.isArray(plainAttr.values)
					? plainAttr.values.map((v) => extractLangField(v, lang))
					: [],
			};
		}),
	};
}

/**
 * Level 2 categories
 */
function transformLevel2(children = [], lang) {
	return children.map((child) => {
		const translation = extractTranslation(child.translations, lang);

		return {
			id: child.id,
			title: translation.title,
			slug: translation.slug,
			children: transformLevel3(child.children, lang),
		};
	});
}

/**
 * Level 3 (leaf nodes)
 * Returns array of strings
 */
function transformLevel3(children = [], lang) {
	return children
		.map((child) => {
			const translation = extractTranslation(child.translations, lang);
			return {
				id: child.id,
				title: translation.title,
				slug: translation.slug,
			};
		})
		.filter(Boolean);
}

function transformNavCategoriesResponse(response, lang = 'en') {
	return response.map((root) => {
		const rootTranslation = extractTranslation(root.translations, lang);

		return {
			id: root.id,
			title: rootTranslation.title,
			slug: rootTranslation.slug,
			tag: rootTranslation.tag,
			children: transformLevel2(root.children, lang),
		};
	});
}
function transformBrandsResponse(response, lang = 'en') {
	return response.map((brand) => {
		const brandTranslation = extractTranslation(brand.translations, lang);

		return {
			id: brand.id,
			title: brandTranslation.title,
			slug: brandTranslation.slug,
		};
	});
}

module.exports = {
	transformFilterDataResponse,
	transformNavCategoriesResponse,
	transformBrandsResponse,
};
