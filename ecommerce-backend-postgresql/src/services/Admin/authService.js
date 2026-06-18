const httpStatus = require('http-status');
const userService = require('./userService');
const ApiError = require('../../utils/ApiError');
const { decryptData } = require('../../utils/auth');
const { sendEmail } = require('../../services/email.service');
// const emailVerificationOtpTemplate = require('../../config/emailTemplates/emailVerificationOtp');
const db = require('../../db/models');
const {
	emailVerificationOtpTemplate,
} = require('../../config/emailTemplates/emailVerificationOtp');

async function sendLoginOtp(req) {
	const { email } = req.body;

	// Verify admin exists before sending OTP
	const user = await userService.getUserByEmail(email, ['activeEntity']);
	if (!user) {
		// Return generic message to avoid user enumeration
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'Invalid email or password'
		);
	}

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
	console.log({ otp });

	await db.otp.destroy({ where: { email, type: 'admin_login' } });
	await db.otp.create({
		email,
		otp,
		type: 'admin_login',
		expires_at: expiresAt,
	});

	await sendEmail({
		to: email,
		subject: 'Your CMS Login OTP',
		html: emailVerificationOtpTemplate({
			customerName: user.name || 'Admin',
			otp,
		}),
	});
}

async function loginUserWithEmailAndPassword(req) {
	const { email, password, otp } = req.body;

	const user = await userService.getUserByEmail(email, [
		'withPassword',
		'activeEntity',
	]);

	if (!user) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'Invalid email or password'
		);
	}

	const isPasswordMatch = await decryptData(password, user.password);
	if (!isPasswordMatch) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'Invalid email or password'
		);
	}

	// Verify OTP
	const otpRecord = await db.otp.findOne({
		where: { email, type: 'admin_login' },
	});
	if (!otpRecord) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'OTP not found. Please request a new one.'
		);
	}
	if (otpRecord.expires_at < new Date()) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'OTP expired. Please request a new one.'
		);
	}
	if (otpRecord.otp !== otp) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
	}

	await db.otp.destroy({ where: { email, type: 'admin_login' } });

	delete user.password;
	return user;
}

module.exports = {
	sendLoginOtp,
	loginUserWithEmailAndPassword,
};
