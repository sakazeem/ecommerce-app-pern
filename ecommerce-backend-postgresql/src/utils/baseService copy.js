const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { getOffset } = require('./query');
const config = require('../config/config');
const { pickLanguageFields } = require('./languageUtils');
const { Op } = require('sequelize');

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
	} = options;

	const getLang = (req) =>
		req?.query?.lang || req?.headers?.['accept-language'] || 'en';

	return {
		async getById(id, include = [], scope = 'defaultScope') {
			const result = await model
				.scope(scope)
				.findOne({ where: { id }, include: includes });
			if (!result)
				throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
			return result;
		},

		async getBySlug(slug, scope = 'defaultScope') {
			const result = await model
				.scope(scope)
				.findOne({ where: { slug } });
			if (!result)
				throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
			return result;
		},

		async create(data, userId) {
			await validations(data);
			if (checkDuplicateSlug && data.slug) {
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

			const entity = await model.create(formattedData);
			return entity.get({ plain: true });
		},

		async update(id, data, userId) {
			const toUpdate = formatUpdateData(data);
			toUpdate.user_id = userId;
			await validations(data);

			if (checkDuplicateSlug && data.slug) {
				const exists = await model.findOne({
					where: {
						slug: data.slug,
						id: { [Op.ne]: data.id },
					},
				});
				if (exists)
					throw new ApiError(
						httpStatus.CONFLICT,
						`${name} with this slug already exists`
					);
			}

			const [_, updated] = await model.update(toUpdate, {
				where: { id },
				returning: true,
				plain: true,
				raw: true,
			});
			if (!updated)
				throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
			return updated;
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

		async permanentDelete(id) {
			const deleted = await model
				.scope('withDeleted')
				.destroy({ where: { id } });
			if (!deleted)
				throw new ApiError(httpStatus.NOT_FOUND, `${name} not found`);
			return deleted;
		},

		async list(
			req,
			include = [],
			attributes = [],
			sort = [['id', 'DESC']]
		) {
			const { page: defaultPage, limit: defaultLimit } =
				config.pagination;
			const {
				page = defaultPage,
				limit = defaultLimit,
				sortBy,
				sortOrder = 'DESC',
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
				// order: [[...sort, sortBy, sortOrder.toUpperCase()]],
				include: includes,
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
