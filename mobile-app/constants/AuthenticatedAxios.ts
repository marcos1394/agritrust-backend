import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import { API_URL } from './config';
import { useMemo } from 'react';

export const useAuthenticatedAxios = () => {
  const { getToken } = useAuth();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [getToken]);

  return axiosInstance;
};