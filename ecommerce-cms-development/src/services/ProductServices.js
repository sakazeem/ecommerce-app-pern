import requests, { instance } from "./httpService";

const ProductServices = {
	getAllProducts: async (query) => {
		return requests.get(`/product${query ? `?${query}` : ""}`);
	},
	getAllProductTitles: async () => {
		return requests.get(`/product/only-titles`);
	},

	getProductById: async (id) => {
		return requests.get(`/product/${id}`);
	},

	addProduct: async (body) => {
		return requests.post("/product", body);
	},

	updateProduct: async (id, body) => {
		return requests.patch(`/product/${id}`, body);
	},

	updateStatus: async (id, body) => {
		return requests.patch(`/product/${id}`, body);
	},

	deleteProduct: async (id, body) => {
		return requests.delete(`/product/${id}`, body);
	},

	importProducts: async (body) => {
		return requests.post(`/product/import-products`, body);
	},
	importProductsStock: async (body) => {
		return requests.post(`/product/import-products-stock`, body);
	},
	importProductPrices: async (body) => {
		return requests.post(`/product/import-variant-prices`, body);
	},

	exportProducts: async () => {
		return instance.get(`/product/export-products`, {
			responseType: "blob",
		});
	},

	// addAllProduct: async (body) => {
	// 	return requests.post("/product", body);
	// },

	// updateManyProduct: async (body) => {
	// 	return requests.patch("/product/update/many", body);
	// },

	// deleteManyProduct: async (body) => {
	// 	return requests.patch("/product/delete/many", body);
	// },
};

export default ProductServices;
