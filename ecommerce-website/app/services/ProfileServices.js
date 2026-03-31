import requests from "./httpServices";

const ProfileServices = {
  addOrUpdateAddress: async (body) => {
    return requests.patch("/profile/address", body);
  },
  deleteAddress: async (id) => {
    return requests.delete(`/profile/address/${id}`);
  },
};

export default ProfileServices;
