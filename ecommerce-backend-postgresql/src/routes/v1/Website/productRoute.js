const express = require('express');
const { apiProductController } = require('../../../controllers/Api');

const router = express.Router();

router.route('/').get(apiProductController.getProducts);
router.route('/filter').get(apiProductController.getProductsForFilterPage);
router
	.route('/category-filter')
	.get(apiProductController.getCategoryFilterProducts);
router.route('/suggestions').get(apiProductController.getProductsSuggestions);
// Fetch a specific list of products by IDs (used by homepage sections with selected_product_ids)
router.route('/by-ids').get(apiProductController.getProductsByIds);
router.route('/:slug').get(apiProductController.getProductBySlug);

module.exports = router;
