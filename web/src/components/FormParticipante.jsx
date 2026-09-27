// src/components/FormParticipante.jsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function FormParticipante() {
  const [form, setForm] = useState({ nombres: '', dni: '', correo: '' });
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [errorDni, setErrorDni] = useState('');

  async function cargar(q = busqueda) {
    try { setLista(await api.listarParticipantes(q)); }
    catch (e) { setMensaje({ tipo: 'error', texto: e.message }); }
  }

  useEffect(() => { cargar(''); }, []);

  function cambiar(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'dni') {
      if (value === '') setErrorDni('');
      else if (!/^\d*$/.test(value)) setErrorDni('El DNI solo debe tener números.');
      else if (value.length < 8) setErrorDni(`Faltan ${8 - value.length} dígito(s).`);
      else setErrorDni('');
    }
  }

  async function guardar(e) {
    e.preventDefault();
    if (errorDni) return;
    try {
      const nuevo = await api.crearParticipante({ ...form, correo: form.correo || null });
      setMensaje({ tipo: 'ok', texto: `✅ ${nuevo.nombres} registrado` });
      setForm({ nombres: '', dni: '', correo: '' });
      cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: `⚠️ ${err.message}` });
    }
  }

  async function eliminar(p) {
    if (!confirm(`¿Eliminar a "${p.nombres}"?`)) return;
    try {
      await api.eliminarParticipante(p.id);
      cargar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="dos-columnas">
      <form className="card form" onSubmit={guardar}>
        <h3>Nuevo participante</h3>
        <label>Nombres y apellidos*
          <input name="nombres" value={form.nombres} onChange={cambiar} required />
        </label>
        <label>DNI*
          <input name="dni" value={form.dni} onChange={cambiar}
            required pattern="\d{8}" maxLength={8} inputMode="numeric" />
        </label>
        {errorDni && <p className="error" style={{ margin: 0, fontSize: '0.85rem' }}>⚠️ {errorDni}</p>}
        <label>Correo
          <input type="email" name="correo" value={form.correo} onChange={cambiar} />
        </label>
        {mensaje.texto && <p className={mensaje.tipo}>{mensaje.texto}</p>}
        <button className="btn" disabled={!!errorDni}>Registrar</button>
      </form>

      <div className="card">
        <h3>Participantes ({lista.length})</h3>
        <input placeholder="Buscar por nombre o DNI…" value={busqueda}
          onChange={e => { setBusqueda(e.target.value); cargar(e.target.value); }} />
        <table>
          <thead><tr><th>Nombres</th><th>DNI</th><th>Correo</th><th></th></tr></thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id}>
                <td>{p.nombres}</td>
                <td>{p.dni}</td>
                <td>{p.correo || '—'}</td>
                <td><button className="btn peligro" onClick={() => eliminar(p)}>🗑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}