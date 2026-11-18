// src/modules/orders/index.js
// หน้าที่: "ประตูหน้าบ้าน" ของโมดูล orders
//   1. ส่ง routes ให้ app.js
//   2. เปิด public API ให้โมดูลอื่น
//   3. ลงทะเบียนว่าโมดูลนี้ฟัง event อะไรบ้าง
const routes = require('./orders.routes');
const service = require('./orders.service');
const events = require('../../shared/events');

// ฟัง: เมื่อ payments ประกาศว่าจ่ายเงินสำเร็จ → เปลี่ยนสถานะ order เป็น paid
events.on('payment.completed', ({ orderId }) => service.markPaid(orderId));

module.exports = {
  routes,

  // public API: ตอนนี้ยังไม่มีโมดูลไหนต้องเรียก orders ตรงๆ
  // (payments รู้ข้อมูลที่ต้องใช้จาก event 'order.created' แล้ว)
};
