import requests from "./httpService";

const AppuserServices = {
  getAllAppuser: async (query) => {
    return requests.get(`/appuser${query ? `?${query}` : ""}`);
  },

  updateAppuser: async (id, body) => {
    return requests.patch(`/appuser/${id}`, body);
  },

  updateStatus: async (id, body) => {
    return requests.patch(`/appuser/${id}`, body);
  },
};

export default AppuserServices;
