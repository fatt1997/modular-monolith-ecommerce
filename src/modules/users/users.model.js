// src/modules/users/users.model.js
// หน้าที่: "ใบสเปกข้อมูล" — หน้าตาตาราง, กฎรูปแบบข้อมูล, การแปลงก่อนส่งออก
// ไม่มีการ query database ในไฟล์นี้

// 1. โครงตาราง (scripts/init-db.js ใช้สร้างตารางครั้งแรก)
const TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    name       VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// 2. กฎตรวจรูปแบบข้อมูลตอนสมัคร (คืน array ของปัญหาที่เจอ)
function validateRegister({ email, password }) {
  const errors = [];
  if (!email || !email.includes('@')) errors.push('Invalid email');
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
  return errors;
}

// 3. กฎตรวจรูปแบบข้อมูลตอนแก้โปรไฟล์
function validateUpdate({ name }) {
  const errors = [];
  if (name === undefined || name === null || String(name).trim() === '') {
    errors.push('Name is required');
  } else if (String(name).length > 100) {
    errors.push('Name must be at most 100 characters');
  }
  return errors;
}

// 4. แปลงข้อมูลก่อนส่งให้คนนอก (ตัด password ออก)
function toPublic(user) {
  const { password, ...rest } = user;
  return rest;
}

module.exports = { TABLE, validateRegister, validateUpdate, toPublic };
