const catchAsync = require('../../utils/catchAsync');
const { apiProductService } = require('../../services/Api');
const {
	transformProductsResponse,
	transformProduct,
	transformProductsSuggestionResponse,
} = require('../../transformers/Api/productTransformer');
const { getLang } = require('../../utils/commonUtils');
const { adminProductService } = require('../../services/Admin');

const getProducts = catchAsync(async (req, res) => {
	const products = await apiProductService.getProducts(req);
	res.send(transformProductsResponse(products, getLang(req)));
});
const getProductsForFilterPage = catchAsync(async (req, res) => {
	const products = await apiProductService.getProductsForFilterPage(req);
	res.send(transformProductsResponse(products, getLang(req)));
});
const getProductsSuggestions = catchAsync(async (req, res) => {
	const products = await apiProductService.getProductsSuggestions(req);
	// res.send(products);
	res.send(transformProductsSuggestionResponse(products, getLang(req)));
});
const getProductBySlug = catchAsync(async (req, res) => {
	const products = await apiProductService.getProductBySlug(req);
	res.send(transformProduct(products, getLang(req)));
});

module.exports = {
	getProducts,
	getProductsForFilterPage,
	getProductBySlug,
	getProductsSuggestions,
};
