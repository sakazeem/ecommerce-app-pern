const httpStatus = require('http-status');
const db = require('../../db/models/index.js');
const ApiError = require('../../utils/ApiError.js');
const createAppBaseService = require('../../utils/appBaseService.js');
const {
	emailVerificationOtpTemplate,
} = require('../../config/emailTemplates/emailVerificationOtp.js');
const { sendEmail } = require('../email.service.js');
const { Op } = require('sequelize');
const { encryptData } = require('../../utils/auth.js');
const { tokenTypes } = require('../../config/tokens');

const validations = async (data) => {
	if (data.email) {
		const exist = await db.app_user.scope(['onlyId']).findOne({
			where: {
				email: data.email,
				...(data.id ? { id: { [Op.ne]: data.id } } : {}),
			},
		});
		if (exist)
			throw new ApiError(httpStatus.BAD_REQUEST, `Email already exists`);
	}
};

const appUserService = createAppBaseService(db.app_user, {
	name: 'User',
	formatCreateData: (data) => ({
		name: data.name,
		email: data.email,
		password: data.password,
		phone: data.phone,
		user_type: data.user_type,
	}),
	formatUpdateData: (data) => {
		const toUpdate = {};
		if (data.name) toUpdate.name = data.name;
		if (data.email) toUpdate.email = data.email;
		if (data.password) toUpdate.password = data.password;
		if (data.phone) toUpdate.phone = data.phone;
		if (data.image) toUpdate.image = data.image;
		if (data.user_type) toUpdate.user_type = data.user_type;
		if (data.status !== undefined) toUpdate.status = data.status;
		return toUpdate;
	},
	validations,
});

async function sendRegistrationOtp(req) {
	const { email, name } = req.body;
	if (!email) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required!');
	}
	const existingUser = await db.app_user.findOne({ where: { email } });
	if (existingUser) {
		throw new ApiError(httpStatus.CONFLICT, 'Email already registered');
	}

	// Generate 6-digit OTP
	const otp = Math.floor(100000 + Math.random() * 900000).toString();

	// Set expiry 30 minutes from now
	const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
	// Save OTP in DB (upsert if email already exists)

	await db.otp.destroy({ where: { email } });

	await db.otp.create({
		email,
		otp,
		type: 'appuser_registration',
		expires_at: expiresAt,
	});

	await sendEmail({
		to: email,
		subject: `Verify Your Email with One-Time 6-Digit PIN`,
		html: emailVerificationOtpTemplate({
			customerName: name,
			otp,
		}),
	});
}

async function verifyOtp(req) {
	const { email, otp } = req.body;
	const record = await db.otp.findOne({ where: { email } });
	if (!record) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'OTP not found. Please request again.'
		);
	}

	if (record.expires_at < new Date()) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'OTP expired. Please request again.'
		);
	}

	if (record.otp !== otp) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
	}

	await db.otp.destroy({ where: { email } });
}

async function createAppUser(req) {
	await verifyOtp(req);
	req.body.password = await encryptData(req.body.password);
	return await appUserService.create(req.body);
}

async function addOrUpdateAddress(data, userId) {
	const { id, address, apartment, city, country, postal_code, type, title } =
		data;

	if (!type) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Address type is required');
	}

	if (id) {
		const existing = await db.address.findOne({
			where: { id, app_user_id: userId },
		});
		if (!existing)
			throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
		await existing.update({
			address,
			apartment,
			city,
			country,
			postal_code,
			type,
			title,
		});
		return existing;
	}

	return await db.address.create({
		address,
		apartment,
		city,
		country,
		postal_code,
		type,
		title: title || null,
		app_user_id: userId,
	});
}

async function resetPassword(userId, newPassword) {
	const hashedPassword = await encryptData(newPassword);
	await appUserService.update(userId, { password: hashedPassword });
	await db.token.destroy({
		where: { app_user_id: userId, type: tokenTypes.RESET_PASSWORD },
	});
}

async function deleteAddress(addressId, userId) {
	const deleted = await db.address.destroy({
		where: { id: addressId, app_user_id: userId },
	});
	if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
	return { success: true };
}

module.exports = {
	getAppUserById: (id) => appUserService.getById(id),
	getAppUserByEmail: (email) =>
		appUserService.getByAttribute(
			'email',
			email,
			['activeEntity', 'withPassword'],
			false
		),
	createAppUser,
	updateAppUser: (req) => appUserService.update(req.body.id, req.body),
	sendRegistrationOtp,
	resetPassword,
	addOrUpdateAddress,
	deleteAddress,
};
