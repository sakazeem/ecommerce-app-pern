const express = require('express');
const { adminSubscriberController } = require('../../../controllers/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/export')
	.get(
		checkPermission('view_subscriber'),
		adminSubscriberController.exportSubscribers
	);

router
	.route('/')
	.get(
		checkPermission('view_subscriber'),
		adminSubscriberController.getSubscribers
	);

module.exports = router;
