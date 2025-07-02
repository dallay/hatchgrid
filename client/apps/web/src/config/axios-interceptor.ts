import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';

declare const SERVER_API_URL: string;

const TIMEOUT = 1000000;

const onRequestSuccess = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('jhi-authenticationToken') || sessionStorage.getItem('jhi-authenticationToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.timeout = TIMEOUT;
  config.url = `${SERVER_API_URL}${config.url}`;
  return config;
};

const setupAxiosInterceptors = (
  onUnauthenticated: (err: AxiosError) => Promise<never>,
  onServerError: (err: AxiosError) => Promise<never>
): void => {
  const onResponseError = (err: AxiosError): Promise<never> => {
    const status = err.status || err.response?.status;
    if (status === 403 || status === 401) {
      return onUnauthenticated(err);
    }
    if (status && status >= 500) {
      return onServerError(err);
    }
    return Promise.reject(err);
  };

  if (axios.interceptors) {
    axios.interceptors.request.use(onRequestSuccess);
    axios.interceptors.response.use(res => res, onResponseError);
  }
};

export { onRequestSuccess, setupAxiosInterceptors };
