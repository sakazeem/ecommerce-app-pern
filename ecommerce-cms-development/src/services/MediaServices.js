import requests from "./httpService";

const MediaServices = {
	getAllMedia: async ({
		page = 1,
		limit = 20,
		search = "",
		mediaType,
		variantImages,
	}) => {
		let query = `limit=${limit}&page=${page}`;

		if (search) query += `&search=${search}`;
		if (mediaType) query += `&media_type=${mediaType}`;
		if (variantImages) query += `&${variantImages}`;

		const data = await requests.get(`/media?${query}`);
		console.log(data, "chkking data media");
		
		return data;
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
