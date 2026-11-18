// tests/setup.js
// หน้าที่: ตั้งค่า env ปลอมก่อนเทสทุกไฟล์ (Jest รันไฟล์นี้ก่อน — ตั้งไว้ใน package.json)
// เทสในโปรเจกต์นี้ไม่ต่อ database จริง จึงใส่ค่าอะไรก็ได้
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_NAME = 'test_db';
process.env.JWT_SECRET = 'test-secret';
