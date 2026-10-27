export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('mcl_iccc_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }
  return data;
}

