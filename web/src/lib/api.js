// src/lib/api.js
const BASE = import.meta.env.PUBLIC_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

async function request(ruta, opciones = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`${BASE}${ruta}`, {
    headers,
    ...opciones,
  });

  if (resp.status === 204) return null;

  const datos = await resp.json();
  if (!resp.ok) {
    const mensaje = datos.errores ? datos.errores.join(' ') : datos.error;
    throw new Error(mensaje || `Error ${resp.status}`);
  }
  return datos;
}

export const api = {
  login: (usuario, password) => request('/login', { method: 'POST', body: JSON.stringify({ usuario, password }) }),

  listarEventos: (estado = '') => request(`/eventos${estado ? `?estado=${estado}` : ''}`),
  obtenerEvento: (id) => request(`/eventos/${id}`),
  crearEvento: (evento) => request('/eventos', { method: 'POST', body: JSON.stringify(evento) }),
  actualizarEvento: (id, ev) => request(`/eventos/${id}`, { method: 'PUT', body: JSON.stringify(ev) }),
  eliminarEvento: (id) => request(`/eventos/${id}`, { method: 'DELETE' }),

  listarParticipantes: (q = '') => request(`/participantes?q=${encodeURIComponent(q)}`),
  crearParticipante: (p) => request('/participantes', { method: 'POST', body: JSON.stringify(p) }),
  eliminarParticipante: (id) => request(`/participantes/${id}`, { method: 'DELETE' }),

  verAsistencias: (eventoId) => request(`/eventos/${eventoId}/asistencias`),
  inscribir: (eventoId, partId) =>
    request(`/eventos/${eventoId}/inscripciones`, { method: 'POST', body: JSON.stringify({ participante_id: partId }) }),
  marcarPorDni: (eventoId, dni) =>
    request(`/eventos/${eventoId}/marcar-por-dni`, { method: 'POST', body: JSON.stringify({ dni }) }),
  cambiarEstado: (asistId, estado) =>
    request(`/asistencias/${asistId}`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  anularInscripcion: (asistId) => request(`/asistencias/${asistId}`, { method: 'DELETE' }),
};