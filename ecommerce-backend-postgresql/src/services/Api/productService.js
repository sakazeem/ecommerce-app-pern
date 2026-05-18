const { Op } = require('sequelize');
const config = require('../../config/config.js');
const db = require('../../db/models/index.js');
const createAppBaseService = require('../../utils/appBaseService.js');
const { getLang } = require('../../utils/commonUtils.js');
const { translationInclude } = require('../../utils/includeHelpers.js');
const { getOffset } = require('../../utils/query.js');
const { getAllDescendantCategoryIds } = require('./categoryService.js');
const ApiError = require('../../utils/ApiError.js');
const httpStatus = require('http-status');
const redisClient = require('../../config/redis.js');

const productService = createAppBaseService(db.product, {
	name: 'Product',
});

const productFilterConditions = async (req) => {
	const { categoryId, brandId, minPrice, maxPrice, search, color, size } =
		req.query;
	/* ---------------- CATEGORY FILTER ---------------- */
	let categoryIds = [];

	if (categoryId) {
		const inputCategoryIds = Array.isArray(categoryId)
			? categoryId
			: [categoryId];

		const descendantResults = await Promise.all(
			inputCategoryIds.map((id) => getAllDescendantCategoryIds(id))
		);

		categoryIds = [...new Set(descendantResults.flat().map(Number))];
	}

	/* ---------------- 🔥 BRAND FILTER ---------------- */
	let brandCondition = {};
	let brandRequired = false;

	if (brandId) {
		const brandIds = Array.isArray(brandId)
			? brandId.map(Number)
			: brandId.split(',').map(Number);

		brandCondition.brand_id = {
			[Op.in]: brandIds,
		};
		brandRequired = true;
	}

	/* -----------;----- 🔥 PRICE FILTER ---------------- */
	const priceCondition = {};

	if (minPrice || maxPrice) {
		priceCondition.base_price = {};

		if (minPrice) {
			priceCondition.base_price[Op.gte] = Number(minPrice);
		}

		if (maxPrice) {
			if (minPrice && Number(minPrice) > Number(maxPrice)) {
				throw new ApiError(
					httpStatus.BAD_REQUEST,
					'Invalid price range: minPrice cannot be greater than maxPrice'
				);
			}
			priceCondition.base_price[Op.lte] = Number(maxPrice);
		}
	}

	/* ---------------- 🔥 SEARCH FILTER ---------------- */
	let searchCondition = null;

	if (search) {
		searchCondition = {
			[Op.or]: [
				{
					title: {
						[Op.iLike]: `%${search}%`,
					},
				},
				{
					excerpt: {
						[Op.iLike]: `%${search}%`,
					},
				},
				{ slug: { [Op.iLike]: `%${search}%` } },
			],
		};
	}

	// --- ATTRIBUTE FILTERS (JSONB in product_variant_to_attribute.value) ---
	const variantAttributeFilter = [];

	if (color) {
		const colors = Array.isArray(color) ? color : color.split(',');
		variantAttributeFilter.push({
			[Op.or]: colors.map((c) =>
				db.Sequelize.where(db.Sequelize.json('value.en'), {
					[Op.iLike]: `%${c}%`,
				})
			),
		});
	}

	if (size) {
		const sizes = Array.isArray(size) ? size : size.split(',');
		variantAttributeFilter.push({
			[Op.or]: sizes.map((s) =>
				db.Sequelize.where(db.Sequelize.json('value.en'), {
					[Op.iLike]: `%${s}%`,
				})
			),
		});
	}

	return {
		categoryIds,
		brandCondition,
		brandRequired,
		priceCondition,
		searchCondition,
		variantAttributeFilter,
	};
};

