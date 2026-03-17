const catchAsync = require('../../utils/catchAsync');
const { verifyToken } = require('../../utils/auth');
const { cartService } = require('../../services/Api');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');

const getCart = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	const { userId } = await verifyToken(accessToken);
	const cart = await cartService.getCart(userId);
	res.send({ cart });
});

const addToCart = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	const { userId } = await verifyToken(accessToken);
	const item = await cartService.addToCart(userId, req.body);
	res.send({ item });
});

const updateCartItem = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	const { userId } = await verifyToken(accessToken);
	const item = await cartService.updateCartItem(
		userId,
		req.params.id,
		req.body.quantity
	);
	res.send({ item });
});

const removeFromCart = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	const { userId } = await verifyToken(accessToken);
	await cartService.removeFromCart(userId, req.params.id);
	res.send({ success: true });
});

const clearCart = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	const { userId } = await verifyToken(accessToken);
	await cartService.clearCart(userId);
	res.send({ success: true });
});

const syncCart = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}
	const { userId } = await verifyToken(accessToken);
	const cart = await cartService.syncCart(userId, req.body.items);
	res.send({ cart });
});

module.exports = {
	getCart,
	addToCart,
	updateCartItem,
	removeFromCart,
	clearCart,
	syncCart,
};
