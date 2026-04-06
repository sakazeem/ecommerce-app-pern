const express = require('express');
const { adminPermissionController } = require('../../../controllers/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		// checkPermission('view_permission'),
		adminPermissionController.getPermissions
	)
	.post(
		// checkPermission('create_permission'),
		adminPermissionController.createPermission
	);

router
	.route('/:permissionId')
	.get(
		// checkPermission('view_permission'),
		adminPermissionController.getPermissionById
	)
	.patch(
		// checkPermission('edit_permission'),
		adminPermissionController.updatePermission
	)
	.delete(
		// checkPermission('delete_permission'),
		adminPermissionController.softDeletePermission
	);
router.route('/permanent/:permission').delete(
	// checkPermission('delete_permission'),
	adminPermissionController.permanentDeletePermission
);
router.route('/register').post(
	// checkPermission('create_permission'),
	adminPermissionController.registerPermissions
);
router.route('/delete/unregister').patch(
	// checkPermission('create_permission'),
	adminPermissionController.unregisterPermissions
);

module.exports = router;
