const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminAuthValidation } = require('../../../validations/Admin');
const { adminAuthController } = require('../../../controllers/Admin');

const router = express.Router();

router.post(
	'/send-otp',
	validate(adminAuthValidation.sendOtp),
	adminAuthController.sendOtp
);
router.post(
	'/login',
	validate(adminAuthValidation.login),
	adminAuthController.login
);
router.post('/refresh', adminAuthController.refreshAccessToken);

module.exports = router;
