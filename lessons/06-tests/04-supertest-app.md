# 6.4 เทส app.js ด้วย supertest

## supertest คืออะไร

library ที่ **ยิง HTTP request ใส่แอปได้โดยไม่ต้องเปิด port จริง** เหมือนมีลูกค้าปลอมมาเคาะประตู

นี่คือเหตุผลที่เราแยก `app.js` ออกจาก `server.js` เพราะเทสต้องการแค่ตัวแอป ไม่ต้องการ `app.listen()` และ `db.connect()`

```js
// src/app.js
module.exports = app;   // ส่งออกแอป ไม่มี listen
```

## โค้ดเทสเต็ม

```js
// tests/app.test.js
const request = require('supertest');
const app = require('../src/app');

describe('app', () => {
  test('GET /health → 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('URL ที่ไม่มี → 404', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
  });

  test('โซน /orders ไม่มี token → 401', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(401);
  });

  test('โซน /payments token ปลอม → 401', async () => {
    const res = await request(app)
      .get('/payments/order/1')
      .set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(401);
  });

  test('body ไม่ใช่ JSON ที่ถูกต้อง → 400', async () => {
    const res = await request(app)
      .post('/users/register')
      .set('Content-Type', 'application/json')
      .send('{ bad json');
    expect(res.status).toBe(400);
  });
});
```

## คำสั่งที่ใช้

| คำสั่ง | ความหมาย |
|---|---|
| `request(app)` | เตรียมยิง request ใส่แอปนี้ |
| `.get('/health')` | method GET ไปที่ URL นี้ |
| `.post('/users/register')` | method POST |
| `.set('Authorization', 'Bearer ...')` | ใส่ header |
| `.send({...})` | ใส่ body |
| `res.status` | เลข status ที่แอปตอบ |
| `res.body` | ข้อมูลที่แอปตอบ (แปลงจาก JSON แล้ว) |

## เทสพวกนี้ตรวจอะไร

| เทส | ตรวจส่วนไหนของ `app.js` |
|---|---|
| `/health` → 200 | route ทำงาน |
| `/nope` → 404 | ตัวจับ 404 อยู่หลัง routes ถูกตำแหน่ง |
| `/orders` ไม่มี token → 401 | `authMiddleware` ครอบโซน orders จริง |
| token ปลอม → 401 | `jwt.verify` ปฏิเสธ token ปลอม |
| JSON พัง → 400 | `errorHandler` จับ error จาก `express.json()` ได้ |

ทุกเทสนี้ **ไม่ต้องต่อ database** เพราะ request ถูกตอบก่อนจะถึง repository ทั้งหมด

## ถ้าอยากเทสทั้ง flow ผ่าน HTTP

เช่น สมัคร → login → สั่งซื้อ ต้องมี database จริง เรียกว่า **integration test** ซึ่งช้ากว่า มักแยกไปรันเป็นอีกคำสั่งหนึ่ง

| ชนิดเทส | ทดสอบ | ต้องมี DB | ความเร็ว |
|---|---|---|---|
| Unit test (service + mock) | กฎธุรกิจทีละฟังก์ชัน | ไม่ต้อง | เร็วมาก |
| App test (supertest, ไม่ถึง DB) | ด่านต่างๆ ใน `app.js` | ไม่ต้อง | เร็ว |
| Integration test | ทั้ง flow จริง | ต้อง | ช้า |
