const catchAsync = require('../../utils/catchAsync');
const { apiAuthService, apiAppUserService } = require('../../services/Api');
const { tokenService } = require('../../services');
const {
	setCookie,
	generateExpires,
	verifyToken,
	clearCookie,
} = require('../../utils/auth');
const config = require('../../config/config');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const db = require('../../db/models');
const { Op } = require('sequelize');
const { tokenTypes } = require('../../config/tokens');
const {
	forgotPasswordTemplate,
} = require('../../config/emailTemplates/forgotPassword');
const { sendEmail } = require('../../services/email.service');

const login = catchAsync(async (req, res) => {
	const user = await apiAuthService.loginUserWithEmailAndPassword(req);
	const tokens = await tokenService.generateAuthTokens({
		userId: user.id,
	});
	setCookie(
		res,
		'refreshToken',
		tokens.refresh.token,
		generateExpires(config.jwt.refreshExpirationDays * 24)
	);
	setCookie(
		res,
		'accessToken',
		tokens.access.token,
		generateExpires(config.jwt.accessExpirationMinutes / 60)
	);
	res.send({ user });
});

const forgotPassword = catchAsync(async (req, res) => {
	const { email } = req.body;
	const resetPasswordToken = await tokenService.generateResetPasswordToken(
		email
	);
	const resetUrl = `${config.websiteUrl}/reset-password?token=${resetPasswordToken}`;
	await sendEmail({
		to: email,
		subject: 'Reset your password',
		html: forgotPasswordTemplate({
			customerName: '',
			resetUrl,
			expiresMinutes: config.jwt.resetPasswordExpirationMinutes,
		}),
	});
	res.send({ success: true });
});

const resetPassword = catchAsync(async (req, res) => {
	const { userId } = await verifyToken(
		req.query.token,
		tokenTypes.RESET_PASSWORD
	);
	await apiAppUserService.resetPassword(userId, req.body.password);
	res.send({ success: true });
});

const sendOtp = catchAsync(async (req, res) => {
	await apiAppUserService.sendRegistrationOtp(req);
	res.send({ message: 'Otp sent successfully' });
});

const register = catchAsync(async (req, res) => {
	const user = await apiAppUserService.createAppUser(req);
	const tokens = await tokenService.generateAuthTokens({
		userId: user.id,
	});
	delete user.password;
	setCookie(
		res,
		'refreshToken',
		tokens.refresh.token,
		generateExpires(config.jwt.refreshExpirationDays * 24)
	);
	setCookie(
		res,
		'accessToken',
		tokens.access.token,
		generateExpires(config.jwt.refreshExpirationDays * 24)
	);

	res.status(httpStatus.CREATED).send({ user });
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

	// update cookie
	setCookie(res, 'accessToken', tokens.access.token, tokens.access.expires);

	res.send({ message: 'Access token refreshed' });
});

const changePassword = catchAsync(async (req, res) => {
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}

	// Verify access token
	const payload = await verifyToken(accessToken);
	await apiAuthService.changePassword(req, payload.userId);

	const refreshToken = req.cookies.refreshToken;

	if (refreshToken) {
		const { jti } = await verifyToken(refreshToken);

		// Remove this refresh token from DB (current session)
		await db.token.destroy({
			where: { jti, expires_at: { [Op.gt]: new Date() } },
		});
	}

	// Clear cookies for current user
	clearCookie(res, 'accessToken');
	clearCookie(res, 'refreshToken');

	res.send({
		message: 'password changed and user logged out successfully',
	});
});
const logout = catchAsync(async (req, res) => {
	const refreshToken = req.cookies.refreshToken;

	if (refreshToken) {
		const { jti } = await verifyToken(refreshToken);

		// Remove this refresh token from DB (current session)
		await db.token.destroy({
			where: { jti, expires_at: { [Op.gt]: new Date() } },
		});
	}

	// Clear cookies for current user
	clearCookie(res, 'accessToken');
	clearCookie(res, 'refreshToken');

	res.send({
		message: 'Logged out successfully',
	});
});

const me = catchAsync(async (req, res) => {
	// Get access token from cookie
	const accessToken = req.cookies.accessToken;
	if (!accessToken) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
	}

	// Verify access token
	const payload = await verifyToken(accessToken);

	// Fetch user from DB
	let user;
	if (payload.isCmsUser) {
		user = await db.user.findByPk(payload.userId, {
			attributes: { exclude: ['password'] }, // exclude sensitive info
		});
	} else {
		user = await apiAppUserService.getAppUserById(payload.userId);
	}

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	// 4️⃣ Return user data
	res.send({ user });
});

module.exports = {
	login,
	register,
	refreshAccessToken,
	logout,
	me,
	sendOtp,
	changePassword,
	forgotPassword,
	resetPassword,
};
