// src/shared/events/index.js
// หน้าที่: "กระดานประกาศ" ให้โมดูลคุยกันแบบไม่ต้องรู้จักกันตรงๆ
//   - โมดูลที่เกิดเรื่อง → events.emit('ชื่อเหตุการณ์', ข้อมูล)
//   - โมดูลที่สนใจ     → events.on('ชื่อเหตุการณ์', ฟังก์ชัน)
//
// เหตุการณ์ที่ใช้ในโปรเจกต์นี้:
//   order.created      (orders ประกาศ)   → payments ฟัง แล้วสร้างใบแจ้งชำระ
//   payment.completed  (payments ประกาศ) → orders ฟัง แล้วเปลี่ยนสถานะเป็น paid
const { EventEmitter } = require('events');

const emitter = new EventEmitter();

// ลงทะเบียนตัวฟัง — ห่อ try/catch ไว้ เพราะถ้าตัวฟังพัง ไม่ควรทำให้ทั้งแอปพัง
function on(eventName, handler) {
  emitter.on(eventName, async (payload) => {
    try {
      await handler(payload);
    } catch (err) {
      console.error(`[event:${eventName}] handler failed:`, err);
    }
  });
}

// ประกาศเหตุการณ์
function emit(eventName, payload) {
  emitter.emit(eventName, payload);
}

module.exports = { on, emit };
