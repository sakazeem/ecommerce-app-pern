const express = require('express');
const { adminNotificationController } = require('../../../controllers/Admin');

const router = express.Router();

router.get('/', adminNotificationController.getAllNotifications);
router.post('/add', adminNotificationController.addNotification);
router.patch('/update/many', adminNotificationController.updateManyNotificationStatus);
router.patch('/delete/many', adminNotificationController.deleteManyNotifications);
router.delete('/product-id/:id', adminNotificationController.deleteNotificationByProductId);
router.put('/:id', adminNotificationController.updateNotificationStatus);
router.delete('/:id', adminNotificationController.deleteNotification);

module.exports = router;
