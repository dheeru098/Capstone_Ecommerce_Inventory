const Category = require('../models/Category');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const slugify = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const list = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, data: categories });
});

const get = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.validated.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, data: category });
});

const create = asyncHandler(async (req, res) => {
  const name = req.validated.body.name;
  const slug = slugify(name);
  if (!slug) throw new ApiError(400, 'Category name needs at least one letter or number');
  const category = await Category.create({ name, slug });
  res.status(201).json({ success: true, data: category });
});

const update = asyncHandler(async (req, res) => {
  const name = req.validated.body.name;
  const slug = slugify(name);
  if (!slug) throw new ApiError(400, 'Category name needs at least one letter or number');
  const category = await Category.findByIdAndUpdate(req.validated.params.id, { name, slug }, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, data: category });
});

const remove = asyncHandler(async (req, res) => {
  const id = req.validated.params.id;
  if (await Product.exists({ category: id })) throw new ApiError(409, 'Category still has products');
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { list, get, create, update, remove };
