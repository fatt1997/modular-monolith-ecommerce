// src/modules/products/products.model.js
// หน้าที่: "ใบสเปกข้อมูล" ของสินค้า — หน้าตาตาราง, กฎรูปแบบข้อมูล, การแปลงก่อนส่งออก

// 1. โครงตาราง
const TABLE = `
  CREATE TABLE IF NOT EXISTS products (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    stock      INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// 2. กฎตรวจรูปแบบข้อมูลตอนสร้างสินค้า (ทุกช่องต้องมี)
function validateCreate({ name, price, stock }) {
  const errors = [];
  if (!name || String(name).trim() === '') errors.push('Name is required');
  if (typeof price !== 'number' || price <= 0) errors.push('Price must be a number greater than 0');
  if (!Number.isInteger(stock) || stock < 0) errors.push('Stock must be an integer 0 or more');
  return errors;
}

// 3. กฎตรวจรูปแบบข้อมูลตอนแก้สินค้า (ส่งมาแค่บางช่องได้ แต่ช่องที่ส่งต้องถูก)
function validateUpdate({ name, price, stock }) {
  const errors = [];
  if (name === undefined && price === undefined && stock === undefined) {
    errors.push('Nothing to update');
  }
  if (name !== undefined && String(name).trim() === '') errors.push('Name cannot be empty');
  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    errors.push('Price must be a number greater than 0');
  }
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    errors.push('Stock must be an integer 0 or more');
  }
  return errors;
}

// 4. แปลงข้อมูลก่อนส่งออก — MySQL คืน DECIMAL มาเป็น string เช่น "199.00" → แปลงเป็นตัวเลข
function toPublic(product) {
  return { ...product, price: Number(product.price) };
}

module.exports = { TABLE, validateCreate, validateUpdate, toPublic };
