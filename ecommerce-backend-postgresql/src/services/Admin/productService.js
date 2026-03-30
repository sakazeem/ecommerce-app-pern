const db = require('../../db/models/index.js');
const commonUtils = require('../../utils/commonUtils.js');
const createBaseService = require('../../utils/baseService.js');
const { Op, QueryTypes } = require('sequelize');
const { createBrand } = require('./brandService.js');
const { createCategory } = require('./categoryService.js');
const ExcelJS = require('exceljs');
const cheerio = require('cheerio');
const { getFilterAttributes } = require('./attributeService.js');
const ApiError = require('../../utils/ApiError.js');
const httpStatus = require('http-status');
const { pickLanguageFields } = require('../../utils/languageUtils.js');
const config = require('../../config/config.js');
const { getOffset } = require('../../utils/query.js');

const productService = createBaseService(db.product, {
	name: 'Product',
	checkDuplicateSlug: true,
	formatCreateData: (data) => ({}),
	formatUpdateData: (data) => {},
	includes: [
		{ model: db.media, required: false, as: 'thumbnailImage' },
		{ model: db.media, required: false, as: 'images' },
		{
			model: db.category,
			required: false,
			include: [
				{
					model: db.category_translation,
					as: 'translations',
					required: false,
					attributes: {
						exclude: [
							'created_at',
							'updated_at',
							'category_id',
							'language_id',
							'id',
						],
					},
				},
			],
		},
		{ model: db.product_translation, required: false },
		{
			model: db.usp,
			required: false,
			include: [
				{
					model: db.usp_translation,
					as: 'translations',
					required: false,
					attributes: {
						exclude: [
							'created_at',
							'updated_at',
							'usp_id',
							'language_id',
							'id',
						],
					},
				},
			],
		},
		{
			model: db.brand,
			required: false,
			include: [
				{
					model: db.brand_translation,
					as: 'translations',
					required: false,
					attributes: {
						exclude: [
							'created_at',
							'updated_at',
							'brand_id',
							'language_id',
							'id',
						],
					},
				},
			],
		},
		{ model: db.vendor, required: false },
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
			],
		},
		{
			model: db.product,
			as: 'similar_products',
			attributes: ['id'],
			required: false,
			include: [
				{
					model: db.product_translation,
					required: false,
					attributes: ['title', 'slug'],
				},
			],
		},
	],
});

async function getProductTitlesOnly(req) {
	return await db.product_translation.findAll({
		attributes: ['product_id', 'title'],
	});
}

