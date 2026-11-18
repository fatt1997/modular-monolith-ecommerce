// tests/orders/orders.service.test.js
// ปลอมทั้ง repository ของ orders, โมดูล products และ events
// → เทสว่า orders เรียกโมดูลอื่นถูกต้อง โดยไม่ต้องมีของจริง
jest.mock('../../src/modules/orders/orders.repository');
jest.mock('../../src/modules/products', () => ({
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

  test('quantity เป็น 0 → 400 และไม่แตะ products', async () => {
    await expect(service.create(1, { productId: 2, quantity: 0 })).rejects.toMatchObject({ status: 400 });
    expect(products.getProductById).not.toHaveBeenCalled();
  });

  test('stock ไม่พอ → ไม่สร้าง order และไม่ประกาศ event', async () => {
    products.getProductById.mockResolvedValue({ id: 2, price: 590, stock: 1 });
    products.decreaseStock.mockRejectedValue(Object.assign(new Error('Not enough stock'), { status: 409 }));

    await expect(service.create(1, { productId: 2, quantity: 5 })).rejects.toMatchObject({ status: 409 });
    expect(repository.create).not.toHaveBeenCalled();
    expect(events.emit).not.toHaveBeenCalled();
  });
});

describe('orders.service.getMine', () => {
  test('order ของคนอื่น → 404', async () => {
    repository.findById.mockResolvedValue({ id: 7, user_id: 2 });
    await expect(service.getMine(1, 7)).rejects.toMatchObject({ status: 404 });
  });
});

describe('orders.service.markPaid', () => {
  test('pending → เปลี่ยนเป็น paid', async () => {
    repository.findById.mockResolvedValue({ id: 7, status: 'pending' });
    await service.markPaid(7);
    expect(repository.updateStatus).toHaveBeenCalledWith(7, 'paid');
  });

  test('paid อยู่แล้ว → ไม่ทำซ้ำ', async () => {
    repository.findById.mockResolvedValue({ id: 7, status: 'paid' });
    await service.markPaid(7);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
});
