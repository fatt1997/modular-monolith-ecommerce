// src/modules/orders/orders.service.js
// หน้าที่: กฎธุรกิจของคำสั่งซื้อ
// ตัวอย่างการคุยกับโมดูลอื่น 2 แบบ:
//   1. เรียกตรงผ่าน index.js  → products.getProductById(), products.decreaseStock()
//   2. ประกาศ event           → events.emit('order.created', ...)
const repository = require('./orders.repository');
const model = require('./orders.model');
const products = require('../products');           // ✅ require ประตูหน้าบ้าน (index.js)
const events = require('../../shared/events');
const { AppError } = require('../../shared/utils');

async function create(userId, { productId, quantity }) {
  // กฎ 1: รูปแบบข้อมูลต้องถูก
  const errors = model.validateCreate({ productId, quantity });
  if (errors.length) {
    throw new AppError(400, errors.join(', '));
  }

  // กฎ 2: สินค้าต้องมีอยู่จริง (ถามโมดูล products — ถ้าไม่มีจะ throw 404 มาเอง)
  const product = await products.getProductById(productId);

  // กฎ 3: stock ต้องพอ → ตัด stock (ถ้าไม่พอ products จะ throw 409 มาเอง)
  await products.decreaseStock(productId, quantity);

  // กฎ 4: ราคารวมคำนวณที่ server เสมอ ห้ามเชื่อราคาที่ลูกค้าส่งมา
  const totalPrice = Math.round(product.price * quantity * 100) / 100;

  // หมายเหตุ: ระบบจริงควรใช้ database transaction ครอบ "ตัด stock + สร้าง order"
  // เพื่อให้ถ้าขั้นใดพัง จะย้อนกลับทั้งหมด — ตัวอย่างนี้ตัดออกให้อ่านง่าย
  const order = await repository.create({
    userId,
    productId,
    quantity,
    totalPrice,
    status: model.STATUS.PENDING,
  });

  // ประกาศให้โมดูลอื่นรู้ (payments จะมาฟังแล้วสร้างใบแจ้งชำระ)
  // orders ไม่ต้องรู้ว่าใครฟังอยู่บ้าง
  events.emit('order.created', {
    orderId: order.id,
    userId: order.user_id,
    amount: Number(order.total_price),
  });

  return model.toPublic(order);
}

async function listMine(userId) {
  const orders = await repository.findByUserId(userId);
  return orders.map(model.toPublic);
}

async function getMine(userId, orderId) {
  const order = await repository.findById(orderId);
  // ไม่ใช่ของตัวเอง → ตอบ 404 เหมือนไม่มี (ไม่บอกว่ามี order นี้อยู่)
  if (!order || order.user_id !== userId) {
    throw new AppError(404, 'Order not found');
  }
  return model.toPublic(order);
}

// ถูกเรียกเมื่อได้ยิน event 'payment.completed' (ลงทะเบียนไว้ใน index.js)
async function markPaid(orderId) {
  const order = await repository.findById(orderId);
  if (!order || order.status === model.STATUS.PAID) {
    return;   // ไม่มี หรือจ่ายไปแล้ว → ไม่ต้องทำอะไร
  }
  await repository.updateStatus(orderId, model.STATUS.PAID);
}

module.exports = { create, listMine, getMine, markPaid };
