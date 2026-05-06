const express = require('express');
const { notificationController } = require('../../../controllers/Admin');

const router = express.Router();

router.route('/').get(notificationController.getAllNotification);
router.route('/add').post(notificationController.addNotification);
router.route('/update/many').patch(notificationController.updateManyStatusNotification);
router.route('/delete/many').patch(notificationController.deleteManyNotification);
router.route('/product-id/:id').delete(notificationController.deleteNotificationByProductId);
router
	.route('/:id')
	.put(notificationController.updateStatusNotification)
	.delete(notificationController.deleteNotification);

module.exports = router;
