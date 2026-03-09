import crypto from 'crypto';

const TOKEN_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'mt_token';
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || 'mt_csrf';
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || 'lax';

const buildCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd || COOKIE_SAMESITE === 'none';
  return {
    httpOnly: true,
    secure,
    sameSite: COOKIE_SAMESITE,
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  };
};

const buildCsrfOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd || COOKIE_SAMESITE === 'none';
  return {
    httpOnly: false,
    secure,
    sameSite: COOKIE_SAMESITE,
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  };
};

const setAuthCookies = (res, token) => {
  const cookieOptions = buildCookieOptions();
  const csrfOptions = buildCsrfOptions();
  const csrfToken = crypto.randomBytes(24).toString('hex');
  res.cookie(TOKEN_COOKIE_NAME, token, cookieOptions);
  res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfOptions);
  return csrfToken;
};

const ensureCsrfCookie = (req, res) => {
  if (req.cookies?.[CSRF_COOKIE_NAME]) {
    return null;
  }
  const csrfOptions = buildCsrfOptions();
  const csrfToken = crypto.randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfOptions);
  return csrfToken;
};

const clearAuthCookies = (res) => {
  const cookieOptions = buildCookieOptions();
  const csrfOptions = buildCsrfOptions();
  res.clearCookie(TOKEN_COOKIE_NAME, cookieOptions);
  res.clearCookie(CSRF_COOKIE_NAME, csrfOptions);
};

export { TOKEN_COOKIE_NAME, CSRF_COOKIE_NAME, setAuthCookies, ensureCsrfCookie, clearAuthCookies };
