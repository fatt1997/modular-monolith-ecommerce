// tests/payments/payments.service.test.js
jest.mock('../../src/modules/payments/payments.repository');
jest.mock('../../src/shared/events', () => ({ on: jest.fn(), emit: jest.fn() }));

const repository = require('../../src/modules/payments/payments.repository');
const events = require('../../src/shared/events');
const service = require('../../src/modules/payments/payments.service');

beforeEach(() => jest.resetAllMocks());

describe('payments.service.createForOrder', () => {
  test('ยังไม่มีใบแจ้งชำระ → สร้างใหม่ สถานะ pending', async () => {
    repository.findByOrderId.mockResolvedValue(null);
    repository.create.mockImplementation(async (d) => ({
      id: 1, order_id: d.orderId, user_id: d.userId, amount: d.amount, status: d.status,
    }));

    const payment = await service.createForOrder({ orderId: 7, userId: 1, amount: 1770 });
    expect(payment.status).toBe('pending');
  });

  test('มีอยู่แล้ว → ไม่สร้างซ้ำ', async () => {
    repository.findByOrderId.mockResolvedValue({ id: 1, order_id: 7, status: 'pending', amount: '1770.00' });
    await service.createForOrder({ orderId: 7, userId: 1, amount: 1770 });
    expect(repository.create).not.toHaveBeenCalled();
  });
});

describe('payments.service.pay', () => {
  test('จ่ายสำเร็จ → ประกาศ payment.completed', async () => {
    repository.findByOrderId.mockResolvedValue({ id: 1, order_id: 7, user_id: 1, status: 'pending', amount: '1770.00' });
    repository.markPaid.mockResolvedValue({ id: 1, order_id: 7, user_id: 1, status: 'paid', amount: '1770.00' });

    const payment = await service.pay(1, 7);

    expect(payment.status).toBe('paid');
    expect(events.emit).toHaveBeenCalledWith('payment.completed', { orderId: 7, paymentId: 1 });
  });

  test('จ่ายซ้ำ → 409', async () => {
    repository.findByOrderId.mockResolvedValue({ id: 1, order_id: 7, user_id: 1, status: 'paid' });
    await expect(service.pay(1, 7)).rejects.toMatchObject({ status: 409 });
    expect(events.emit).not.toHaveBeenCalled();
  });

  test('ใบแจ้งชำระของคนอื่น → 404', async () => {
    repository.findByOrderId.mockResolvedValue({ id: 1, order_id: 7, user_id: 2, status: 'pending' });
    await expect(service.pay(1, 7)).rejects.toMatchObject({ status: 404 });
  });
});
