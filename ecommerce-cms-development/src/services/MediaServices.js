import requests from "./httpService";

const MediaServices = {
	getAllMedia: async (query) => {
		console.log("query", query);
		return requests.get(`/media?limit=10000${query ? `&${query}` : ""}`);
	},

	addMedia: async (body) => {
		return requests.post("/media", body, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},

	deleteMedia: async (id, body) => {
		return requests.delete(`/media/${id}`, body);
	},
};

export default MediaServices;
