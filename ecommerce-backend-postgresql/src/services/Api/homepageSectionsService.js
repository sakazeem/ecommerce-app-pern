const db = require('../../db/models');

async function getHomepageSections() {
	// 1. Get active homepage sections
	const sections = await db.homepage_sections.findAll({
		where: { status: true },
		order: [['position', 'ASC']],
		raw: true,
	});

	if (!sections.length) return [];

	// 2. Collect all IDs from configs
	const mediaIds = new Set();
	const categoryIds = new Set();

	for (const section of sections) {
		const config = section.config || {};

		// Slider — images now stored as [{imageId, categoryId}] (or legacy plain string ids)
		if (Array.isArray(config.images)) {
			config.images.forEach((img) => {
				const imageId =
					typeof img === 'object' && img !== null ? img.imageId : img;
				const categoryId =
					typeof img === 'object' && img !== null
						? img.categoryId
						: null;

				if (imageId) mediaIds.add(imageId);
				if (categoryId && Number(categoryId)) {
					categoryIds.add(Number(categoryId));
				}
			});
		}

		// ✅ Video slider
		if (section.type === 'video_slider' && Array.isArray(config.slides)) {
			config.slides.forEach((slide) => {
				if (slide.videoId) mediaIds.add(slide.videoId);
				if (slide.poster) mediaIds.add(slide.poster);
				if (slide.categoryId && Number(slide.categoryId)) {
					categoryIds.add(Number(slide.categoryId));
				}
			});
		}

		// Banner
		if (config.image) {
			mediaIds.add(config.image);
		}

		// Single product category
		if (config.category_id && Number(config.category_id)) {
			categoryIds.add(Number(config.category_id));
		}

		// Categories section
		if (Array.isArray(config.category_ids)) {
			config.category_ids.forEach((id) => categoryIds.add(Number(id)));
		}

		// Tabs section
		if (Array.isArray(config.tab_categories)) {
			config.tab_categories.forEach((id) => categoryIds.add(Number(id)));
		}
	}

	// 3. Fetch media & categories in bulk
	const [media, categories] = await Promise.all([
		mediaIds.size
			? db.media.findAll({
					where: { id: [...mediaIds] },
					attributes: ['id', 'url', 'media_type'],
			  })
			: [],

		categoryIds.size
			? db.category.findAll({
					where: { id: [...categoryIds] },
					include: [
						{
							model: db.category_translation,
							as: 'translations',
							required: false,
							attributes: ['title', 'slug'],
						},
						{
							model: db.media,
							as: 'cat_icon',
							required: false,
							attributes: ['url', 'title'],
						},
					],
			  })
			: [],
	]);

	// 4. Create lookup maps
	const mediaMap = Object.fromEntries(media.map((m) => [m.id, m]));
	const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

	// 5. Hydrate sections
	const hydratedSections = sections.map((section) => {
		const config = { ...(section.config || {}) };

		// Slider images — hydrate each slide to {imageId: mediaObj, categoryId, category}
		if (Array.isArray(config.images)) {
			config.images = config.images
				.map((img) => {
					const imageId =
						typeof img === 'object' && img !== null
							? img.imageId
							: img;
					const categoryId =
						typeof img === 'object' && img !== null
							? img.categoryId
							: null;

					const mediaObj = mediaMap[imageId];
					if (!mediaObj) return null;

					return {
						imageId: mediaObj, // full media object with .url
						categoryId: categoryId || null,
						category: categoryId
							? categoryMap[Number(categoryId)] || null
							: null,
					};
				})
				.filter(Boolean);
		}

		// ✅ Video slider hydration
		if (section.type === 'video_slider' && Array.isArray(config.slides)) {
			config.slides = config.slides
				.map((slide) => {
					const videoMedia = mediaMap[slide.videoId];
					if (!videoMedia) return null;

					return {
						videoUrl: videoMedia.url,
						poster: slide.poster
							? mediaMap[slide.poster]?.url || null
							: null,
						categoryId: slide.categoryId || null,
						category: slide.categoryId
							? categoryMap[Number(slide.categoryId)] || null
							: null,
					};
				})
				.filter(Boolean);
		}

		// Banner image
		if (config.image) {
			config.image = mediaMap[config.image] || null;
		}

		// Single product category
		if (config.category_id && Number(config.category_id)) {
			config.category = categoryMap[Number(config.category_id)] || null;
			delete config.category_id;
		}

		// Categories
		if (Array.isArray(config.category_ids)) {
			config.categories = config.category_ids
				.map((id) => categoryMap[Number(id)])
				.filter(Boolean);
			delete config.category_ids;
		}

		// Tabs
		if (Array.isArray(config.tab_categories)) {
			config.tabs = config.tab_categories
				.map((id) => categoryMap[Number(id)])
				.filter(Boolean);
			delete config.tab_categories;
		}

		return {
			id: section.id,
			type: section.type,
			title: section.title,
			position: section.position,
			config,
		};
	});

	return hydratedSections;
}

module.exports = {
	getHomepageSections,
};
