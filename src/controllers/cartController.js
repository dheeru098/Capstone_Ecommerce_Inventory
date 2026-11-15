const Cart = require('../models/Cart');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { cartFor, cartSummary, usableProduct } = require('../services/cartService');

const get = asyncHandler(async (req, res) => {
  const cart = await cartFor(req.user._id);
  res.json({ success: true, data: await cartSummary(cart) });
});

const add = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.validated.body;
  const product = await usableProduct(productId);
  const cart = await cartFor(req.user._id);
  if (cart.checkoutLocked) throw new ApiError(409, 'Checkout is in progress');
  const existing = cart.items.find((item) => String(item.product) === productId);
  const target = (existing?.quantity || 0) + quantity;
  if (target > 100 || target > product.stock) throw new ApiError(409, 'Requested quantity exceeds available stock or cart limit');
  const filter = { customer: req.user._id, checkoutLocked: false };
  let updated;
  if (existing) {
    updated = await Cart.findOneAndUpdate({ ...filter, 'items.product': productId }, { $set: { 'items.$.quantity': target } }, { new: true });
  } else {
    updated = await Cart.findOneAndUpdate({ ...filter, 'items.product': { $ne: productId } }, { $push: { items: { product: productId, quantity } } }, { new: true });
  }
  if (!updated) throw new ApiError(409, 'Cart changed during update. Try again');
  res.json({ success: true, data: await cartSummary(updated) });
});

const update = asyncHandler(async (req, res) => {
  const { productId } = req.validated.params;
  const { quantity } = req.validated.body;
  const product = await usableProduct(productId);
  if (quantity > product.stock) throw new ApiError(409, 'Not enough stock');
  const cart = await Cart.findOneAndUpdate(
    { customer: req.user._id, checkoutLocked: false, 'items.product': productId },
    { $set: { 'items.$.quantity': quantity } }, { new: true }
  );
  if (!cart) throw new ApiError(404, 'Cart item not found or checkout in progress');
  res.json({ success: true, data: await cartSummary(cart) });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { customer: req.user._id, checkoutLocked: false, 'items.product': req.validated.params.productId },
    { $pull: { items: { product: req.validated.params.productId } } }, { new: true }
  );
  if (!cart) throw new ApiError(404, 'Cart item not found or checkout in progress');
  res.json({ success: true, data: await cartSummary(cart) });
});

const clear = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate({ customer: req.user._id, checkoutLocked: false }, { $set: { items: [] } }, { new: true });
  if (!cart) throw new ApiError(409, 'Cart is locked for checkout');
  res.json({ success: true, data: await cartSummary(cart) });
});

module.exports = { get, add, update, removeItem, clear };
