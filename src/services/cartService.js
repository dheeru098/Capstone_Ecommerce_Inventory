const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const { subtotal, roundMoney } = require('../utils/money');

async function cartFor(userId) {
  let cart = await Cart.findOne({ customer: userId });
  if (!cart) {
    cart = await Cart.findOneAndUpdate({ customer: userId }, { $setOnInsert: { customer: userId, items: [] } }, { new: true, upsert: true });
  }
  return cart;
}

async function cartSummary(cart) {
  const ids = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: ids } }).select('name price stock isActive seller');
  const byId = new Map(products.map((product) => [String(product._id), product]));
  const items = cart.items.map((item) => {
    const product = byId.get(String(item.product));
    return {
      productId: item.product, name: product?.name || 'Unavailable product',
      quantity: item.quantity, price: product?.price ?? null,
      available: Boolean(product?.isActive && product.stock >= item.quantity),
      subtotal: product ? subtotal(product.price, item.quantity) : null
    };
  });
  return { items, total: roundMoney(items.reduce((sum, item) => sum + (item.subtotal || 0), 0)) };
}

async function usableProduct(productId) {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new ApiError(404, 'Product is unavailable');
  return product;
}

module.exports = { cartFor, cartSummary, usableProduct };
