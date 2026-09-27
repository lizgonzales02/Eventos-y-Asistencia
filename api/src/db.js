import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const carpeta = path.resolve('data');
if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta);
const db = new Database(path.join(carpeta, 'eventos.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON')
db.exec(`
  CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    lugar TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    cupo INTEGER NOT NULL DEFAULT 30 CHECK (cupo > 0),
    creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS participantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres TEXT NOT NULL,
    dni TEXT NOT NULL UNIQUE CHECK (length(dni) = 8),
    correo TEXT,
    creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS asistencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    participante_id INTEGER NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    estado TEXT NOT NULL DEFAULT 'inscrito'
      CHECK (estado IN ('inscrito','presente','ausente')),
    hora_registro TEXT,
    UNIQUE (evento_id, participante_id)
  );
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  

`);

export default db;