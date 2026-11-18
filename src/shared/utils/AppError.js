// src/shared/utils/AppError.js
// หน้าที่: error ที่มีเลข HTTP status ติดไปด้วย
// service ใช้ throw เมื่อผิดกฎ → errorHandler อ่าน status แล้วตอบลูกค้า
class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;   // เช่น 400, 401, 403, 404, 409
  }
}

module.exports = AppError;
