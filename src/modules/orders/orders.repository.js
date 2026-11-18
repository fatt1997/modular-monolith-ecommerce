// src/modules/orders/orders.repository.js
// หน้าที่: SQL ของตาราง orders เท่านั้น
// ห้าม JOIN ไปตาราง users หรือ products — ต้องการข้อมูลโมดูลอื่นให้ขอผ่าน index.js ของเขา
const db = require('../../shared/database');

const COLUMNS = 'id, user_id, product_id, quantity, total_price, status, created_at';

async function findById(id) {
  const [rows] = await db.query(`SELECT ${COLUMNS} FROM orders WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function findByUserId(userId) {
  const [rows] = await db.query(
    `SELECT ${COLUMNS} FROM orders WHERE user_id = ? ORDER BY id DESC`,
    [userId]
  );
  return rows;
}

async function create({ userId, productId, quantity, totalPrice, status }) {
  const [result] = await db.query(
    'INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
    [userId, productId, quantity, totalPrice, status]
  );
  return findById(result.insertId);
}

async function updateStatus(id, status) {
  await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
}

module.exports = { findById, findByUserId, create, updateStatus };
