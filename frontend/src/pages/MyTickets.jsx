// FRONTEND - src/pages/MyTickets.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import { getMyTickets } from '../api/tickets';

function MyTickets() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadTickets() {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyTickets();
      // getMyTickets devuelve un array (items), así que asignamos directamente
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Debes iniciar sesión para ver tus boletos.');
      } else {
        setError('Error al cargar tus boletos.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setError('Debes iniciar sesión para ver tus boletos.');
      setLoading(false);
      return;
    }
    loadTickets();
  }, [user]);

  if (!user) {
    return (
      <div className="page-container">
        <h1 className="page-title">Mis boletos</h1>
        <p className="page-subtitle">
          Debes iniciar sesión para acceder a esta sección.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Ir al login
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Mis boletos</h1>
      <p className="page-subtitle">
        Aquí verás los tickets comprados con tu usuario.
      </p>

      {error && (
        <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{error}</p>
      )}

      {loading ? (
        <p>Cargando boletos...</p>
      ) : tickets.length === 0 ? (
        <p>No has comprado boletos todavía.</p>
      ) : (
        <div className="events-list">
          {tickets.map(ticket => {
            // ticket incluye propiedades:
            // - quantity, unitPrice, total, createdAt
            // - eventId, eventTitle, eventLocation, eventStartDate
            const purchaseDate = ticket.createdAt
              ? new Date(ticket.createdAt)
              : null;
            const eventDate = ticket.eventStartDate
              ? new Date(ticket.eventStartDate)
              : null;

            return (
              <article key={ticket.id} className="event-card">
                <h2 className="event-title">
                  {ticket.eventTitle || `Evento #${ticket.eventId}`}
                </h2>
                {ticket.eventLocation && <p>Lugar: {ticket.eventLocation}</p>}
                {eventDate && (
                  <p>
                    Fecha evento:{' '}
                    {eventDate.toLocaleDateString()}{' '}
                    {eventDate.toLocaleTimeString()}
                  </p>
                )}
                <p>
                  <strong>Cantidad:</strong> {ticket.quantity || 1}
                </p>
                {ticket.unitPrice && (
                  <p>
                    <strong>Precio unitario:</strong> Q{' '}
                    {Number(ticket.unitPrice).toFixed(2)}
                  </p>
                )}
                {ticket.total && (
                  <p>
                    <strong>Total:</strong> Q{' '}
                    {Number(ticket.total).toFixed(2)}
                  </p>
                )}
                {purchaseDate && (
                  <p>
                    <strong>Comprado el:</strong>{' '}
                    {purchaseDate.toLocaleDateString()}{' '}
                    {purchaseDate.toLocaleTimeString()}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyTickets;
