import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { fileTypeFromFile } from 'file-type';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { clearAuthCookies, ensureCsrfCookie, setAuthCookies } from '../utils/authCookies.js';
import { isValidEmail, normalizeEmail, normalizeText } from '../utils/validation.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MIN_PASSWORD_LENGTH = 8;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
});

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = path.basename(file.originalname || 'avatar', ext);
    const safeBase = base.replace(/[^a-z0-9_-]+/gi, '').slice(0, 40) || 'avatar';
    cb(null, `${safeBase}-${Date.now()}${ext}`);
  },
});

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!allowedExtensions.has(ext) || !allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error('Only image files are allowed.'));
  }
  return cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_AVATAR_SIZE } });

const uploadAvatar = (req, res, next) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (req.file?.path) {
      try {
        const detected = await fileTypeFromFile(req.file.path);
        if (!detected || !allowedMimeTypes.has(detected.mime)) {
          await fs.promises.unlink(req.file.path).catch(() => {});
          return res.status(400).json({ error: 'Only image files are allowed.' });
        }
      } catch (fileError) {
        await fs.promises.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ error: 'Invalid image upload.' });
      }
    }
    return next();
  });
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const serializeAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  theme: user.theme,
  role: user.role || 'storekeeper',
  adminId: user.adminId,
  mustChangePassword: Boolean(user.mustChangePassword),
});

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = Number.parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_LOCK_MINUTES = Number.parseInt(process.env.OTP_LOCK_MINUTES || '15', 10);

const hasVerifiedAdmin = async () => {
  const existing = await User.exists({ role: 'admin', isVerified: true });
  return Boolean(existing);
};

const getOtpLockRemainingMs = (user) => {
  if (!user?.otpLockedUntil) return 0;
  const remaining = user.otpLockedUntil.getTime() - Date.now();
  return remaining > 0 ? remaining : 0;
};

const isOtpLocked = (user) => getOtpLockRemainingMs(user) > 0;

const clearOtpLockIfExpired = (user) => {
  if (user?.otpLockedUntil && user.otpLockedUntil.getTime() <= Date.now()) {
    user.otpLockedUntil = undefined;
    user.otpAttempts = 0;
    return true;
  }
  return false;
};

const recordOtpFailure = (user) => {
  if (!user) return;
  const maxAttempts = Number.isFinite(OTP_MAX_ATTEMPTS) && OTP_MAX_ATTEMPTS > 0 ? OTP_MAX_ATTEMPTS : 5;
  const lockMinutes = Number.isFinite(OTP_LOCK_MINUTES) && OTP_LOCK_MINUTES > 0 ? OTP_LOCK_MINUTES : 15;
  user.otpAttempts = (user.otpAttempts || 0) + 1;
  if (user.otpAttempts >= maxAttempts) {
    user.otpLockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    user.otpAttempts = 0;
  }
};

const resetOtpAttempts = (user) => {
  if (!user) return;
  user.otpAttempts = 0;
  user.otpLockedUntil = undefined;
};

