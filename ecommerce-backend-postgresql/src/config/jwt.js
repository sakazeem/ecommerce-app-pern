const { expressjwt: expressJwt } = require('express-jwt');
const config = require('./config.js');
const db = require('../db/models/index.js');
const { tokenTypes } = require('./tokens.js');

// Better error-safe isRevoked
async function isRevoked(req, token) {
	try {
		const jwtToken = req.headers.authorization?.split(' ')[1];
		// const jwtToken = req.cookies.accessToken || req.cookies.refreshToken;
		if (!jwtToken) return true;

		const isRefreshRoute = req.originalUrl.includes('/refresh');

		if (!isRefreshRoute) {
			// It's an access token route, don't revoke
			return false;
		}

		const savedToken = await db.token.findOne({
			where: {
				token: jwtToken,
				type: tokenTypes.REFRESH,
				revoked: false,
			},
		});

		// Revoke if not found
		return !savedToken;
	} catch (err) {
		console.error('JWT isRevoked Error:', err.message);
		// Revoke on error for safety
		return true;
	}
}

// function jwt() {
// 	const { secret } = config.jwt;

// 	return expressJwt({
// 		secret,
// 		algorithms: ['HS256'],
// 		isRevoked,
// 		getToken: function (req) {
// 			console.log(req.cookies, 'chkking access token');

// 			return (
// 				req.cookies?.accessToken || req.cookies?.refreshToken || null
// 			);
// 		},
// 	}).unless({
// 		path: [/\/v[1-9](\d)*\/(auth|admin\/auth|docs|delete|website)(\/.*)?$/],
// 	});
// }
function jwt() {
	const { secret } = config.jwt;

	return expressJwt({
		secret,
		algorithms: ['HS256'],
		isRevoked,
		getToken: function fromHeaderOrQuerystring(req) {
			return req.headers.authorization?.split(' ')[1] || null;
		},
	}).unless({
		path: [
			/\/v[1-9](\d)*\/(auth|admin\/auth|docs|delete|website)\/.*/, // Public routes
			'/v1/admin/branch', // Exclude branch route
			'/v1/admin/language', // Exclude language route
			'/v1/admin/move-to-r2', // Exclude move-to-r2 route
			'/v1/test/purge-cache', // Exclude purge-cache route
			'/v1/test/health-check', // Exclude health-check route
			/^\/uploads(\/.*)?$/, // ✅ best version
		],
	});
}

module.exports = jwt;
