// src/shared/database/index.js
// หน้าที่: connection กลางไปยัง MySQL — ทุกโมดูลใช้ตัวนี้ร่วมกัน
// ไม่มี SQL ของโมดูลไหนในไฟล์นี้ (SQL อยู่ใน repository ของแต่ละโมดูล)
const mysql = require('mysql2/promise');
const config = require('../../config');

let pool = null;   // เก็บ pool ไว้ใช้ทั้งแอป (สร้างครั้งเดียว)

// เปิด connection pool แล้วลองคุยกับ DB 1 ครั้ง ถ้าไม่ได้ → throw
async function connect() {
  pool = mysql.createPool({
    ...config.db,
    waitForConnections: true,
    connectionLimit: 10,
  });
  await pool.query('SELECT 1');
}

// ใช้แทน pool.query ทุกที่ → repository เรียก db.query(sql, params)
async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database not connected. Call db.connect() first.');
  }
  return pool.query(sql, params);
}

// ปิด pool ตอน shutdown
async function disconnect() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { connect, query, disconnect };
