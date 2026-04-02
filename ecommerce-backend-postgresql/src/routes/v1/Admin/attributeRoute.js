const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminAttributeController } = require('../../../controllers/Admin');
const { adminAttributeValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		checkPermission('view_filter'),
		// validate(adminAttributeValidation.getAttributes),
		adminAttributeController.getAttributes
	)
	.post(
		checkPermission('create_filter'),
		validate(adminAttributeValidation.createAttribute),
		adminAttributeController.createAttribute
	);
router.route('/filters').get(adminAttributeController.getFilterAttributes);

router
	.route('/:attributeId')
	.get(
		checkPermission('view_filter'),
		validate(adminAttributeValidation.getAttribute),
		adminAttributeController.getAttributeById
	)
	.patch(
		checkPermission('update_filter'),
		validate(adminAttributeValidation.updateAttribute),
		adminAttributeController.updateAttribute
	)
	.delete(
		checkPermission('delete_filter'),
		validate(adminAttributeValidation.deleteAttribute),
		adminAttributeController.softDeleteAttribute
	);

router
	.route('/permanent/:attributeId')
	.delete(
		checkPermission('delete_filter'),
		validate(adminAttributeValidation.deleteAttribute),
		adminAttributeController.permanentDeleteAttribute
	);

router.route('/import').post(adminAttributeController.importAttributes);

module.exports = router;
