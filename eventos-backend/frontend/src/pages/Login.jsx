import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginRequest(email, password);
      // data = { token, user }

      // Guardamos token y user en localStorage para usarlo después
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Por ahora solo redirigimos a Home
      navigate('/');
    } catch (err) {
      console.error(err);
      // Mensaje simple, puedes afinarlo si quieres
      setError('Credenciales inválidas o error en el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <h1 className="page-title">Login</h1>
      <p className="page-subtitle">
        Usa las mismas credenciales con las que has probado el login en Postman.
      </p>

      {error && (
        <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;
