import requests from "./httpServices";

const AuthServices = {
  login: async (body) => {
    return requests.post("/auth/login", body);
  },
  register: async (body) => {
    return requests.post(`/auth/register`, body);
  },
  forgotPassword: async (body) => {
    return requests.post("/auth/forgot-password", body);
  },
  resetPassword: async (token, body) => {
    return requests.post(
      `/auth/reset-password?token=${encodeURIComponent(token)}`,
      body,
    );
  },
};

export default AuthServices;
