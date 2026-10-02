import { apiRequest } from "./api";

const login = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: credentials,
  });

const register = (payload) =>
  apiRequest("/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  });

const getProfile = () =>
  apiRequest("/auth/profile");

export const authService = {
  login,
  register,
  getProfile,
};