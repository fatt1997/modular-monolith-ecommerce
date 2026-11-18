// src/modules/payments/index.js
// หน้าที่: "ประตูหน้าบ้าน" ของโมดูล payments
const routes = require('./payments.routes');
const service = require('./payments.service');
const events = require('../../shared/events');

// ฟัง: เมื่อ orders ประกาศว่ามีคำสั่งซื้อใหม่ → สร้างใบแจ้งชำระรอไว้
events.on('order.created', (payload) => service.createForOrder(payload));

module.exports = {
  routes,

  // public API: ยังไม่มีโมดูลไหนต้องเรียก payments ตรงๆ
};
