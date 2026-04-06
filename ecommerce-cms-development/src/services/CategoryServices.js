import requests from "./httpService";

const CategoryServices = {
	getAllCategory: async (query) => {
		return requests.get(`/category${query ? `?${query}` : ""}`);
	},

	getAllCategoriesForCmsOptions: async (excludeId) => {
		return requests.get(
			`/category/cms-options`,
		);
	},
	getAllCategoriesForOptions: async (excludeId) => {
		return requests.get(
			`/category/options${excludeId ? `?excludeId=${excludeId}` : ""}`,
		);
	},
	getAllCategories: async () => {
		return requests.get("/category");
	},

	getCategoryById: async (id) => {
		return requests.get(`/category/${id}`);
	},

	addCategory: async (body) => {
		return requests.post("/category", body);
	},

	addAllCategory: async (body) => {
		return requests.post("/category", body);
	},

	updateCategory: async (id, body) => {
		return requests.patch(`/category/${id}`, body);
	},

	updateStatus: async (id, body) => {
		return requests.patch(`/category/${id}`, body);
	},

	deleteCategory: async (id, body) => {
		return requests.delete(`/category/${id}`, body);
	},

	updateManyCategory: async (body) => {
		return requests.patch("/category/update/many", body);
	},

	deleteManyCategory: async (body) => {
		return requests.patch("/category/delete/many", body);
	},
};

export default CategoryServices;
