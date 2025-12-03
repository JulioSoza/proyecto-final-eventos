// FRONTEND - src/api/tickets.js
import { api } from './client';

const STORAGE_KEY = 'my_tickets';

// Leer boletos guardados en localStorage
function loadLocalTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error leyendo boletos de localStorage', err);
    return [];
  }
}

// Guardar boletos en localStorage
function saveLocalTickets(tickets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Error guardando boletos en localStorage', err);
  }
}

// Comprar ticket: sigue llamando al backend,
// pero además guarda el ticket en localStorage
export async function buyTicket(eventId, quantity = 1) {
  const res = await api.post('/tickets', {
    eventId,
    quantity
  });

  const data = res.data; // { ticket, event }

  const current = loadLocalTickets();
  current.push({
    ...data.ticket,
    event: data.event
  });
  saveLocalTickets(current);

  return data;
}

// Obtener los boletos del usuario actual desde localStorage
export async function getMyTickets() {
  // Lo dejamos async para no romper el código que lo usa
  return loadLocalTickets();
}
