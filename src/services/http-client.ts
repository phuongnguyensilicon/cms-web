import { getEnv } from '@configs/env';
import axios, { AxiosHeaders } from 'axios';
import { getSession } from 'next-auth/react';

const Axios = axios.create({
  baseURL: getEnv('API_ENDPOINT'),
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json'
  }
});

Axios.interceptors.request.use(async request => {
  const session: any = await getSession();

  (request.headers as AxiosHeaders).set(
    'Authorization',
    session?.user?.id_token ? `Bearer ${session?.user?.id_token}` : ''
  );

  return request;
});

Axios.interceptors.response.use(
  response => response,
  error => {
    if (error?.response) {
      const data = error?.response.data;
      // if (error.response.status === 401 || error.response.status === 403) {
      //   signOut();
      // }
      const { error_description, message } = data;
      if (error_description || message) {
        return Promise.reject({
          ...error,
          message: error_description || message
        });
      } else {
        return Promise.reject(error);
      }
    } else {
      return Promise.reject(error);
    }
  }
);

export class HttpClient {
  static async get<T>(url: string, params?: unknown) {
    const response = await Axios.get<T>(url, { params });
    return response.data;
  }

  static async post<T>(url: string, data: unknown, options?: any) {
    const response = await Axios.post<T>(url, data, options);
    return response.data;
  }

  static async put<T>(url: string, data: unknown) {
    const response = await Axios.put<T>(url, data);
    return response.data;
  }

  static async delete<T>(url: string) {
    const response = await Axios.delete<T>(url);
    return response.data;
  }
}

export function getFormErrors(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data.message;
  }
  return null;
}

export function getFieldErrors(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data.errors;
  }
  return null;
}
