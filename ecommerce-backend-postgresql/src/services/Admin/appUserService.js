const db = require('../../db/models');
const createBaseService = require('../../utils/baseService');
const { Op } = require('sequelize');

const appUserService = createBaseService(db.app_user, {
	name: 'App User',
	formatCreateData: (data) => {},
	formatUpdateData: (data) => {
		const toUpdate = {};
		if (data.status !== undefined) toUpdate.status = data.status;
		return toUpdate;
	},
});

async function updateAppUser(req) {
	return appUserService.update(req.params.id, req.body);
}

async function getAppUsers(req) {
	const { page = 1, limit = 1000, search, startDate, endDate } = req.query;
	const whereCondition = {};

	if (search) {
		whereCondition[Op.or] = [
			{ name: { [Op.iLike]: `%${search}%` } },
			{ email: { [Op.iLike]: `%${search}%` } },
			{ phone: { [Op.iLike]: `%${search}%` } },
		];
	}

	const start = startDate ? new Date(startDate) : null;
	const end = endDate
		? new Date(new Date(endDate).setHours(23, 59, 59, 999))
		: null;

	if (start && end) {
		whereCondition.created_at = { [Op.between]: [start, end] };
	} else if (start) {
		whereCondition.created_at = { [Op.gte]: start };
	} else if (end) {
		whereCondition.created_at = { [Op.lte]: end };
	}

	const data = await db.app_user.findAndCountAll({
		where: whereCondition,
		order: [['id', 'DESC']],
		limit: Number(limit),
		offset: (Number(page) - 1) * Number(limit),
		attributes: { exclude: ['password'] },
		distinct: true,
		col: 'id',
	});

	return {
		total: data.count,
		records: data.rows,
		limit,
		page,
	};
}

module.exports = {
	getAppUsers,
	updateAppUser,
};
	