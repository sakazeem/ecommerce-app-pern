const express = require('express');
const { adminUserController } = require('../../../controllers/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(checkPermission('view_user'), adminUserController.getUsers)
	.post(checkPermission('create_user'), adminUserController.createUser);

router
	.route('/:userId')
	.get(checkPermission('view_user'), adminUserController.getUser)
	.patch(checkPermission('edit_user'), adminUserController.updateUser)
	.delete(checkPermission('delete_user'), adminUserController.deleteUser);
router
	.route('/permanent/:user')
	.delete(
		checkPermission('delete_user'),
		adminUserController.permanentDeleteUser
	);

module.exports = router;
