const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');

const ACCESS_AGE = '15m';
const REFRESH_SECONDS = 7 * 24 * 60 * 60;

function makeAccessToken(user) {
  return jwt.sign({ sub: String(user._id), typ: 'access' }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_AGE });
}

function makeRefreshToken(user) {
  return jwt.sign({ sub: String(user._id), typ: 'refresh', jti: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_SECONDS });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function verifyToken(token, type) {
  const secret = type === 'refresh' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_ACCESS_SECRET;
  const payload = jwt.verify(token, secret);
  if (payload.typ !== type) throw new Error('Wrong token type');
  return payload;
}

module.exports = { makeAccessToken, makeRefreshToken, hashToken, verifyToken, REFRESH_SECONDS };