const getProductsSuggestions = async (req) => {
	const { page: defaultPage } = config.pagination;
	const { page = defaultPage, limit = 5 } = req.query;
	const offset = getOffset(page, limit);

	const { searchCondition } = await productFilterConditions(req);

	const products = await db.product
		.scope(
			{ method: ['active'] } // active scope with params
		)
		.findAll({
			offset,
			limit,
			order: [['id', 'DESC']],
			attributes: [
				'id',
				'sku',
				'base_price',
				'base_discount_percentage',
				'is_featured',
			],
			include: [
				{
					model: db.media,
					required: false,
					as: 'thumbnailImage',
					attributes: ['url', 'title'],
				},
				{
					model: db.product_translation,
					required: true,
					attributes: ['title', 'excerpt', 'slug'],
					where: { ...(searchCondition || {}), language_id: 1 },
				},
			],
			unique: true,
			distinct: true, // to fix count
			col: 'id', // to fix count
		});

	return {
		records: products,
		limit: limit,
		page: page,
	};

	return products;
};
const getProducts = async (req) => {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		filterQuery = false,
	} = req.query;
	const offset = getOffset(page, limit);

	// 🔥 SAFE cache key (avoid full query explosion)
	const cacheKey = `products:base:${page}:${limit}:${filterQuery}`;

	// 1. Check cache
	// const cached = await redisClient.get(cacheKey);
	// if (cached) {
	// 	return JSON.parse(cached);
	// }

	const products = await db.product
		.scope(
			{ method: ['active'] } // active scope with params
		)
		.findAndCountAll({
			offset,
			limit,
			order: filterQuery ? db.sequelize.random() : [['id', 'DESC']],
			attributes: [
				'id',
				'sku',
				'base_price',
				'base_discount_percentage',
				'is_featured',
			],
			include: [
				// {
				// 	model: db.category.scope('active'),
				// 	attributes: ['id'],
				// 	required: false,
				// 	include: [
				// 		{
				// 			model: db.category_translation,
				// 			as: 'translations',
				// 			attributes: ['title'],
				// 			include: [translationInclude(req)],
				// 		},
				// 	],
				// },
				// --- PRODUCT VARIANTS & ATTRIBUTE FILTER ---
				{
					model: db.product_variant,
					// required: false,
					required: false,
					attributes: ['id', 'sku'],
					include: [
						// {
						// 	model: db.product_variant_to_attribute,
						// 	as: 'product_variant_to_attributes', // must match the alias above
						// 	required: false,
						// 	attributes: ['id', 'attribute_id', 'value'],
						// 	include: [
						// 		{
						// 			model: db.attribute,
						// 			required: false,
						// 			attributes: ['name'],
						// 		},
						// 	],
						// },
						{
							model: db.branch,
							required: false,
							through: {
								as: 'pvb',
							},
							// attributes: [
							// 	'stock',
							// 	'sale_price',
							// 	'discount_percentage',
							// ],
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
			unique: true,
			distinct: true, // to fix count
			col: 'id', // to fix count
		});

	const result = {
		total: products.count,
		records: products.rows,
		limit,
		page,
	};

	// 2. Store in Redis (SHORT TTL because data changes often)
	// await redisClient.set(
	// 	cacheKey,
	// 	JSON.stringify(result),
	// 	'EX',
	// 	60 * 30 // 🔥 30 minutes only (important)
	// );

	return result;

	return products;
};
const getCategoryFilterProducts = async (req) => {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { filterQuery = false } = req.query;

	const page = Number(req.query.page ?? defaultPage);
	const limit = Number(req.query.limit ?? defaultLimit);

	const offset = getOffset(page, limit);
	const { categoryIds } = await productFilterConditions(req);

	const isMixed = filterQuery === 'mixed';

	// ── MIXED: 2 products per category, shuffled ─────────────────────────────
	if (isMixed) {
		let poolCategoryIds = [];

		// 1. Explicit ids from query param (website passing mixedCategoryIds)
		if (req.query.mixedCategoryIds) {
			const raw = req.query.mixedCategoryIds;
			poolCategoryIds = (Array.isArray(raw) ? raw : raw.split(','))
				.map(Number)
				.filter(Boolean);
		}

		// 2. Look up from section config by sectionId (most reliable — no website change needed)
		if (!poolCategoryIds.length && req.query.sectionId) {
			const section = await db.homepage_sections.findByPk(
				Number(req.query.sectionId),
				{ attributes: ['config'], raw: true }
			);
			const ids = section?.config?.mixed_category_ids;
			if (Array.isArray(ids) && ids.length) {
				poolCategoryIds = ids.map(Number).filter(Boolean);
			}
		}

		// 3. Fallback: all active root categories
		if (!poolCategoryIds.length) {
			const allCats = await db.category.scope('active').findAll({
				attributes: ['id'],
				where: { parent_id: null },
			});
			poolCategoryIds = allCats.map((c) => c.id);
		}

		const sharedIncludes = [
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
		];

		const perCatResults = await Promise.all(
			poolCategoryIds.map((catId) =>
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
							include: [
								{
									model: db.category_translation,
									separate: true,
									as: 'translations',
									attributes: ['title'],
									include: [translationInclude(req)],
								},
							],
						},
						...sharedIncludes,
					],
					distinct: true,
				})
			)
		);

		// Flatten, dedupe, Fisher-Yates shuffle, apply limit
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
		return {
			total: flat.length,
			records: flat.slice(0, limit),
			limit,
			page,
		};
	}

	// ── NON-MIXED ─────────────────────────────────────────────────────────────
	const isBestSelling = filterQuery === 'best-selling';
	const fetchLimit = isBestSelling ? limit * 4 : limit;

	const bestSellingOrder = [
		db.sequelize.literal(`(
			SELECT COALESCE(SUM(oi.quantity), 0)
			FROM order_item oi
			INNER JOIN "order" o ON o.id = oi.order_id
			WHERE oi.product_id = "product"."id"
			  AND o.created_at >= NOW() - INTERVAL '30 days'
		)`),
		'DESC',
	];

	const products = await db.product
		.scope({ method: ['active'] })
		.findAndCountAll({
			offset,
			limit: fetchLimit,
			order: isBestSelling ? [bestSellingOrder] : [['id', 'DESC']],
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
					required: Boolean(categoryIds.length),
					where: categoryIds.length
						? { id: { [Op.in]: categoryIds } }
						: undefined,
					include: [
						{
							model: db.category_translation,
							separate: true,
							as: 'translations',
							attributes: ['title'],
							include: [translationInclude(req)],
						},
					],
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
			unique: true,
			distinct: true,
			col: 'id',
		});

	return { total: products.count, records: products.rows, limit, page };
};
const getProductsForFilterPage = async (req) => {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		filterQuery = false,
	} = req.query;
	const offset = getOffset(page, limit);

	const {
		categoryIds,
		brandCondition,
		brandRequired,
		priceCondition,
		searchCondition,
		variantAttributeFilter,
	} = await productFilterConditions(req);

	const products = await db.product
		.scope(
			{ method: ['active'] } // active scope with params
		)
		.findAndCountAll({
			offset,
			limit,
			where: {
				...priceCondition,
				...brandCondition,
			},
			order: filterQuery ? db.sequelize.random() : [['id', 'DESC']],
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
					required: Boolean(categoryIds.length),
					where: categoryIds.length
						? { id: { [Op.in]: categoryIds } }
						: undefined,
					include: [
						{
							model: db.category_translation,
							separate: true,
							as: 'translations',
							attributes: ['title'],
							include: [translationInclude(req)],
						},
					],
				},
				// {
				// 	model: db.usp.scope('active'),
				// 	attributes: ['id'],
				// 	required: false,
				// 	include: [
				// 		{
				// 			model: db.usp_translation,
				// 			as: 'translations',

				// 			attributes: ['title'],
				// 			include: [translationInclude(req)],
				// 		},
				// 	],
				// },
				// --- PRODUCT VARIANTS & ATTRIBUTE FILTER ---
				{
					model: db.product_variant,
					// required: false,
					required: variantAttributeFilter.length > 0,
					attributes: ['id', 'sku'],
					include: [
						{
							model: db.product_variant_to_attribute,
							as: 'product_variant_to_attributes', // must match the alias above
							required: false,
							attributes: ['id', 'attribute_id', 'value'],
							where:
								variantAttributeFilter.length > 0
									? { [Op.and]: variantAttributeFilter }
									: undefined,
							include: [
								{
									model: db.attribute,
									required: false,
									attributes: ['name'],
								},
							],
						},
						{
							model: db.branch,
							required: false,
							through: {
								as: 'pvb',
							},
							// attributes: [
							// 	'stock',
							// 	'sale_price',
							// 	'discount_percentage',
							// ],
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
					where: { ...(searchCondition || {}), language_id: 1 },
				},
			],

			unique: true,
			distinct: true, // to fix count
			col: 'id', // to fix count
		});
	const result = {
		total: products.count,
		records: products.rows,
		limit,
		page,
	};
	// 2. Store in cache (IMPORTANT: short TTL recommended)
	// await redisClient.set(
	// 	cacheKey,
	// 	JSON.stringify(result),
	// 	'EX',
	// 	60 * 30 // 30 minutes (because filters change often)
	// );
	return result;
	return {
		total: products.count,
		records: products.rows,
		limit: limit,
		page: page,
	};

	return products;
};

