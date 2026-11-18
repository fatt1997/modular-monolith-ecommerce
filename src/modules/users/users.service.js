// src/modules/users/users.service.js
// หน้าที่: "หัวหน้าเชฟ" — กฎธุรกิจทั้งหมดของ users อยู่ที่นี่
// ไม่มี req/res ไม่มี SQL (สั่ง repository แทน)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('./users.repository');
const model = require('./users.model');
const config = require('../../config');
const { AppError } = require('../../shared/utils');

async function register({ email, password, name }) {
  // กฎ 1: รูปแบบข้อมูลต้องถูกต้อง (ให้ model ตรวจ)
  const errors = model.validateRegister({ email, password });
  if (errors.length) {
    throw new AppError(400, errors.join(', '));
  }

  // กฎ 2: email ห้ามซ้ำ (ต้องถาม database)
  const existing = await repository.findByEmail(email);
  if (existing) {
    throw new AppError(409, 'Email already in use');
  }

  // กฎ 3: password ต้องเข้ารหัสก่อนเก็บ
  const hashed = await bcrypt.hash(password, 10);

  const user = await repository.create({ email, password: hashed, name });
  return model.toPublic(user);         // ส่งกลับแบบไม่มี password
}

async function login(email, password) {
  const user = await repository.findByEmail(email);
  const ok = user && await bcrypt.compare(password || '', user.password);
  if (!ok) {
    // ตอบข้อความเดียวกัน ไม่บอกว่าผิดที่ email หรือ password
    throw new AppError(401, 'Invalid email or password');
  }
  const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '1d' });
  return { token };
}

async function getById(id) {
  const user = await repository.findById(id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return model.toPublic(user);
}

async function updateProfile(id, { name }) {
  const errors = model.validateUpdate({ name });
  if (errors.length) {
    throw new AppError(400, errors.join(', '));
  }

  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError(404, 'User not found');
  }

  const user = await repository.update(id, { name: String(name).trim() });
  return model.toPublic(user);
}

module.exports = { register, login, getById, updateProfile };
