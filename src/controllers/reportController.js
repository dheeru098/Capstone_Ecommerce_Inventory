const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

function scopeToOrders(req, dateFilter = {}) {
  const query = { ...dateFilter, status: { $ne: 'cancelled' } };
  if (req.user.role === 'seller') query['items.seller'] = req.user._id;
  return query;
}

const sales = asyncHandler(async (req, res) => {
  const { from, to } = req.validated.query;
  const createdAt = {};
  if (from) createdAt.$gte = from;
  if (to) createdAt.$lte = to;
  const match = scopeToOrders(req, Object.keys(createdAt).length ? { createdAt } : {});
  const pipeline = [
    { $match: match },
    { $unwind: '$items' },
    ...(req.user.role === 'seller' ? [{ $match: { 'items.seller': req.user._id } }] : []),
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $addToSet: '$_id' }, units: { $sum: '$items.quantity' }, value: { $sum: '$items.subtotal' } } },
    { $project: { _id: 0, date: '$_id', orders: { $size: '$orders' }, units: 1, value: { $round: ['$value', 2] } } },
    { $sort: { date: 1 } }
  ];
  const data = await Order.aggregate(pipeline);
  res.json({ success: true, note: 'Simulated payment: values are non-cancelled order totals, not settled revenue', data });
});

const inventory = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'seller' ? { seller: req.user._id, isActive: true } : { isActive: true };
  const data = await Product.aggregate([
    { $match: filter },
    { $group: { _id: '$category', products: { $sum: 1 }, unitsInStock: { $sum: '$stock' }, inventoryValue: { $sum: { $multiply: ['$price', '$stock'] } }, lowStockProducts: { $sum: { $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0] } } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, categoryId: '$_id', category: '$category.name', products: 1, unitsInStock: 1, lowStockProducts: 1, inventoryValue: { $round: ['$inventoryValue', 2] } } },
    { $sort: { category: 1 } }
  ]);
  res.json({ success: true, data });
});

const bestSellers = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: scopeToOrders(req) },
    { $unwind: '$items' },
    ...(req.user.role === 'seller' ? [{ $match: { 'items.seller': req.user._id } }] : []),
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, units: { $sum: '$items.quantity' }, value: { $sum: '$items.subtotal' } } },
    { $project: { _id: 0, productId: '$_id', name: 1, units: 1, value: { $round: ['$value', 2] } } },
    { $sort: { units: -1 } },
    { $limit: 10 }
  ]);
  res.json({ success: true, data });
});

module.exports = { sales, inventory, bestSellers };
