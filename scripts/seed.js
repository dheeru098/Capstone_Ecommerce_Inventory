require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

async function seedUser(name, email, role, password) {
  const passwordHash = await bcrypt.hash(password, 12);
  return User.findOneAndUpdate({ email }, { $set: { name, role, passwordHash, isActive: true } }, { upsert: true, new: true, runValidators: true });
}

async function main() {
  await connectDatabase();
  const admin = await seedUser('Demo Admin', 'admin@capstone.test', 'admin', process.env.SEED_ADMIN_PASSWORD || 'Admin@12345');
  const seller = await seedUser('Demo Seller', 'seller@capstone.test', 'seller', process.env.SEED_SELLER_PASSWORD || 'Seller@12345');
  const customer = await seedUser('Demo Customer', 'customer@capstone.test', 'customer', process.env.SEED_CUSTOMER_PASSWORD || 'Customer@12345');
  const categories = [];
  for (const name of ['Electronics', 'Clothing', 'Books']) {
    const slug = name.toLowerCase();
    categories.push(await Category.findOneAndUpdate({ slug }, { $set: { name } }, { upsert: true, new: true }));
  }
  const samples = [
    { name: 'USB-C Cable', description: 'Durable one-metre charging cable', price: 299, stock: 20, category: categories[0]._id, lowStockThreshold: 5 },
    { name: 'Cotton T-Shirt', description: 'Comfortable everyday cotton T-shirt', price: 599, stock: 12, category: categories[1]._id, lowStockThreshold: 3 },
    { name: 'Notebook', description: 'A ruled notebook for daily notes', price: 79, stock: 4, category: categories[2]._id, lowStockThreshold: 5 }
  ];
  for (const sample of samples) {
    await Product.findOneAndUpdate({ name: sample.name, seller: seller._id }, { $set: { ...sample, seller: seller._id, isActive: true } }, { upsert: true, new: true, runValidators: true });
  }
  console.log('Sample accounts and products are ready.');
  console.log('Admin: admin@capstone.test');
  console.log('Seller: seller@capstone.test');
  console.log('Customer: customer@capstone.test');
  console.log('Passwords come from your .env SEED_*_PASSWORD settings.');
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
