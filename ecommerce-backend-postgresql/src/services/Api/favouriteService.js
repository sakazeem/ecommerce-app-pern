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

module.exports = { getFavourites, toggleFavourite, syncFavourites };
