const express = require('express');
const { apiReturnedController } = require('../../../controllers/Api');
const { upload } = require('../../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/:orderId/return-eligible-items')
	.get(apiReturnedController.getReturnEligibleItems);

router
	.route('/')
	.get(apiReturnedController.getReturnRequestByUserId)
	.post(
		upload.fields([
			{ name: 'video', maxCount: 1 },
			{ name: 'images', maxCount: 5 },
		]),
		apiReturnedController.createReturnRequest
	);

router
	.route('/:returnId')
	.get(apiReturnedController.getReturnRequestById)
	.delete(apiReturnedController.cancelReturn);

module.exports = router;
