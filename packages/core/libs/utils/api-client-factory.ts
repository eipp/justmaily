import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiClientFactoryConfig {
  baseURL: string;
  headers?: AxiosRequestHeaders;
  timeout?: number;
  interceptors?: {
    request?: ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>)[];
    response?: ((response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>)[];
    responseError?: ((error: any) => Promise<any>)[]; 
  };
}

export const createApiClient = (config: ApiClientFactoryConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.baseURL,
    headers: config.headers,
    timeout: config.timeout,
  });

  // Default request interceptor for logging
  instance.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => { // Use InternalAxiosRequestConfig
      console.log('API Request:', request.method, request.url);
      return request;
    },
    (error) => { return Promise.reject(error); } // keep error interceptor for request as is
  );

  // Default response interceptor for error logging
  instance.interceptors.response.use(
    (response: AxiosResponse) => { // Use AxiosResponse
      return response;
    },
    error => {
      console.error('API Response Error:', error.response?.status, error.response?.data);
      return Promise.reject(error);
    }
  );

  // Add custom interceptors from config
  config.interceptors?.request?.forEach(interceptor => {
    instance.interceptors.request.use(interceptor);
  });
  config.interceptors?.response?.forEach(interceptor => {
    instance.interceptors.response.use(interceptor);
  });
  config.interceptors?.responseError?.forEach(interceptor => {
    instance.interceptors.response.use(undefined, interceptor); // Axios uses undefined for error interceptor
  });

  return instance;
};