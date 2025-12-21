import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "./auth";

export const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const token = await authAPI.verifyToken();
      
      useAuthStore.setState({ accessToken: token.data.accessToken });
      if (error.response.status === 200) {
        error.response.config.headers.Authorization = `Bearer ${token.data.accessToken}`;
      }
    }
    return Promise.reject(error);
  }
);
