const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminSizeChartController } = require('../../../controllers/Admin');
const { adminSizeChartValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		// checkPermission('view_sizeChart'),
		validate(adminSizeChartValidation.getSizeCharts),
		adminSizeChartController.getSizeCharts
	)
	.post(
		// checkPermission('create_sizeChart'),
		validate(adminSizeChartValidation.createSizeChart),
		adminSizeChartController.createSizeChart
	);

router
	.route('/:sizeChartId')
	.get(
		// checkPermission('view_sizeChart'),
		validate(adminSizeChartValidation.getSizeChart),
		adminSizeChartController.getSizeChartById
	)
	.patch(
		// checkPermission('edit_sizeChart'),
		validate(adminSizeChartValidation.updateSizeChart),
		adminSizeChartController.updateSizeChart
	)
	.delete(
		// checkPermission('delete_sizeChart'),
		validate(adminSizeChartValidation.deleteSizeChart),
		adminSizeChartController.softDeleteSizeChart
	);
router.route('/permanent/:sizeChart').delete(
	// checkPermission('delete_sizeChart'),
	validate(adminSizeChartValidation.deleteSizeChart),
	adminSizeChartController.permanentDeleteSizeChart
);

module.exports = router;
