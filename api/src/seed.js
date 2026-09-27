// src/seed.js
import db from './db.js';

db.exec('DELETE FROM asistencias; DELETE FROM participantes; DELETE FROM eventos;');

const insEvento = db.prepare(`
  INSERT INTO eventos (titulo, descripcion, lugar, fecha, hora, cupo)
  VALUES (@titulo, @descripcion, @lugar, @fecha, @hora, @cupo)
`);

const insParticipante = db.prepare(
  'INSERT INTO participantes (nombres, dni, correo) VALUES (?, ?, ?)'
);

const cargar = db.transaction(() => {
  insEvento.run({ titulo: 'Taller de Git y GitHub', descripcion: 'Control de versiones desde cero',
    lugar: 'Laboratorio 3', fecha: '2026-10-05', hora: '09:00', cupo: 25 });
  insEvento.run({ titulo: 'Charla: IA en la industria', descripcion: 'Casos reales en empresas',
    lugar: 'Auditorio', fecha: '2026-10-12', hora: '16:00', cupo: 80 });

  insParticipante.run('Ana Torres Ríos', '71234567', 'ana@correo.com');
  insParticipante.run('Luis Pérez Soria', '72345678', 'luis@correo.com');
  insParticipante.run('María Flores Vela', '73456789', null);
});

cargar();
console.log('✅ Datos de prueba cargados');