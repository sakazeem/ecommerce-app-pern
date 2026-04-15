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

	return {
		total: products.count,
		records: products.rows,
		limit: limit,
		page: page,
	};

	return products;
};
const getCategoryFilterProducts = async (req) => {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		filterQuery = false,
	} = req.query;
	const offset = getOffset(page, limit);
	const { categoryIds } = await productFilterConditions(req);

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

	return {
		total: products.count,
		records: products.rows,
		limit: limit,
		page: page,
	};

	return products;
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

	console.log(
		{
			categoryIds,
			brandCondition,
			brandRequired,
			priceCondition,
			searchCondition,
			variantAttributeFilter,
		},
		'chkking conditions'
	);

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
