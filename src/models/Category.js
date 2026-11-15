const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
