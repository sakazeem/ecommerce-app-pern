const db = require('../../db/models/index.js');
const commonUtils = require('../../utils/commonUtils.js');
const createBaseService = require('../../utils/baseService.js');

const roleService = createBaseService(db.role, {
	name: 'Role',
	checkDuplicateSlug: true,
	formatCreateData: (data) => ({
		name: data.name,
		description: data.description,
	}),
	formatUpdateData: (data) => {
		const toUpdate = {};
		if (data.name) toUpdate.name = data.name;
		if (data.description) toUpdate.description = data.description;
		return toUpdate;
	},
	useSoftDelete: false,
	includes: [
		{
			model: db.permission,
			required: false,
			attributes: ['id'],
		},
	],
});

// Using userId logic from request
async function createRole(req) {
	const userId = commonUtils.getUserId(req);
	return roleService.create(req.body, userId);
}

async function updateRole(req) {
	const userId = commonUtils.getUserId(req);
	return roleService.update(req.params.roleId, req.body, userId);
}

async function softDeleteRoleById(req) {
	const userId = commonUtils.getUserId(req);
	return roleService.softDelete(req.params.roleId, userId);
}

module.exports = {
	getRoleById: roleService.getById,
	createRole,
	updateRole,
	getRoles: (req) => roleService.list(req, [], [], [['id', 'ASC']]),
	permanentDeleteRoleById: roleService.permanentDelete,
	softDeleteRoleById: roleService.permanentDelete,
};
