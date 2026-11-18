// src/modules/products/products.controller.js
// หน้าที่: แกะ req → เรียก service → ตอบ res
const service = require('./products.service');

async function list(req, res, next) {
  try {
    const products = await service.list();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const product = await service.getById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, price, stock } = req.body;
    const product = await service.create({ name, price, stock });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, price, stock } = req.body;
    const product = await service.update(req.params.id, { name, price, stock });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update };
