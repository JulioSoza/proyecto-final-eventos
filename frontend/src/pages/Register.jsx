// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      });

      setMessage('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Error al registrar usuario';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '4rem',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480, padding: '0 1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Registro</h1>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', color: '#9ca3af' }}>
          Crea tu cuenta para poder iniciar sesión y comprar tickets.
        </p>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="name"
              style={{ display: 'block', marginBottom: '0.25rem', fontSize: 14 }}
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                border: '1px solid #4b5563',
                backgroundColor: '#020617',
                color: 'white',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', marginBottom: '0.25rem', fontSize: 14 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                border: '1px solid #4b5563',
                backgroundColor: '#020617',
                color: 'white',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: '0.25rem', fontSize: 14 }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                border: '1px solid #4b5563',
                backgroundColor: '#020617',
                color: 'white',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.6rem 1.2rem',
              borderRadius: 6,
              border: 'none',
              backgroundColor: loading ? '#4b5563' : '#4f46e5',
              color: 'white',
              fontWeight: 500,
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
