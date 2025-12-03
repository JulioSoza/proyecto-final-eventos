// FRONTEND - src/pages/AdminEvents.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { getCurrentUser } from '../api/auth';

function AdminEvents() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [location, setLocation] = useState('Guatemala');
  const [category, setCategory] = useState('music');
  const [price, setPrice] = useState(100);

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function loadEvents() {
    setLoadingEvents(true);
    setError(null);

    try {
      const res = await api.get('/events', { params: { page: 1, limit: 50 } });
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los eventos.');
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setError('No tienes permisos para acceder a este panel.');
      setLoadingEvents(false);
      return;
    }

    loadEvents();
  }, [user]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!user || user.role !== 'admin') {
      setError('No autorizado.');
      return;
    }

    try {
      const isoDate = new Date(date).toISOString();

      const payload = {
        title,
        description,
        date: isoDate,
        capacity: Number(capacity),
        location,
        category,
        price: Number(price)
      };

      const res = await api.post('/events', payload);
      const newEvent = res.data;

      setEvents(prev => [newEvent, ...prev]);
      setMessage('Evento creado correctamente.');

      // limpiar formulario
      setTitle('');
      setDescription('');
      setDate('');
      setCapacity(100);
      setLocation('Guatemala');
      setCategory('music');
      setPrice(100);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('No autorizado. Verifica que sigues autenticado como admin.');
      } else {
        setError('Error al crear el evento.');
      }
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Panel administrativo</h1>
      <p className="page-subtitle">
        Solo usuarios con rol <strong>admin</strong> pueden acceder.
      </p>

      {error && (
        <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{error}</p>
      )}

      {message && (
        <p style={{ color: '#bbf7d0', marginBottom: '1rem' }}>{message}</p>
      )}

      {/* Si no es admin, solo mostramos el mensaje y un botón para volver */}
      {(!user || user.role !== 'admin') ? (
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      ) : (
        <>
          {/* Formulario de creación */}
          <section className="event-card" style={{ marginBottom: '2rem' }}>
            <h2 className="event-title">Crear nuevo evento</h2>

            <form className="form-grid" onSubmit={handleCreate}>
              <label>
                Título
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </label>

              <label>
                Descripción
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </label>

              <label>
                Fecha y hora
                <input
                  type="datetime-local"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </label>

              <label>
                Capacidad
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  required
                />
              </label>

              <label>
                Precio (Q)
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </label>

              <label>
                Lugar
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </label>

              <label>
                Categoría
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                />
              </label>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Guardar evento
              </button>
            </form>
          </section>

          {/* Lista de eventos existentes */}
          <section>
            <h2 className="event-title">Eventos existentes</h2>

            {loadingEvents ? (
              <p>Cargando eventos...</p>
            ) : events.length === 0 ? (
              <p>No hay eventos creados todavía.</p>
            ) : (
              <div className="events-list">
                {events.map(ev => (
                  <article key={ev.id} className="event-card">
                    <h3 className="event-title">{ev.title}</h3>
                    <p>{ev.description}</p>
                    <p>
                      Capacidad: {ev.capacity} | Disponibles:{' '}
                      {ev.remainingCapacity}
                    </p>
                    <p>
                      Lugar: {ev.location} | Categoría: {ev.category}
                    </p>
                    <p style={{ fontWeight: 'bold' }}>Q {ev.price}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminEvents;
