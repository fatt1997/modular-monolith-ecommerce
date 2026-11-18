// src/modules/products/index.js
// หน้าที่: "ประตูหน้าบ้าน" ของโมดูล products
const routes = require('./products.routes');
const service = require('./products.service');

module.exports = {
  routes,

  // public API: โมดูล orders ใช้ 2 ตัวนี้ตอนสร้างคำสั่งซื้อ
  getProductById: service.getById,
  decreaseStock: service.decreaseStock,
};
