// tests/app.test.js
// เทส app.js ด้วย supertest — ยิง request ได้โดยไม่ต้องเปิด port จริง
// (นี่คือเหตุผลที่แยก app.js ออกจาก server.js)
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
