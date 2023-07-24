import axios from "axios";
import { notify } from "./client.util";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TMDB_API_URL,
  timeout: Number(process.env.NEXT_PUBLIC_TMDB_API_TIMEOUT || 10000),
  params: {
    api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY
  }
});

export default instance;

export const zypeInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ZYPE_API_URL,
  timeout: Number(10000),
  params: {
    api_key: process.env.NEXT_PUBLIC_ZYPE_API_KEY
  }
});

/**
 * Perform an API call on Next.js Api routes using fetch with default options & error handling
 * @param endpoint {string}
 * @param [_id] {string}
 * @param [id] {string}
 * @param [method] { 'GET' | 'POST' | 'PATCH' | 'DELETE' }
 * @param [headers] {object}
 * @param [payload] {object}
 * @returns {Promise<any>}
 */
export const apiCall = async (
  endpoint: string,
  { method, _id = "", id = _id, payload, headers }: any
) => {
  const { data, status } = await axios(
    `${process.env.NEXT_PUBLIC_HOST}/api/${endpoint}${id ? `/${id}` : ""}`,
    {
      method,
      [method === "GET" || method === "DELETE" ? "params" : "data"]: payload,
      headers
    }
  );


  if (status !== 200) {
    notify("Error occurred!", { type: "error" });
    return;
  }

  return data.data;
};
