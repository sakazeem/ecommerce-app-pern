const catchAsync = require('../../utils/catchAsync');
const { adminSubscriberService } = require('../../services/Admin');

const getSubscribers = catchAsync(async (req, res) => {
	const subscribers = await adminSubscriberService.getSubscribers(req);
	res.send(subscribers);
});

const exportSubscribers = catchAsync(async (req, res) => {
	await adminSubscriberService.exportSubscribers(req, res);
});

module.exports = {
	getSubscribers,
	exportSubscribers,
};
