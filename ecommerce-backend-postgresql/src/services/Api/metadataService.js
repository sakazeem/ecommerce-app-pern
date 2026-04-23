const { Op, json } = require('sequelize');
const db = require('../../db/models');
const { translationInclude } = require('../../utils/includeHelpers');
const { getAllDescendantCategoryIds } = require('./categoryService');
const redisClient = require('../../config/redis');

async function getFiltersData(req) {
	const { category, brand } = req.query; //get category and brand from slugs

	const cacheKey = `filters:${category || 'all'}:${brand || 'all'}`;

	// 1. Check cache
	const cached = await redisClient.get(cacheKey);
	if (cached) {
		return JSON.parse(cached);
	}

	let selectedCategory = null;
	let selectedBrand = null;

	if (brand) {
		selectedBrand = await db.brand.scope('active').findOne({
			include: [
				{
					model: db.brand_translation,
					as: 'translations',
					where: { slug: brand, language_id: 1 },
					attributes: ['title', 'slug'], // 👈 no data returned, only join
					required: true, // 👈 INNER JOIN (important for filtering)
				},
			],
			attributes: ['id'],
		});
	}

	if (category) {
		selectedCategory = await db.category.scope('active').findOne({
			attributes: ['id', 'parent_id', 'level', 'attribute_type'],
			include: [
				{
					model: db.category_translation,
					as: 'translations',
					where: { slug: category, language_id: 1 },
					attributes: ['title', 'slug'], // 👈 no data returned, only join
					required: true, // 👈 INNER JOIN (important for filtering)
				},
			],
		});
	}

	// Default: top-level categories
	let categoriesWhere = { level: 1 };

	if (selectedCategory) {
		const descendantIds = await getAllDescendantCategoryIds(
			selectedCategory.id,
			false
		);

		if (descendantIds.length > 0) {
			// ✅ Return all descendants
			categoriesWhere = {
				id: descendantIds,
			};
		} else {
			// ✅ No children → return selected category only
			categoriesWhere = {
				id: selectedCategory.id,
			};
		}
	}

	const categories = await db.category.scope({ method: ['active'] }).findAll({
		where: categoriesWhere,
		include: [
			{
				model: db.category_translation,
				as: 'translations',
				attributes: ['title', 'slug'],

				required: true,
				include: [translationInclude(req)],
			},
		],
		order: [
			[
				{ model: db.category_translation, as: 'translations' },
				'title',
				'ASC',
			],
		],
	});

	const brands = await db.brand.scope({ method: ['active'] }).findAll({
		where: {
			id: { [Op.ne]: 1 },
		},
		include: [
			{
				model: db.brand_translation,
				as: 'translations',
				attributes: ['title', 'slug'],
				required: true,
				include: [translationInclude(req)],
			},
		],
		order: [
			[
				{ model: db.brand_translation, as: 'translations' },
				'title',
				'ASC',
			],
		],
	});

	const attributes = await db.attribute
		.scope({ method: ['active'] })
		.findAll({
			where: {
				[Op.or]: [
					json('name.en', 'size'),
					json('name.en', 'gender'),
					json('name.en', 'color'),
				],
			},
			attributes: ['id', 'name', 'values'],
		});

	const categoryAttributeType = selectedCategory?.attribute_type || 'baby';
	const filteredAttributes = attributes.map((attr) => {
		// Only filter SIZE attribute
		if (attr.name?.en?.toLowerCase() === 'size') {
			return {
				...attr.toJSON(),
				values: (attr.values || []).filter(
					(v) => v.type === categoryAttributeType
				),
			};
		}

		// gender / color untouched
		return attr;
	});

	const result = {
		categories,
		brands,
		attributes: filteredAttributes,
		selectedCategory,
		selectedBrand,
	};
	// 2. Save cache (TTL: 30 min recommended)
	await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60);

	return result;
}

// async function getFiltersData(req) {
// 	const { category, brand } = req.query; //get category and brand from slugs

// 	let selectedCategory = null;
// 	let selectedBrand = null;

// 	// if (brand) {
// 	// 	selectedBrand = await db.brand.scope('active').findOne({
// 	// 		include: [
// 	// 			{
// 	// 				model: db.brand_translation,
// 	// 				as: 'translations',
// 	// 				attributes: ['title', 'slug'],
// 	// 				where: { slug: brand },
// 	// 				required: true,
// 	// 				include: [translationInclude(req)],
// 	// 			},
// 	// 		],
// 	// 		attributes: ['id'],
// 	// 	});
// 	// }

// 	if (category) {
// 		selectedCategory = await db.category.scope('active').findOne({
// 			where: {
// 				'$translations.slug$': category, // ✅ correct way
// 			},
// 			attributes: ['id', 'parent_id', 'level'],
// 			include: [
// 				{
// 					model: db.category_translation,
// 					as: 'translations',
// 					attributes: ['title', 'slug'],
// 					required: true, // ✅ safe now
// 					include: [translationInclude(req)],
// 				},
// 			],
// 		});
// 	}

