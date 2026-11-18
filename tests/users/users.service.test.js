// tests/users/users.service.test.js
// เทส service โดย "ปลอม" repository (jest.mock) → ไม่ต้องมี database จริง
// เทสแค่กฎธุรกิจ: email ซ้ำ, password สั้น, login ผิด, ไม่คืน password
jest.mock('../../src/modules/users/users.repository');

const bcrypt = require('bcryptjs');
const repository = require('../../src/modules/users/users.repository');
const service = require('../../src/modules/users/users.service');

beforeEach(() => jest.resetAllMocks());

describe('users.service.register', () => {
  test('สมัครสำเร็จ → ไม่มี password ในผลลัพธ์', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockImplementation(async (data) => ({ id: 1, ...data }));

    const user = await service.register({ email: 'a@mail.com', password: '12345678', name: 'A' });

    expect(user).toEqual({ id: 1, email: 'a@mail.com', name: 'A' });
    expect(user.password).toBeUndefined();
  });

  test('password ถูกเข้ารหัสก่อนเก็บ', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockImplementation(async (data) => ({ id: 1, ...data }));

    await service.register({ email: 'a@mail.com', password: '12345678' });

    const saved = repository.create.mock.calls[0][0];
    expect(saved.password).not.toBe('12345678');
    expect(await bcrypt.compare('12345678', saved.password)).toBe(true);
  });

  test('email ซ้ำ → 409', async () => {
    repository.findByEmail.mockResolvedValue({ id: 1, email: 'a@mail.com' });

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
