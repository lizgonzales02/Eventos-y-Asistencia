// src/middlewares/auth.js
import jwt from 'jsonwebtoken';

const SECRETO = 'clave-secreta-senati-2026'; // en producción esto va en una variable de entorno

export function generarToken(usuario) {
  return jwt.sign({ usuario }, SECRETO, { expiresIn: '2h' });
}

export function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = header.split(' ')[1];
  try {
    req.usuario = jwt.verify(token, SECRETO);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}