// 	// Default: top-level categories
// 	let categoriesWhere = { level: 1 };

// 	if (selectedCategory) {
// 		const descendantIds = await getAllDescendantCategoryIds(
// 			selectedCategory.id
// 		);

// 		if (descendantIds.length > 0) {
// 			// ✅ Return all descendants
// 			categoriesWhere = {
// 				id: descendantIds,
// 			};
// 		} else {
// 			// ✅ No children → return selected category only
// 			categoriesWhere = {
// 				id: selectedCategory.id,
// 			};
// 		}
// 	}

// 	const categories = await db.category.scope({ method: ['active'] }).findAll({
// 		where: categoriesWhere,
// 		include: [
// 			{
// 				model: db.category_translation,
// 				as: 'translations',
// 				attributes: ['title', 'slug'],
// 				required: true,
// 				include: [translationInclude(req)],
// 			},
// 		],
// 		order: [
// 			[
// 				{ model: db.category_translation, as: 'translations' },
// 				'title',
// 				'ASC',
// 			],
// 		],
// 	});
// 	const brands = await db.brand.scope({ method: ['active'] }).findAll({
// 		include: [
// 			{
// 				model: db.brand_translation,
// 				as: 'translations',
// 				attributes: ['title', 'slug'],
// 				required: true,
// 				include: [translationInclude(req)],
// 			},
// 		],
// 		order: [
// 			[
// 				{ model: db.brand_translation, as: 'translations' },
// 				'title',
// 				'ASC',
// 			],
// 		],
// 	});

// 	const attributes = await db.attribute
// 		.scope({ method: ['active'] })
// 		.findAll({
// 			where: {
// 				[Op.or]: [
// 					json('name.en', 'size'),
// 					json('name.en', 'gender'),
// 					json('name.en', 'color'),
// 				],
// 			},
// 			attributes: ['id', 'name', 'values'],
// 		});

// 	return { categories, brands, attributes, selectedCategory, selectedBrand };
// }

async function getNavCategories(req) {
	const lang = req?.headers?.lang || 'en';
	const cacheKey = `nav_categories:${lang}`;
	const cachedData = await redisClient.get(cacheKey);
	if (cachedData) {
		return JSON.parse(cachedData);
	}

	const categories = await db.category.scope('active').findAll({
		where: {
			parent_id: null,
		},
		attributes: ['id'],
		include: [
			{
				model: db.category.scope('active'),
				as: 'children',
				where: { level: 2 },
				attributes: ['id'],
				required: false,
				include: [
					{
						model: db.category.scope('active'),
						as: 'children',
						where: { level: 3 },
						attributes: ['id'],
						required: false,
						include: [
							{
								model: db.category_translation,
								as: 'translations',
								attributes: ['title', 'slug'],
								include: [translationInclude(req)],
							},
						],
					},
					{
						model: db.category_translation,
						as: 'translations',
						attributes: ['title', 'slug'],
						include: [translationInclude(req)],
					},
				],
			},
			{
				model: db.category_translation,
				as: 'translations',
				attributes: ['title', 'slug'],
				include: [translationInclude(req)],
			},
		],
		// ✅ ORDER EVERYTHING
		order: [
			['id', 'ASC'], // parent

			// level 2 children by title
			[
				{ model: db.category, as: 'children' },
				{ model: db.category_translation, as: 'translations' },
				'title',
				'ASC',
			],

			// level 3 children by title
			[
				{ model: db.category, as: 'children' },
				{ model: db.category, as: 'children' },
				{ model: db.category_translation, as: 'translations' },
				'title',
				'ASC',
			],
		],
		limit: 9,
	});
	// 3. Store in Redis (TTL: 1 hour)
	await redisClient.set(cacheKey, JSON.stringify(categories), 'EX', 60 * 60);
	return categories;
}

async function getBrands(req) {
	const lang = req?.headers?.lang || 'en';
	const cacheKey = `brands:${lang}`;

	// 1. Check cache
	const cachedData = await redisClient.get(cacheKey);
	if (cachedData) {
		return JSON.parse(cachedData);
	}

	const brands = await db.brand.scope('active').findAll({
		where: {
			id: { [Op.ne]: 1 },
		},
		attributes: ['id'],
		include: [
			{
				model: db.brand_translation,
				as: 'translations',
				attributes: ['title', 'slug'],
				include: [translationInclude(req)],
			},
		],
		order: [['id', 'ASC']],
		limit: 9,
	});
	// ⚠️ Convert Sequelize instance → plain JSON
	const plainData = JSON.parse(JSON.stringify(brands));

	// 3. Store in Redis (TTL: 1 hour)
	await redisClient.set(cacheKey, JSON.stringify(plainData), 'EX', 60 * 60);

	return plainData;
}

module.exports = {
	getFiltersData,
	getNavCategories,
	getBrands,
};
