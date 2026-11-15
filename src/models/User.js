const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
