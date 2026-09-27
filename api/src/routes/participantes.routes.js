// src/routes/participantes.routes.js
import { Router } from 'express';
import db from '../db.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

// GET /api/participantes?q=texto
router.get('/', (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const lista = db.prepare(`
    SELECT * FROM participantes
    WHERE nombres LIKE ? OR dni LIKE ?
    ORDER BY nombres
  `).all(q, q);
  res.json(lista);
});

// POST /api/participantes
router.post('/', verificarToken, (req, res) => {
  const { nombres, dni, correo = null } = req.body;
  const errores = [];

  if (!nombres || nombres.trim().length < 3) errores.push('Los nombres son obligatorios.');
  if (!/^\d{8}$/.test(dni || '')) errores.push('El DNI debe tener exactamente 8 dígitos.');
  if (correo && !/^\S+@\S+\.\S+$/.test(correo)) errores.push('El correo no es válido.');

  if (errores.length) return res.status(400).json({ errores });

  const r = db.prepare('INSERT INTO participantes (nombres, dni, correo) VALUES (?, ?, ?)')
    .run(nombres.trim(), dni, correo);

  res.status(201).json(db.prepare('SELECT * FROM participantes WHERE id = ?').get(r.lastInsertRowid));
});

// DELETE /api/participantes/:id
router.delete('/:id', verificarToken, (req, res) => {
  const r = db.prepare('DELETE FROM participantes WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Participante no encontrado' });
  res.status(204).end();
});

export default router;