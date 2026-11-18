// src/modules/products/products.service.js
// หน้าที่: กฎธุรกิจของสินค้า
const repository = require('./products.repository');
const model = require('./products.model');
const { AppError } = require('../../shared/utils');

async function list() {
  const products = await repository.findAll();
  return products.map(model.toPublic);
}

async function getById(id) {
  const product = await repository.findById(id);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }
  return model.toPublic(product);
}

async function create({ name, price, stock }) {
  const errors = model.validateCreate({ name, price, stock });
  if (errors.length) {
    throw new AppError(400, errors.join(', '));
  }
  const product = await repository.create({ name: String(name).trim(), price, stock });
  return model.toPublic(product);
}

async function update(id, { name, price, stock }) {
  const errors = model.validateUpdate({ name, price, stock });
  if (errors.length) {
    throw new AppError(400, errors.join(', '));
  }

  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError(404, 'Product not found');
  }

  const product = await repository.update(id, {
    name: name !== undefined ? String(name).trim() : undefined,
    price,
    stock,
  });
  return model.toPublic(product);
}

// ใช้โดยโมดูล orders (ผ่าน index.js) ตอนมีคนสั่งซื้อ
async function decreaseStock(id, quantity) {
  const ok = await repository.decreaseStock(id, quantity);
  if (!ok) {
    throw new AppError(409, 'Not enough stock');
  }
}

module.exports = { list, getById, create, update, decreaseStock };
