import axios from "axios";
import { getToken, logout } from "./authService";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const naRotaDeAuth = error.config?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && !naRotaDeAuth) {
      logout();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
