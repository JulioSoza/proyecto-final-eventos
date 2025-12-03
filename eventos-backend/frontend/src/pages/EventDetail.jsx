// FRONTEND - src/pages/EventDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { getCurrentUser } from '../api/auth';
import { buyTicket } from '../api/tickets';

function EventDetail() {
  const { id } = useParams();           // viene de /eventos/:id
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function loadEvent() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el evento. Es posible que no exista.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvent();
  }, [id]);

  async function handleBuy() {
    const user = getCurrentUser();
    if (!user) {
      setError('Debes iniciar sesión para comprar un ticket.');
      setMessage(null);
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const { ticket, event: updatedEvent } = await buyTicket(Number(id), 1);

      setEvent(updatedEvent);
      setMessage(
        `Ticket comprado (ID: ${ticket.id}). Quedan ${updatedEvent.remainingCapacity} lugares.`
      );
    } catch (err) {
      console.error(err);
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError('Sesión inválida. Vuelve a iniciar sesión.');
        } else if (status === 404) {
          setError('El evento ya no existe.');
        } else if (status === 409) {
          setError('No hay suficiente capacidad para ese evento.');
        } else {
          setError('Error al comprar el ticket.');
        }
      } else {
        setError('Error de red al comprar el ticket.');
      }
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <p>Cargando evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container">
        <p>Evento no encontrado.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  const date = new Date(event.date);

  return (
    <div className="page-container">
      <h1 className="page-title">{event.title}</h1>
      <p className="page-subtitle">{event.description}</p>

      {message && (
        <p style={{ color: '#bbf7d0', marginBottom: '1rem' }}>{message}</p>
      )}

      <div className="event-card">
        <p>
          <strong>Fecha:</strong>{' '}
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </p>
        <p>
          <strong>Lugar:</strong> {event.location}
        </p>
        <p>
          <strong>Categoría:</strong> {event.category}
        </p>
        <p>
          <strong>Capacidad:</strong> {event.capacity} |{' '}
          <strong>Disponibles:</strong> {event.remainingCapacity}
        </p>
        <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
          Precio: Q {event.price}
        </p>

        <button
          className="btn btn-primary"
          style={{ marginTop: '0.75rem' }}
          onClick={handleBuy}
        >
          Comprar ticket
        </button>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/">← Volver a eventos</Link>
      </div>
    </div>
  );
}

export default EventDetail;
