// src/routes/auth.routes.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generarToken } from '../middlewares/auth.js';

const router = Router();

// POST /api/login
router.post('/login', (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
  }

  const fila = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario);
  if (!fila || !bcrypt.compareSync(password, fila.password_hash)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  const token = generarToken(usuario);
  res.json({ token, usuario });
});

export default router;