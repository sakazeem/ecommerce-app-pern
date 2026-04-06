const db = require('../../db/models/index.js');
const commonUtils = require('../../utils/commonUtils.js');
const createBaseService = require('../../utils/baseService.js');
const registerPermissions = require('../../utils/registerPermissions.js');
const unregisterPermissions = require('../../utils/unregisterPermissions.js');

const permissionService = createBaseService(db.permission, {
	name: 'Permission',
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
});

// Using userId logic from request
async function createPermission(req) {
	const userId = commonUtils.getUserId(req);
	return permissionService.create(req.body, userId);
}

async function updatePermission(req) {
	const userId = commonUtils.getUserId(req);
	return permissionService.update(req.params.permissionId, req.body, userId);
}

async function softDeletePermissionById(req) {
	const userId = commonUtils.getUserId(req);
	return permissionService.softDelete(req.params.permissionId, userId);
}

async function registerPermissionsService(req) {
	await registerPermissions(
		req.body.moduleName,
		req.body.actions,
		req.body.show
	);
	return true;
}
async function unregisterPermissionsService(req) {
	await unregisterPermissions(req.body.moduleName, req.body.actions);
	return true;
}

module.exports = {
	getPermissionById: permissionService.getById,
	createPermission,
	updatePermission,
	getPermissions: (req) =>
		permissionService.list(req, [], [], [['id', 'ASC']]),
	permanentDeletePermissionById: permissionService.permanentDelete,
	softDeletePermissionById: permissionService.permanentDelete,
	registerPermissionsService,
	unregisterPermissionsService,
};
