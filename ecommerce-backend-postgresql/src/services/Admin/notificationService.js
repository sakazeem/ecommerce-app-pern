const httpStatus = require('http-status');
const db = require('../../db/models');
const ApiError = require('../../utils/ApiError');
const { getOffset } = require('../../utils/query');

const PAGE_SIZE = 10;

async function addNotification(body) {
	return db.notification.create(body);
}

async function getAllNotification(page = 1) {
	const offset = getOffset(page, PAGE_SIZE);
	const { rows: notifications, count } = await db.notification.findAndCountAll({
		order: [['createdAt', 'DESC']],
		limit: PAGE_SIZE,
		offset,
	});

	const totalUnreadDoc = await db.notification.count({ where: { status: 'unread' } });

	return { notifications, totalDoc: count, totalUnreadDoc };
}

async function updateStatusNotification(id, body) {
	const notification = await db.notification.findByPk(id);
	if (!notification) throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
	await notification.update(body);
	return notification;
}

async function updateManyStatusNotification(body) {
	const { ids, status } = body;
	await db.notification.update({ status }, { where: { id: ids } });
}

async function deleteNotification(id) {
	const notification = await db.notification.findByPk(id);
	if (!notification) throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
	await notification.destroy();
}

async function deleteNotificationByProductId(productId) {
	await db.notification.destroy({ where: { productId } });
}

async function deleteManyNotification(body) {
	const { ids } = body;
	await db.notification.destroy({ where: { id: ids } });
}

module.exports = {
	addNotification,
	getAllNotification,
	updateStatusNotification,
	updateManyStatusNotification,
	deleteNotification,
	deleteNotificationByProductId,
	deleteManyNotification,
};
