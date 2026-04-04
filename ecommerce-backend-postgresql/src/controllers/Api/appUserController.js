const catchAsync = require('../../utils/catchAsync');
const { apiAppUserService } = require('../../services/Api');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const { verifyToken } = require('../../utils/auth');

const updateAppUser = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}

	// Verify access token
	const payload = await verifyToken(accessToken);
	req.body.id = payload.userId;
	const appUser = await apiAppUserService.updateAppUser(req);
	res.send(appUser);
});
const addOrUpdateAddress = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}

	// Verify access token
	const payload = await verifyToken(accessToken);
	const address = await apiAppUserService.addOrUpdateAddress(
		req.body,
		payload.userId
	);
	res.send(address);
});

const deleteAddress = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken)
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	const payload = await verifyToken(accessToken);
	await apiAppUserService.deleteAddress(req.params.id, payload.userId);
	res.send({ success: true });
});

const setDefaultAddress = catchAsync(async (req, res) => {
	const userId = req.user.id;
	const result = await apiAppUserService.setDefaultAddress(
		req.params.id,
		userId
	);
	res.send(result);
});


module.exports = {
	updateAppUser,
	addOrUpdateAddress,
	deleteAddress,
	setDefaultAddress
};
