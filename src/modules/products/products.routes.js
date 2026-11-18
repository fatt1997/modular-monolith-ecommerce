// src/modules/products/products.routes.js
// หน้าที่: ป้ายบอกทางของโซน /products
const express = require('express');
const controller = require('./products.controller');
const { authMiddleware } = require('../../shared/middlewares');

const router = express.Router();

// ดูสินค้า: ไม่ต้อง login
router.get('/', controller.list);              // GET /products
router.get('/:id', controller.getById);        // GET /products/3

// เพิ่ม/แก้สินค้า: ต้อง login
// (ระบบจริงควรเช็กว่าเป็น admin ด้วย — ตัวอย่างนี้ตัดออกให้เรียบง่าย)
router.post('/', authMiddleware, controller.create);       // POST /products
router.put('/:id', authMiddleware, controller.update);     // PUT /products/3

module.exports = router;
