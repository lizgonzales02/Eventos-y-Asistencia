// src/server.js
import express from 'express';
import cors from 'cors';
import eventosRoutes from './routes/eventos.routes.js';
import authRoutes from './routes/auth.routes.js';
import participantesRoutes from './routes/participantes.routes.js';
import asistenciasRoutes from './routes/asistencias.routes.js';
import { noEncontrado, manejadorErrores } from './middlewares/errores.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:4321' }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});

app.get('/api', (req, res) => {
  res.json({ mensaje: 'API de Eventos funcionando 🚀', version: '1.0.0' });
});

app.use('/api/eventos', eventosRoutes);
app.use('/api/participantes', participantesRoutes);
app.use('/api', asistenciasRoutes);
app.use('/api', authRoutes);

app.use(noEncontrado);
app.use(manejadorErrores);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
