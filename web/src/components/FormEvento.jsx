// src/components/FormEvento.jsx
import { useState } from 'react';
import { api } from '../lib/api.js';

const VACIO = { titulo: '', descripcion: '', lugar: '', fecha: '', hora: '', cupo: 30 };

export default function FormEvento() {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await api.crearEvento({ ...form, cupo: Number(form.cupo) });
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card form" onSubmit={guardar}>
      <label>Título*
        <input name="titulo" value={form.titulo} onChange={cambiar} required minLength={3} />
      </label>
      <label>Descripción
        <textarea name="descripcion" value={form.descripcion} onChange={cambiar} rows={3} />
      </label>
      <label>Lugar*
        <input name="lugar" value={form.lugar} onChange={cambiar} required />
      </label>
      <div className="fila">
        <label>Fecha*
          <input type="date" name="fecha" value={form.fecha} onChange={cambiar} required />
        </label>
        <label>Hora*
          <input type="time" name="hora" value={form.hora} onChange={cambiar} required />
        </label>
        <label>Cupo*
          <input type="number" name="cupo" min="1" value={form.cupo} onChange={cambiar} required />
        </label>
      </div>
      {error && <p className="error">⚠️ {error}</p>}
      <button className="btn" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar evento'}
      </button>
    </form>
  );
}