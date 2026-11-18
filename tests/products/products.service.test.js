// tests/products/products.service.test.js
jest.mock('../../src/modules/products/products.repository');

const repository = require('../../src/modules/products/products.repository');
const service = require('../../src/modules/products/products.service');

beforeEach(() => jest.resetAllMocks());

describe('products.service', () => {
  test('getById แปลงราคาจาก string เป็นตัวเลข', async () => {
    repository.findById.mockResolvedValue({ id: 1, name: 'Mouse', price: '590.00', stock: 3 });

    const product = await service.getById(1);
    expect(product.price).toBe(590);
  });

  test('getById ไม่เจอ → 404', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getById(1)).rejects.toMatchObject({ status: 404 });
  });

  test('create ราคาติดลบ → 400', async () => {
    await expect(
      service.create({ name: 'X', price: -1, stock: 1 })
    ).rejects.toMatchObject({ status: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test('update ไม่ได้ส่งอะไรมา → 400', async () => {
    await expect(service.update(1, {})).rejects.toMatchObject({ status: 400 });
  });

  test('decreaseStock stock ไม่พอ → 409', async () => {
    repository.decreaseStock.mockResolvedValue(false);
    await expect(service.decreaseStock(1, 5)).rejects.toMatchObject({ status: 409 });
  });
});
