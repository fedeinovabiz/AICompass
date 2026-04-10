// ══════════════════════════════════════════════
// API CLIENT — HTTP helper con camelCase transform
// ══════════════════════════════════════════════

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Transforma snake_case → camelCase recursivamente
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function transformKeys(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(transformKeys);
  if (typeof value === 'object' && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[toCamelCase(key)] = transformKeys(val);
    }
    return result;
  }
  return value;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

async function request<T>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('No autorizado');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error((errorBody as { message?: string }).message ?? `Error ${response.status}`);
  }

  // Respuestas sin cuerpo (204 No Content)
  if (response.status === 204) return undefined as T;

  const json: unknown = await response.json();
  return transformKeys(json) as T;
}

export function apiGet<T>(url: string): Promise<T> {
  return request<T>('GET', url);
}

export function apiPost<T>(url: string, data: unknown): Promise<T> {
  return request<T>('POST', url, data);
}

export function apiPut<T>(url: string, data: unknown): Promise<T> {
  return request<T>('PUT', url, data);
}

export function apiDel<T>(url: string): Promise<T> {
  return request<T>('DELETE', url);
}
