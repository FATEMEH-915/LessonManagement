"use client";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = "http://195.181.37.207:8000";

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

export interface Classroom {
  id: number;
  title: string;
}

export interface Lecturer {
  id: number;
  name: string;
  code: number;
}

export interface CourseOffering {
  id: number;
  group_code: number;
  year: number;
  quiz_time: number;
  lecturer: {
    id: number;
    name: string;
    code: number;
  };
  classroom: {
    id: number;
    title: string;
  };
  times: {
    day: string;
    start_time: [number, number];
    end_time: [number, number];
  }[];
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

export const storeToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return {
      message: (axiosError.response?.data as any)?.message || axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    };
  }
  return { message: 'خطای ناشناخته رخ داده است' };
};

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(handleApiError(error));
  }
);