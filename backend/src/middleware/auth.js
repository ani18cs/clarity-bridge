const { authAdmin } = require('../config/firebaseAdmin');

/**
 * Optional Auth Middleware:
 * If an Authorization Bearer token is passed, verifies it and sets req.user.
 * If not, sets a guest user identifier so guests can still analyze documents.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = {
      uid: req.headers['x-guest-id'] || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isAnonymous: true,
      email: null
    };
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (authAdmin) {
      const decodedToken = await authAdmin.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null,
        isAnonymous: false
      };
    } else {
      req.user = {
        uid: 'user_fallback',
        email: 'user@example.com',
        isAnonymous: false
      };
    }
    next();
  } catch (err) {
    // If invalid token, fallback to guest
    req.user = {
      uid: `guest_${Date.now()}`,
      isAnonymous: true
    };
    next();
  }
}

/**
 * Strict Auth Middleware:
 * Requires valid Firebase ID token for protected routes like /api/history.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required to access this resource.'
    });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (authAdmin) {
      const decodedToken = await authAdmin.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null,
        isAnonymous: false
      };
      next();
    } else {
      // Test environment fallback
      req.user = { uid: 'test_user_id', isAnonymous: false };
      next();
    }
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token.'
    });
  }
}

module.exports = {
  optionalAuth,
  requireAuth
};
