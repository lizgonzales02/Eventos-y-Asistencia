// src/components/Login.jsx
import { useState } from 'react';
import { api } from '../lib/api.js';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function entrar(e) {
    e.preventDefault();
    setError('');
    try {
      const r = await api.login(usuario, password);
      localStorage.setItem('token', r.token);
      localStorage.setItem('usuario', r.usuario);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card form" onSubmit={entrar} style={{ maxWidth: 360 }}>
      <label>Usuario
        <input value={usuario} onChange={e => setUsuario(e.target.value)} required />
      </label>
      <label>Contraseña
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </label>
      {error && <p className="error">⚠️ {error}</p>}
      <button className="btn">Iniciar sesión</button>
    </form>
  );
}