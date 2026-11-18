// src/config/index.js
// หน้าที่: "สมุดตั้งค่าของร้าน" — อ่านค่าจาก .env มาแจกจ่ายให้ไฟล์อื่น
require('dotenv').config();   // อ่าน .env แล้วใส่เข้า process.env

// เช็กก่อนว่าค่าสำคัญมีครบไหม ขาดตัวไหน → ไม่ยอมเปิดร้าน
const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env: ${key}`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,   // ไม่มีค่า ใช้ 3000 แทน
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
};
