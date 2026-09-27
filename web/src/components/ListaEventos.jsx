// src/components/ListaEventos.jsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function ListaEventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('');

  async function cargar() {
    try {
      setCargando(true);
      setEventos(await api.listarEventos(filtro));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, [filtro]);

  async function eliminar(ev) {
    if (!confirm(`¿Eliminar "${ev.titulo}" y todas sus inscripciones?`)) return;
    try {
      await api.eliminarEvento(ev.id);
      cargar();
    } catch (e) {
      alert(e.message);
    }
  }

  if (cargando) return <p>Cargando eventos…</p>;
  if (error) return <p className="error">⚠️ {error}. ¿Está encendida la API?</p>;

  const filtrados = eventos.filter(ev =>
    ev.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ marginBottom: '0.5rem' }}>
        <option value="">Todos los eventos</option>
        <option value="proximos">Próximos</option>
        <option value="pasados">Pasados</option>
      </select>

      <input
        placeholder="Buscar evento por título…"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />

      {eventos.length === 0 ? (
        <p>No hay eventos en esta categoría.</p>
      ) : filtrados.length === 0 ? (
        <p>No se encontraron eventos con ese título.</p>
      ) : (
        <div className="grid">
          {filtrados.map(ev => (
            <article key={ev.id} className="card">
              <h3>{ev.titulo}</h3>
              <p className="muted">📅 {ev.fecha} · 🕒 {ev.hora} · 📍 {ev.lugar}</p>
              {ev.descripcion && <p>{ev.descripcion}</p>}
              <p>
                <span className="badge">{ev.inscritos}/{ev.cupo} inscritos</span>{' '}
                <span className="badge ok">{ev.presentes} presentes</span>
              </p>
              <div className="acciones">
                <a className="btn" href={`/eventos/detalle?id=${ev.id}`}>Tomar asistencia</a>
                <a className="btn" href={`/eventos/editar?id=${ev.id}`} style={{ background: '#6b7280' }}>Editar</a>
                <button className="btn peligro" onClick={() => eliminar(ev)}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}