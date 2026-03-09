import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { setAuthCookies } from '../utils/authCookies.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const getAuthConfig = () => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const hasGoogleConfig = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  return { clientUrl, hasGoogleConfig };
};

const redirectConfigError = (res, clientUrl) =>
  res.redirect(`${clientUrl}/login?googleAuthError=config`);

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', (req, res, next) => {
  const { clientUrl, hasGoogleConfig } = getAuthConfig();
  if (!hasGoogleConfig) {
    return redirectConfigError(res, clientUrl);
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(
    req,
    res,
    next
  );
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', (req, res, next) => {
  const { clientUrl, hasGoogleConfig } = getAuthConfig();
  if (!hasGoogleConfig) {
    return redirectConfigError(res, clientUrl);
  }
  return passport.authenticate(
    'google',
    {
      failureRedirect: `${clientUrl}/login?googleAuthError=failed`,
      session: false,
    },
    (err, user) => {
      if (err || !user) {
        const code = err?.message === 'Google signup is disabled.' ? 'disabled' : 'failed';
        return res.redirect(`${clientUrl}/login?googleAuthError=${code}`);
      }
      const token = generateToken(user._id);
      setAuthCookies(res, token);

      return res.redirect(`${clientUrl}/login?googleAuth=success`);
    }
  )(req, res, next);
});

export default router;
