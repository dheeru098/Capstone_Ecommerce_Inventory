const EventEmitter = require('node:events');

const events = new EventEmitter();

function attachEventHandlers(io) {
  events.on('order.placed', ({ orderId, customerId, sellerIds }) => {
    io.to(`user:${customerId}`).emit('order:placed', { orderId });
    sellerIds.forEach((sellerId) => io.to(`user:${sellerId}`).emit('order:new', { orderId }));
    io.to('role:admin').emit('order:new', { orderId });
  });

  events.on('order.status', ({ orderId, customerId, status, sellerIds }) => {
    io.to(`user:${customerId}`).emit('order:status', { orderId, status });
    sellerIds.forEach((sellerId) => io.to(`user:${sellerId}`).emit('order:status', { orderId, status }));
    io.to('role:admin').emit('order:status', { orderId, status });
  });

  events.on('stock.low', ({ productId, sellerId, stock }) => {
    io.to(`user:${sellerId}`).emit('inventory:low', { productId, stock });
    io.to('role:admin').emit('inventory:low', { productId, stock });
  });
}

module.exports = { events, attachEventHandlers };
