// src/server.js
// หน้าที่: "ปุ่มเปิดร้าน" — โหลด config, ต่อ DB, เปิด port, ปิดอย่างสุภาพ
// ไม่มี routes หรือ logic ธุรกิจในไฟล์นี้
const config = require('./config');               // 1. โหลดค่าตั้งค่า
const db = require('./shared/database');          // 2. ตัวต่อ database
const app = require('./app');                     // 3. ตัวแอป (routes ทั้งหมด)

async function start() {
  try {
    await db.connect();                           // ต่อ DB ให้ได้ก่อน
    console.log('Database connected');

    const server = app.listen(config.port, () => { // เปิดรับ request
      console.log(`Server running on port ${config.port}`);
    });

    // 4. ปิดเครื่องอย่างสุภาพ เมื่อถูกสั่งปิด (Ctrl+C = SIGINT, ระบบสั่ง = SIGTERM)
    const shutdown = async () => {
      try {
        console.log('Shutting down...');
        server.close();                           // หยุดรับ request ใหม่
        await db.disconnect();                    // ปิด DB ให้เรียบร้อย
        process.exit(0);                          // ✅ ปิดปกติ
      } catch (err) {
        console.error('Shutdown failed:', err);
        process.exit(1);                          // ❌ ปิดไม่เรียบร้อย
      }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('Start failed:', err);          // ต่อ DB ไม่ได้ ก็ไม่เปิดร้าน
    process.exit(1);
  }
}

start();
