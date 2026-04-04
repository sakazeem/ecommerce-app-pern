import requests from "./httpService";

const AttributeServices = {
	getAllAttribute: async () => {
		return requests.get("/attribute");
	},

	getAllAttributes: async () => {
		return requests.get("/attribute");
	},
	getAllAttributesForOptions: async () => {
		return requests.get("/attribute/options");
	},
	getActiveAttributes: async () => {
		return requests.get("/attribute?status=true");
	},
	getActiveAttributesForOptions: async () => {
		return requests.get("/attribute/options?status=true");
	},
	getFilterAttributes: async () => {
		return requests.get("/attribute/filters");
	},

	getAttributeById: async (id) => {
		return requests.get(`/attribute/${id}`);
	},

	addAttribute: async (body) => {
		return requests.post("/attribute", body);
	},

	addAllAttribute: async (body) => {
		return requests.post("/attribute", body);
	},

	updateAttribute: async (id, body) => {
		return requests.patch(`/attribute/${id}`, body);
	},

	updateStatus: async (id, body) => {
		return requests.patch(`/attribute/${id}`, body);
	},

	deleteAttribute: async (id, body) => {
		return requests.delete(`/attribute/${id}`, body);
	},

	updateManyAttribute: async (body) => {
		return requests.patch("/attribute/update/many", body);
	},

	deleteManyAttribute: async (body) => {
		return requests.patch("/attribute/delete/many", body);
	},
};

export default AttributeServices;
