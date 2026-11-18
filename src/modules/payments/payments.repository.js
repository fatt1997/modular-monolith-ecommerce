// src/modules/payments/payments.repository.js
// หน้าที่: SQL ของตาราง payments เท่านั้น
const db = require('../../shared/database');

const COLUMNS = 'id, order_id, user_id, amount, status, paid_at, created_at';

async function findById(id) {
  const [rows] = await db.query(`SELECT ${COLUMNS} FROM payments WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function findByOrderId(orderId) {
  const [rows] = await db.query(`SELECT ${COLUMNS} FROM payments WHERE order_id = ?`, [orderId]);
  return rows[0] || null;
}

async function create({ orderId, userId, amount, status }) {
  const [result] = await db.query(
    'INSERT INTO payments (order_id, user_id, amount, status) VALUES (?, ?, ?, ?)',
    [orderId, userId, amount, status]
  );
  return findById(result.insertId);
}

async function markPaid(id, status) {
  await db.query(
    'UPDATE payments SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id]
  );
  return findById(id);
}

module.exports = { findById, findByOrderId, create, markPaid };
