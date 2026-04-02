const db = require('../../db/models');

async function createSection(req) {
	const data = req.body;
	const maxPosition = await db.homepage_sections.max('position');

	return db.homepage_sections.create({
		...data,
		position: maxPosition ? maxPosition + 1 : 1,
	});
}

async function updateSection(req) {
	const data = req.body;
	const { sectionId } = req.params;
	const section = await db.homepage_sections.findByPk(sectionId);
	if (!section) throw new Error('Section not found');

	return section.update(data);
}

async function getHomepageSections(req) {
	const sections = await db.homepage_sections.findAll({
		where: { status: true },
		order: [['position', 'ASC']],
		raw: true,
	});

	if (!sections.length) return [];

	const mediaIds = new Set();

	for (const section of sections) {
		const config = section.config || {};

		if (Array.isArray(config.images)) {
			config.images.forEach((img) => {
				const id =
					typeof img === 'object' && img !== null ? img.imageId : img;
				if (id) mediaIds.add(id);
			});
		}

		// Banner
		if (config.image) {
			mediaIds.add(config.image);
		}

		if (section.type === 'video_slider' && Array.isArray(config.slides)) {
			config.slides.forEach((slide) => {
				if (slide.videoId) mediaIds.add(slide.videoId);
				if (slide.poster) mediaIds.add(slide.poster);
			});
		}
	}

	// Fetch media in bulk
	const [media] = await Promise.all([
		mediaIds.size
			? db.media.findAll({
					where: { id: [...mediaIds] },
					attributes: ['id', 'url'],
			  })
			: [],
	]);

	const mediaMap = Object.fromEntries(media.map((m) => [m.id, m]));

	const hydratedSections = sections.map((section) => {
		const config = { ...section.config };

		// Slider images — return imagesUrl as [{url, categoryId}] for CMS preview
		if (Array.isArray(config.images)) {
			config.imagesUrl = config.images
				.map((img) => {
					const imageId =
						typeof img === 'object' && img !== null
							? img.imageId
							: img;
					const categoryId =
						typeof img === 'object' && img !== null
							? img.categoryId || ''
							: '';
					const mediaObj = mediaMap[imageId];
					if (!mediaObj) return null;
					return { url: mediaObj.url, categoryId };
				})
				.filter(Boolean);
		}

		// Banner image
		if (config.image) {
			config.imageUrl = mediaMap[config.image] || null;
		}

		if (section.type === 'video_slider' && Array.isArray(config.slides)) {
			config.slidesResolved = config.slides
				.map((slide) => ({
					videoId: slide.videoId,
					videoUrl: mediaMap[slide.videoId]?.url || null,
					poster: slide.poster
						? mediaMap[slide.poster]?.url || null
						: null,
					categoryId: slide.categoryId || '',
				}))
				.filter((s) => s.videoUrl);
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

async function deleteSection(req) {
	const { sectionId } = req.params;
	return db.homepage_sections.destroy({ where: { id: sectionId } });
}

async function reorderSections(payload) {
	const transaction = await db.sequelize.transaction();
	try {
		for (const item of payload) {
			await db.homepage_sections.update(
				{ position: item.position },
				{ where: { id: item.id }, transaction }
			);
		}
		await transaction.commit();
		return true;
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
}

module.exports = {
	createSection,
	updateSection,
	getHomepageSections,
	deleteSection,
	reorderSections,
};
