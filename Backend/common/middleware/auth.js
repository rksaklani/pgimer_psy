const { verifyAccessToken } = require('../utils/tokenUtils');
const { query } = require('../database/pool');

// Verify JWT token (access token)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = verifyAccessToken(token);
    
    // Verify user still exists and get current role
    const userResult = await query(
      'SELECT id, name, role, email FROM users WHERE id = $1 AND email = $2',
      [decoded.userId, decoded.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const flatRoles = roles.flat();
    const userRole = req.user.role ? req.user.role.trim() : null;
    const normalizedRoles = flatRoles.map(r => typeof r === 'string' ? r.trim() : r);
    
    const hasAccess = normalizedRoles.some(role => 
      userRole && userRole.toLowerCase() === role.toLowerCase()
    );

    if (!hasAccess) {
      console.error(`[Authorization] User role "${userRole}" not in allowed roles: [${normalizedRoles.join(', ')}]`);
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${normalizedRoles.join(', ')}. Your role: ${userRole || 'unknown'}` 
      });
    }

    next();
  };
};

// Specific role middlewares
const requireAdmin = authorizeRoles('Admin');
const requireMWO = authorizeRoles('Psychiatric Welfare Officer');
const requireDoctor = authorizeRoles('Faculty', 'Resident');
const requireMWOOrDoctor = authorizeRoles('Psychiatric Welfare Officer', 'Faculty', 'Resident');

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireMWO,
  requireDoctor,
  requireMWOOrDoctor
};

