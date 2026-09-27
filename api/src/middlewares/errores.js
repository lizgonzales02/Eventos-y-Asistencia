// src/middlewares/errores.js
export function noEncontrado(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function manejadorErrores(err, req, res, next) {
  console.error('❌', err.message);

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'El registro ya existe (dato duplicado).' });
  }
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({ error: 'Referencia inválida a otro registro.' });
  }

  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
}