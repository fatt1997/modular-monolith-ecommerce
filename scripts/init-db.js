// scripts/init-db.js
// หน้าที่: สร้าง database และตารางทั้งหมดครั้งแรก → รันด้วย `npm run db:init`
// สคริปต์นี้อยู่นอก src/ เป็นเครื่องมือช่วยตอนพัฒนา ไม่ใช่ส่วนของแอป
const mysql = require('mysql2/promise');
const config = require('../src/config');

// เอาโครงตารางจาก model ของแต่ละโมดูล
const tables = [
  require('../src/modules/users/users.model').TABLE,
  require('../src/modules/products/products.model').TABLE,
  require('../src/modules/orders/orders.model').TABLE,
  require('../src/modules/payments/payments.model').TABLE,
];

async function main() {
  const { database, ...connectionOptions } = config.db;

  // 1. ต่อ MySQL แบบยังไม่เลือก database แล้วสร้าง database ถ้ายังไม่มี
  const conn = await mysql.createConnection(connectionOptions);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await conn.query(`USE \`${database}\``);

  // 2. สร้างตารางทีละตาราง
  for (const sql of tables) {
    await conn.query(sql);
  }

  // 3. ใส่สินค้าตัวอย่าง (ถ้ายังไม่มีสินค้าเลย)
  const [rows] = await conn.query('SELECT COUNT(*) AS count FROM products');
  if (rows[0].count === 0) {
    await conn.query(
      'INSERT INTO products (name, price, stock) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
      ['Keyboard', 1290, 10, 'Mouse', 590, 25, 'Monitor 24"', 4990, 5]
    );
    console.log('Inserted sample products');
  }

  await conn.end();
  console.log(`Database "${database}" is ready`);
}

main().catch((err) => {
  console.error('DB init failed:', err);
  process.exit(1);
});
