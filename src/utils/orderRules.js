const changes = {
  placed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

function canChangeStatus(from, to) {
  return (changes[from] || []).includes(to);
}

module.exports = { changes, canChangeStatus };
