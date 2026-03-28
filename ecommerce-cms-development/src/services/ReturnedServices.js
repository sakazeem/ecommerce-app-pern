import requests from "./httpService";

const ReturnedServices = {
  getAllReturned: async () => {
    return requests.get("/returned");
  },

  getAllReturneds: async (query) => {
    return requests.get(`/returned${query ? `?${query}` : ""}`);
  },

  getReturnedById: async (id) => {
    return requests.get(`/returned/${id}`);
  },

  addReturned: async (body) => {
    return requests.post("/returned", body);
  },

  addAllReturned: async (body) => {
    return requests.post("/returned", body);
  },

  updateReturned: async (id, body) => {
    return requests.patch(`/returned/${id}`, body);
  },

  updateReturnedStatus: async (id, body) => {
    return requests.patch(`/returned/status/${id}`, body);
  },

  deleteReturned: async (id, body) => {
    return requests.delete(`/returned/${id}`, body);
  },

  updateManyReturned: async (body) => {
    return requests.patch("/returned/update/many", body);
  },

  deleteManyReturned: async (body) => {
    return requests.patch("/returned/delete/many", body);
  },
};

export default ReturnedServices;
