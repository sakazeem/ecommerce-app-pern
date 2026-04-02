const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminVendorController } = require('../../../controllers/Admin');
const { adminVendorValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		// checkPermission('view_vendor'),
		validate(adminVendorValidation.getVendors),
		adminVendorController.getVendors
	)
	.post(
		// checkPermission('create_vendor'),
		validate(adminVendorValidation.createVendor),
		adminVendorController.createVendor
	);

router
	.route('/:vendorId')
	.get(
		// checkPermission('view_vendor'),
		validate(adminVendorValidation.getVendor),
		adminVendorController.getVendorById
	)
	.patch(
		// checkPermission('update_vendor'),
		validate(adminVendorValidation.updateVendor),
		adminVendorController.updateVendor
	)
	.delete(
		// checkPermission('delete_vendor'),
		validate(adminVendorValidation.deleteVendor),
		adminVendorController.softDeleteVendor
	);
router
	.route('/permanent/:vendor')
	.delete(
		// checkPermission('delete_vendor'),
		validate(adminVendorValidation.deleteVendor),
		adminVendorController.permanentDeleteVendor
	);

router.route('/import').post(adminVendorController.importVendors);

module.exports = router;
