const express = require('express');
const { apiAppUserController } = require('../../../controllers/Api');

const router = express.Router();

router.route('/').patch(apiAppUserController.updateAppUser);
router.route('/address').patch(apiAppUserController.addOrUpdateAddress);
router.route('/address/:id').delete(apiAppUserController.deleteAddress);

module.exports = router;
