// frontend/src/api/auth.js
import { api } from './client';

const STORAGE_KEY = 'auth';

export async function loginRequest(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const { token, user } = res.data; // { token, user: { id, name, email, role } }

  const payload = { token, user };

  // Guarda todo junto
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  // Compatibilidad: algunos módulos leen solo "token"
  localStorage.setItem('token', token);

  return payload;
}

export async function registerRequest({ name, email, password }) {
  const res = await api.post('/auth/register', { name, email, password });
  // El backend devuelve el usuario creado (sin password)
  return res.data;
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.user || null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('token');
}
