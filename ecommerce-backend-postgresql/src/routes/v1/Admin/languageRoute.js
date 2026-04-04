const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminLanguageController } = require('../../../controllers/Admin');
const { adminLanguageValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		// checkPermission('view_language'),
		validate(adminLanguageValidation.getLanguages),
		adminLanguageController.getLanguages
	)
	.post(
		// checkPermission('create_language'),
		validate(adminLanguageValidation.createLanguage),
		adminLanguageController.createLanguage
	);

router
	.route('/:languageId')
	.get(
		// checkPermission('view_language'),
		validate(adminLanguageValidation.getLanguage),
		adminLanguageController.getLanguageById
	)
	.patch(
		// checkPermission('edit_language'),
		validate(adminLanguageValidation.updateLanguage),
		adminLanguageController.updateLanguage
	)
	.delete(
		// checkPermission('delete_language'),
		validate(adminLanguageValidation.deleteLanguage),
		adminLanguageController.softDeleteLanguage
	);
router.route('/permanent/:language').delete(
	// checkPermission('delete_language'),
	validate(adminLanguageValidation.deleteLanguage),
	adminLanguageController.permanentDeleteLanguage
);

module.exports = router;
