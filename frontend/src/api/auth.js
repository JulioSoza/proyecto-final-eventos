// FRONTEND - src/api/auth.js
import { api } from './client';

// Login contra el backend
export async function loginRequest(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data; // { token, user }
}

// Leer el usuario actual desde localStorage
export function getCurrentUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Cerrar sesión: borrar token y usuario
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
