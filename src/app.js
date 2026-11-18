// src/app.js
// หน้าที่: "แผนผังร้าน" — ด่านที่ทุก request ต้องผ่าน + แบ่งโซน URL ไปให้แต่ละโมดูล
// ไม่มี app.listen ในไฟล์นี้ (เป็นหน้าที่ของ server.js) → เทสดึงไฟล์นี้ไปใช้ได้เลย
const express = require('express');
const { authMiddleware, errorHandler } = require('./shared/middlewares');

// ดึงจาก "ประตูหน้าบ้าน" (index.js) ของแต่ละโมดูลเท่านั้น
const users = require('./modules/users');
const products = require('./modules/products');
const orders = require('./modules/orders');
const payments = require('./modules/payments');

const app = express();

// 1. ด่านแรก: ทุก request ต้องผ่าน
app.use(express.json());              // แปลง body ที่เป็น JSON ให้อ่านได้

// 2. เช็กว่าร้านยังเปิดอยู่ไหม (ไม่ต้อง login)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 3. แบ่งโซน: URL ขึ้นต้นด้วยอะไร → ส่งไปโมดูลไหน
app.use('/users', users.routes);
app.use('/products', products.routes);
app.use('/orders', authMiddleware, orders.routes);     // ต้อง login ก่อนทั้งโซน
app.use('/payments', authMiddleware, payments.routes); // ต้อง login ก่อนทั้งโซน

// 4. หาไม่เจอ: URL ไม่ตรงโซนไหนเลย (ต้องอยู่หลัง routes ทั้งหมด)
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// 5. ด่านสุดท้าย: จับ error ทุกตัวที่หลุดมา (ต้องอยู่ล่างสุด)
app.use(errorHandler);

module.exports = app;
