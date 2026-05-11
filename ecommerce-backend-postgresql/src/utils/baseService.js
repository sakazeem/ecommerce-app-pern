const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { getOffset } = require('./query');
const config = require('../config/config');
const { pickLanguageFields } = require('./languageUtils');
const { Op } = require('sequelize');
const db = require('../db/models');

function createBaseService(model, options = {}) {
	const {
		name = 'Entity',
		formatCreateData = (data) => data,
		formatUpdateData = (data) => data,
		checkDuplicateSlug = false,
		useSoftDelete = true,
		validations = () => {},
		isPagination = true,
		includes = [],
		translationModel = null, // <-- NEW: pass translation model
		translationForeignKey = null, // <-- e.g. "parent_category_id"
		isTagColumn = false, // <-- to handle tag field in category translation
	} = options;

	const getLang = (req) =>
		req?.query?.lang || req?.headers?.['accept-language'] || 'en';

	return {
		async getById(id, scope = 'defaultScope') {
			const result = await model.scope(scope).findOne({
				where: { id },
				include: [
					...includes,
					...(translationModel
						? [
								{
									model: translationModel,
									as: 'translations',
									required: false,
									attributes: {
										exclude: [
											'created_at',
											'updated_at',
											translationForeignKey,
											'id',
										],
									},
									// where: lang
									// 	? { '$translations.language_id$': lang }
									// 	: {},
								},
						  ]
						: []),
				],
			});
			if (!result)
				throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
			return result;
		},

		async create(data, userId) {
			await validations(data);
			if (!translationModel && checkDuplicateSlug && data.slug) {
				const exists = await model.findOne({
					where: { slug: data.slug },
				});
				if (exists)
					throw new ApiError(
						httpStatus.CONFLICT,
						`${name} with this slug already exists`
					);
			}

			const formattedData = formatCreateData(data);
			formattedData.user_id = userId;

			const transaction = await db.sequelize.transaction();
			try {
				const entity = await model.create(formattedData, {
					transaction,
				});
				if (translationModel && data.translations?.length > 0) {
					const translations = data.translations.map((t) => ({
						[translationForeignKey]: entity.id,
						language_id: t.language_id,
						title: t.title,
						description: t.description || null,
						slug: t.slug,
						...(isTagColumn ? { tag: t.tag || null } : {}),
					}));
					await translationModel.bulkCreate(translations, {
						transaction,
					});
				}
				await transaction.commit();
				return entity.get({ plain: true });
			} catch (error) {
				await transaction.rollback();
				throw error;
			}
		},

		async update(id, data, userId, incommingTransaction) {
			const toUpdate = formatUpdateData(data);
			toUpdate.user_id = userId;
			await validations(data);

			if (!translationModel && checkDuplicateSlug && data.slug) {
				const exists = await model.findOne({
					where: {
						slug: data.slug,
						id: { [Op.ne]: id },
					},
				});
				if (exists)
					throw new ApiError(
						httpStatus.CONFLICT,
						`${name} with this slug already exists`
					);
			}

			const transaction = incommingTransaction
				? incommingTransaction
				: await db.sequelize.transaction();
			try {
				const [_, updated] = await model.update(toUpdate, {
					where: { id },
					transaction,
					returning: true,
					plain: true,
					raw: true,
				});
				if (!updated)
					throw new ApiError(
						httpStatus.NOT_FOUND,
						`${name} not found`
					);

				if (translationModel && Array.isArray(data.translations)) {
					// 2. Delete translations not present in incoming
					await translationModel.destroy({
						where: {
							[translationForeignKey]: id,
							language_id: {
								[Op.notIn]: data.translations.map(
									(t) => t.language_id
								),
							},
						},
						transaction,
					});
				}

				if (translationModel && data.translations?.length > 0) {
					for (const t of data.translations) {
						await translationModel.upsert(
							{
								[translationForeignKey]: id,
								language_id: t.language_id,
								title: t.title,
								description: t.description || null,
								slug: t.slug,
								...(isTagColumn ? { tag: t.tag || null } : {}),
							},
							{ transaction }
						);
					}
				}
				await transaction.commit();
				return updated;
			} catch (error) {
				await transaction.rollback();
				throw error;
			}
		},

		async softDelete(id, deletedByUserId) {
			if (!useSoftDelete) {
				throw new ApiError(
					httpStatus.BAD_REQUEST,
					`${name} does not support soft delete`
				);
			}

			const [count] = await model.update(
				{
					deleted_at: new Date(),
					deleted_by: deletedByUserId,
				},
				{ where: { id } }
			);

			if (count === 0)
				throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
			return true;
		},

		async permanentDelete(id, useScope = true) {
			const deleted = useScope
				? await model.scope('withDeleted').destroy({ where: { id } })
				: await model.destroy({ where: { id } });
			if (!deleted)
				throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
			return deleted;
		},

		async list(
			req,
			include = [],
			attributes = [],
			sort = [['id', 'DESC']],
			isProduct
		) {
			const { page: defaultPage, limit: defaultLimit } =
				config.pagination;
			const {
				page = defaultPage,
				limit = 1000,
				// limit = defaultLimit,
				sortBy,
				sortOrder = 'DESC',
				search, // search by title only, for now
				status,
			} = req.query;

			const offset = getOffset(page, limit);
			const finalSort = sortBy
				? [[sortBy, sortOrder.toUpperCase()]]
				: sort;
			const lang = getLang(req);
			const data = await model.findAndCountAll({
				offset,
				limit,
				order: finalSort,
				where: status
					? {
							status,
					  }
					: {},
				// order: [[...sort, sortBy, sortOrder.toUpperCase()]],
				include: [
					...(isProduct ? include : includes),
					...(translationModel
						? [
								{
									model: translationModel,
									as: 'translations',
									required: search ? true : false,
									attributes: {
										exclude: [
											'created_at',
											'updated_at',
											translationForeignKey,
											'language_id',
											'id',
										],
									},
									where: search
										? {
												title: {
													[Op.iLike]: `%${search}%`,
												},
										  }
										: {},
									// where: lang
									// 	? { '$translations.language_id$': lang }
									// 	: {},
								},
						  ]
						: []),
				],
				// attributes: attributes?.length > 0 ? ['id','created_at'] : {},
				attributes: attributes?.length > 0 ? attributes : {},
				// raw: true,
				// logging: console.warn,
				unique: true,
				distinct: true, // to fix count
				col: 'id', // to fix count
			});
			const parsedRows = pickLanguageFields(data.rows, lang);
			if (isPagination) {
				return {
					total: data.count,
					records: parsedRows,
					limit: limit,
					page: page,
				};
			}
			return parsedRows;
		},
	};
}

module.exports = createBaseService;
