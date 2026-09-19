import type { ApiResponse } from '@/types';

function baseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.daanoday.com')) return '/api/v1';
  return 'http://localhost:5000/api/v1';
}

class ApiClient {
  private adminMode = false;

  asAdmin() {
    const client = new ApiClient();
    client.adminMode = true;
    return client;
  }

  private headers() {
    return { 'Content-Type': 'application/json' };
  }

  async request<T>(endpoint: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    let response: Response;
    try {
      response = await fetch(`${baseUrl()}${endpoint}`, {
        ...init,
        credentials: 'include',
        headers: { ...this.headers(), ...(init.headers || {}) },
      });
    } catch {
      throw new Error('Network error. Please check the backend connection.');
    }

    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && typeof window !== 'undefined') {
      if (this.adminMode) {
        window.location.href = '/admin/dashboard';
        throw new Error('Admin session expired. Please login again.');
      }
      if (endpoint !== '/auth/refresh') {
        const refresh = await fetch(`${baseUrl()}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const refreshBody = await refresh.json().catch(() => ({}));
        if (refresh.ok && refreshBody.data?.refreshed) return this.request<T>(endpoint, init);
      }
      localStorage.removeItem('erp_tabs');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    if (!response.ok) throw new Error(body.message || 'Request failed');
    return body as ApiResponse<T>;
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<T>(`${endpoint}${query}`);
  }
  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }
  put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }
  patch<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  }
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
export const adminApi = api.asAdmin();