// duplicate slug validation missing
// Using userId logic from request
async function createProduct(req, existingTransaction) {
	const {
		categories = [],
		branches = [],
		usps = [],
		vendors = [],
		translations = [],
		variants = [],
		images = [],
		attribute_data = [],
		similarProducts = [],
		...productData
	} = req.body;

	let transactionCreatedHere = false;
	const transaction =
		existingTransaction || (await db.sequelize.transaction());
	if (!existingTransaction) transactionCreatedHere = true;
	const userId = commonUtils.getUserId(req);

	try {
		// Create main product
		const newProduct = await db.product.create(
			{ ...productData, user_id: userId },
			{
				transaction,
			}
		);

		// Create translations
		if (translations.length > 0) {
			const translationsWithProductId = translations.map((t) => ({
				...t,
				product_id: newProduct.id,
			}));
			await db.product_translation.bulkCreate(translationsWithProductId, {
				transaction,
			});
		}

		// Product associations
		if (images.length > 0) {
			const createdImages = await newProduct.setImages(images, {
				transaction,
			});
		}

		// attributes
		if (categories.length > 0)
			await newProduct.setCategories(categories, { transaction });
		if (branches.length > 0)
			await newProduct.setBranches(branches, { transaction });
		if (usps.length > 0) await newProduct.setUsps(usps, { transaction });
		if (vendors.length > 0 && newProduct.setVendors)
			await newProduct.setVendors(vendors, { transaction });

		if (similarProducts.length > 0) {
			const bulkData = [];

			for (const sim of similarProducts) {
				const similarId = typeof sim === 'object' ? sim.id : sim;
				if (similarId === newProduct.id) continue;

				// Both directions
				bulkData.push({
					product_id: newProduct.id,
					similar_product_id: similarId,
				});
				bulkData.push({
					product_id: similarId,
					similar_product_id: newProduct.id,
				});
			}

			await db.similar_product.bulkCreate(bulkData, {
				ignoreDuplicates: true,
				transaction,
			});
		}

		// Product variants with branch data
		for (const variant of variants) {
			const {
				branch_data = [],
				attribute_data = [],
				...variantData
			} = variant;

			const newVariant = await db.product_variant.create(
				{
					...variantData,
					product_id: newProduct.id,
				},
				{ transaction }
			);

			// Insert into product_variant_to_attribute for each attribute entry
			for (const entry of attribute_data) {
				await db.product_variant_to_attribute.create(
					{
						...entry,
						product_variant_id: newVariant.id,
					},
					{ transaction }
				);
			}
			// Insert into product_variant_to_branch for each branch entry
			for (const entry of branch_data) {
				await db.product_variant_to_branch.create(
					{
						...entry,
						product_variant_id: newVariant.id,
						branch_id: 1,
					},
					{ transaction }
				);
			}
		}

		if (transactionCreatedHere) await transaction.commit();
		return newProduct;
	} catch (error) {
		if (transactionCreatedHere) await transaction.rollback();
		throw error;
	}
}

