const httpStatus = require('http-status');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');
const config = require('../../config/config');
const { getOffset } = require('../../utils/query');
const { Op } = require('sequelize');

async function getReturnRequestById(req) {
	const { id } = req.params;
	const returned = db.returned.findByPk(id, {
		include: [
			{
				model: db.order_item,
				include: [
					{
						model: db.product,
						required: false,
						include: [
							{
								model: db.media,
								required: false,
								as: 'thumbnailImage',
								attributes: ['url', 'title', 'size'],
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
						],
					},
				],
			},
			{ model: db.order, required: false },
			{ model: db.app_user, as: 'user', required: false },
		],
	});

	if (!returned)
		throw new ApiError(httpStatus.NOT_FOUND, `Return request not found`);
	return returned;
}

async function getReturnRequests(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const {
		page = defaultPage,
		limit = defaultLimit,
		status,
		startDate,
		endDate,
	} = req.query;
	const offset = getOffset(page, limit);
	const whereCondition = {};
	if (status) {
		whereCondition.status = status;
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

	const returned = await db.returned.findAndCountAll({
		offset,
		limit,
		where: whereCondition,
		include: [
			{
				model: db.order_item,
				required: false,
			},
			{
				model: db.app_user,
				as: 'user',
				required: false,
			},
		],
		order: [['id', 'DESC']],
		unique: true,
		distinct: true, // to fix count
		col: 'id', // to fix count
	});

	return {
		total: returned.count,
		records: returned.rows,
		limit: limit,
		page: page,
	};
}

async function approveReturn(req) {
	const { returnId, adminId } = req.body;
	return await db.sequelize.transaction(async (t) => {
		const returned = await db.returned.findOne({
			where: { id: returnId },
			transaction: t,
		});

		if (!returned)
			throw new ApiError(
				httpStatus.NOT_FOUND,
				'Return request not found'
			);

		if (returned.status !== 'requested')
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Only requested returns can be approved'
			);

		await returned.update(
			{
				status: 'approved',
				admin_note: `Approved by admin ${adminId}`,
				approved_at: new Date(),
			},
			{ transaction: t }
		);

		return returned;
	});
}

async function rejectReturn(req) {
	const { returnId, adminId, note } = req.body;
	return await db.sequelize.transaction(async (t) => {
		const returned = await db.returned.findOne({
			where: { id: returnId },
			transaction: t,
		});

		if (!returned)
			throw new ApiError(
				httpStatus.NOT_FOUND,
				'Return request not found'
			);

		if (!['requested', 'approved'].includes(returned.status))
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Cannot reject in current status'
			);
		await db.order.update(
			{
				status: 'delivered',
			},
			{
				where: {
					id: returned.order_id,
				},
				transaction: t,
			}
		);
		await returned.update(
			{
				status: 'rejected',
				admin_note: note || `Rejected by admin ${adminId}`,
			},
			{ transaction: t }
		);

		return returned;
	});
}

async function markReturnReceived(req) {
	const { returnId, adminId } = req.body;
	return await db.sequelize.transaction(async (t) => {
		const returned = await db.returned.findOne({
			where: { id: returnId },
			transaction: t,
		});

		if (!returned)
			throw new ApiError(
				httpStatus.NOT_FOUND,
				'Return request not found'
			);

		if (returned.status !== 'approved')
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Only approved returns can be received'
			);
		await db.order.update(
			{
				status: 'returned',
			},
			{
				where: {
					id: returned.order_id,
				},
				transaction: t,
			}
		);
		await returned.update(
			{
				status: 'received',
				admin_note: `${
					returned.admin_note || ''
				}\nReceived by admin ${adminId}`,
				received_at: new Date(),
			},
			{ transaction: t }
		);

		return returned;
	});
}

async function processRefund(req) {
	const { returnId, adminId, totalAmount, refundMethod } = req.body;
	return await db.sequelize.transaction(async (t) => {
		const returned = await db.returned.findOne({
			where: { id: returnId },
			include: [{ model: db.refund }],
			transaction: t,
		});

		if (!returned)
			throw new ApiError(
				httpStatus.NOT_FOUND,
				'Return request not found'
			);

		if (returned.status !== 'received')
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Only received returns can be refunded'
			);

		if (returned.refund)
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Refund already processed'
			);

		// Create refund record
		const refund = await db.refund.create(
			{
				returned_id: returned.id,
				total_amount: totalAmount,
				refund_method: refundMethod, // 'wallet' | 'bank' | 'original_payment'
				status: 'processed',
				processed_at: new Date(),
				completed_at: new Date(),
			},
			{ transaction: t }
		);
		await db.order.update(
			{
				status: 'refunded',
			},
			{
				where: {
					id: returned.order_id,
				},
				transaction: t,
			}
		);
		// Update returned status
		await returned.update({ status: 'refunded' }, { transaction: t });

		return { returned, refund };
	});
}

module.exports = {
	approveReturn,
	rejectReturn,
	markReturnReceived,
	processRefund,
	getReturnRequestById,
	getReturnRequests,
};
