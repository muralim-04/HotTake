import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import type { ProblemDetails } from '../types/ProblemDetails';
import { useUserStore } from "../stores/userStore";
import type { UserRes } from '../types/UserTypes';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:44321',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const user = useUserStore.getState().user;
    const token = user?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error(error)
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const {data} = await apiClient.post<UserRes>('/api/auth/refresh');
        useUserStore.setState({user: data}) 
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    console.error(error)
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    let errorTitle = 'An unexpected error occurred.';
    let errorDetail = 'Something happened.';

    if (error.response?.data) {
      const problem = error.response.data;
      console.error(problem);
      
      if (problem.title){
        errorTitle = problem.title;
      }

      if(problem.detail) {
        if (problem.detail.length > 150) {
          console.error('[Backend Stack Trace]:', problem.detail);
          errorDetail = 'Server Error (Check Console)';
        } else {
          errorDetail = problem.detail;
        }
      }

      if(problem.errors) {
        const firstErrorKey = Object.keys(problem.errors)[0];
        if (firstErrorKey && problem.errors[firstErrorKey].length > 0) {
          errorDetail = problem.errors[firstErrorKey][0]; // Grabs the first validation error string
        }
      }
    } else if (error.request) {
      errorTitle = 'Network Error / Server Unreachable';
    }

    toast.error(errorTitle);
    error.message = errorDetail;

    return Promise.reject(error);
  }
);