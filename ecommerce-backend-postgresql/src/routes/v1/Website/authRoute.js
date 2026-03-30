const express = require('express');
const validate = require('../../../middlewares/validate');
const { apiAuthController } = require('../../../controllers/Api');
const { apiAuthValidation } = require('../../../validations/Api');

const router = express.Router();

router.post(
	'/login',
	validate(apiAuthValidation.login),
	apiAuthController.login
);

router.post(
	'/send-otp',
	// validate(apiAuthValidation.sendOtp),
	apiAuthController.sendOtp
);

router.post(
	'/register',
	// validate(apiAuthValidation.register),
	apiAuthController.register
);

router.post(
	'/forgot-password',
	validate(apiAuthValidation.forgotPassword),
	apiAuthController.forgotPassword
);

router.post(
	'/reset-password',
	validate(apiAuthValidation.resetPassword),
	apiAuthController.resetPassword
);

router.patch('/change-password', apiAuthController.changePassword);

router.post(
	'/logout',
	validate(apiAuthValidation.logout),
	apiAuthController.logout
);

router.post(
	'/refresh',
	validate(apiAuthValidation.refresh),
	apiAuthController.refreshAccessToken
);

router.get('/me', apiAuthController.me);

module.exports = router;
