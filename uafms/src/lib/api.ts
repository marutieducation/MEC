

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';


const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('uafms_token');
  }
  return null;
};


const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }


  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  const config: RequestInit = {
    ...options,
    headers,
    signal: controller.signal
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = { message: await response.text().catch(() => 'Response body could not be read') };
    }

    if (!response.ok) {

      if (response.status === 401 && typeof window !== 'undefined') {

        const isLoginAttempt = endpoint.includes('/auth/login') || endpoint.includes('/auth/verify-2fa') || endpoint.includes('/auth/forgot-password') || endpoint.includes('/auth/me');

        if (!isLoginAttempt) {
          localStorage.removeItem('uafms_token');
          localStorage.removeItem('uafms_user');
          window.location.href = '/login';
        }
      }
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`API Timeout (${endpoint}): Request took too long`);
      throw new Error('Connection timed out. Please check if the server is running.');
    }
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const api = {
  get: (endpoint: string, options?: RequestInit) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, data: unknown, options?: RequestInit) =>
    apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  put: (endpoint: string, data: unknown, options?: RequestInit) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: (endpoint: string, options?: RequestInit) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};
