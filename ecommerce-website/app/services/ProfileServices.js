import requests from "./httpServices";

const ProfileServices = {
  addOrUpdateAddress: (body) => requests.patch("/profile/address", body),
  deleteAddress: (id) => requests.delete(`/profile/address/${id}`),
  setDefaultAddress: (id) => requests.patch(`/profile/address/${id}/default`),
};

export default ProfileServices;
