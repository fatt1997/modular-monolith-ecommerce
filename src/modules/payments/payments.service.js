// src/modules/payments/payments.service.js
// หน้าที่: กฎธุรกิจของการชำระเงิน
// สังเกต: ไฟล์นี้ไม่ require โมดูล orders เลย — ข้อมูลที่ต้องใช้ได้มาจาก event
const repository = require('./payments.repository');
const model = require('./payments.model');
const events = require('../../shared/events');
const { AppError } = require('../../shared/utils');

// ถูกเรียกเมื่อได้ยิน event 'order.created' (ลงทะเบียนไว้ใน index.js)
async function createForOrder({ orderId, userId, amount }) {
  const existing = await repository.findByOrderId(orderId);
  if (existing) {
    return model.toPublic(existing);   // มีอยู่แล้ว ไม่สร้างซ้ำ
  }
  const payment = await repository.create({
    orderId,
    userId,
    amount,
    status: model.STATUS.PENDING,
  });
  return model.toPublic(payment);
}

// หาใบแจ้งชำระของ order — ต้องเป็นของ user คนนี้เท่านั้น
async function getMineByOrderId(userId, orderId) {
  const payment = await repository.findByOrderId(orderId);
  if (!payment || payment.user_id !== userId) {
    throw new AppError(404, 'Payment not found');
  }
  return model.toPublic(payment);
}

async function pay(userId, orderId) {
  const payment = await repository.findByOrderId(orderId);

  // กฎ 1: ต้องมีใบแจ้งชำระ และเป็นของตัวเอง
  if (!payment || payment.user_id !== userId) {
    throw new AppError(404, 'Payment not found');
  }

  // กฎ 2: ห้ามจ่ายซ้ำ
  if (payment.status === model.STATUS.PAID) {
    throw new AppError(409, 'Already paid');
  }

  // ระบบจริง: ตรงนี้จะเรียก payment gateway (เช่น Omise, Stripe) ให้ตัดเงิน
  // ตัวอย่างนี้สมมติว่าตัดเงินสำเร็จเสมอ

  const updated = await repository.markPaid(payment.id, model.STATUS.PAID);

  // ประกาศให้โมดูลอื่นรู้ (orders จะมาฟังแล้วเปลี่ยนสถานะเป็น paid)
  events.emit('payment.completed', {
    orderId: updated.order_id,
    paymentId: updated.id,
  });

  return model.toPublic(updated);
}

module.exports = { createForOrder, getMineByOrderId, pay };