module.exports = {
	getProductBySlug: (req) => {
		return productService.getBySlug(
			req.params.slug,
			getProductsIncludes(req, true),
			[] // keep attribtes array empty to get all the attributes
		);
	},
	getProducts,
	getProductsForFilterPage,
	getCategoryFilterProducts,
	getProductsSuggestions,
	// getProducts: (req) => {
	// 	return productService.list(
	// 		req,
	// 		// [],
	// 		getProductsIncludes(req),
	// 		[], // keep attribtes array empty to get all the attributes
	// 		[['id', 'DESC']]
	// 	);
	// },
};

const getProductsIncludes = (req, includeSlugCond = false) => [
	{
		model: db.category.scope('active'),
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
	// {
	// 	model: db.usp.scope('active'),
	// 	attributes: ['id'],
	// 	required: false,
	// 	include: [
	// 		{
	// 			model: db.usp_translation,
	// 			as: 'translations',

	// 			attributes: ['title', 'description', 'slug'],
	// 			include: [translationInclude(req)],
	// 		},
	// 	],
	// },
	{
		model: db.brand.scope('active'),
		attributes: ['id'],
		required: false,
		include: [
			{
				model: db.brand_translation,
				as: 'translations',

				attributes: ['title', 'slug'],
				include: [translationInclude(req)],
			},
		],
	},
	{
		model: db.product.scope('active'),
		as: 'similar_products',
		attributes: ['id'],
		required: false,
		include: [
			{
				model: db.media,
				required: false,
				as: 'thumbnailImage',
				attributes: ['url'],
			},
			{
				model: db.product_translation,
				required: false,
				attributes: ['title', 'slug'],
			},
		],
	},

	// {
	// 	model: db.product_variant,
	// 	attributes: ['id', 'sku'],
	// 	required: false,
	// 	include: [
	// 		{
	// 			model: db.media,
	// 			required: false,
	// 			attributes: ['url', 'title', 'size'],
	// 		},
	// 		{
	// 			model: db.branch,
	// 			required: false,
	// 			through: {
	// 				as: 'pvb',
	// 				attributes: [
	// 					'cost_price',
	// 					'stock',
	// 					'low_stock',
	// 					'reorder_quantity',
	// 					'sale_price',
	// 					'discount_percentage',
	// 				],
	// 			}, // this will stay intact
	// 			attributes: [
	// 				'id',
	// 				'name',
	// 				'address',
	// 				'country',
	// 				'code',
	// 				'phone',
	// 				'email',
	// 				'latitude',
	// 				'longitude',
	// 				'is_main_branch',
	// 			],
	// 		},
	// 	],
	// },
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
		required: false,
		attributes: ['title', 'excerpt', 'description', 'slug'],
		where: includeSlugCond
			? {
					slug: req.params.slug,
			  }
			: {},
		include: [
			{
				model: db.language,
				attributes: [],
				where: { code: getLang(req) }, // "en" or "ur",
				required: true,
			},
		],
	},
	{
		model: db.product_variant,
		required: false,
		include: [
			{ model: db.media, required: false },
			{
				model: db.attribute,
				required: false,
				through: {
					as: 'pva',
				},
				attributes: ['id', 'name'],
			},
			{
				model: db.branch,
				required: false,
				through: {
					as: 'pvb',
				},
			},
			// {
			// 	model: db.branch,
			// 	required: false,
			// 	through: {
			// 		as: 'pvb',
			// 	},
			// },
		],
	},
	{
		model: db.review,
		required: false,

		// where: { status: 'APPROVED' }, // removed this condition for now
		attributes: ['id', 'rating', 'guest_name', 'comment'],
		include: [
			{
				model: db.app_user,
				as: 'user',
				required: false,
				attributes: ['name'],
			},
		],
	},
];
