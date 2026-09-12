import type { ApiResponse } from '@/types';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private headers() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('erp_token') : null;
    const slug = typeof window !== 'undefined' ? localStorage.getItem('erp_org_slug') : null;
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(slug ? { 'X-Org-Slug': slug } : {}) };
  }
  async request<T>(endpoint: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    let response: Response;
    try { response = await fetch(`${baseUrl}${endpoint}`, { ...init, headers: { ...this.headers(), ...(init.headers || {}) } }); }
    catch { throw new Error('Network error. Please check the backend connection.'); }
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && typeof window !== 'undefined' && endpoint !== '/auth/refresh' && localStorage.getItem('erp_refresh_token')) {
      const refresh = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: localStorage.getItem('erp_refresh_token') }) });
      const refreshBody = await refresh.json().catch(() => ({}));
      if (refresh.ok && refreshBody.data?.token && refreshBody.data?.refresh_token) {
        localStorage.setItem('erp_token', refreshBody.data.token);
        localStorage.setItem('erp_refresh_token', refreshBody.data.refresh_token);
        return this.request<T>(endpoint, init);
      }
      localStorage.removeItem('erp_token'); localStorage.removeItem('erp_refresh_token'); window.location.href = '/login';
    } else if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('erp_token'); localStorage.removeItem('erp_refresh_token'); window.location.href = '/login';
    }
    if (!response.ok) throw new Error(body.message || 'Request failed');
    return body as ApiResponse<T>;
  }
  get<T>(endpoint: string, params?: Record<string, string>) { const query = params ? `?${new URLSearchParams(params)}` : ''; return this.request<T>(`${endpoint}${query}`); }
  post<T>(endpoint: string, body: unknown) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put<T>(endpoint: string, body: unknown) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  patch<T>(endpoint: string, body: unknown) { return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}
export const api = new ApiClient();
