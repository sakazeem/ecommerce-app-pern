const catchAsync = require('../../utils/catchAsync');
const { adminPermissionService } = require('../../services/Admin');

const getPermissionById = catchAsync(async (req, res) => {
	const permission = await adminPermissionService.getPermissionById(
		req.params.permissionId
	);
	res.send(permission);
});
const getPermissions = catchAsync(async (req, res) => {
	const permissions = await adminPermissionService.getPermissions(req);
	res.send(permissions);
});
const createPermission = catchAsync(async (req, res) => {
	const permissions = await adminPermissionService.createPermission(req);
	res.send(permissions);
});

const softDeletePermission = catchAsync(async (req, res) => {
	await adminPermissionService.softDeletePermissionById(
		req.params.permissionId,
		false
	);
	res.send({ success: true });
});
const permanentDeletePermission = catchAsync(async (req, res) => {
	await adminPermissionService.permanentDeletePermissionById(
		req.params.permissionId,
		false
	);
	res.send({ success: true });
});
const registerPermissions = catchAsync(async (req, res) => {
	await adminPermissionService.registerPermissionsService(req);
	res.send({ success: true });
});
const unregisterPermissions = catchAsync(async (req, res) => {
	await adminPermissionService.unregisterPermissionsService(req);
	res.send({ success: true });
});

const updatePermission = catchAsync(async (req, res) => {
	const permission = await adminPermissionService.updatePermission(req);

	res.send(permission);
});

module.exports = {
	getPermissionById,
	getPermissions,
	createPermission,
	softDeletePermission,
	permanentDeletePermission,
	updatePermission,
	registerPermissions,
	unregisterPermissions,
};
