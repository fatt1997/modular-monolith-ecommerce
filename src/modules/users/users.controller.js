// src/modules/users/users.controller.js
// หน้าที่: "พนักงานหน้าร้าน" — แกะ req → เรียก service → ตอบ res
// ไม่มีกฎธุรกิจ ไม่มี SQL
const service = require('./users.service');

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;               // 1. รับของ
    const user = await service.register({ email, password, name }); // 2. ส่งต่อ
    res.status(201).json(user);                               // 3. ตอบกลับ (201 = สร้างสำเร็จ)
  } catch (err) {
    next(err);                                                // มีปัญหา → ส่งให้ errorHandler
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await service.login(email, password);
    res.json(result);                                         // { token: '...' }
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await service.getById(req.user.id);          // req.user มาจาก authMiddleware
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name } = req.body;
    const user = await service.updateProfile(req.user.id, { name });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await service.getById(req.params.id);        // id จาก URL /users/:id
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, updateMe, getById };
