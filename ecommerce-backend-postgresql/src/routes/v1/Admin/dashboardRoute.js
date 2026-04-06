const express = require('express');
const { adminDashboardController } = require('../../../controllers/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		// checkPermission('view_dashboard'),
		adminDashboardController.getDashboardData
	);

module.exports = router;
