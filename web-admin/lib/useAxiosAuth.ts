"use client";

import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect } from "react";

// Tu URL del Backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://improved-funicular-gpxx6vqj47whpwr9-8080.app.github.dev";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const useAxiosAuth = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Interceptor: Antes de cada petición, inyecta el token
    const requestIntercept = axiosInstance.interceptors.request.use(
      async (config) => {
        // Pedimos el token a Clerk (cacheado, rápido)
        const token = await getToken();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Limpieza del interceptor al desmontar
    return () => {
      axiosInstance.interceptors.request.eject(requestIntercept);
    };
  }, [getToken]);

  return axiosInstance;
};