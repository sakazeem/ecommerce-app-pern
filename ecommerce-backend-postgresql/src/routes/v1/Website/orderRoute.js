const express = require('express');
const { apiOrderController } = require('../../../controllers/Api');
const upload = require('../../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/confirm-order')
	.post(upload.single('receipt'), apiOrderController.confirmOrder);
router.route('/track/:trackingId').get(apiOrderController.trackOrder);
router.route('/my-orders').get(apiOrderController.myOrders);
router.route('/:trackingId').get(apiOrderController.getOrderByTrackingId);

module.exports = router;
