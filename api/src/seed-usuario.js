// src/seed-usuario.js
import bcrypt from 'bcryptjs';
import db from './db.js';

const usuario = 'admin';
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

try {
  db.prepare('INSERT INTO usuarios (usuario, password_hash) VALUES (?, ?)').run(usuario, hash);
  console.log(`✅ Usuario creado: ${usuario} / ${password}`);
} catch (e) {
  console.log('⚠️ Ese usuario ya existe:', e.message);
}