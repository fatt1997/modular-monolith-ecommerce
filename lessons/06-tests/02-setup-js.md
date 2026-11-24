# 6.2 setup.js เตรียมของก่อนเทส

## โค้ด

```js
// tests/setup.js
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_NAME = 'test_db';
process.env.JWT_SECRET = 'test-secret';
```

## ทำไมต้องมีไฟล์นี้

`config/index.js` เช็กว่าค่าใน `.env` มีครบไหม ถ้าขาดจะพังทันที

```js
// src/config/index.js
const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env: ${key}`);   // ขาดตัวไหน → พังทันที
  }
}
```

ตอนเทส เราไม่มีไฟล์ `.env` (เพราะ `.env` ไม่ได้ขึ้น GitHub และเทสก็ไม่ได้ต่อ DB จริง) ถ้าไม่มี `setup.js` ทุกไฟล์ที่ require `config` จะพังด้วย `Missing env: DB_HOST`

`setup.js` จึงใส่ **ค่าปลอม** ไว้ให้ก่อน `config` จะผ่านการเช็ก และเทสก็รันต่อได้

## ค่าปลอมใช้ได้ไหม

ใช้ได้ เพราะเทสของเราไม่ได้ต่อ DB จริงเลย ค่า `DB_HOST` จะเป็นอะไรก็ได้ ขอแค่มีค่าอยู่

ส่วน `JWT_SECRET` ใช้จริงตอนเทส login (สร้างและตรวจ token) แต่ใช้ค่าอะไรก็ได้เหมือนกัน

## Jest รู้ได้ยังไงว่าต้องรันไฟล์นี้ก่อน

เราบอกไว้ใน `package.json`

```json
"jest": {
  "testEnvironment": "node",
  "setupFiles": ["<rootDir>/tests/setup.js"]
}
```

| ค่า | ความหมาย |
|---|---|
| `setupFiles` | รายชื่อไฟล์ที่ต้องรันก่อนเทส **ทุกไฟล์** |
| `<rootDir>` | โฟลเดอร์หลักของโปรเจกต์ (ที่มี `package.json` อยู่) |
| `testEnvironment: "node"` | เทสโค้ดฝั่ง server ไม่ใช่โค้ดในเบราว์เซอร์ |

## ลำดับการทำงาน

```
npm test
  → Jest อ่าน package.json
  → รัน tests/setup.js (ใส่ค่าปลอมใน process.env)
  → รันเทสไฟล์แรก → require config → ผ่าน ✅
  → รัน setup.js ใหม่ → รันเทสไฟล์ถัดไป
  → ...ทำซ้ำจนครบทุกไฟล์
```
