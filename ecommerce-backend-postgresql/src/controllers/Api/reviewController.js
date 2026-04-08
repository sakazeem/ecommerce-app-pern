const catchAsync = require('../../utils/catchAsync');
const { apiReviewService } = require('../../services/Api');
const { verifyToken } = require('../../utils/auth');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');

const getReviewsByUser = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}

	// Verify access token
	const payload = await verifyToken(accessToken);
	const reviews = await apiReviewService.getReviewsByUser(
		req,
		payload.userId
	);

	res.send(reviews);
});

const createReview = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	let payload = {};
	if (accessToken) {
		// Verify access token
		payload = await verifyToken(accessToken);
	}

	await apiReviewService.createReview(req, payload.userId);

	res.send({ success: true });
});

module.exports = {
	getReviewsByUser,
	createReview,
};
