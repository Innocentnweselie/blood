import { CSRF_COOKIE_NAME, TOKEN_COOKIE_NAME } from '../utils/authCookies.js';

const csrfProtect = (req, res, next) => {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return next();
  }

  const hasAuthCookie = Boolean(req.cookies?.[TOKEN_COOKIE_NAME]);
  if (!hasAuthCookie) {
    return next();
  }

  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
  const csrfHeader = req.headers['x-csrf-token'];
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'Invalid CSRF token.' });
  }
  return next();
};

export { csrfProtect };