async function updateProduct(req, existingTransaction) {
	const {
		categories = [],
		branches = [],
		usps = [],
		vendors = [],
		translations = [],
		variants = [],
		images = [],
		similarProducts = [],
		...productData
	} = req.body;
	let transactionCreatedHere = false;
	const transaction =
		existingTransaction || (await db.sequelize.transaction());
	if (!existingTransaction) transactionCreatedHere = true;
	const userId = commonUtils.getUserId(req);
	const productId = req.params.productId;

	try {
		// Fetch the product
		const product = await db.product.findByPk(productId, { transaction });
		if (!product) throw new Error('Product not found');

		// Update main product
		await product.update(
			{ ...productData, user_id: userId },
			{ transaction }
		);

		if (translations.length > 0) {
			// Update translations: remove old, add new
			await db.product_translation.destroy({
				where: { product_id: product.id },
				transaction,
			});
			const translationsWithProductId = translations.map((t) => ({
				...t,
				product_id: product.id,
			}));
			await db.product_translation.bulkCreate(translationsWithProductId, {
				transaction,
			});
		}

		// Update associations
		if (images?.length) await product.setImages(images, { transaction });
		if (categories?.length)
			await product.setCategories(categories, { transaction });
		if (branches?.length)
			await product.setBranches(branches, { transaction });
		if (usps?.length) await product.setUsps(usps, { transaction });
		if (vendors?.length) await product.setVendors(vendors, { transaction });

		// handle similar products
		// 2️⃣ Update similar products
		if (similarProducts.length > 0) {
			const bulkData = [];

			for (const sim of similarProducts) {
				// it accepts both [1,2,3,4] or [{id:1},{id:2},{id:3},{id:4}]
				const similarId = typeof sim === 'object' ? sim.id : sim;
				if (similarId === productId) continue; // skip self

				// Both directions
				bulkData.push({
					product_id: productId,
					similar_product_id: similarId,
				});
				bulkData.push({
					product_id: similarId,
					similar_product_id: productId,
				});
			}

			// Delete old similar products for this product (both directions)
			await db.similar_product.destroy({
				where: {
					[Op.or]: [
						{ product_id: productId },
						{ similar_product_id: productId },
					],
				},
				transaction,
			});

			// Insert new similar products
			if (bulkData.length) {
				await db.similar_product.bulkCreate(bulkData, {
					ignoreDuplicates: true,
					transaction,
				});
			}
		} else {
			// If similarProducts is empty, remove all old similar products
			// await db.similar_product.destroy({
			// 	where: {
			// 		[Op.or]: [
			// 			{ product_id: productId },
			// 			{ similar_product_id: productId },
			// 		],
			// 	},
			// 	transaction,
			// });
		}

		// Handle variants
		// update existing, remove extra, add new
		// Fetch existing variants
		const existingVariants = await db.product_variant.findAll({
			where: { product_id: product.id },
			transaction,
		});

		// Map existing variants by SKU
		const existingVariantMap = new Map();
		existingVariants.forEach((v) => existingVariantMap.set(v.sku, v));

		// Incoming SKUs
		const incomingSkus = variants.map((v) => v.sku);

		// Find variants to delete (sku not present anymore)
		const variantsToDelete = existingVariants.filter(
			(v) => !incomingSkus.includes(v.sku)
		);

		if (variantsToDelete.length) {
			const deleteIds = variantsToDelete.map((v) => v.id);

			await db.product_variant_to_branch.destroy({
				where: { product_variant_id: deleteIds },
				transaction,
			});

			await db.product_variant_to_attribute.destroy({
				where: { product_variant_id: deleteIds },
				transaction,
			});

			await db.product_variant.destroy({
				where: { id: deleteIds },
				transaction,
			});
		}

		// Loop incoming variants
		for (const variant of variants) {
			const {
				sku,
				branch_data = [],
				attribute_data = [],
				...variantData
			} = variant;

			let variantRecord;

			// UPDATE existing variant
			if (existingVariantMap.has(sku)) {
				variantRecord = existingVariantMap.get(sku);

				await variantRecord.update(variantData, { transaction });

				// Remove old relations
				await db.product_variant_to_branch.destroy({
					where: { product_variant_id: variantRecord.id },
					transaction,
				});

				await db.product_variant_to_attribute.destroy({
					where: { product_variant_id: variantRecord.id },
					transaction,
				});
			}
			// CREATE new variant
			else {
				variantRecord = await db.product_variant.create(
					{
						...variantData,
						sku,
						product_id: product.id,
					},
					{ transaction }
				);
			}

			// Insert attributes
			if (attribute_data.length) {
				const attributeEntries = attribute_data.map((entry) => ({
					...entry,
					product_variant_id: variantRecord.id,
				}));

				await db.product_variant_to_attribute.bulkCreate(
					attributeEntries,
					{
						transaction,
					}
				);
			}

			// Insert branch data
			if (branch_data.length) {
				const branchEntries = branch_data.map((entry) => ({
					...entry,
					product_variant_id: variantRecord.id,
				}));

				await db.product_variant_to_branch.bulkCreate(branchEntries, {
					transaction,
				});
			}
		}

		// await transaction.commit();
		if (transactionCreatedHere) await transaction.commit();
		return product;
	} catch (error) {
		// await transaction.rollback();
		if (transactionCreatedHere) await transaction.rollback();
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
	}
}

async function softDeleteProductById(req) {
	const userId = commonUtils.getUserId(req);
	return productService.softDelete(req.params.productId, userId);
}

