const catchAsync = require('../../utils/catchAsync');
const { adminProductService } = require('../../services/Admin');
const httpStatus = require('http-status');

const getProductById = catchAsync(async (req, res) => {
	const product = await adminProductService.getProductById(
		req.params.productId
	);
	res.send(product);
});
const getProducts = catchAsync(async (req, res) => {
	const products = await adminProductService.getProducts(req);
	res.send(products);
});
const getProductTitlesOnly = catchAsync(async (req, res) => {
	const products = await adminProductService.getProductTitlesOnly(req);
	res.send(products);
});
const createProduct = catchAsync(async (req, res) => {
	const products = await adminProductService.createProduct(req);
	res.status(httpStatus.CREATED).send(products);
});
const softDeleteProduct = catchAsync(async (req, res) => {
	await adminProductService.softDeleteProductById(req);
	res.send({ success: true });
});
const permanentDeleteProduct = catchAsync(async (req, res) => {
	await adminProductService.permanentDeleteProductById(req.params.productId);
	res.send({ success: true });
});

const updateProduct = catchAsync(async (req, res) => {
	const product = await adminProductService.updateProduct(req);
	res.send(product);
});
const importProductsFromSheet = catchAsync(async (req, res) => {
	const results = await adminProductService.importProductsFromSheet(req);
	res.send(results);
});
const importProductsStockFromSheet = catchAsync(async (req, res) => {
	const results = await adminProductService.importProductsStockFromSheet(req);
	res.send(results);
});
const cleanDescriptionProducts = catchAsync(async (req, res) => {
	const results = await adminProductService.cleanDescriptionProducts(req);
	res.send(results);
});

const exportProducts = catchAsync(async (req, res) => {
	await adminProductService.exportProducts(req, res);
});

module.exports = {
	getProductById,
	getProducts,
	updateProduct,
	createProduct,
	softDeleteProduct,
	permanentDeleteProduct,
	importProductsFromSheet,
	exportProducts,
	getProductTitlesOnly,
	cleanDescriptionProducts,
	importProductsStockFromSheet,
};
