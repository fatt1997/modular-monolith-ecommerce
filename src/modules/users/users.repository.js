// src/modules/users/users.repository.js
// หน้าที่: "คนดูแลคลัง" — คุยกับ database อย่างเดียว (แตะได้แค่ตาราง users)
// ไม่มีกฎธุรกิจ ไม่ throw AppError ไม่รู้จัก req/res
const db = require('../../shared/database');

async function findById(id) {
  const [rows] = await db.query(
    'SELECT id, email, password, name, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;              // ไม่เจอ → คืน null ให้ service ตัดสินใจ
}

async function findByEmail(email) {
  const [rows] = await db.query(
    'SELECT id, email, password, name, created_at FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function create({ email, password, name }) {
  const [result] = await db.query(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, password, name || null]
  );
  return findById(result.insertId);    // คืนข้อมูลที่เพิ่งสร้าง
}

async function update(id, { name }) {
  await db.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
  return findById(id);
}

module.exports = { findById, findByEmail, create, update };
