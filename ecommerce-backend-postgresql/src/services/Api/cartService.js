const httpStatus = require('http-status');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');

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
			{
				model: db.branch,
				required: false,
				through: { as: 'pvb' },
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
	{ product_id, product_variant_id, quantity = 1, sku }
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
		sku: sku || null,
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
				sku: item.sku || null,
			});
		}
	}
	return getCart(userId);
}

async function verifyCart(items) {
	const verified = [];
	const removed = [];

	for (const item of items) {
		const productId = item.product_id || item.id;
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
						{
							model: db.branch,
							required: false,
							through: { as: 'pvb' },
						},
					],
				},
			],
		});

		// Product deleted from store
		if (!product) {
			removed.push({ ...item, reason: 'product_deleted' });
			continue;
		}

		const variantId = item.product_variant_id || item.selectedVariant?.id;

		// No variant needed
		if (!variantId) {
			// Update SKU in case it changed on the product level
			verified.push(buildCartItem(item, product, null));
			continue;
		}

		// Try to find variant by ID first
		let variant = product.product_variants?.find((v) => v.id === variantId);

		// Variant not found by ID — try fallback by SKU
		if (!variant && item.sku) {
			variant = product.product_variants?.find((v) => v.sku === item.sku);
		}

		// Variant completely gone (both ID and SKU lookup failed)
		if (!variant) {
			removed.push({ ...item, reason: 'variant_deleted' });
			continue;
		}

		// Variant found but ID changed (SKU matched, different ID)
		// This means the variant was recreated — update the reference silently

		// Check stock
		const stock = variant.branches?.[0]?.pvb?.stock ?? null;
		if (stock !== null && stock === 0) {
			removed.push({ ...item, reason: 'out_of_stock' });
			continue;
		}

		verified.push(buildCartItem(item, product, variant));
	}

	return { verified, removed };
}

function buildCartItem(item, product, variant) {
	const translation = product.product_translations?.[0] || {};
	return {
		cartItemId: item.cartItemId || null,
		id: product.id,
		title: translation.title || '',
		slug: translation.slug || '',
		thumbnail: product.thumbnailImage?.url || product.thumbnail,
		sku: variant?.sku || product.sku,
		base_price: product.base_price,
		base_discount_percentage: product.base_discount_percentage,
		quantity: item.quantity || 1,
		selectedVariant: variant
			? {
					id: variant.id,
					sku: variant.sku,
					price: variant.branches?.[0]?.pvb?.sale_price ?? null,
					discount_percentage:
						variant.branches?.[0]?.pvb?.discount_percentage ?? null,
					stock: variant.branches?.[0]?.pvb?.stock ?? null,
					image: variant.image || null,
					attributes: variant.attributes?.map((a) => ({
						id: a.id,
						name: a.name,
						value: a.pva?.value?.en || a.pva?.value || '',
					})),
			  }
			: null,
	};
}

module.exports = {
	getCart,
	addToCart,
	updateCartItem,
	removeFromCart,
	clearCart,
	syncCart,
	verifyCart,
};
