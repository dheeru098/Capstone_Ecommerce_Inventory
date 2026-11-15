const RefreshToken = require('../models/RefreshToken');
const { makeAccessToken, makeRefreshToken, hashToken, REFRESH_SECONDS } = require('../utils/tokens');

async function createSession(user) {
  const accessToken = makeAccessToken(user);
  const refreshToken = makeRefreshToken(user);
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_SECONDS * 1000)
  });
  return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 };
}

module.exports = { createSession };
