import requests from "./httpService";

const RoleServices = {
	getAllRoles: async () => {
		return requests.get("/role");
	},

	getRoleById: async (id) => {
		return requests.get(`/role/${id}`);
	},

	addRole: async (body) => {
		return requests.post("/role", body);
	},

	updateRole: async (id, body) => {
		return requests.patch(`/role/${id}`, body);
	},

	updateStatus: async (id, body) => {
		return requests.patch(`/role/${id}`, body);
	},

	deleteRole: async (id, body) => {
		return requests.delete(`/role/${id}`, body);
	},

	getAllPermissions: async () => {
		return requests.get("/permissions");
	},
};

export default RoleServices;
