const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminParentCategoryController } = require('../../../controllers/Admin');
const { adminParentCategoryValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		// checkPermission('view_parentCategory'),
		validate(adminParentCategoryValidation.getParentCategories),
		adminParentCategoryController.getParentCategories
	)
	.post(
		// checkPermission('create_parentCategory'),
		validate(adminParentCategoryValidation.createParentCategory),
		adminParentCategoryController.createParentCategory
	);

router
	.route('/:parentCategoryId')
	.get(
		// checkPermission('view_parentCategory'),
		validate(adminParentCategoryValidation.getParentCategory),
		adminParentCategoryController.getParentCategoryById
	)
	.patch(
		// checkPermission('update_parentCategory'),
		validate(adminParentCategoryValidation.updateParentCategory),
		adminParentCategoryController.updateParentCategory
	)
	.delete(
		// checkPermission('delete_parentCategory'),
		validate(adminParentCategoryValidation.deleteParentCategory),
		adminParentCategoryController.softDeleteParentCategory
	);
router.route('/permanent/:parentCategory').delete(
	// checkPermission('delete_parentCategory'),
	validate(adminParentCategoryValidation.deleteParentCategory),
	adminParentCategoryController.permanentDeleteParentCategory
);

module.exports = router;
