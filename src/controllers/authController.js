const bcrypt = require('bcrypt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const { createSession } = require('../services/authService');
const { verifyToken, hashToken } = require('../utils/tokens');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validated.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role });
  const tokens = await createSession(user);
  const { passwordHash: removed, ...safeUser } = user.toObject();
  res.status(201).json({ success: true, data: { user: safeUser, ...tokens } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const tokens = await createSession(user);
  const { passwordHash, ...safeUser } = user.toObject();
  res.json({ success: true, data: { user: safeUser, ...tokens } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.validated.body.refreshToken;
  let payload;
  try {
    payload = verifyToken(token, 'refresh');
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
  const stored = await RefreshToken.findOneAndDelete({ tokenHash: hashToken(token), user: payload.sub, expiresAt: { $gt: new Date() } });
  if (!stored) throw new ApiError(401, 'Refresh token is no longer valid');
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, 'Account is not available');
  res.json({ success: true, data: await createSession(user) });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.validated.body.refreshToken;
  await RefreshToken.deleteOne({ tokenHash: hashToken(token) });
  res.json({ success: true, message: 'Logged out' });
});

module.exports = { register, login, refresh, logout };
