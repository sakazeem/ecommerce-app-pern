const express = require('express');
const validate = require('../../../middlewares/validate');
const {
	adminHomepageSectionsController,
} = require('../../../controllers/Admin');
const {
	adminHomepageSectionsValidation,
} = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		checkPermission('view_homepage'),
		adminHomepageSectionsController.getHomepage
	)
	.post(
		checkPermission('create_homepage'),
		// validate(adminHomepageSectionsValidation.createSection),
		adminHomepageSectionsController.createHomepageSection
	);
router.route('/reorder').patch(
	checkPermission('edit_homepage'),
	// validate(adminHomepageSectionsValidation.reorderSections),
	adminHomepageSectionsController.reorderHomepageSections
);

router
	.route('/:sectionId')
	.patch(
		checkPermission('edit_homepage'),
		// validate(adminHomepageSectionsValidation.updateSection),
		adminHomepageSectionsController.updateHomepageSection
	)
	.delete(
		checkPermission('delete_homepage'),
		adminHomepageSectionsController.deleteHomepageSection
	);

module.exports = router;
