// src/routes/eventos.routes.js
import { Router } from 'express';
import db from '../db.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

function validarEvento(body) {
  const errores = [];
  const { titulo, lugar, fecha, hora, cupo } = body;

  if (!titulo || titulo.trim().length < 3) errores.push('El título debe tener al menos 3 caracteres.');
  if (!lugar || !lugar.trim()) errores.push('El lugar es obligatorio.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) errores.push('La fecha debe tener formato AAAA-MM-DD.');
  if (!/^\d{2}:\d{2}$/.test(hora || '')) errores.push('La hora debe tener formato HH:MM.');
  if (cupo !== undefined && (!Number.isInteger(Number(cupo)) || Number(cupo) <= 0)) {
    errores.push('El cupo debe ser un número entero mayor que 0.');
  }
  return errores;
}

// GET /api/eventos
// GET /api/eventos?estado=proximos|pasados
router.get('/', (req, res) => {
  const { estado } = req.query;
  let condicion = '';
  if (estado === 'proximos') condicion = "WHERE e.fecha >= date('now')";
  if (estado === 'pasados') condicion = "WHERE e.fecha < date('now')";

  const eventos = db.prepare(`
    SELECT e.*,
      COUNT(a.id) AS inscritos,
      SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) AS presentes
    FROM eventos e
    LEFT JOIN asistencias a ON a.evento_id = e.id
    ${condicion}
    GROUP BY e.id
    ORDER BY e.fecha, e.hora
  `).all();

  res.json(eventos.map(e => ({ ...e, presentes: e.presentes ?? 0 })));
}); 
// GET /api/eventos/:id
router.get('/:id', (req, res) => {
  const evento = db.prepare('SELECT * FROM eventos WHERE id = ?').get(req.params.id);
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json(evento);
});

// POST /api/eventos
router.post('/', verificarToken, (req, res) => {
  const errores = validarEvento(req.body);
  if (errores.length) return res.status(400).json({ errores });

  const { titulo, descripcion = '', lugar, fecha, hora, cupo = 30 } = req.body;
  const resultado = db.prepare(`
    INSERT INTO eventos (titulo, descripcion, lugar, fecha, hora, cupo)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(titulo.trim(), descripcion.trim(), lugar.trim(), fecha, hora, Number(cupo));

  const nuevo = db.prepare('SELECT * FROM eventos WHERE id = ?').get(resultado.lastInsertRowid);
  res.status(201).json(nuevo);
});

// PUT /api/eventos/:id
router.put('/:id', verificarToken, (req, res) => {
  const errores = validarEvento(req.body);
  if (errores.length) return res.status(400).json({ errores });

  const { titulo, descripcion = '', lugar, fecha, hora, cupo = 30 } = req.body;
  const resultado = db.prepare(`
    UPDATE eventos
    SET titulo = ?, descripcion = ?, lugar = ?, fecha = ?, hora = ?, cupo = ?
    WHERE id = ?
  `).run(titulo.trim(), descripcion.trim(), lugar.trim(), fecha, hora, Number(cupo), req.params.id);

  if (resultado.changes === 0) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json(db.prepare('SELECT * FROM eventos WHERE id = ?').get(req.params.id));
});

// DELETE /api/eventos/:id
router.delete('/:id', verificarToken, (req, res) => {
  const resultado = db.prepare('DELETE FROM eventos WHERE id = ?').run(req.params.id);
  if (resultado.changes === 0) return res.status(404).json({ error: 'Evento no encontrado' });
  res.status(204).end();
});

export default router;

