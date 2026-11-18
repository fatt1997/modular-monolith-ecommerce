// src/modules/orders/orders.model.js
// หน้าที่: "ใบสเปกข้อมูล" ของคำสั่งซื้อ
// เพื่อให้เรียบง่าย: 1 คำสั่งซื้อ = สินค้า 1 รายการ (ระบบจริงมักมีตาราง order_items เพิ่ม)

// สถานะที่เป็นไปได้ของคำสั่งซื้อ
const STATUS = {
  PENDING: 'pending',     // สร้างแล้ว รอจ่ายเงิน
  PAID: 'paid',           // จ่ายแล้ว
};

// 1. โครงตาราง
// สังเกต: user_id, product_id เก็บแค่ "เลข id" ไม่มี FOREIGN KEY ข้ามไปตารางของโมดูลอื่น
// → ถ้าวันหนึ่งแยกโมดูลออกเป็น service คนละ database ก็ไม่ติดอะไร
const TABLE = `
  CREATE TABLE IF NOT EXISTS orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// 2. กฎตรวจรูปแบบข้อมูลตอนสั่งซื้อ
function validateCreate({ productId, quantity }) {
  const errors = [];
  if (!Number.isInteger(productId) || productId <= 0) errors.push('productId must be a positive integer');
  if (!Number.isInteger(quantity) || quantity <= 0) errors.push('quantity must be a positive integer');
  return errors;
}

// 3. แปลงข้อมูลก่อนส่งออก (snake_case จาก DB → camelCase แบบ JavaScript)
function toPublic(order) {
  return {
    id: order.id,
    userId: order.user_id,
    productId: order.product_id,
    quantity: order.quantity,
    totalPrice: Number(order.total_price),
    status: order.status,
    createdAt: order.created_at,
  };
}

module.exports = { STATUS, TABLE, validateCreate, toPublic };
