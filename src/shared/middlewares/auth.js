// src/shared/middlewares/auth.js
// หน้าที่: ด่านตรวจ login — อ่าน token จาก header แล้วใส่ req.user ให้ controller ใช้
// ใช้ได้กับทุกโมดูล จึงอยู่ใน shared
const jwt = require('jsonwebtoken');
const config = require('../../config');
const { AppError } = require('../utils');

function authMiddleware(req, res, next) {
  // header ต้องหน้าตาแบบนี้: Authorization: Bearer <token>
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError(401, 'Login required'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret); // ปลอมหรือหมดอายุ → throw
    req.user = { id: payload.id };                        // ส่งต่อให้ controller
    next();
  } catch (err) {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

module.exports = authMiddleware;
