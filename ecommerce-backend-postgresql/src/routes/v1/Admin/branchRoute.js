const express = require('express');
const validate = require('../../../middlewares/validate');
const { adminBranchController } = require('../../../controllers/Admin');
const { adminBranchValidation } = require('../../../validations/Admin');
const checkPermission = require('../../../middlewares/checkPermission');

const router = express.Router();

router
	.route('/')
	.get(
		// checkPermission('view_branch'),
		validate(adminBranchValidation.getBranches),
		adminBranchController.getBranches
	)
	.post(
		// checkPermission('create_branch'),
		validate(adminBranchValidation.createBranch),
		adminBranchController.createBranch
	);

router
	.route('/:branchId')
	.get(
		// checkPermission('view_branch'),
		validate(adminBranchValidation.getBranch),
		adminBranchController.getBranchById
	)
	.patch(
		// checkPermission('edit_branch'),
		validate(adminBranchValidation.updateBranch),
		adminBranchController.updateBranch
	)
	.delete(
		// checkPermission('delete_branch'),
		validate(adminBranchValidation.deleteBranch),
		adminBranchController.softDeleteBranch
	);
router.route('/permanent/:branch').delete(
	// checkPermission('delete_branch'),
	validate(adminBranchValidation.deleteBranch),
	adminBranchController.permanentDeleteBranch
);

module.exports = router;
