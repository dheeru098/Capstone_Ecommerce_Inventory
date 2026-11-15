const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const { roundMoney, subtotal } = require('../utils/money');
const { events } = require('../utils/events');

async function restoreStock(items) {
  for (const item of items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
  }
}

async function checkout(userId, address) {
  const cart = await Cart.findOneAndUpdate(
    { customer: userId, checkoutLocked: false, 'items.0': { $exists: true } },
    { $set: { checkoutLocked: true } }, { new: true }
  );
  if (!cart) throw new ApiError(409, 'Cart is empty or checkout is already running');

  const changed = [];
  let order;
  try {
    const ids = cart.items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    const byId = new Map(products.map((item) => [String(item._id), item]));
    const items = cart.items.map((item) => {
      const product = byId.get(String(item.product));
      if (!product) throw new ApiError(409, 'A product in the cart is unavailable');
      if (product.stock < item.quantity) throw new ApiError(409, `Not enough stock for ${product.name}`);
      return {
        product: product._id, seller: product.seller, name: product.name,
        price: product.price, quantity: item.quantity, subtotal: subtotal(product.price, item.quantity),
        threshold: product.lowStockThreshold
      };
    });

    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, isActive: true, stock: { $gte: item.quantity }, price: item.price },
        { $inc: { stock: -item.quantity } }, { new: true }
      );
      if (!updated) throw new ApiError(409, `Stock or price changed for ${item.name}. Please review your cart`);
      changed.push(item);
    }

    const storedItems = items.map(({ threshold, ...item }) => item);
    order = await Order.create({ customer: userId, address, items: storedItems, total: roundMoney(items.reduce((total, item) => total + item.subtotal, 0)) });
    await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } });
    const sellerIds = [...new Set(items.map((item) => String(item.seller)))];
    events.emit('order.placed', { orderId: String(order._id), customerId: String(userId), sellerIds });
    for (const item of items) {
      const latest = await Product.findById(item.product).select('stock');
      if (latest && latest.stock <= item.threshold) {
        events.emit('stock.low', { productId: String(item.product), sellerId: String(item.seller), stock: latest.stock });
      }
    }
    return order;
  } catch (error) {
    if (!order && changed.length) await restoreStock(changed);
    throw error;
  } finally {
    await Cart.updateOne({ _id: cart._id }, { $set: { checkoutLocked: false } });
  }
}

async function cancelOrder(order) {
  for (const item of order.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
  }
}

module.exports = { checkout, cancelOrder };
