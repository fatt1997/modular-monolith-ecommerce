// src/modules/users/users.routes.js
// หน้าที่: "ป้ายบอกทาง" — URL + method ไหน → ไปหาฟังก์ชันไหนใน controller
// URL เต็ม = '/users' (จาก app.js) + path ในไฟล์นี้
const express = require('express');
const controller = require('./users.controller');
const { authMiddleware } = require('../../shared/middlewares');

const router = express.Router();

// ไม่ต้อง login
router.post('/register', controller.register);   // POST /users/register
router.post('/login', controller.login);         // POST /users/login

// ต้อง login ก่อน — /me ต้องอยู่ก่อน /:id เสมอ
router.get('/me', authMiddleware, controller.getMe);      // GET /users/me
router.put('/me', authMiddleware, controller.updateMe);   // PUT /users/me

// มีตัวแปรใน URL (รับกว้าง → ไว้ล่างสุด)
router.get('/:id', controller.getById);          // GET /users/5

module.exports = router;
