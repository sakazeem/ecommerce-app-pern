import requests from "./httpService";

const UspServices = {
	getAllUsp: async () => {
		return requests.get("/usp");
	},

	getAllUsps: async () => {
		return requests.get("/usp");
	},
	getAllUspsForOptions: async () => {
		return requests.get("/usp/options");
	},

	getUspById: async (id) => {
		return requests.get(`/usp/${id}`);
	},

	addUsp: async (body) => {
		return requests.post("/usp", body);
	},

	addAllUsp: async (body) => {
		return requests.post("/usp", body);
	},

	updateUsp: async (id, body) => {
		return requests.patch(`/usp/${id}`, body);
	},

	updateStatus: async (id, body) => {
		return requests.patch(`/usp/${id}`, body);
	},

	deleteUsp: async (id, body) => {
		return requests.delete(`/usp/${id}`, body);
	},

	updateManyUsp: async (body) => {
		return requests.patch("/usp/update/many", body);
	},

	deleteManyUsp: async (body) => {
		return requests.patch("/usp/delete/many", body);
	},
};

export default UspServices;
