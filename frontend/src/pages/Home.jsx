// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { getCurrentUser } from '../api/auth';
import { buyTicket } from '../api/tickets';
import './Home.css';

function formatDateRange(startDate, endDate) {
  if (!startDate) return '';
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const optsDate = { day: '2-digit', month: 'short', year: 'numeric' };
  const optsTime = { hour: '2-digit', minute: '2-digit' };

  const startStr = `${start.toLocaleDateString('es-GT', optsDate)} · ${start.toLocaleTimeString('es-GT', optsTime)}`;

  if (!end) return startStr;

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const endStr = sameDay
    ? end.toLocaleTimeString('es-GT', optsTime)
    : `${end.toLocaleDateString('es-GT', optsDate)} · ${end.toLocaleTimeString('es-GT', optsTime)}`;

  return `${startStr} — ${endStr}`;
}

function Home() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function loadEvents(customPage = page) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const params = {
        page: customPage,
        pageSize,
      };

      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();
      if (minPrice !== '') params.minPrice = Number(minPrice);
      if (maxPrice !== '') params.maxPrice = Number(maxPrice);

      const res = await api.get('/events', { params });
      const data = res.data;

      console.log('Eventos desde backend:', data);

      // Soportar varios formatos: items, events o arreglo plano
      let items = [];
      if (Array.isArray(data.items)) {
        items = data.items;
      } else if (Array.isArray(data.events)) {
        items = data.events;
      } else if (Array.isArray(data)) {
        items = data;
      } else {
        console.warn(
          'No se encontró arreglo de eventos en data.items / data.events. Respuesta:',
          data
        );
      }

      setEvents(items);
      setPage(data.page ?? customPage);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? items.length);
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setError('Ocurrió un error al cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApplyFilters(e) {
    e.preventDefault();
    setPage(1);
    loadEvents(1);
  }

  function handleClearFilters() {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    loadEvents(1);
  }

  async function handleBuyTicket(eventId) {
    setError(null);
    setMessage(null);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('Debes iniciar sesión para comprar tickets.');
        return;
      }

      const { ticket, event } = await buyTicket({ eventId, quantity: 1 });

      setMessage(
        `Compraste ${ticket.quantity} ticket(s) para "${event.title}".`
      );

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                capacity: event.capacity,
                remainingCapacity: event.remainingCapacity ?? event.capacity,
              }
            : e
        )
      );
    } catch (err) {
      console.error('Error al comprar ticket:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('No se pudo completar la compra de ticket.');
      }
    }
  }

  function handleChangePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    loadEvents(newPage);
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div>
          <h1 className="home-title">Eventos destacados</h1>
          <p className="home-subtitle">
            Estos datos vienen del backend (<code>GET /api/events</code>) con
            búsqueda, filtros y paginación.
          </p>
        </div>

        <div className="home-hero-stats">
          <div className="stat-card">
            <span className="stat-label">Eventos totales</span>
            <span className="stat-value">{total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Página</span>
            <span className="stat-value">
              {page} / {totalPages}
            </span>
          </div>
        </div>
      </section>

      <section className="home-filters">
        <form className="filters-form" onSubmit={handleApplyFilters}>
          <div className="filters-row">
            <div className="field">
              <label>Buscar</label>
              <input
                type="text"
                placeholder="Título, descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Categoría</label>
              <input
                type="text"
                placeholder="music, sport, tech..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="filters-row">
            <div className="field">
              <label>Precio mínimo</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Precio máximo</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="filters-actions">
              <button type="submit" className="btn btn-primary">
                Aplicar filtros
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleClearFilters}
              >
                Limpiar
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="home-content">
        {loading && <p className="status-label">Cargando eventos…</p>}

        {!loading && error && (
          <p className="status-label status-label--error">{error}</p>
        )}

        {!loading && message && (
          <p className="status-label status-label--success">{message}</p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="status-label">
            No hay eventos disponibles todavía. Crea uno desde el backend o
            Postman.
          </p>
        )}

        <div className="events-grid">
          {events.map((event) => {
            const remaining =
              event.remainingCapacity ?? event.capacity ?? 0;
            const soldOut = remaining <= 0;

            return (
              <article className="event-card" key={event.id}>
                <div className="event-card-header">
                  <span className="event-chip">
                    {event.category || 'Evento'}
                  </span>
                  {!event.isPublished && (
                    <span className="event-chip event-chip--draft">
                      Borrador
                    </span>
                  )}
                </div>

                <h3 className="event-title">{event.title}</h3>
                {event.location && (
                  <p className="event-location">{event.location}</p>
                )}

                {(event.startDate || event.date || event.start_date) && (
                  <p className="event-date">
                    {formatDateRange(
                      event.startDate || event.date || event.start_date,
                      event.endDate || event.end_date
                    )}
                  </p>
                )}

                {event.description && (
                  <p className="event-description">
                    {event.description.length > 140
                      ? event.description.slice(0, 140) + '…'
                      : event.description}
                  </p>
                )}

                <div className="event-meta">
                  <div>
                    <span className="event-label">Precio</span>
                    <span className="event-value">
                      Q{Number(event.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="event-label">Lugares</span>
                    <span className="event-value">
                      {soldOut ? 'Agotado' : remaining}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-full"
                  disabled={soldOut}
                  onClick={() => handleBuyTicket(event.id)}
                >
                  {soldOut ? 'Sin cupo' : 'Comprar ticket'}
                </button>
              </article>
            );
          })}
        </div>

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost"
              disabled={page === 1}
              onClick={() => handleChangePage(page - 1)}
            >
              ◀ Anterior
            </button>
            <span className="pagination-label">
              Página {page} de {totalPages}
            </span>
            <button
              className="btn btn-ghost"
              disabled={page === totalPages}
              onClick={() => handleChangePage(page + 1)}
            >
              Siguiente ▶
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
