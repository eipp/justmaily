import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useToast } from '@/components/Toast/useToast';
import { APIError } from '@/types';
import Bottleneck from 'bottleneck';
import { performanceMonitor } from '../monitoring/performance';
import { toast } from '@/components/ui/atoms/use-toast';

// Rate limiter configuration
const limiter = new Bottleneck({
  minTime: 100,
  maxConcurrent: 10,
  reservoir: 100,
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000, // 1 minute
});

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APIClient {
  private instance: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private circuitBreaker = {
    failures: 0,
    lastFailure: 0,
    isOpen: false,
  };

  constructor() {
    this.instance = axios.create({
      baseURL: env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        const startTime = performance.now();
        
        // Check circuit breaker
        if (this.circuitBreaker.isOpen) {
          const now = Date.now();
          if (now - this.circuitBreaker.lastFailure > 30000) { // 30 seconds
            this.circuitBreaker.isOpen = false;
            this.circuitBreaker.failures = 0;
          } else {
            throw new Error('Circuit breaker is open');
          }
        }

        // Apply rate limiting
        await limiter.schedule(() => Promise.resolve());

        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Track request start
        config.metadata = { startTime };
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Track request performance
        const duration = performance.now() - (response.config.metadata?.startTime || 0);
        performanceMonitor.trackCustomMetric('api-request', duration, {
          endpoint: response.config.url || '',
          method: response.config.method || '',
          status: response.status.toString(),
        });

        return response;
      },
      async (error: AxiosError<APIError>) => {
        // Update circuit breaker
        if (error.response?.status && error.response.status >= 500) {
          this.circuitBreaker.failures++;
          this.circuitBreaker.lastFailure = Date.now();
          if (this.circuitBreaker.failures >= 5) {
            this.circuitBreaker.isOpen = true;
          }
        }

        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          const response = await axios.post<RefreshTokenResponse>(
            `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );

          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          return response.data.accessToken;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  private handleAuthError() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  private handleError(error: AxiosError<APIError>) {
    const message = error.response?.data?.message || error.message;
    
    // Handle different error status codes
    switch (error.response?.status) {
      case 401:
        // Handle unauthorized
        window.location.href = '/sign-in';
        break;
      case 403:
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to perform this action.',
          variant: 'destructive',
        });
        break;
      case 429:
        toast({
          title: 'Rate Limited',
          description: 'Please try again later.',
          variant: 'destructive',
        });
        break;
      default:
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        limiter.updateSettings({
          minTime: parseInt(retryAfter) * 1000,
        });
      }
    }
  }

  private getCacheKey(url: string, config?: AxiosRequestConfig): string {
    return `${config?.method || 'get'}-${url}-${JSON.stringify(config?.params || {})}`;
  }

  private isCacheValid(entry: CacheEntry<any>, maxAge: number): boolean {
    return Date.now() - entry.timestamp < maxAge;
  }

  // Public methods with caching
  public async get<T>(url: string, config?: AxiosRequestConfig & { cache?: number }) {
    const cacheKey = this.getCacheKey(url, config);
    const cached = this.cache.get(cacheKey);

    if (cached && config?.cache && this.isCacheValid(cached, config.cache)) {
      return cached.data as T;
    }

    const response = await this.instance.get<T>(url, config);
    
    if (config?.cache) {
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  // Cache management
  public clearCache() {
    this.cache.clear();
  }

  public removeCacheEntry(url: string, config?: AxiosRequestConfig) {
    const cacheKey = this.getCacheKey(url, config);
    this.cache.delete(cacheKey);
  }
}

export const apiClient = new APIClient();

// API endpoints
export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),
    register: (data: { email: string; password: string; name: string }) =>
      apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
  },
  user: {
    me: () => apiClient.get('/user/me'),
    update: (data: any) => apiClient.patch('/user/me', data),
  },
  campaigns: {
    list: (params?: any) => apiClient.get('/campaigns', { params }),
    create: (data: any) => apiClient.post('/campaigns', data),
    get: (id: string) => apiClient.get(`/campaigns/${id}`),
    update: (id: string, data: any) =>
      apiClient.patch(`/campaigns/${id}`, data),
    delete: (id: string) => apiClient.delete(`/campaigns/${id}`),
  },
  team: {
    list: () => apiClient.get('/team'),
    invite: (data: { email: string; role: string }) =>
      apiClient.post('/team/invite', data),
    remove: (userId: string) => apiClient.delete(`/team/${userId}`),
  },
}; 