// src/modules/users/index.js
// หน้าที่: "ประตูหน้าบ้าน" ของโมดูล users
// ไฟล์อื่นนอกโมดูล require ได้แค่ไฟล์นี้ — ห้ามเข้าไปหยิบไฟล์ข้างในตรงๆ
const routes = require('./users.routes');
const service = require('./users.service');

module.exports = {
  // ให้ app.js เอาไปเสียบ
  routes,

  // public API: ฟังก์ชันที่โมดูลอื่นเรียกได้ (เปิดเท่าที่จำเป็น)
  getUserById: service.getById,
};
