# 6.1 โครงโฟลเดอร์ tests และทำไมแยกตามโมดูล

## โครงโฟลเดอร์

```
tests/
├── setup.js                         ← เตรียม env ปลอมก่อนเทสทุกไฟล์
├── app.test.js                      ← เทสภาพรวมของแอป
├── users/
│   └── users.service.test.js
├── products/
│   └── products.service.test.js
├── orders/
│   └── orders.service.test.js
└── payments/
    └── payments.service.test.js
```

## เทสคืออะไร

เทสคือ **โค้ดที่ตรวจโค้ด** เราเขียนว่า "ถ้าใส่แบบนี้ ต้องได้ผลแบบนี้" แล้วให้ Jest รันตรวจให้

```js
test('email ซ้ำ → 409', async () => {
  // ถ้าสมัครด้วย email ที่มีอยู่แล้ว
  // ต้องได้ error 409
});
```

พิมพ์ `npm test` ครั้งเดียว Jest จะรันเทสทุกไฟล์ แล้วบอกว่าผ่านกี่ตัวและพังกี่ตัว

```
PASS tests/users/users.service.test.js
PASS tests/orders/orders.service.test.js
...
Tests: 29 passed, 29 total
```

## Jest หาไฟล์เทสยังไง

หาไฟล์ที่ชื่อลงท้ายด้วย `.test.js` ให้เอง ไม่ต้องบอกว่าอยู่ที่ไหน

## ทำไมแยกโฟลเดอร์ตามโมดูล

- **หาง่าย:** อยากดูเทสของ orders ก็เปิด `tests/orders/`
- **รันเฉพาะโมดูลได้:** เช่น `npx jest tests/orders` จะรันแค่เทสของ orders
- **ตรงกับโครงของ `src/`:** ถ้าวันหนึ่งแยก orders ออกไปเป็น service ต่างหาก ก็ยกโฟลเดอร์ `tests/orders/` ไปด้วยได้ทั้งก้อน

## ทำไมส่วนใหญ่เทส service

เพราะ **กฎธุรกิจทั้งหมดอยู่ที่ service** ถ้ากฎผิด เช่น email ซ้ำแล้วยังให้สมัครได้ ระบบจะเสียหายมากที่สุด จึงเทสชั้นนี้ละเอียดที่สุด

## ทำไมเทสรันได้โดยไม่ต้องมี MySQL

เพราะเราใช้ **repository ปลอม** แทนตัวจริง (ดูขั้นย่อยที่ 3)
