const express = require('express');
const { apiProductController } = require('../../../controllers/Api');

const router = express.Router();

router.route('/').get(apiProductController.getProducts);
router.route('/filter').get(apiProductController.getProductsForFilterPage);
router.route('/suggestions').get(apiProductController.getProductsSuggestions);
router.route('/:slug').get(apiProductController.getProductBySlug);

module.exports = router;
