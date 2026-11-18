// src/shared/middlewares/errorHandler.js
// หน้าที่: "ตาข่ายรองรับ" error จากทุกโมดูล → ตอบลูกค้าในรูปแบบเดียวกันหมด
// Express รู้ว่าเป็น error handler เพราะมี 4 พารามิเตอร์ (err, req, res, next)
const { AppError } = require('../utils');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // 1. error ที่เราตั้งใจ throw เอง (ผิดกฎธุรกิจ)
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // 2. body ที่ส่งมาไม่ใช่ JSON ที่ถูกต้อง
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // 3. database กันข้อมูลซ้ำ (UNIQUE) — กันกรณีหลุดการเช็กใน service
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate data' });
  }

  // 4. error ที่ไม่คาดคิด → log ไว้ดูเอง แต่ไม่บอกรายละเอียดลูกค้า
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
