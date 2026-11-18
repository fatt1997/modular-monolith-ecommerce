// src/shared/middlewares/index.js
// หน้าที่: รวม middleware ทั้งหมดไว้ที่เดียว
const authMiddleware = require('./auth');
const errorHandler = require('./errorHandler');

module.exports = { authMiddleware, errorHandler };
