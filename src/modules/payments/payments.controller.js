// src/modules/payments/payments.controller.js
// หน้าที่: แกะ req → เรียก service → ตอบ res
// ทุก route ในโซนนี้ผ่าน authMiddleware แล้ว (ใส่ไว้ใน app.js)
const service = require('./payments.service');

async function getByOrder(req, res, next) {
  try {
    const payment = await service.getMineByOrderId(req.user.id, Number(req.params.orderId));
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

async function pay(req, res, next) {
  try {
    const payment = await service.pay(req.user.id, Number(req.params.orderId));
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

module.exports = { getByOrder, pay };
