// frontend/src/api/tickets.js
import { api } from './client';

// Obtiene el token guardado en localStorage
function getAuthToken() {
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) return parsed.token;
    }
  } catch (err) {
    console.error('Error leyendo auth desde localStorage', err);
  }
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
  // Nota: usamos la nueva ruta /tickets/purchase
  const res = await api.post(
    '/tickets/purchase',
    { eventId, quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

// Obtener tickets del usuario logueado
export async function getMyTickets() {
  const token = getAuthToken();
  if (!token) {
    const error = new Error('No hay token de autenticación');
    error.code = 'NO_TOKEN';
    throw error;
  }
  // La nueva ruta devuelve { items: [...] }, devolvemos directamente el array
  const res = await api.get('/tickets/my', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.items;
}
