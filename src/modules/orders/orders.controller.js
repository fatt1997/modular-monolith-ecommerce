// src/modules/orders/orders.controller.js
// หน้าที่: แกะ req → เรียก service → ตอบ res
// ทุก route ในโซนนี้ผ่าน authMiddleware แล้ว (ใส่ไว้ใน app.js) → มี req.user เสมอ
const service = require('./orders.service');

async function create(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const order = await service.create(req.user.id, { productId, quantity });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const orders = await service.listMine(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const order = await service.getMine(req.user.id, Number(req.params.id));
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listMine, getMine };