function getProductIncludes(req) {
	return [
		{ model: db.media, required: false, as: 'thumbnailImage' },
		{
			model: db.category,
			required: false,
			include: [
				{
					model: db.category_translation,
					as: 'translations',
					required: false,
					attributes: {
						exclude: [
							'created_at',
							'updated_at',
							'category_id',
							'language_id',
							'id',
						],
					},
				},
			],
		},
		{
			model: db.product_translation,
			required: false,
		},
		{
			model: db.brand,
			required: false,
			include: [
				{
					model: db.brand_translation,
					as: 'translations',
					required: false,
					attributes: {
						exclude: [
							'created_at',
							'updated_at',
							'brand_id',
							'language_id',
							'id',
						],
					},
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
			],
		},
		// { model: db.vendor, required: false },
		// {
		// 	model: db.product_variant,
		// 	required: false,
		// 	include: [
		// 		{ model: db.media, required: false },
		// 		{
		// 			model: db.attribute,
		// 			required: false,
		// 			through: {
		// 				as: 'pva',
		// 			},
		// 			attributes: ['id', 'name'],
		// 		},
		// 		// {
		// 		// 	model: db.branch,
		// 		// 	required: false,
		// 		// 	through: {
		// 		// 		as: 'pvb',
		// 		// 	},
		// 		// },
		// 	],
		// },
	];
}

// import and export utils and services
const normalizeName = (str) => {
	if (!str) return '';

	return str
		.toLowerCase()
		.trim()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9\s]/g, '') // remove symbols
		.replace(/\b(s|es)\b$/g, '') // plural handling
		.replace(/\s+/g, ' '); // extra spaces
};

function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}

const resolveCategoryIds = async (
	categoryMap,
	categoryNames = [],
	transaction,
	createdCategories
) => {
	const ids = [];

	for (const name of categoryNames) {
		if (!name) continue;

		const normalized = normalizeName(name);
		let category = categoryMap.get(normalized);

		if (!category) {
			const created = await createCategory(
				{
					body: {
						status: true,
						translations: [
							{
								title: name,
								slug: slugify(name),
								language_id: 1,
							},
						],
					},
				},
				{ transaction }
			);

			const categoryId = created.category?.id || created.id;
			category = { id: categoryId };

			categoryMap.set(normalized, category);
			createdCategories.push(categoryId);
		}

		ids.push(category.id);
	}

	return ids;
};

const resolveBrandId = async (
	brandMap,
	brandName,
	transaction,
	createdBrands
) => {
	if (!brandName) return null;

	const normalized = normalizeName(brandName);
	let brand = brandMap.get(normalized);

	if (!brand) {
		const created = await createBrand(
			{
				body: {
					status: true,
					translations: [
						{
							title: brandName,
							slug: slugify(brandName),
							language_id: 1,
						},
					],
				},
			},
			{ transaction }
		);

		const brandId = created.brand?.id || created.id;
		brand = { id: brandId };

		brandMap.set(normalized, brand);
		createdBrands.push(brandId);
	}

	return brand.id;
};

const getProductByIdForImport = async (id) => {
	return await db.product.findByPk(id, {
		include: [
			{
				model: db.product_translation,
				// as: 'translations',
				attributes: ['title', 'slug'],
			},
		],
	});
};

