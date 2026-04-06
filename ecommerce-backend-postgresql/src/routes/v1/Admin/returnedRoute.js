const express = require('express');
const { adminReturnedController } = require('../../../controllers/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		checkPermission('view_order'),
		adminReturnedController.getReturnRequests
	);

router
	.route('/:id')
	.get(
		checkPermission('view_order'),
		adminReturnedController.getReturnRequestById
	);

router
	.route('/:id/refund')
	.patch(
		checkPermission('process_order'),
		adminReturnedController.processRefund
	);
router
	.route('/:id/received')
	.patch(
		checkPermission('process_order'),
		adminReturnedController.markReturnReceived
	);
router
	.route('/:id/reject')
	.patch(
		checkPermission('process_order'),
		adminReturnedController.rejectReturn
	);
router
	.route('/:id/approve')
	.patch(
		checkPermission('process_order'),
		adminReturnedController.approveReturn
	);

module.exports = router;
