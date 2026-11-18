// src/modules/products/products.repository.js
// หน้าที่: "คนดูแลคลัง" ของสินค้า — SQL อย่างเดียว (แตะได้แค่ตาราง products)
const db = require('../../shared/database');

async function findAll() {
  const [rows] = await db.query(
    'SELECT id, name, price, stock, created_at FROM products ORDER BY id'
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    'SELECT id, name, price, stock, created_at FROM products WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create({ name, price, stock }) {
  const [result] = await db.query(
    'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)',
    [name, price, stock]
  );
  return findById(result.insertId);
}

async function update(id, { name, price, stock }) {
  // COALESCE(?, คอลัมน์เดิม) = ถ้าไม่ได้ส่งค่ามา (null) ให้ใช้ค่าเดิม
  await db.query(
    `UPDATE products
     SET name = COALESCE(?, name),
         price = COALESCE(?, price),
         stock = COALESCE(?, stock)
     WHERE id = ?`,
    [name ?? null, price ?? null, stock ?? null, id]
  );
  return findById(id);
}

// ลด stock แบบปลอดภัย: ลดได้เฉพาะเมื่อ stock พอ (เช็กกับลดในคำสั่งเดียว)
// คืน true ถ้าลดสำเร็จ, false ถ้า stock ไม่พอ
async function decreaseStock(id, quantity) {
  const [result] = await db.query(
    'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
    [quantity, id, quantity]
  );
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, decreaseStock };
