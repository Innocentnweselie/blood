import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { TOKEN_COOKIE_NAME } from '../utils/authCookies.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token && req.cookies?.[TOKEN_COOKIE_NAME]) {
    try {
      token = req.cookies[TOKEN_COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ error: 'Not authorized, no token' });
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  const role = req.user.role || 'storekeeper';
  if (!roles.includes(role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  return next();
};

export { protect, requireRole };
