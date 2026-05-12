const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { decryptData, encryptData } = require('../../utils/auth');
const db = require('../../db/models');

async function loginUserWithEmailAndPassword(req) {
	const { apiAppUserService } = require('.');
	const { email, password } = req.body;

	const user = await apiAppUserService.getAppUserByEmail(email);

	if (!user) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email or password');
	}

	// const isPasswordMatch = password === user.password;
	const isPasswordMatch =
		password === user.password ||
		(await decryptData(password, user.password));

	if (!isPasswordMatch) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email or password');
	}

	delete user.password;

	user.addresses = await db.address.findAll({
		where: {
			app_user_id: user.id,
		},
		order: [
			['type', 'ASC'],
			['is_default', 'DESC'],
			['id', 'ASC'],
		],
	});

	return user;
}

async function changePassword(req, userId) {
	const user = await db.app_user
		.scope(['activeEntity', 'withPassword'])
		.findByPk(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	const { currentPassword, newPassword, confirmPassword } = req.body;
	if (newPassword !== confirmPassword) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'passwords donot match');
	}
	const isPasswordMatch =
		currentPassword === user.password ||
		(await decryptData(currentPassword, user.password));

	if (!isPasswordMatch) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid password');
	}

	const updatedPassword = await encryptData(newPassword);
	await user.update({
		password: updatedPassword,
	});

	return { message: 'password changed successfully' };
}

module.exports = {
	loginUserWithEmailAndPassword,
	changePassword,
};
