const httpStatus = require('http-status');
const { getOffset } = require('../../utils/query.js');
const ApiError = require('../../utils/ApiError.js');
const { encryptData } = require('../../utils/auth.js');
const config = require('../../config/config.js');
const db = require('../../db/models/index.js');
const roleService = require('../role.service.js');
const commonUtils = require('../../utils/commonUtils.js');

async function getUserByEmail(email, scope = 'defaultScope') {
	const user = await db.user.scope(scope).findOne({
		where: { email },
		include: [
			{
				model: db.role,
			},
		],
	});

	return user;
}

async function getUserById(id) {
	const user = await db.user.scope('defaultScope').findOne({
		where: { id },
		include: [
			{
				model: db.role,
				require: true,
				attributes: ['id', 'name'],
			},
		],
	});

	return user;
}

async function createUser(req) {
	const { first_name, last_name, image, email, password, role_id } = req.body;
	const hashedPassword = await encryptData(password);
	const user = await getUserByEmail(email);

	if (user) {
		throw new ApiError(httpStatus.CONFLICT, 'This email already exits');
	}

	const role = await roleService.getRoleById(role_id);

	if (!role) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
	}

	const createdUser = await db.user
		.create({
			first_name,
			last_name,
			image,
			email,
			role_id,
			password: hashedPassword,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdUser;
}

async function getUsers(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const users = await db.user.scope('defaultScope').findAndCountAll({
		order: [
			['first_name', 'ASC'],
			['id', 'DESC'],
			['updated_at', 'DESC'],
		],
		include: [
			{
				model: db.role,
				require: true,
				attributes: ['id', 'name'],
			},
		],
		offset,
		limit,
	});

	return {
		total: users.count,
		records: users.rows,
		// records: users.rows,
		limit: limit,
		page: page,
	};
}

async function deleteUserById(req) {
	const deletedByUserId = commonUtils.getUserId(req);
	const deletedUser = await commonUtils.softDelete(
		db.user,
		req.params.userId,
		deletedByUserId
	);

	if (!deletedUser) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	return deletedUser;
}
async function permanentDeleteUserById(userId) {
	const deletedUser = await db.user.scope('withDeleted').destroy({
		where: { id: userId },
	});

	if (!deletedUser) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	return deletedUser;
}

async function updateUser(req) {
	const { password, email } = req.body;

	if (password) {
		const hashedPassword = await encryptData(password);

		if (!hashedPassword) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				'Internal Server Error'
			);
		}

		req.body.password = hashedPassword;
	}

	if (email) {
		const existedUser = await getUserByEmail(email);

		if (existedUser) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This email is already exist'
			);
		}
	}

	const updatedUser = await db.user
		.update(
			{ ...req.body },
			{
				where: { id: req.params.userId || req.body.id },
				returning: true,
				plain: true,
			}
		)
		.then((data) => data[1]);

	return updatedUser;
}

module.exports = {
	getUserByEmail,
	getUserById,
	createUser,
	updateUser,
	getUsers,
	deleteUserById,
	permanentDeleteUserById,
};
