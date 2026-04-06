import requests from "./httpService";

const VendorServices = {
	getAllVendors: async () => {
		return requests.get("/brand");
	},
	getAllVendorsForOptions: async () => {
		return requests.get("/brand/options");
	},

	getVendorById: async (id) => {
		return requests.get(`/brand/${id}`);
	},

	addVendor: async (body) => {
		return requests.post("/brand", body);
	},

	updateVendor: async (id, body) => {
		return requests.patch(`/brand/${id}`, body);
	},

	updateStatus: async (id, body) => {
		return requests.patch(`/brand/${id}`, body);
	},

	deleteVendor: async (id, body) => {
		return requests.delete(`/brand/${id}`, body);
	},

	// addAllVendor: async (body) => {
	// 	return requests.post("/brand", body);
	// },

	// updateManyVendor: async (body) => {
	// 	return requests.patch("/brand/update/many", body);
	// },

	// deleteManyVendor: async (body) => {
	// 	return requests.patch("/brand/delete/many", body);
	// },
};

export default VendorServices;
