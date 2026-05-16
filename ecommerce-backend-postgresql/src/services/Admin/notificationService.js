const httpStatus = require('http-status');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');

const DEFAULT_LIMIT = 10;

async function createNotification(message) {
	return db.notification.create({ message });
}

async function getAllNotifications(req) {
	const page = parseInt(req.query.page) || 1;
	const limit = DEFAULT_LIMIT;
	const offset = (page - 1) * limit;

	const { count, rows } = await db.notification.findAndCountAll({
		order: [['created_at', 'DESC']],
		limit,
		offset,
	});

	const totalUnreadDoc = await db.notification.count({
		where: { is_read: false },
	});

	return {
		notifications: rows,
		totalUnreadDoc,
		total: count,
		page,
		limit,
	};
}

async function addNotification(req) {
	const { message } = req.body;
	if (!message) throw new ApiError(httpStatus.BAD_REQUEST, 'Message is required');
	const notification = await createNotification(message);
	return notification;
}

async function updateNotificationStatus(req) {
	const { id } = req.params;
	const { status } = req.body;
	const is_read = status === 'read';

	const [updated] = await db.notification.update(
		{ is_read },
		{ where: { id } }
	);
	if (!updated) throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
	return { success: true };
}

async function updateManyNotificationStatus(req) {
	const { ids } = req.body;
	if (!Array.isArray(ids) || ids.length === 0)
		throw new ApiError(httpStatus.BAD_REQUEST, 'ids array required');

	await db.notification.update(
		{ is_read: true },
		{ where: { id: { [Op.in]: ids } } }
	);
	return { success: true };
}

async function deleteNotification(req) {
	const { id } = req.params;
	const deleted = await db.notification.destroy({ where: { id } });
	if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
	return { success: true };
}

async function deleteNotificationByProductId(req) {
	// Stub — kept for CMS compatibility
	return { success: true };
}

async function deleteManyNotifications(req) {
	const { ids } = req.body;
	if (!Array.isArray(ids) || ids.length === 0)
		throw new ApiError(httpStatus.BAD_REQUEST, 'ids array required');

	await db.notification.destroy({ where: { id: { [Op.in]: ids } } });
	return { success: true };
}

module.exports = {
	createNotification,
	getAllNotifications,
	addNotification,
	updateNotificationStatus,
	updateManyNotificationStatus,
	deleteNotification,
	deleteNotificationByProductId,
	deleteManyNotifications,
};
