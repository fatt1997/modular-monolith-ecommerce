# 6.3 เทส service ด้วยการปลอม repository (mock)

## ปัญหา

`users.service.register` เรียก repository ซึ่งต้องคุยกับ MySQL

```js
// src/modules/users/users.service.js
async function register({ email, password, name }) {
  const errors = model.validateRegister({ email, password });
  if (errors.length) throw new AppError(400, errors.join(', '));

  const existing = await repository.findByEmail(email);    // ← ต้องมี DB
  if (existing) throw new AppError(409, 'Email already in use');

  const hashed = await bcrypt.hash(password, 10);
  const user = await repository.create({ email, password: hashed, name }); // ← ต้องมี DB
  return model.toPublic(user);
}
```

ถ้าเทสกับ DB จริง จะช้า, ต้องติดตั้ง MySQL และข้อมูลเก่าในตารางอาจทำให้ผลเทสเปลี่ยนไปเรื่อยๆ

## ทางแก้: ปลอม repository

**mock** คือการสร้าง **ตัวแสดงแทน** ให้ repository เราสั่งได้ว่าตัวแสดงแทนต้องตอบอะไร

เทียบกับซ้อมละคร: ไม่ต้องรอนักแสดงตัวจริง ให้คนมายืนแทนแล้วพูดบทที่เราเขียนให้

## โค้ดเทสเต็ม

```js
// tests/users/users.service.test.js

// 1. สั่ง Jest: ไฟล์ users.repository ให้ใช้ตัวปลอมแทน
jest.mock('../../src/modules/users/users.repository');

const bcrypt = require('bcryptjs');
const repository = require('../../src/modules/users/users.repository'); // ได้ตัวปลอม
const service = require('../../src/modules/users/users.service');       // ของจริง

// 2. ก่อนเทสแต่ละตัว ล้างบทที่สั่งไว้ให้หมด
beforeEach(() => jest.resetAllMocks());

describe('users.service.register', () => {
  test('สมัครสำเร็จ → ไม่มี password ในผลลัพธ์', async () => {
    // เขียนบทให้ตัวปลอม
    repository.findByEmail.mockResolvedValue(null);                     // "ไม่มี email นี้"
    repository.create.mockImplementation(async (data) => ({ id: 1, ...data })); // "บันทึกแล้วได้ id 1"

    // เรียกของจริง
    const user = await service.register({ email: 'a@mail.com', password: '12345678', name: 'A' });

    // ตรวจผล
    expect(user).toEqual({ id: 1, email: 'a@mail.com', name: 'A' });
    expect(user.password).toBeUndefined();
  });

  test('password ถูกเข้ารหัสก่อนเก็บ', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockImplementation(async (data) => ({ id: 1, ...data }));

    await service.register({ email: 'a@mail.com', password: '12345678' });

    // ดูว่า service ส่งอะไรให้ repository.create
    const saved = repository.create.mock.calls[0][0];
    expect(saved.password).not.toBe('12345678');
    expect(await bcrypt.compare('12345678', saved.password)).toBe(true);
  });

  test('email ซ้ำ → 409', async () => {
    repository.findByEmail.mockResolvedValue({ id: 1, email: 'a@mail.com' }); // "มี email นี้แล้ว"

    await expect(
      service.register({ email: 'a@mail.com', password: '12345678' })
    ).rejects.toMatchObject({ status: 409 });
  });

  test('password สั้นเกิน → 400 และไม่ไปถาม database', async () => {
    await expect(
      service.register({ email: 'a@mail.com', password: '123' })
    ).rejects.toMatchObject({ status: 400 });
    expect(repository.findByEmail).not.toHaveBeenCalled();
  });
});

describe('users.service.login', () => {
  test('ถูกต้อง → ได้ token', async () => {
    const hashed = await bcrypt.hash('12345678', 10);
    repository.findByEmail.mockResolvedValue({ id: 1, email: 'a@mail.com', password: hashed });

    const result = await service.login('a@mail.com', '12345678');
    expect(typeof result.token).toBe('string');
  });

  test('password ผิด → 401', async () => {
    const hashed = await bcrypt.hash('12345678', 10);
    repository.findByEmail.mockResolvedValue({ id: 1, email: 'a@mail.com', password: hashed });

    await expect(service.login('a@mail.com', 'wrong-pass')).rejects.toMatchObject({ status: 401 });
  });

  test('ไม่มี email นี้ → 401 (ข้อความเดียวกับ password ผิด)', async () => {
    repository.findByEmail.mockResolvedValue(null);

    await expect(service.login('x@mail.com', '12345678')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });
  });
});

describe('users.service.getById', () => {
  test('ไม่เจอ → 404', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getById(99)).rejects.toMatchObject({ status: 404 });
  });
});
```

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ความหมาย |
|---|---|
| `jest.mock('path')` | ไฟล์นี้ให้ใช้ตัวปลอมแทน (ทุกฟังก์ชันในไฟล์กลายเป็นตัวปลอม) |
| `fn.mockResolvedValue(x)` | ถ้าถูกเรียก ให้ตอบ `x` (แบบ async) |
| `fn.mockImplementation(f)` | ถ้าถูกเรียก ให้ทำตามฟังก์ชัน `f` |
| `fn.mock.calls[0][0]` | ค่าที่ส่งเข้ามาตอนถูกเรียก **ครั้งแรก** ช่องที่ **1** |
| `jest.resetAllMocks()` | ล้างบทและประวัติการเรียกทั้งหมด |
| `describe('...', () => {})` | จัดกลุ่มเทสที่เกี่ยวข้องกัน |
| `test('...', async () => {})` | เทส 1 กรณี |
| `expect(x).toBe(y)` | x ต้องเท่ากับ y (เทียบค่าธรรมดา) |
| `expect(x).toEqual(y)` | x ต้องหน้าตาเหมือน y (เทียบ object ข้างในทุกช่อง) |
| `expect(x).toBeUndefined()` | x ต้องไม่มีค่า |
| `expect(promise).rejects.toMatchObject({...})` | promise ต้องพัง และ error ต้องมีช่องตามนี้ |
| `expect(fn).toHaveBeenCalled()` | fn ต้องถูกเรียก |
| `expect(fn).not.toHaveBeenCalled()` | fn ต้องไม่ถูกเรียก |

