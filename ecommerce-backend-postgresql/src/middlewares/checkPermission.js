const httpStatus = require('http-status');
const db = require('../db/models');
const ApiError = require('../utils/ApiError');

module.exports = function checkPermission(permissionName) {
	return async function (req, res, next) {
		try {
			// return next(); // uncomment this to start working
			const userId = req.user?.id;

			if (!userId) {
				throw new ApiError(
					httpStatus.FORBIDDEN,
					'Unauthorized: User not found'
				);
			}

			const user = await db.user.findByPk(userId, {
				include: [
					{
						model: db.role,
						include: [
							{
								model: db.permission,
								attributes: ['name'],
								through: { attributes: [] },
							},
						],
					},
				],
			});

			if (!user || !user.role) {
				throw new ApiError(
					httpStatus.FORBIDDEN,
					'Forbidden: No role assigned'
				);
			}

			// Normalize roles (array or single)
			const roles = Array.isArray(user.role) ? user.role : [user.role];

			// Extract permissions
			const userPermissions = roles.flatMap(
				(role) => role.permissions?.map((p) => p.name) || []
			);

			// Check permission
			if (!userPermissions.includes(permissionName)) {
				throw new ApiError(
					httpStatus.FORBIDDEN,
					`Forbidden: You are not authorized to perform this action. Missing permission: ${permissionName}`
				);
				// throw new ApiError(
				// 	httpStatus.FORBIDDEN,
				// 	`Forbidden: Missing ${permissionName} permission`
				// );
			}

			return next();
		} catch (error) {
			console.error('Permission check failed:', error);
			if (error instanceof ApiError) {
				return next(error);
			}

			return next(
				new ApiError(
					httpStatus.INTERNAL_SERVER_ERROR,
					'Internal Server Error'
				)
			);
		}
	};
};
