const express = require('express');
const { adminOrderController } = require('../../../controllers/Admin');

const router = express.Router();

router.route('/').get(adminOrderController.getOrders);
router.route('/export').get(adminOrderController.exportOrders);
router.route('/status/:orderId').patch(adminOrderController.updateOrderStatus);
router
	.route('/:orderId/details')
	.patch(adminOrderController.updateOrderDetails);
router
	.route('/:orderId')
	.get(adminOrderController.getOrderById)
	.patch(adminOrderController.updateOrderId);

module.exports = router;
