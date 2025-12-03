// FRONTEND - src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { getCurrentUser } from '../api/auth';
import { buyTicket } from '../api/tickets';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Home() {
  const [currentUser, setCurrentUser] = useState(null);

  const [eventsData, setEventsData] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  async function loadEvents(options = {}) {
    setLoading(true);
    setError(null);

    try {
      const finalSearch = options.search ?? search;
      const finalPage = options.page ?? page;

      const params = {
        page: finalPage,
        pageSize: 6,
      };

      if (finalSearch && finalSearch.trim() !== '') {
        params.search = finalSearch.trim();
      }

      const res = await api.get('/events', { params });
      setEventsData(res.data);
      setPage(res.data.page);
    } catch (err) {
      console.error(err);
      setError('Error cargando eventos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user || null);
    loadEvents({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBuy(eventId) {
    setMessage(null);
    setError(null);

    if (!currentUser) {
      setError('Debes iniciar sesión para comprar un ticket');
      return;
    }

    try {
      await buyTicket(eventId);
      setMessage('Ticket comprado con éxito');
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Error al comprar ticket';
      setError(msg);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadEvents({ search, page: 1 });
  }

  function goToPage(newPage) {
    if (newPage < 1 || newPage > eventsData.totalPages) return;
    loadEvents({ page: newPage });
  }

  return (
    <div
      className="home-page"
      style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}
    >
      <header
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Eventos</h1>
          <p style={{ margin: 0, color: '#555' }}>
            Encuentra y compra tickets para tus eventos favoritos.
          </p>
        </div>
        <div>
          {currentUser ? (
            <span style={{ fontWeight: 500 }}>
              Hola, {currentUser.name} ({currentUser.role})
            </span>
          ) : (
            <span style={{ color: '#777' }}>No has iniciado sesión</span>
          )}
        </div>
      </header>

      <section
        style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          borderRadius: 8,
          border: '1px solid #eee',
          backgroundColor: '#fafafa',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
        >
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: 6,
              border: '1px solid #ccc',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.55rem 1.2rem',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Buscar
          </button>
        </form>
      </section>

      {message && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 6,
            backgroundColor: '#ecfdf3',
            color: '#166534',
            border: '1px solid #bbf7d0',
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 6,
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>Cargando eventos...</p>
      ) : eventsData.items.length === 0 ? (
        <p>No hay eventos disponibles.</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {eventsData.items.map((event) => (
              <article
                key={event.id}
                style={{
                  borderRadius: 12,
                  border: '1px solid #eee',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                }}
              >
                {event.imageUrl && (
                  <div
                    style={{ width: '100%', height: 180, overflow: 'hidden' }}
                  >
                    <img
                      src={`${API_BASE_URL}${event.imageUrl}`}
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    padding: '0.85rem 1rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h2
                    style={{
                      margin: '0 0 0.35rem',
                      fontSize: '1.05rem',
                    }}
                  >
                    {event.title}
                  </h2>
                  <p
                    style={{
                      margin: '0 0 0.5rem',
                      color: '#555',
                      fontSize: 14,
                    }}
                  >
                    {event.description}
                  </p>

                  <p
                    style={{
                      margin: '0 0 0.25rem',
                      fontSize: 13,
                      color: '#666',
                    }}
                  >
                    📍 {event.location}
                  </p>

                  {event.startDate && (
                    <p
                      style={{
                        margin: '0 0 0.25rem',
                        fontSize: 13,
                        color: '#666',
                      }}
                    >
                      🗓{' '}
                      {new Date(event.startDate).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  )}

                  <p
                    style={{
                      margin: '0.25rem 0',
                      fontSize: 14,
                    }}
                  >
                    💵 <strong>Q {Number(event.price).toFixed(2)}</strong>
                  </p>

                  <p
                    style={{
                      margin: '0 0 0.5rem',
                      fontSize: 13,
                      color: '#555',
                    }}
                  >
                    Capacidad:{' '}
                    <strong>
                      {event.remainingCapacity ?? event.capacity}/
                      {event.capacity}
                    </strong>
                  </p>

                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      onClick={() => handleBuy(event.id)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: 999,
                        border: 'none',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Comprar ticket
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 999,
                border: '1px solid #ddd',
                backgroundColor: page <= 1 ? '#f3f4f6' : 'white',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Anterior
            </button>
            <span style={{ fontSize: 14 }}>
              Página {eventsData.page} de {eventsData.totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= eventsData.totalPages}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 999,
                border: '1px solid #ddd',
                backgroundColor: page >= eventsData.totalPages ? '#f3f4f6' : 'white',
                cursor: page >= eventsData.totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
