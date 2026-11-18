// src/modules/payments/payments.routes.js
// หน้าที่: ป้ายบอกทางของโซน /payments (app.js ใส่ authMiddleware ทั้งโซนแล้ว)
const express = require('express');
const controller = require('./payments.controller');

const router = express.Router();

router.get('/order/:orderId', controller.getByOrder);   // GET  /payments/order/7      ดูใบแจ้งชำระ
router.post('/order/:orderId/pay', controller.pay);     // POST /payments/order/7/pay  จ่ายเงิน

module.exports = router;
