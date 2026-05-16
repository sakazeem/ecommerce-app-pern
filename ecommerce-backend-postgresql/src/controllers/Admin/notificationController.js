const catchAsync = require('../../utils/catchAsync');
const { adminNotificationService } = require('../../services/Admin');

const getAllNotifications = catchAsync(async (req, res) => {
	const data = await adminNotificationService.getAllNotifications(req);
	res.send(data);
});

const addNotification = catchAsync(async (req, res) => {
	const data = await adminNotificationService.addNotification(req);
	res.send(data);
});

const updateNotificationStatus = catchAsync(async (req, res) => {
	const data = await adminNotificationService.updateNotificationStatus(req);
	res.send(data);
});

const updateManyNotificationStatus = catchAsync(async (req, res) => {
	const data = await adminNotificationService.updateManyNotificationStatus(req);
	res.send(data);
});

const deleteNotification = catchAsync(async (req, res) => {
	const data = await adminNotificationService.deleteNotification(req);
	res.send(data);
});

const deleteNotificationByProductId = catchAsync(async (req, res) => {
	const data = await adminNotificationService.deleteNotificationByProductId(req);
	res.send(data);
});

const deleteManyNotifications = catchAsync(async (req, res) => {
	const data = await adminNotificationService.deleteManyNotifications(req);
	res.send(data);
});

module.exports = {
	getAllNotifications,
	addNotification,
	updateNotificationStatus,
	updateManyNotificationStatus,
	deleteNotification,
	deleteNotificationByProductId,
	deleteManyNotifications,
};
