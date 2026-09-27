// src/routes/asistencias.routes.js
import { Router } from 'express';
import db from '../db.js';
import { verificarToken } from '../middlewares/auth.js';
const router = Router();
const ESTADOS = ['inscrito', 'presente', 'ausente'];

function obtenerEvento(id, res) {
  const evento = db.prepare('SELECT * FROM eventos WHERE id = ?').get(id);
  if (!evento) res.status(404).json({ error: 'Evento no encontrado' });
  return evento;
}
// GET /api/eventos/:id/asistencias.csv
router.get('/eventos/:id/asistencias.csv',  (req, res) => { 
  const evento = obtenerEvento(req.params.id, res);
  if (!evento) return;

  const lista = db.prepare(`
    SELECT p.nombres, p.dni, p.correo, a.estado, a.hora_registro
    FROM asistencias a
    JOIN participantes p ON p.id = a.participante_id
    WHERE a.evento_id = ?
    ORDER BY p.nombres
  `).all(evento.id);

  const encabezado = 'Nombres,DNI,Correo,Estado,Hora de registro\n';
  const filas = lista.map(p =>
    `"${p.nombres}","${p.dni}","${p.correo || ''}","${p.estado}","${p.hora_registro || ''}"`
  ).join('\n');

  res.type('text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="asistencia_evento_${evento.id}.csv"`);
  res.send(encabezado + filas);
});


// GET /api/eventos/:id/asistencias
router.get('/eventos/:id/asistencias',  (req, res) => {
  const evento = obtenerEvento(req.params.id, res);
  if (!evento) return;

  const lista = db.prepare(`
    SELECT a.id, a.estado, a.hora_registro,
      p.id AS participante_id, p.nombres, p.dni, p.correo
    FROM asistencias a
    JOIN participantes p ON p.id = a.participante_id
    WHERE a.evento_id = ?
    ORDER BY p.nombres
  `).all(evento.id);

  const resumen = {
    cupo: evento.cupo,
    inscritos: lista.length,
    presentes: lista.filter(x => x.estado === 'presente').length,
    ausentes: lista.filter(x => x.estado === 'ausente').length,
  };
  resumen.porcentaje = resumen.inscritos
    ? Math.round((resumen.presentes / resumen.inscritos) * 100)
    : 0;

  res.json({ evento, resumen, asistencias: lista });
});



// POST /api/eventos/:id/inscripciones
router.post('/eventos/:id/inscripciones', verificarToken,(req, res) => {
  const evento = obtenerEvento(req.params.id, res);
  if (!evento) return;

  const { participante_id } = req.body;
  if (!participante_id) return res.status(400).json({ error: 'participante_id es obligatorio' });

  const { total } = db.prepare('SELECT COUNT(*) AS total FROM asistencias WHERE evento_id = ?')
    .get(evento.id);
  if (total >= evento.cupo) return res.status(409).json({ error: 'El evento ya no tiene cupos.' });

  const r = db.prepare('INSERT INTO asistencias (evento_id, participante_id) VALUES (?, ?)')
    .run(evento.id, participante_id);

  res.status(201).json(db.prepare('SELECT * FROM asistencias WHERE id = ?').get(r.lastInsertRowid));
});

// POST /api/eventos/:id/marcar-por-dni
router.post('/eventos/:id/marcar-por-dni',verificarToken, (req, res) => {
  const evento = obtenerEvento(req.params.id, res);
  if (!evento) return;

  const fila = db.prepare(`
    SELECT a.id, p.nombres FROM asistencias a
    JOIN participantes p ON p.id = a.participante_id
    WHERE a.evento_id = ? AND p.dni = ?
  `).get(evento.id, req.body.dni);

  if (!fila) return res.status(404).json({ error: 'Ese DNI no está inscrito en este evento.' });

  db.prepare(`UPDATE asistencias SET estado = 'presente', hora_registro = datetime('now','localtime')
    WHERE id = ?`).run(fila.id);

  res.json({ mensaje: `Asistencia registrada: ${fila.nombres}` });
});

// PATCH /api/asistencias/:id
router.patch('/asistencias/:id', verificarToken,(req, res) => {
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Use: ${ESTADOS.join(', ')}` });
  }

  const hora = estado === 'presente' ? "datetime('now','localtime')" : 'NULL';
  const r = db.prepare(`UPDATE asistencias SET estado = ?, hora_registro = ${hora} WHERE id = ?`)
    .run(estado, req.params.id);

  if (r.changes === 0) return res.status(404).json({ error: 'Registro no encontrado' });
  res.json(db.prepare('SELECT * FROM asistencias WHERE id = ?').get(req.params.id));
});

// DELETE /api/asistencias/:id
router.delete('/asistencias/:id', verificarToken,(req, res) => {
  const r = db.prepare('DELETE FROM asistencias WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Registro no encontrado' });
  res.status(204).end();
});

export default router;