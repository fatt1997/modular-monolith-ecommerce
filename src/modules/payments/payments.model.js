// src/modules/payments/payments.model.js
// หน้าที่: "ใบสเปกข้อมูล" ของการชำระเงิน

const STATUS = {
  PENDING: 'pending',   // รอจ่าย
  PAID: 'paid',         // จ่ายแล้ว
};

// 1. โครงตาราง — 1 order มีใบแจ้งชำระได้ 1 ใบ (order_id UNIQUE)
const TABLE = `
  CREATE TABLE IF NOT EXISTS payments (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL UNIQUE,
    user_id    INT NOT NULL,
    amount     DECIMAL(10, 2) NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at    TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// 2. แปลงข้อมูลก่อนส่งออก
function toPublic(payment) {
  return {
    id: payment.id,
    orderId: payment.order_id,
    userId: payment.user_id,
    amount: Number(payment.amount),
    status: payment.status,
    paidAt: payment.paid_at,
    createdAt: payment.created_at,
  };
}

module.exports = { STATUS, TABLE, toPublic };
