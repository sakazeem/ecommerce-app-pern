const catchAsync = require('../../utils/catchAsync');
const { adminUspService, adminOrderService } = require('../../services/Admin');

const getOrderById = catchAsync(async (req, res) => {
	const order = await adminOrderService.getOrderById(req);
	res.send(order);
});
const getOrders = catchAsync(async (req, res) => {
	const orders = await adminOrderService.getAllOrders(req);
	res.send(orders);
});

const updateOrderStatus = catchAsync(async (req, res) => {
	const order = await adminOrderService.updateOrderStatus(req);
	res.send(order);
});
const updateOrderId = catchAsync(async (req, res) => {
	const order = await adminOrderService.updateOrderId(req);
	res.send(order);
});

const exportOrders = catchAsync(async (req, res) => {
	await adminOrderService.exportOrders(req, res);
});

const updateOrderDetails = catchAsync(async (req, res) => {
	const result = await adminOrderService.updateOrderDetails(req);
	res.send(result);
});
const updateOrderStatusAutomaticallyByCCLTracking = catchAsync(
	async (req, res) => {
		adminOrderService.updateOrderStatusAutomaticallyByCCLTracking(req);
		res.send('updating order statuses');
	}
);
const sendReviewsEmailtoDeliveredOrder = catchAsync(async (req, res) => {
	adminOrderService.sendReviewsEmailtoDeliveredOrder(req);
	res.send('sending reviews emails');
});

module.exports = {
	getOrderById,
	getOrders,
	updateOrderStatus,
	updateOrderId,
	updateOrderDetails,
	exportOrders,
	updateOrderStatusAutomaticallyByCCLTracking,
	sendReviewsEmailtoDeliveredOrder,
};
