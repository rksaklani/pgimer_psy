const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token
 * Expiration time can be configured via JWT_ACCESS_TOKEN_EXPIRATION env variable (default: 5m)
 */
function generateAccessToken(payload) {
  const expiration = process.env.JWT_ACCESS_TOKEN_EXPIRATION || '5m';
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: expiration }
  );
}

/**
 * Generate a long-lived refresh token
 * Expiration time can be configured via JWT_REFRESH_TOKEN_EXPIRATION env variable (default: 7d)
 */
function generateRefreshTokenJWT(payload) {
  const expiration = process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d';
  return jwt.sign(
    {
      userId: payload.userId,
      tokenId: payload.tokenId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: expiration }
  );
}

/**
 * Verify and decode an access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
}

/**
 * Verify and decode a refresh token JWT
 */
function verifyRefreshTokenJWT(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
}

/**
 * Extract device info from request headers
 */
function getDeviceInfo(req) {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  return userAgent.substring(0, 255);
}

/**
 * Extract IP address from request
 */
function getIpAddress(req) {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress || 
         'Unknown';
}

module.exports = {
  generateAccessToken,
  generateRefreshTokenJWT,
  verifyAccessToken,
  verifyRefreshTokenJWT,
  getDeviceInfo,
  getIpAddress
};

