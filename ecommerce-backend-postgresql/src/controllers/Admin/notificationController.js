const catchAsync = require('../../utils/catchAsync');
const { notificationService } = require('../../services/Admin');

const addNotification = catchAsync(async (req, res) => {
	const result = await notificationService.addNotification(req.body);
	res.send(result);
});

const getAllNotification = catchAsync(async (req, res) => {
	const result = await notificationService.getAllNotification(req.query.page);
	res.send(result);
});

const updateStatusNotification = catchAsync(async (req, res) => {
	const result = await notificationService.updateStatusNotification(req.params.id, req.body);
	res.send(result);
});

const updateManyStatusNotification = catchAsync(async (req, res) => {
	await notificationService.updateManyStatusNotification(req.body);
	res.send({ message: 'Notifications updated successfully' });
});

const deleteNotification = catchAsync(async (req, res) => {
	await notificationService.deleteNotification(req.params.id);
	res.send({ message: 'Notification deleted successfully' });
});

const deleteNotificationByProductId = catchAsync(async (req, res) => {
	await notificationService.deleteNotificationByProductId(req.params.id);
	res.send({ message: 'Notifications deleted successfully' });
});

const deleteManyNotification = catchAsync(async (req, res) => {
	await notificationService.deleteManyNotification(req.body);
	res.send({ message: 'Notifications deleted successfully' });
});

module.exports = {
	addNotification,
	getAllNotification,
	updateStatusNotification,
	updateManyStatusNotification,
	deleteNotification,
	deleteNotificationByProductId,
	deleteManyNotification,
};
