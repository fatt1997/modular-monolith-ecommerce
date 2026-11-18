// src/modules/orders/orders.routes.js
// หน้าที่: ป้ายบอกทางของโซน /orders
// ไม่ต้องใส่ authMiddleware ที่นี่ เพราะ app.js ใส่ไว้ทั้งโซนแล้ว
const express = require('express');
const controller = require('./orders.controller');

const router = express.Router();

router.post('/', controller.create);       // POST /orders      สั่งซื้อ
router.get('/', controller.listMine);      // GET  /orders      ดูคำสั่งซื้อของฉัน
router.get('/:id', controller.getMine);    // GET  /orders/7    ดูคำสั่งซื้อ 1 รายการ

module.exports = router;
