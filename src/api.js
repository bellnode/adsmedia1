const BASE = import.meta.env.VITE_API_URL || '';

// simple device id for anti-fraud tracking
function deviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('deviceId', id);
  }
  return id;
}

/**
 * Safe JSON body for fetch — never double-stringify.
 * Pass a plain object; we stringify once. Strings are sent as-is only if already valid JSON objects.
 */
function encodeBody(body) {
  if (body == null) return undefined;
  if (typeof body === 'string') {
    // If caller already stringified an object, pass through once
    const trimmed = body.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return trimmed;
    }
    // Plain string → wrap as JSON string value (rare)
    return JSON.stringify(body);
  }
  return JSON.stringify(body);
}

export async function api(path, { method = 'GET', body, formData } = {}) {
  const headers = { 'x-device-id': deviceId() };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = 'Bearer ' + token;

  let payload;
  if (formData instanceof FormData) {
    payload = formData;
    // let browser set multipart boundary — do not set Content-Type
  } else {
    payload = encodeBody(body);
    if (payload !== undefined) headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: payload,
    });
  } catch {
    throw new Error('Server not reachable — check connection and refresh the page');
  }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('token');
    const onAuthPage = /^\/(login|register|forgot)(\/|$)/.test(location.pathname) || location.pathname === '/';
    if (!onAuthPage) window.location.replace('/login');
    throw new Error(data.error || 'Please login');
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export function setToken(t) { localStorage.setItem('token', t); }
export function clearToken() { localStorage.removeItem('token'); }
export function hasToken() { return !!localStorage.getItem('token'); }
export function logout() { clearToken(); window.location.replace('/login'); }
