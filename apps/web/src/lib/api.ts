import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Result, ApiResponse } from '@cronjob/shared';

const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '';
const IS_PREVIEW = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (IS_PREVIEW && VERCEL_URL ? `${VERCEL_URL}/api` : 'http://localhost:4000/api');

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

  private handleResponse<T>(res: AxiosResponse<any>): Result<T> {
    const data = res.data;

    // Handle raw Result serialization format
    if (data && typeof data.isSuccess === 'boolean') {
      if (data.isSuccess) {
        return Result.ok<T>(data._value);
      }
      return Result.fail<T>(data.error || 'Operation failed');
    }

    // Handle ApiResponse format
    if (data && data.success) {
      return Result.ok<T>(data.data as T);
    }

    return Result.fail<T>(data?.error?.message || data?.message || 'Operation failed');
  }

  private handleError<T>(err: any): Result<T> {
    const data = err.response?.data;
    const msg =
      (typeof data?.error === 'string' ? data.error : data?.error?.message) ||
      data?.message ||
      err.message ||
      'Network error';
    return Result.fail<T>(msg);
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<Result<T>> {
    try {
      const res = await this.client.get(url, { params });
      return this.handleResponse<T>(res);
    } catch (err: any) {
      return this.handleError<T>(err);
    }
  }

  public async post<T>(url: string, data?: any): Promise<Result<T>> {
    try {
      const res = await this.client.post(url, data);
      return this.handleResponse<T>(res);
    } catch (err: any) {
      return this.handleError<T>(err);
    }
  }

  public async put<T>(url: string, data?: any): Promise<Result<T>> {
    try {
      const res = await this.client.put(url, data);
      return this.handleResponse<T>(res);
    } catch (err: any) {
      return this.handleError<T>(err);
    }
  }

  public async delete<T>(url: string): Promise<Result<T>> {
    try {
      const res = await this.client.delete(url);
      return this.handleResponse<T>(res);
    } catch (err: any) {
      return this.handleError<T>(err);
    }
  }
}

export const api = new ApiClient();
