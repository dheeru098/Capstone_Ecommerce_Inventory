const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $set: req.validated.body }, { new: true, runValidators: true });
  res.json({ success: true, data: user });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, role } = req.validated.query;
  const filter = role ? { role } : {};
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { role, isActive } = req.validated.body;
  if (String(req.user._id) === id && (role !== 'admin' || isActive === false)) {
    throw new ApiError(400, 'You cannot remove your own admin access');
  }
  const updates = { role };
  if (typeof isActive === 'boolean') updates.isActive = isActive;
  const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  if (!user.isActive) await RefreshToken.deleteMany({ user: user._id });
  res.json({ success: true, data: user });
});

module.exports = { me, updateMe, listUsers, updateRole };
