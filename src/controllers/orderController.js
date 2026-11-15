const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { checkout, cancelOrder } = require('../services/orderService');
const { canChangeStatus } = require('../utils/orderRules');
const { events } = require('../utils/events');

function canSee(order, user) {
  return user.role === 'admin' || String(order.customer) === String(user._id) ||
    (user.role === 'seller' && order.items.some((item) => String(item.seller) === String(user._id)));
}

const create = asyncHandler(async (req, res) => {
  const order = await checkout(req.user._id, req.validated.body.address);
  res.status(201).json({ success: true, data: order });
});

const list = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.validated.query;
  const filter = {};
  if (req.user.role === 'customer') filter.customer = req.user._id;
  if (req.user.role === 'seller') filter['items.seller'] = req.user._id;
  if (status) filter.status = status;
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter)
  ]);
  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const get = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.validated.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (!canSee(order, req.user)) throw new ApiError(403, 'You cannot view this order');
  res.json({ success: true, data: order });
});

const changeStatusHandler = async (req, res) => {
  const order = await Order.findById(req.validated.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  const next = req.validated.body.status;
  const customer = String(order.customer) === String(req.user._id);
  const sellerOwnsEverything = order.items.every((item) => String(item.seller) === String(req.user._id));
  if (req.user.role === 'customer' && !(customer && next === 'cancelled' && order.status === 'placed')) {
    throw new ApiError(403, 'Customers can only cancel their own placed orders');
  }
  if (req.user.role === 'seller' && !sellerOwnsEverything) {
    throw new ApiError(403, 'Only the administrator may change a multi-seller order');
  }
  if (!canChangeStatus(order.status, next)) throw new ApiError(409, `Cannot change ${order.status} to ${next}`);
  const saved = await Order.findOneAndUpdate({ _id: order._id, status: order.status }, { $set: { status: next } }, { new: true });
  if (!saved) throw new ApiError(409, 'Order changed. Reload and try again');
  if (next === 'cancelled') await cancelOrder(saved);
  const sellerIds = [...new Set(saved.items.map((item) => String(item.seller)))];
  events.emit('order.status', { orderId: String(saved._id), customerId: String(saved.customer), sellerIds, status: next });
  res.json({ success: true, data: saved });
};

const changeStatus = asyncHandler(changeStatusHandler);

const cancel = asyncHandler(async (req, res) => {
  req.validated.body = { status: 'cancelled' };
  await changeStatusHandler(req, res);
});

module.exports = { create, list, get, changeStatus, cancel };
