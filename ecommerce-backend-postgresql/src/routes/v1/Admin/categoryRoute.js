const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminCategoryController } = require('../../../controllers/Admin');
const { adminCategoryValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		checkPermission('view_filter'),
		// validate(adminCategoryValidation.getCategories),
		adminCategoryController.getCategories
	)
	.post(
		checkPermission('create_filter'),
		validate(adminCategoryValidation.createCategory),
		adminCategoryController.createCategory
	);
router.route('/cms-options').get(
	// validate(adminCategoryValidation.getCategories),
	adminCategoryController.getCategories
);
router.route('/similar').get(adminCategoryController.findSimilarCategories);
router.route('/fix-slugs').patch(adminCategoryController.fixSlugsCategories);
router
	.route('/restore-soft-delete')
	.patch(adminCategoryController.restoreSoftDeleteCategories);

router
	.route('/options')
	.get(
		validate(adminCategoryValidation.getCategoriesOptions),
		adminCategoryController.getCategoriesForOptions
	);

router
	.route('/:categoryId')
	.get(
		checkPermission('view_filter'),
		validate(adminCategoryValidation.getCategory),
		adminCategoryController.getCategoryById
	)
	.patch(
		checkPermission('edit_filter'),
		validate(adminCategoryValidation.updateCategory),
		adminCategoryController.updateCategory
	)
	.delete(
		checkPermission('delete_filter'),
		validate(adminCategoryValidation.deleteCategory),
		adminCategoryController.softDeleteCategory
	);
router
	.route('/permanent/:categoryId')
	.delete(
		checkPermission('delete_filter'),
		validate(adminCategoryValidation.deleteCategory),
		adminCategoryController.permanentDeleteCategory
	);

// routes only for import
router.route('/import').post(adminCategoryController.importCategories);

module.exports = router;
