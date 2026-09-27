// src/components/TomarAsistencia.jsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function TomarAsistencia() {
  const [eventoId, setEventoId] = useState(null);
  const [datos, setDatos] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [dni, setDni] = useState('');
  const [aviso, setAviso] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    setEventoId(id);
  }, []);

  useEffect(() => {
    if (eventoId) {
      cargar();
      api.listarParticipantes().then(setParticipantes).catch(() => {});
    }
  }, [eventoId]);

  async function cargar() {
    try { setDatos(await api.verAsistencias(eventoId)); }
    catch (e) { setAviso({ tipo: 'error', texto: e.message }); }
  }

  async function ejecutar(accion, textoOk) {
    try {
      const r = await accion();
      setAviso({ tipo: 'ok', texto: r?.mensaje || textoOk });
      cargar();
    } catch (e) {
      setAviso({ tipo: 'error', texto: `⚠️ ${e.message}` });
    }
  }

  function inscribir(e) {
    e.preventDefault();
    if (!seleccionado) return;
    ejecutar(() => api.inscribir(eventoId, Number(seleccionado)), '✅ Participante inscrito');
    setSeleccionado('');
  }

  function marcarDni(e) {
    e.preventDefault();
    ejecutar(() => api.marcarPorDni(eventoId, dni.trim()));
    setDni('');
  }

    function verCertificados() {
    const presentes = asistencias.filter(a => a.estado === 'presente');
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html><head><title>Aptos para certificado - ${evento.titulo}</title></head>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h1>${evento.titulo}</h1>
        <h3>Participantes aptos para certificado (${presentes.length})</h3>
        <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
          <thead><tr><th>Nombres</th><th>DNI</th><th>Hora de registro</th></tr></thead>
          <tbody>
            ${presentes.map(p => `<tr><td>${p.nombres}</td><td>${p.dni}</td><td>${p.hora_registro || '—'}</td></tr>`).join('')}
          </tbody>
        </table>
      </body></html>
    `);
  }

  if (!eventoId) return <p className="error">Falta el parámetro ?id= en la URL.</p>;
  if (!datos) return <p>{aviso.texto || 'Cargando…'}</p>;

  const { evento, resumen, asistencias } = datos;
  const idsInscritos = asistencias.map(a => a.participante_id);
  const disponibles = participantes.filter(p => !idsInscritos.includes(p.id));

  return (
    <section>
      <h2>{evento.titulo}</h2>
      <p className="muted">📅 {evento.fecha} · 🕒 {evento.hora} · 📍 {evento.lugar}</p>

      <div className="stats">
        <div><strong>{resumen.inscritos}/{resumen.cupo}</strong><span>Inscritos</span></div>
        <div><strong>{resumen.presentes}</strong><span>Presentes</span></div>
        <div><strong>{resumen.ausentes}</strong><span>Ausentes</span></div>
        <div><strong>{resumen.porcentaje}%</strong><span>Asistencia</span></div>
      </div>
      <progress max="100" value={resumen.porcentaje} />

      {aviso.texto && <p className={aviso.tipo}>{aviso.texto}</p>}

      <div className="dos-columnas">
        <form className="card form" onSubmit={marcarDni}>
          <h3>Registrar ingreso por DNI</h3>
          <input value={dni} onChange={e => setDni(e.target.value)}
            placeholder="DNI de 8 dígitos" pattern="\d{8}" maxLength={8} inputMode="numeric" required autoFocus />
          <button className="btn">Marcar presente</button>
        </form>

        <form className="card form" onSubmit={inscribir}>
          <h3>Inscribir participante</h3>
          <select value={seleccionado} onChange={e => setSeleccionado(e.target.value)}>
            <option value="">— Selecciona —</option>
            {disponibles.map(p => (
              <option key={p.id} value={p.id}>{p.nombres} ({p.dni})</option>
            ))}
          </select>
          <button className="btn" disabled={!seleccionado}>Inscribir</button>
          <a href="/participantes">+ Registrar nuevo participante</a>
        </form>
      </div>

        <div className="card">
        <h3>Lista de asistencia
          <a className="btn" style={{ marginLeft: '1rem', fontSize: '0.85rem' }}
             href={`${import.meta.env.PUBLIC_API_URL}/eventos/${eventoId}/asistencias.csv`}>
            ⬇️ Descargar CSV
          </a>
          <button type="button" className="btn" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}
            onClick={verCertificados}>
            🎓 Ver aptos para certificado
          </button>
        </h3>
        {asistencias.length === 0 ? <p>Aún no hay inscritos.</p> : (
          <table>
            <thead>
              <tr><th>Participante</th><th>DNI</th><th>Estado</th><th>Hora</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {asistencias.map(a => (
                <tr key={a.id}>
                  <td>{a.nombres}</td>
                  <td>{a.dni}</td>
                  <td><span className={`badge ${a.estado}`}>{a.estado}</span></td>
                  <td>{a.hora_registro?.slice(11, 16) || '—'}</td>
                  <td className="acciones">
                    <button onClick={() => ejecutar(() => api.cambiarEstado(a.id, 'presente'), 'Marcado presente')}>✅</button>
                    <button onClick={() => ejecutar(() => api.cambiarEstado(a.id, 'ausente'), 'Marcado ausente')}>❌</button>
                    <button onClick={() => confirm('¿Anular inscripción?') && ejecutar(() => api.anularInscripcion(a.id), 'Inscripción anulada')}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}