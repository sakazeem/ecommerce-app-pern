const catchAsync = require('../../utils/catchAsync');
const { tokenService } = require('../../services');
const { adminAuthService } = require('../../services/Admin');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { verifyToken } = require('../../utils/auth');
const { tokenTypes } = require('../../config/tokens');

const sendOtp = catchAsync(async (req, res) => {
	await adminAuthService.sendLoginOtp(req);
	res.send({ message: 'OTP sent to your email' });
});

const login = catchAsync(async (req, res) => {
	const user = await adminAuthService.loginUserWithEmailAndPassword(req);
	const tokens = await tokenService.generateAuthTokens(
		{ userId: user.id, roleId: user.role_id },
		true
	);
	res.send({ user, tokens });
});

const refreshAccessToken = catchAsync(async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken)
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Session Expired');

	const { userId, roleId, isCmsUser } = await verifyToken(
		refreshToken,
		tokenTypes.REFRESH
	);

	const tokens = await tokenService.generateAccessTokens(
		{ userId, roleId },
		isCmsUser
	);

	res.send({
		refresh: {
			token: refreshToken,
			expires: tokens.refresh.expires || tokens.access.expires,
		},
		access: tokens,
	});
});

module.exports = {
	sendOtp,
	login,
	refreshAccessToken,
};
