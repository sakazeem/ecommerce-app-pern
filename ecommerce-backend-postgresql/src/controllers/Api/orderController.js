const catchAsync = require('../../utils/catchAsync');
const { apiOrderService } = require('../../services/Api');
const { verifyToken } = require('../../utils/auth');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const {
	transformOrdersResponse,
	transformOrderResponse,
} = require('../../transformers/Api/orderTransformer');

const confirmOrder = catchAsync(async (req, res) => {
	if (req.body.order) {
		const parsed = JSON.parse(req.body.order);
		req.body = parsed;
	}

	const accessToken = req.cookies.accessToken;
	if (accessToken) {
		const payload = await verifyToken(accessToken);
		req.body.userId = payload.userId || null;
	}

	const order = await apiOrderService.confirmOrder(req);
	res.send({
		order,
		message: 'Order confirmed successfully',
	});
});

const trackOrder = catchAsync(async (req, res) => {
	const order = await apiOrderService.trackOrderByTrackingId(req);
	res.send({ order });
});

const myOrders = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}

	const payload = await verifyToken(accessToken);
	const order = await apiOrderService.myOrders(req, payload.userId);

	res.send(transformOrdersResponse(order));
});

const getOrderByTrackingId = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}

	const payload = await verifyToken(accessToken);
	const order = await apiOrderService.getOrderByTrackingId(
		req,
		payload.userId
	);

	res.send(transformOrderResponse(order));
});

module.exports = {
	confirmOrder,
	trackOrder,
	myOrders,
	getOrderByTrackingId,
};