## รูปแบบ 3 ขั้นของทุกเทส

```
1. เตรียม (Arrange)  → เขียนบทให้ตัวปลอม
2. ทำ     (Act)      → เรียก service ของจริง
3. ตรวจ   (Assert)   → expect ผลลัพธ์
```

## ตัวอย่างเทสที่ปลอมโมดูลอื่นด้วย: orders

orders เรียก products และ events จึงต้องปลอมทั้งสองอย่าง

```js
// tests/orders/orders.service.test.js
jest.mock('../../src/modules/orders/orders.repository');
jest.mock('../../src/modules/products', () => ({   // ปลอมประตูหน้าของ products
  getProductById: jest.fn(),
  decreaseStock: jest.fn(),
}));
jest.mock('../../src/shared/events', () => ({ on: jest.fn(), emit: jest.fn() }));

const repository = require('../../src/modules/orders/orders.repository');
const products = require('../../src/modules/products');
const events = require('../../src/shared/events');
const service = require('../../src/modules/orders/orders.service');

beforeEach(() => jest.resetAllMocks());

describe('orders.service.create', () => {
  test('สั่งซื้อสำเร็จ → คิดราคาที่ server, ตัด stock, ประกาศ order.created', async () => {
    products.getProductById.mockResolvedValue({ id: 2, price: 590, stock: 10 });
    products.decreaseStock.mockResolvedValue();
    repository.create.mockImplementation(async (d) => ({
      id: 7,
      user_id: d.userId,
      product_id: d.productId,
      quantity: d.quantity,
      total_price: d.totalPrice,
      status: d.status,
    }));

    const order = await service.create(1, { productId: 2, quantity: 3 });

    expect(order.totalPrice).toBe(1770);
    expect(order.status).toBe('pending');
    expect(products.decreaseStock).toHaveBeenCalledWith(2, 3);
    expect(events.emit).toHaveBeenCalledWith('order.created', {
      orderId: 7,
      userId: 1,
      amount: 1770,
    });
  });

  test('stock ไม่พอ → ไม่สร้าง order และไม่ประกาศ event', async () => {
    products.getProductById.mockResolvedValue({ id: 2, price: 590, stock: 1 });
    products.decreaseStock.mockRejectedValue(Object.assign(new Error('Not enough stock'), { status: 409 }));

    await expect(service.create(1, { productId: 2, quantity: 5 })).rejects.toMatchObject({ status: 409 });
    expect(repository.create).not.toHaveBeenCalled();
    expect(events.emit).not.toHaveBeenCalled();
  });
});
```

`jest.mock('path', () => ({...}))` แบบมีฟังก์ชันที่ 2 คือ **เขียนตัวปลอมเอง** ว่าในกล่องมีอะไรบ้าง ใช้กับ products เพราะเราอยากปลอมแค่ 2 ฟังก์ชันที่ orders ใช้

`mockRejectedValue(err)` คือ ถ้าถูกเรียก ให้ **พัง** ด้วย error นี้