async function importProductsFromSheet(req) {
	const { products } = req.body;

	const createdCategories = [];
	const createdBrands = [];
	const createdProducts = [];
	const updatedProducts = [];
	const errorProducts = [];

	const categories = await db.category_translation.findAll({
		attributes: ['category_id', 'title'],
	});

	const brands = await db.brand_translation.findAll({
		attributes: ['brand_id', 'title'],
	});

	const categoryMap = new Map();
	const brandMap = new Map();

	categories.forEach((c) => {
		categoryMap.set(normalizeName(c.title), {
			id: c.category_id,
		});
	});

	brands.forEach((b) => {
		brandMap.set(normalizeName(b.title), {
			id: b.brand_id,
		});
	});
	const existingProducts = await db.product.findAll({
		include: [
			{
				model: db.product_translation,
				// as: 'translations',
				attributes: ['title', 'slug'],
			},
		],
	});

	const skuMap = new Map();
	const titleSlugMap = new Map();

	existingProducts.forEach((p) => {
		skuMap.set(p.sku, p);

		p.product_translations.forEach((t) => {
			titleSlugMap.set(t.title.toLowerCase(), p);
			titleSlugMap.set(t.slug.toLowerCase(), p);
		});
	});
	const transaction = await db.sequelize.transaction();

	try {
		for (const product of products) {
			// 🔹 Resolve categories & brand FIRST
			const categoryNames = product.categories || [];
			const brandName = product.brand_id || null;
			const categoryIds = await resolveCategoryIds(
				categoryMap,
				categoryNames,
				transaction,
				createdCategories
			);

			const brandId = await resolveBrandId(
				brandMap,
				brandName,
				transaction,
				createdBrands
			);
			product.categories = categoryIds;
			product.brand_id = brandId;

			// 🔹 Find existing product
			let existingProduct =
				skuMap.get(product.sku) ||
				titleSlugMap.get(
					product.translations?.[0]?.title?.toLowerCase()
				) ||
				titleSlugMap.get(
					product.translations?.[0]?.slug?.toLowerCase()
				);

			const similarProductIds = (product.similarProductsSku || [])
				.map((sku) => skuMap.get(sku)?.id)
				.filter(Boolean); // get product ID

			// // remove undefined (SKUs not found)

			product.similarProducts = similarProductIds; // assign to payload

			if (existingProduct) {
				const updatedProduct = await updateProduct(
					{
						params: { productId: existingProduct.id },
						body: product,
					},
					transaction
				);

				const freshProduct = await getProductByIdForImport(
					updatedProduct.id
				);
				skuMap.set(product.sku, freshProduct);
				titleSlugMap.set(
					product.translations?.[0]?.title?.toLowerCase(),
					freshProduct
				);
				titleSlugMap.set(
					product.translations?.[0]?.slug?.toLowerCase(),
					freshProduct
				);
				updatedProducts.push(existingProduct.id);
			} else {
				const created = await createProduct(
					{ body: product },
					transaction
				);
				const freshProduct = await getProductByIdForImport(created.id);
				skuMap.set(product.sku, freshProduct);
				titleSlugMap.set(
					product.translations?.[0]?.title?.toLowerCase(),
					freshProduct
				);
				titleSlugMap.set(
					product.translations?.[0]?.slug?.toLowerCase(),
					freshProduct
				);

				createdProducts.push(created.id);
			}
		}

		await transaction.commit();

		return {
			createdCategories,
			createdBrands,
			createdProducts,
			updatedProducts,
		};
	} catch (error) {
		await transaction.rollback();
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
	}
}

