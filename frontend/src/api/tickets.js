// frontend/src/api/tickets.js
import { api } from './client';

// Obtiene el token guardado en localStorage
function getAuthToken() {
  try {
    // Caso más común: guardamos todo en "auth"
    const raw = localStorage.getItem('auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) return parsed.token;
    }
  } catch (err) {
    console.error('Error leyendo auth desde localStorage', err);
  }

  // Plan B: token guardado directo
  const token = localStorage.getItem('token');
  return token || null;
}

// Compra de ticket para un evento
export async function buyTicket(eventId, quantity = 1) {
  const token = getAuthToken();

  if (!token) {
    const error = new Error('No hay token de autenticación');
    error.code = 'NO_TOKEN';
    throw error;
  }

  const res = await api.post(
    '/tickets',
    { eventId, quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

// (opcional) obtener tickets del usuario logueado
export async function getMyTickets() {
  const token = getAuthToken();

  if (!token) {
    const error = new Error('No hay token de autenticación');
    error.code = 'NO_TOKEN';
    throw error;
  }

  const res = await api.get('/tickets/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
