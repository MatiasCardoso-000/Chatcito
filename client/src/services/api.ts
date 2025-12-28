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

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para manejar errores y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Marca que ya intentamos esta petición
      originalRequest._retry = true;

      if (isRefreshing) {
        // Si ya hay un refresh en progreso, ponemos esta petición en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Intentamos refrescar el token
        const response = await authAPI.verifyToken();
        const newAccessToken = response.data.accessToken;

        // Actualizamos el token en el store
        useAuthStore.setState({ accessToken: newAccessToken });

        // Procesamos las peticiones en cola con el nuevo token
        processQueue(null, newAccessToken);

        // Actualizamos el header de la petición original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Reintentamos la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, procesamos la cola con error
        processQueue(refreshError, null);

        // Hacemos logout
        useAuthStore.getState().logout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);