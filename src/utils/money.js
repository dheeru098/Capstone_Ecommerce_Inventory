function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function subtotal(price, quantity) {
  return roundMoney(price * quantity);
}

module.exports = { roundMoney, subtotal };
