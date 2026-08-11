import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Result, ApiResponse } from '@cronjob/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to append JWT token from localStorage if available
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<Result<T>> {
    try {
      const res: AxiosResponse<ApiResponse<T>> = await this.client.get(url, { params });
      if (res.data.success && res.data.data !== undefined) {
        return Result.ok<T>(res.data.data);
      }
      return Result.fail<T>(res.data.error?.message || 'Failed to fetch data');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Network error';
      return Result.fail<T>(msg);
    }
  }

  public async post<T>(url: string, data?: any): Promise<Result<T>> {
    try {
      const res: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data);
      if (res.data.success && res.data.data !== undefined) {
        return Result.ok<T>(res.data.data);
      }
      return Result.fail<T>(res.data.error?.message || 'Operation failed');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Network error';
      return Result.fail<T>(msg);
    }
  }

  public async put<T>(url: string, data?: any): Promise<Result<T>> {
    try {
      const res: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data);
      if (res.data.success && res.data.data !== undefined) {
        return Result.ok<T>(res.data.data);
      }
      return Result.fail<T>(res.data.error?.message || 'Update failed');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Network error';
      return Result.fail<T>(msg);
    }
  }

  public async delete<T>(url: string): Promise<Result<T>> {
    try {
      const res: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
      if (res.data.success) {
        return Result.ok<T>(res.data.data as T);
      }
      return Result.fail<T>(res.data.error?.message || 'Delete failed');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Network error';
      return Result.fail<T>(msg);
    }
  }
}

export const api = new ApiClient();
