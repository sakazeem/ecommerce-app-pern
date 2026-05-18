const redisClient = require('../../config/redis');
const db = require('../../db/models');

async function getHomepageSections() {
	const lang = 'en'; // if translations added later
	const cacheKey = `homepage_sections:${lang}`;

	// 1. Check cache
	const cachedData = await redisClient.get(cacheKey);
	if (cachedData) {
		return JSON.parse(cachedData);
	}

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

		// Mixed products category pool
		if (Array.isArray(config.mixed_category_ids)) {
			config.mixed_category_ids.forEach((id) =>
				categoryIds.add(Number(id))
			);
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

		// Single product category (only hydrate if it's a real numeric id)
		if (config.category_id && Number(config.category_id)) {
			config.category = categoryMap[Number(config.category_id)] || null;
			delete config.category_id;
		}

		// For products sections, embed ready-made query params the website can forward
		if (section.type === 'products') {
			const filterQuery = config.category_id || '';
			const qp = { filterQuery, limit: config.limit || 10 };
			if (filterQuery === 'mixed') {
				// Pass sectionId so BE can look up mixed_category_ids directly from DB
				// This works even if the website doesn't know about mixedCategoryIds
				qp.sectionId = section.id;
				// Also pass mixedCategoryIds for clients that support it
				if (
					Array.isArray(config.mixed_category_ids) &&
					config.mixed_category_ids.length > 0
				) {
					qp.mixedCategoryIds = config.mixed_category_ids.join(',');
				}
			}
			config.query_params = qp;
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

		// Mixed products category pool
		if (
			Array.isArray(config.mixed_category_ids) &&
			config.mixed_category_ids.length > 0
		) {
			config.mixed_categories = config.mixed_category_ids
				.map((id) => categoryMap[Number(id)])
				.filter(Boolean);
		}

		return {
			id: section.id,
			type: section.type,
			title: section.title,
			position: section.position,
			config,
		};
	});

	// Pre-fetch mixed products for sections that have a category pool
	// so the website receives products directly without needing extra params
	for (const section of hydratedSections) {
		if (
			section.type === 'products' &&
			section.config.category_id === 'mixed' &&
			Array.isArray(section.config.mixed_category_ids) &&
			section.config.mixed_category_ids.length > 0
		) {
			const poolIds = section.config.mixed_category_ids
				.map(Number)
				.filter(Boolean);
			const limit = section.config.limit || 10;

			const perCatResults = await Promise.all(
				poolIds.map((catId) =>
					db.product.scope({ method: ['active'] }).findAll({
						limit: 2,
						order: db.sequelize.random(),
						attributes: [
							'id',
							'sku',
							'base_price',
							'base_discount_percentage',
							'is_featured',
						],
						include: [
							{
								model: db.category.scope('active'),
								attributes: ['id'],
								required: true,
								where: { id: catId },
							},
							{
								model: db.product_variant,
								required: false,
								attributes: ['id', 'sku'],
								include: [
									{
										model: db.branch,
										required: false,
										through: { as: 'pvb' },
									},
								],
							},
							{
								model: db.media,
								required: false,
								as: 'images',
								attributes: ['url'],
							},
							{
								model: db.media,
								required: false,
								as: 'thumbnailImage',
								attributes: ['url'],
							},
							{
								model: db.product_translation,
								required: true,
								attributes: ['title', 'excerpt', 'slug'],
								where: { language_id: 1 },
							},
						],
						distinct: true,
					})
				)
			);

			const seenIds = new Set();
			const flat = [];
			for (const rows of perCatResults)
				for (const p of rows)
					if (!seenIds.has(p.id)) {
						seenIds.add(p.id);
						flat.push(p);
					}
			for (let i = flat.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[flat[i], flat[j]] = [flat[j], flat[i]];
			}
			section.config.products = flat.slice(0, limit);
		}
	}

	// 3. Store in Redis
	await redisClient.set(
		cacheKey,
		JSON.stringify(hydratedSections),
		'EX',
		60 * 60 // 1 hour
	);

	return hydratedSections;
}

module.exports = {
	getHomepageSections,
};
