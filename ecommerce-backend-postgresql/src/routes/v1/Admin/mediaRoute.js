const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminMediaController } = require('../../../controllers/Admin');
const { adminMediaValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');
const upload = require('../../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(
		// checkPermission('view_media'),
		// validate(adminMediaValidation.getMedias),
		adminMediaController.getMedias
	)
	.post(
		// checkPermission('create_media'),
		validate(adminMediaValidation.createMedia),
		upload.single('file'),
		adminMediaController.createMedia
	);
router
	.route('/deleteAllProductsMedia')
	.delete(
		// checkPermission('delete_media'),
		adminMediaController.deleteAllProductsMedia
	);
router
	.route('/bulk-upload')
	.post(
		upload.array('file', 50),
		// checkPermission('create_media'),
		adminMediaController.bulkUploadMedia
	);
router
	.route('/:mediaId')
	.delete(
		// checkPermission('delete_media'),
		validate(adminMediaValidation.deleteMedia),
		adminMediaController.softDeleteMedia
	);

router
	.route('/bulk-soft-delete/:mediaId')
	.delete(
		// checkPermission('delete_media'),
		adminMediaController.softBulkDeleteMediaById
	);

router
	.route('/permanent/:mediaId')
	.delete(
		// checkPermission('delete_media'),
		validate(adminMediaValidation.deleteMedia),
		adminMediaController.permanentDeleteMedia
	);

module.exports = router;
