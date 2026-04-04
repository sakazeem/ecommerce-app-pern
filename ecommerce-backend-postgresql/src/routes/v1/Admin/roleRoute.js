const express = require('express');
const { adminRoleController } = require('../../../controllers/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(checkPermission('view_role'), adminRoleController.getRoles)
	.post(checkPermission('create_role'), adminRoleController.createRole);

router
	.route('/:roleId')
	.get(checkPermission('view_role'), adminRoleController.getRoleById)
	.patch(checkPermission('edit_role'), adminRoleController.updateRole)
	.delete(checkPermission('delete_role'), adminRoleController.softDeleteRole);
router
	.route('/permanent/:role')
	.delete(
		checkPermission('delete_role'),
		adminRoleController.permanentDeleteRole
	);

module.exports = router;