function splitDescription(html) {
	if (!html) return { description: '', additionalInfo: '' };

	// Decode HTML entities
	const decodedHtml = html
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/\\u003E/g, '>');

	const $ = cheerio.load(decodedHtml);

	// Description: all <p> text before any <ul>
	let descriptionTexts = [];
	$('p').each((i, el) => {
		const pText = $(el).text().trim();
		if (pText) descriptionTexts.push(pText);
	});

	// Additional info: all <li> items
	let additionalInfoTexts = [];
	$('ul li').each((i, el) => {
		const liText = $(el).text().trim();
		if (liText) additionalInfoTexts.push('• ' + liText);
	});

	return {
		description: descriptionTexts.join('\n'),
		additionalInfo: additionalInfoTexts.join('\n'),
	};
}
async function exportProducts(req, res) {
	try {
		const filterAttributes = await getFilterAttributes();

		// 🆕 NEW — set headers BEFORE streaming starts
		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="products_export_${Date.now()}.xlsx"`
		);

		// 🔧 CHANGED — streaming workbook instead of in-memory workbook
		const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
			stream: res,
			useStyles: true,
			useSharedStrings: true,
		});

		const sheet = workbook.addWorksheet('Products');

		// same as before
		sheet.columns = [
			{ header: 'S.No', key: 'sno', width: 6 },
			{ header: excelFeilds.sku, key: excelFeilds.sku, width: 20 },
			{ header: excelFeilds.title, key: excelFeilds.title, width: 30 },
			{
				header: excelFeilds.excerpt,
				key: excelFeilds.excerpt,
				width: 30,
			},
			{
				header: excelFeilds.description,
				key: excelFeilds.description,
				width: 50,
			},
			{ header: excelFeilds.slug, key: excelFeilds.slug, width: 25 },
			{
				header: excelFeilds.meta_title,
				key: excelFeilds.meta_title,
				width: 25,
			},
			{
				header: excelFeilds.meta_description,
				key: excelFeilds.meta_description,
				width: 35,
			},
			{
				header: excelFeilds.categories,
				key: excelFeilds.categories,
				width: 25,
			},
			{ header: excelFeilds.brand, key: excelFeilds.brand, width: 20 },
			{ header: excelFeilds.size, key: excelFeilds.size, width: 10 },
			{ header: excelFeilds.color, key: excelFeilds.color, width: 10 },
			{ header: excelFeilds.gender, key: excelFeilds.gender, width: 10 },
			{
				header: excelFeilds.additionalInfo,
				key: excelFeilds.additionalInfo,
				width: 50,
			},
			{ header: excelFeilds.price, key: excelFeilds.price, width: 12 },
			{
				header: excelFeilds.discount,
				key: excelFeilds.discount,
				width: 12,
			},
			{
				header: excelFeilds.similar_products,
				key: excelFeilds.similar_products,
				width: 20,
			},
			{
				header: excelFeilds.remaining_stock,
				key: excelFeilds.remaining_stock,
				width: 20,
			},
			{
				header: excelFeilds.stock_threshold,
				key: excelFeilds.stock_threshold,
				width: 20,
			},
		];

		// 🔧 CHANGED — header styling only once
		const headerRow = sheet.getRow(1);
		headerRow.eachCell((cell) => {
			cell.font = { bold: true, size: 14 };
			cell.alignment = {
				wrapText: true,
				vertical: 'top',
				horizontal: 'left',
			};
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
		});
		headerRow.commit();

		const colorId =
			filterAttributes.find((v) => v.name?.en === 'color')?.id || 7;

		const genderId =
			filterAttributes.find((v) => v.name?.en === 'gender')?.id || 5;

		const sizeId =
			filterAttributes.find((v) => v.name?.en === 'size')?.id || 4;

		// 🆕 NEW — pagination setup
		const limit = 500;
		let offset = 0;
		let serial = 1;

		// 🆕 NEW — paginated export loop
		while (true) {
			const products = await db.product.findAll({
				include: [
					{ model: db.media, required: false, as: 'thumbnailImage' },
					{ model: db.media, required: false, as: 'images' },
					{
						model: db.category,
						required: false,
						include: [
							{
								model: db.category_translation,
								as: 'translations',
								required: false,
								attributes: {
									exclude: [
										'created_at',
										'updated_at',
										'category_id',
										'language_id',
										'id',
									],
								},
							},
						],
					},
					{ model: db.product_translation, required: false },
					{
						model: db.usp,
						required: false,
						include: [
							{
								model: db.usp_translation,
								as: 'translations',
								required: false,
								attributes: {
									exclude: [
										'created_at',
										'updated_at',
										'usp_id',
										'language_id',
										'id',
									],
								},
							},
						],
					},
					{
						model: db.brand,
						required: false,
						include: [
							{
								model: db.brand_translation,
								as: 'translations',
								required: false,
								attributes: {
									exclude: [
										'created_at',
										'updated_at',
										'brand_id',
										'language_id',
										'id',
									],
								},
							},
						],
					},
					{ model: db.vendor, required: false },
					{
						model: db.product_variant,
						required: false,
						include: [
							{ model: db.media, required: false },
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
					{
						model: db.product,
						as: 'similar_products',
						attributes: ['id', 'sku'],
						required: false,
					},
				],
				order: [['id', 'ASC']],
				limit,
				offset,
			});

			if (!products.length) break;
			// attribute ids

			for (const p of products) {
				const translation = p.product_translations?.[0] || {};
				const brandName = p.brand?.translations?.[0]?.title || '';
				const categoryNames =
					p.categories
						?.map((c) => c.translations?.[0]?.title || '')
						.filter(Boolean) || [];

				const firstVariant = p.product_variants?.[0] || {};
				const variants = p.product_variants || [];

				const color =
					firstVariant.attributes?.find((a) => a.id === colorId)?.pva
						?.value?.en || '';

				const gender =
					firstVariant.attributes?.find((a) => a.id === genderId)?.pva
						?.value?.en || '';

				const sizeValues =
					variants
						?.map((variant) => {
							const sizeValue =
								variant.attributes?.find((a) => a.id === sizeId)
									?.pva?.value?.en || '';
							if (!sizeValue) return null;
							return `${sizeValue}(${variant.sku})`;
						})
						.filter(Boolean) || [];

				const size = sizeValues.join(', ');

				const inventoryDataStock = variants
					.map((variant) => {
						const sku = variant.sku;
						const stock = variant.branches?.[0]?.pvb?.stock ?? 0;
						return `${sku}(${stock})`;
					})
					.join(', ');

				const inventoryDataLowStock = variants
					.map((variant) => {
						const sku = variant.sku;
						const stock = variant.branches?.[0]?.pvb?.stock ?? 0;
						return `${sku}(${stock})`;
					})
					.join(', ');

				const pricesData = variants
					.map((variant) => {
						const sku = variant.sku;
						const price =
							variant.branches?.[0]?.pvb?.sale_price ?? 0;
						return `${sku}(${price})`;
					})
					.join(', ');

				const { description, additionalInfo } = splitDescription(
					translation.description
				);

				const row = sheet.addRow({
					sno: serial++,
					[excelFeilds.sku]: p.sku,
					[excelFeilds.title]: translation.title || '',
					[excelFeilds.excerpt]: translation.excerpt || '',
					[excelFeilds.description]: description,
					[excelFeilds.slug]: translation.slug || '',
					[excelFeilds.meta_title]: p.meta_title || '',
					[excelFeilds.meta_description]: p.meta_description || '',
					[excelFeilds.categories]: categoryNames.join(', '),
					[excelFeilds.brand]: brandName,
					[excelFeilds.size]: size,
					[excelFeilds.color]: color,
					[excelFeilds.gender]: gender,
					[excelFeilds.additionalInfo]: additionalInfo,
					[excelFeilds.price]: pricesData,
					[excelFeilds.discount]: p.base_discount_percentage || 0,
					[excelFeilds.similar_products]:
						p.similar_products?.map((sp) => sp.sku).join(', ') ||
						'',
					[excelFeilds.remaining_stock]: inventoryDataStock,
					[excelFeilds.stock_threshold]: inventoryDataLowStock,
				});

				// 🔧 CHANGED — streaming requires row.commit()
				row.commit();
			}

			// offset += limit;
			offset += products.length;
		}

		// 🔧 CHANGED — finalize stream
		await workbook.commit();
	} catch (error) {
		console.error('EXPORT PRODUCTS ERROR:', error);
		if (!res.headersSent) {
			res.status(500).json({ message: 'Export failed' });
		}
	}
}

async function getProductById(productId) {
	const product = await productService.getById(productId);
	return product;
}

async function getProducts(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		// limit = defaultLimit,
		sortBy,
		sortOrder = 'DESC',
		status,
		search,
		categoryId,
	} = req.query;

	const offset = getOffset(page, limit);
	const sort = [['id', 'DESC']]; // default sort
	let finalSort = sort;

	if (sortBy === 'stock') {
		finalSort = [
			[
				db.Sequelize.literal(
					`(
					SELECT MIN(pvb.stock)
					FROM product_variant pv
					JOIN product_variant_to_branch pvb 
					  ON pvb.product_variant_id = pv.id
					WHERE pv.product_id = product.id
				)`
				),
				sortOrder.toUpperCase(),
			],
		];
	} else if (sortBy) {
		finalSort = [[sortBy, sortOrder.toUpperCase()]];
	}
	const includes = getProductIncludes(req);
	const lang = commonUtils.getLang(req);

	const whereCondition = {};
	if (status) whereCondition.status = status;

	if (search) {
		const variantMatch = await db.product_variant.findOne({
			where: { sku: search },
			attributes: ['product_id'],
			raw: true,
		});

		const productMatch = await db.product.findOne({
			where: { sku: search },
			attributes: ['id'],
			raw: true,
		});

		if (variantMatch || productMatch) {
			const productId = variantMatch?.product_id || productMatch?.id;
			whereCondition.id = productId;
		} else {
			includes.push({
				model: db.product_translation,
				required: true, // 🔥 important
				where: {
					title: {
						[Op.iLike]: `%${search}%`,
					},
				},
			});
		}
	}

	if (categoryId) {
		const matchingProducts = await db.product_to_category.findAll({
			attributes: ['product_id'],
			where: { category_id: categoryId },
			raw: true,
		});
		const productIdsFromCategory = matchingProducts.map(
			(p) => p.product_id
		);
		whereCondition.id = {
			[Op.in]: productIdsFromCategory.length
				? productIdsFromCategory
				: [-1],
		};
	}

	const data = await db.product.findAndCountAll({
		offset,
		limit,
		order: finalSort,
		where: whereCondition,
		include: [...includes],
		unique: true,
		distinct: true, // to fix count
		col: 'id', // to fix count
	});
	const parsedRows = pickLanguageFields(data.rows, lang);

	return {
		total: data.count,
		records: parsedRows,
		limit: limit,
		page: page,
	};
}
const cleanKeyFeaturesText = (html) => {
	if (!html) return html;

	// 1️⃣ Remove repeated plain Key Features text
	html = html.replace(/Key Features(\s*Key Features)*/gi, '');

	// 2️⃣ Remove empty strong tags
	html = html.replace(/<strong>\s*<\/strong>/gi, '');

	// 3️⃣ Remove empty paragraphs
	html = html.replace(/<p>\s*<\/p>/gi, '');

	// 4️⃣ If UL exists and no strong Key Features exists → add it
	if (
		html.includes('<ul>') &&
		!html.includes('<strong>Key Features</strong>')
	) {
		html = html.replace(/<ul>/, '<p><strong>Key Features</strong></p><ul>');
	}

	return html.trim();
};

async function cleanDescriptionProducts(req) {
	const transaction = await db.sequelize.transaction();

	try {
		const products = await db.product_translation.findAll({
			where: {
				description: {
					[Op.ne]: null,
				},
			},
			transaction,
		});

		console.log(`Found ${products.length} products`);

		for (const product of products) {
			const cleaned = cleanKeyFeaturesText(product.description);

			if (cleaned !== product.description) {
				await product.update({ description: cleaned }, { transaction });
				console.log(`Updated Product ID: ${product.id}`);
			}
		}

		await transaction.commit();
		console.log('✅ All descriptions cleaned successfully.');
	} catch (error) {
		await transaction.rollback();
		console.error('❌ Error cleaning descriptions:', error);
	}
}

module.exports = {
	getProductById,
	createProduct,
	updateProduct,
	getProducts,
	permanentDeleteProductById: productService.permanentDelete,
	softDeleteProductById,
	importProductsFromSheet,
	exportProducts,
	getProductTitlesOnly,
	cleanDescriptionProducts,
};

const excelFeilds = {
	sku: 'SKU',
	title: 'Title',
	excerpt: 'Excerpt',
	description: 'Description',
	slug: 'Slug',
	meta_title: 'Meta Title',
	meta_description: 'Meta_Description',
	categories: 'Categories',
	brand: 'Brand',
	size: 'VariantsSize',
	color: 'Variants Color',
	gender: 'Gender',
	additionalInfo: 'Additional info',
	price: 'Price',
	discount: 'Discount',
	similar_products: 'similar_products',
	remaining_stock: 'Remaining Stock',
	stock_threshold: 'Stock Threshold',
};
