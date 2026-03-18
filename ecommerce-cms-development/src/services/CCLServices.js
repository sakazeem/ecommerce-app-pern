import requests from "./httpService";

const UspServices = {
	getCities: async () => {
		return requests.get("/usp");
	},

	
};

export default UspServices;
