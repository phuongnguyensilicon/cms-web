import axios from 'axios';

const Axios = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_HOST}/api/`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios.interceptors.request.use(async request => {
//   const session: any = await getSession();

//   (request.headers as AxiosHeaders).set(
//     'Authorization',
//     `Bearer ${session?.user?.id_token}`
//   );

//   return request;
// });

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
