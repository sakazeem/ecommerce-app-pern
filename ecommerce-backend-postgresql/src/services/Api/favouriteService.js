const httpStatus = require('http-status');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');

const favouriteIncludes = [
	{
		model: db.product,
		required: false,
		attributes: [
			'id',
			'base_price',
			'base_discount_percentage',
			'thumbnail',
			'sku',
		],
		include: [
			{
				model: db.product_translation,
				required: false,
				attributes: ['title', 'slug'],
				where: { language_id: 1 },
			},
			{
				model: db.media,
				required: false,
				as: 'thumbnailImage',
				attributes: ['url'],
			},
		],
	},
];

async function getFavourites(userId) {
	return await db.favourite.findAll({
		where: { app_user_id: userId },
		include: favouriteIncludes,
	});
}

async function toggleFavourite(userId, product_id) {
	const existing = await db.favourite.findOne({
		where: { app_user_id: userId, product_id },
	});
	if (existing) {
		await existing.destroy();
		return { action: 'removed' };
	}
	await db.favourite.create({ app_user_id: userId, product_id });
	return { action: 'added' };
}

async function syncFavourites(userId, productIds) {
	for (const product_id of productIds) {
		const existing = await db.favourite.findOne({
			where: { app_user_id: userId, product_id },
		});
		if (!existing) {
			await db.favourite.create({ app_user_id: userId, product_id });
		}
	}
	return getFavourites(userId);
}

async function verifyFavourites(items) {
	const verified = [];
	const removed = [];

	for (const item of items) {
		const productId = item.id || item.product_id;
		if (!productId) {
			removed.push({ ...item, reason: 'missing_product' });
			continue;
		}

		const product = await db.product.findOne({
			where: { id: productId },
			include: [
				{
					model: db.product_translation,
					required: false,
					attributes: ['title', 'slug'],
					where: { language_id: 1 },
				},
				{
					model: db.media,
					required: false,
					as: 'thumbnailImage',
					attributes: ['url'],
				},
			],
		});

		if (!product) {
			removed.push({ ...item, reason: 'product_deleted' });
			continue;
		}

		const translation = product.product_translations?.[0] || {};
		verified.push({
			id: product.id,
			title: translation.title || '',
			slug: translation.slug || '',
			thumbnail: product.thumbnailImage?.url || product.thumbnail,
			sku: product.sku,
			base_price: product.base_price,
			base_discount_percentage: product.base_discount_percentage,
		});
	}

	return { verified, removed };
}

module.exports = {
	getFavourites,
	toggleFavourite,
	syncFavourites,
	verifyFavourites,
};
