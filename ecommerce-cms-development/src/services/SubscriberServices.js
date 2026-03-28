import requests, { instance } from "./httpService";

const SubscriberServices = {
  getAllSubscribers: async (query) => {
    return requests.get(`/subscriber${query ? `?${query}` : ""}`);
  },
  exportSubscribers: async (query) => {
    return instance.get(`/subscriber/export${query ? `?${query}` : ""}`, {
      responseType: "blob",
    });
  },
};

export default SubscriberServices;
