const express = require('express');
const {
	adminSubscriberController,
	adminAppUserController,
} = require('../../../controllers/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router.route('/').get(
	// checkPermission('view_app_user'),
	adminAppUserController.getAppUsers
);
router.route('/:id').patch(
	// checkPermission('update_app_user'),
	adminAppUserController.updateAppUser
);

module.exports = router;