const otpLockMessage = (user) => {
  const remainingMs = getOtpLockRemainingMs(user);
  const minutes = Math.max(1, Math.ceil(remainingMs / 60000));
  return `Too many OTP attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
};

const sendSignupOtp = async ({ name, email, otp }) => {
  const displayName = name || 'there';
  const message = `Hi ${displayName},\n\nYour MedTracker verification code is: ${otp}\nIt expires in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nThanks,\nMedTracker Support`;

  await sendEmail({
    email,
    subject: 'MedTracker verification code',
    message,
  });
};

// Register User - Send OTP (bootstrap admin only)
router.post('/register', authLimiter, uploadAvatar, async (req, res) => {
  const name = normalizeText(req.body?.name, 120);
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const adminExists = await hasVerifiedAdmin();
    if (adminExists) {
      return res.status(403).json({ error: 'Registration is disabled. Contact your system administrator.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const cleared = clearOtpLockIfExpired(userExists);
      if (cleared) {
        await userExists.save();
      }
      if (isOtpLocked(userExists)) {
        return res.status(429).json({ error: otpLockMessage(userExists) });
      }
    }
    if (userExists && userExists.isVerified !== false) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + OTP_EXPIRY_MS;

    if (userExists && userExists.isVerified === false) {
      userExists.name = name || userExists.name;
      userExists.email = email;
      userExists.password = password;
      userExists.otp = otp;
      userExists.otpExpires = otpExpires;
      resetOtpAttempts(userExists);
      userExists.role = 'admin';
      if (avatarUrl) {
        userExists.avatarUrl = avatarUrl;
      }
      await userExists.save();
    } else {
      await User.create({
        name,
        email,
        password,
        avatarUrl,
        otp,
        otpExpires,
        isVerified: false,
        role: 'admin',
        otpAttempts: 0,
      });
    }

    try {
      await sendSignupOtp({ name, email, otp });
    } catch (emailError) {
      console.error('Error sending signup OTP email:', emailError);
      const allowDevOtp = process.env.NODE_ENV !== 'production';
      if (allowDevOtp) {
        return res.status(200).json({
          message: 'OTP generated, but email delivery failed.',
          otp,
        });
      }
      return res.status(500).json({ error: 'Failed to send verification code.' });
    }

    return res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Signup OTP
router.post('/register/verify', otpLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const otp = normalizeText(req.body?.otp, 10);
  try {
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid OTP or OTP expired' });
    }
    const cleared = clearOtpLockIfExpired(user);
    if (cleared) {
      await user.save();
    }
    if (isOtpLocked(user)) {
      return res.status(429).json({ error: otpLockMessage(user) });
    }
    const otpValid = user.otp === otp && user.otpExpires && user.otpExpires.getTime() > Date.now();
    if (!otpValid) {
      recordOtpFailure(user);
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP or OTP expired' });
    }
    const verifiedAdmin = await User.findOne({ role: 'admin', isVerified: true });
    if (verifiedAdmin && verifiedAdmin._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Registration is disabled. Contact your system administrator.' });
    }

    user.isVerified = true;
    if (!user.role) {
      user.role = 'admin';
    }
    user.otp = undefined;
    user.otpExpires = undefined;
    resetOtpAttempts(user);
    await user.save();

    try {
      const message = `Hi ${user.name || 'there'},\n\nYour MedTracker account was created successfully. You can now log in and start managing your medical inventory.\n\nBest regards,\nThe MedTracker Team`;

      await sendEmail({
        email: user.email,
        subject: 'Your MedTracker account was created successfully',
        message,
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    const token = generateToken(user._id);
    const csrfToken = setAuthCookies(res, token);

    return res.json({ user: serializeAuthUser(user), csrfToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login User
router.post('/login', authLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (user.isVerified === false) {
        return res.status(403).json({ error: 'Please verify your email first.' });
      }
      const token = generateToken(user._id);
      const csrfToken = setAuthCookies(res, token);
      return res.json({ user: serializeAuthUser(user), csrfToken });
    }
    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user session
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    const csrfToken = ensureCsrfCookie(req, res);
    return res.json({ user: serializeAuthUser(req.user), csrfToken });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Logout - Clear auth cookies
router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out' });
});

// Forgot Password - Generate OTP
router.post('/forgot-password', otpLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  try {
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const cleared = clearOtpLockIfExpired(user);
    if (cleared) {
      await user.save();
    }
    if (isOtpLocked(user)) {
      return res.status(429).json({ error: otpLockMessage(user) });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + OTP_EXPIRY_MS;
    resetOtpAttempts(user);
    await user.save();

    const displayName = user.name || 'there';
    const message = `Hi ${displayName},\n\nYour MedTracker password reset code is: ${otp}\nIt expires in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nThanks,\nMedTracker Support`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'MedTracker password reset code',
        message,
      });
      res.json({ message: 'OTP sent to email' });
    } catch (emailError) {
      user.otp = undefined;
      user.otpExpires = undefined;
      resetOtpAttempts(user);
      await user.save();
      console.error('Error sending OTP email:', emailError);
      res.status(500).json({ error: 'Failed to send OTP email.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password - Verify OTP and Update Password
router.post('/reset-password', otpLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const otp = normalizeText(req.body?.otp, 10);
  const newPassword = String(req.body?.newPassword || '');
  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid OTP or OTP expired' });
    }
    const cleared = clearOtpLockIfExpired(user);
    if (cleared) {
      await user.save();
    }
    if (isOtpLocked(user)) {
      return res.status(429).json({ error: otpLockMessage(user) });
    }
    const otpValid = user.otp === otp && user.otpExpires && user.otpExpires.getTime() > Date.now();
    if (!otpValid) {
      recordOtpFailure(user);
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP or OTP expired' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    resetOtpAttempts(user);
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
