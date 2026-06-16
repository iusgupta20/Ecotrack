// In-memory token for guest/demo sessions (lost on refresh)
let memoryToken: string | null = null;

export const setMemoryToken = (token: string | null) => {
  memoryToken = token;
};

export const getMemoryToken = () => memoryToken;

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const BASE_URL = configuredApiBaseUrl
  ? configuredApiBaseUrl.replace(/\/$/, '')
  : '/api';

const getHeaders = (): HeadersInit => {
  // Guest in-memory token takes priority, then persistent localStorage token
  const token = memoryToken || localStorage.getItem('ecotrack_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `GET Request failed: ${response.status}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `POST Request failed: ${response.status}`);
    }
    return response.json();
  }
};

export default api;
