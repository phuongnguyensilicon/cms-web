import { getEnv } from '@configs/env';
import axios from 'axios';

const API_ENDPOINT = getEnv('API_ENDPOINT');
const instance = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 10000
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
  { method, _id = '', id = _id, payload, headers }: any
) => {
  const { data, status } = await instance(`${endpoint}${id ? `/${id}` : ''}`, {
    method,
    [method === 'GET' || method === 'DELETE' ? 'params' : 'data']: payload,
    headers
  });

  if (status !== 200) {
    return;
  }

  return data.data;
};
