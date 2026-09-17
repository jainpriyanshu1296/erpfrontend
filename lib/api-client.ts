import type { ApiResponse } from '@/types';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private adminMode = false;

  // Admin mode — uses erp_admin_token, no X-Org-Slug, redirects to /admin/dashboard on 401
  asAdmin() {
    const c = new ApiClient();
    c.adminMode = true;
    return c;
  }

  private headers() {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };

    if (this.adminMode) {
      const token = localStorage.getItem('erp_admin_token');
      return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
    }

    const token = localStorage.getItem('erp_token');
    const slug = localStorage.getItem('erp_org_slug');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(slug ? { 'X-Org-Slug': slug } : {}),
    };
  }

  async request<T>(endpoint: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${endpoint}`, {
        ...init,
        headers: { ...this.headers(), ...(init.headers || {}) },
      });
    } catch {
      throw new Error('Network error. Please check the backend connection.');
    }

    const body = await response.json().catch(() => ({}));

    if (response.status === 401 && typeof window !== 'undefined') {
      if (this.adminMode) {
        // Admin session expired — clear admin token, go back to admin login
        localStorage.removeItem('erp_admin_token');
        window.location.href = '/admin/dashboard';
        throw new Error('Admin session expired. Please login again.');
      }

      // Org user — try refresh token first
      const refreshToken = localStorage.getItem('erp_refresh_token');
      if (endpoint !== '/auth/refresh' && refreshToken) {
        const refresh = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        const refreshBody = await refresh.json().catch(() => ({}));
        if (refresh.ok && refreshBody.data?.token && refreshBody.data?.refresh_token) {
          localStorage.setItem('erp_token', refreshBody.data.token);
          localStorage.setItem('erp_refresh_token', refreshBody.data.refresh_token);
          return this.request<T>(endpoint, init);
        }
      }
      // Refresh failed or no refresh token — go to org login
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_refresh_token');
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
