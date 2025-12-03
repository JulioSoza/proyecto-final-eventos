//  src/api/client.js
import axios from 'axios';

export const api = axios.create({
  // puedes seguir usando la URL completa, está bien
  baseURL: 'http://localhost:3000/api'
});

// Interceptor: antes de cada request, agrega el token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
