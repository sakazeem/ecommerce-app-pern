function extractTranslation(translations = [], lang) {
	if (!translations.length) return {};
	const translation =
		translations.find((t) => t.language_code === lang) || translations[0];
	return {
		title: translation.title || null,
		description: translation.description || null,
		slug: translation.slug || null,
		tag: translation.tag || null,
		excerpt: translation.excerpt || null,
	};
}

module.exports = { extractTranslation };
