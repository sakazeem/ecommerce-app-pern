const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminBrandController } = require('../../../controllers/Admin');
const { adminBrandValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		checkPermission('view_filter'),
		// validate(adminBrandValidation.getBrands),
		adminBrandController.getBrands
	)
	.post(
		checkPermission('create_filter'),
		// validate(adminBrandValidation.createBrand),
		adminBrandController.createBrand
	);

router.route('/options').get(
	// validate(adminBrandValidation.getBrands),
	adminBrandController.getBrands
);

router
	.route('/:brandId')
	.get(
		checkPermission('view_filter'),
		validate(adminBrandValidation.getBrand),
		adminBrandController.getBrandById
	)
	.patch(
		checkPermission('edit_filter'),
		// validate(adminBrandValidation.updateBrand),
		adminBrandController.updateBrand
	)
	.delete(
		checkPermission('delete_filter'),
		validate(adminBrandValidation.deleteBrand),
		adminBrandController.softDeleteBrand
	);
router
	.route('/permanent/:brand')
	.delete(
		checkPermission('delete_filter'),
		validate(adminBrandValidation.deleteBrand),
		adminBrandController.permanentDeleteBrand
	);

module.exports = router;
