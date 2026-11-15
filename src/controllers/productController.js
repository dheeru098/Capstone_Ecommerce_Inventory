const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { events } = require('../utils/events');

function isOwnerOrAdmin(product, user) {
  return user.role === 'admin' || String(product.seller) === String(user._id);
}

async function verifyCategory(categoryId) {
  if (!(await Category.exists({ _id: categoryId }))) throw new ApiError(400, 'Category does not exist');
}

const list = asyncHandler(async (req, res) => {
  const { q, category, seller, sort, page, limit } = req.validated.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (seller) filter.seller = seller;
  if (q) filter.$text = { $search: q };
  const sorts = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, name: { name: 1 } };
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').populate('seller', 'name')
      .sort(sorts[sort]).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const get = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.validated.params.id, isActive: true })
    .populate('category', 'name slug').populate('seller', 'name');
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: product });
});

const create = asyncHandler(async (req, res) => {
  const data = req.validated.body;
  await verifyCategory(data.category);
  const product = await Product.create({ ...data, seller: req.user._id });
  res.status(201).json({ success: true, data: product });
});

const update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.validated.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (!isOwnerOrAdmin(product, req.user)) throw new ApiError(403, 'Not your product');
  if (req.validated.body.category) await verifyCategory(req.validated.body.category);
  Object.assign(product, req.validated.body);
  await product.save();
  res.json({ success: true, data: product });
});

const stock = asyncHandler(async (req, res) => {
  const id = req.validated.params.id;
  const change = req.validated.body.change;
  const current = await Product.findById(id);
  if (!current) throw new ApiError(404, 'Product not found');
  if (!isOwnerOrAdmin(current, req.user)) throw new ApiError(403, 'Not your product');
  const filter = { _id: id };
  if (change < 0) filter.stock = { $gte: -change };
  const product = await Product.findOneAndUpdate(filter, { $inc: { stock: change } }, { new: true, runValidators: true });
  if (!product) throw new ApiError(409, 'Insufficient stock');
  if (product.stock <= product.lowStockThreshold) {
    events.emit('stock.low', { productId: String(product._id), sellerId: String(product.seller), stock: product.stock });
  }
  res.json({ success: true, data: product });
});

const remove = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.validated.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (!isOwnerOrAdmin(product, req.user)) throw new ApiError(403, 'Not your product');
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: 'Product archived' });
});

module.exports = { list, get, create, update, stock, remove };
