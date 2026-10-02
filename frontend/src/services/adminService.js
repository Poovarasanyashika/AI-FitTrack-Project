import { apiRequest } from "./api";

const getDashboard = () =>
  apiRequest("/admin/dashboard");

const getUsers = () =>
  apiRequest("/admin/users");

const getWorkouts = () =>
  apiRequest("/admin/workouts");

const getReports = () =>
  apiRequest("/admin/reports");

const getSystemHealth = () =>
  apiRequest("/admin/system-health");

export const adminService = {
  getDashboard,
  getUsers,
  getWorkouts,
  getReports,
  getSystemHealth,
};
