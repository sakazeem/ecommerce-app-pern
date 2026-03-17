const httpStatus = require('http-status');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');

const cartIncludes = [
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
	{
		model: db.product_variant,
		required: false,
		include: [
			{
				model: db.attribute,
				required: false,
				through: { as: 'pva' },
				attributes: ['id', 'name'],
			},
		],
	},
];

async function getCart(userId) {
	return await db.cart.findAll({
		where: { app_user_id: userId },
		include: cartIncludes,
	});
}

async function addToCart(
	userId,
	{ product_id, product_variant_id, quantity = 1 }
) {
	const existing = await db.cart.findOne({
		where: {
			app_user_id: userId,
			product_id,
			product_variant_id: product_variant_id || null,
		},
	});

	if (existing) {
		existing.quantity += quantity;
		await existing.save();
		return existing;
	}

	return await db.cart.create({
		app_user_id: userId,
		product_id,
		product_variant_id: product_variant_id || null,
		quantity,
	});
}

async function updateCartItem(userId, cartItemId, quantity) {
	const item = await db.cart.findOne({
		where: { id: cartItemId, app_user_id: userId },
	});
	if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
	item.quantity = quantity;
	await item.save();
	return item;
}

async function removeFromCart(userId, cartItemId) {
	const deleted = await db.cart.destroy({
		where: { id: cartItemId, app_user_id: userId },
	});
	if (!deleted)
		throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
	return { success: true };
}

async function clearCart(userId) {
	await db.cart.destroy({ where: { app_user_id: userId } });
	return { success: true };
}

// Merge guest cart into DB on login
async function syncCart(userId, items) {
	for (const item of items) {
		const existing = await db.cart.findOne({
			where: {
				app_user_id: userId,
				product_id: item.id,
				product_variant_id: item.selectedVariant?.id || null,
			},
		});
		if (existing) {
			existing.quantity += item.quantity;
			await existing.save();
		} else {
			await db.cart.create({
				app_user_id: userId,
				product_id: item.id,
				product_variant_id: item.selectedVariant?.id || null,
				quantity: item.quantity,
			});
		}
	}
	return getCart(userId);
}

module.exports = {
	getCart,
	addToCart,
	updateCartItem,
	removeFromCart,
	clearCart,
	syncCart,
};
