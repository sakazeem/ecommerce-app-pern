const jwt = require('jsonwebtoken');
const bycrypt = require('bcrypt');
const config = require('../config/config');
const db = require('../db/models');
const { tokenTypes } = require('../config/tokens');
const ApiError = require('./ApiError');
const httpStatus = require('http-status');
const { Op } = require('sequelize');

function generateToken(data, expiresMs, secret = config.jwt.secret) {
	if (!data?.userId) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'User Id is required to generate token'
		);
	}

	const token = jwt.sign(
		{ exp: Math.floor(expiresMs / 1000), ...data },
		secret
	);
	return token;
}

async function verifyToken(token, type = tokenTypes.ACCESS) {
	try {
		const payload = jwt.verify(token, config.jwt.secret);
		if (type === tokenTypes.REFRESH || type === tokenTypes.RESET_PASSWORD) {
			const tokenInDb = await db.token.findOne({
				where: {
					jti: payload.jti,
					type,
					expires_at: { [Op.gt]: new Date() },
					revoked: false,
				},
			});

			if (!tokenInDb)
				throw new ApiError(httpStatus.UNAUTHORIZED, 'Session Expired');
		}

		return payload;
	} catch (err) {
		throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid token: ${err}`);
	}
}

async function encryptData(string) {
	const salt = await bycrypt.genSalt(10);
	const hashedString = await bycrypt.hash(string, salt);
	return hashedString;
}

async function decryptData(string, hashedString) {
	const isValid = await bycrypt.compare(string, hashedString);
	return isValid;
}

function setCookie(res, cookieName, cookieValue, expiresMs) {
	res.cookie(cookieName, cookieValue, {
		// httpOnly: true,
		// secure: config.env === 'production',
		// sameSite: 'strict',
		secure: false,
		sameSite: 'lax',
		expires: new Date(expiresMs),
	});
}
function clearCookie(res, cookieName) {
	res.clearCookie(cookieName, {
		// httpOnly: true,
		// secure: config.env === 'production',
		// sameSite: 'strict',
		sameSite: 'lax',
	});
}

function generateExpires(hours) {
	const ms = Math.floor(Date.now() + hours * 60 * 60 * 1000);
	return ms;
}

module.exports = {
	generateToken,
	generateExpires,
	verifyToken,
	encryptData,
	decryptData,
	setCookie,
	clearCookie,
};
