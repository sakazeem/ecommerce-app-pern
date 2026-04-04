import requests from "./httpService";

const BrandServices = {
	getAllBrand: async (query) => {
		return requests.get(`/brand${query ? `?${query}` : ""}`);
	},

	getAllBrands: async (query) => {
		return requests.get(`/brand${query ? `?${query}` : ""}`);
	},
	getAllBrandsForOptions: async () => {
		return requests.get("/brand/options");
	},

	getBrandById: async (id) => {
		return requests.get(`/brand/${id}`);
	},

	addBrand: async (body) => {
		return requests.post("/brand", body);
	},

	addAllBrand: async (body) => {
		return requests.post("/brand", body);
	},

	updateBrand: async (id, body) => {
		return requests.patch(`/brand/${id}`, body);
	},

	updateStatus: async (id, body) => {
		return requests.patch(`/brand/${id}`, body);
	},

	deleteBrand: async (id, body) => {
		return requests.delete(`/brand/${id}`, body);
	},

	updateManyBrand: async (body) => {
		return requests.patch("/brand/update/many", body);
	},

	deleteManyBrand: async (body) => {
		return requests.patch("/brand/delete/many", body);
	},
};

export default BrandServices;
