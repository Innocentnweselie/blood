import express from 'express';
import https from 'https';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import Contact from '../models/Contact.js';
import { isValidEmail, normalizeEmail, normalizeText } from '../utils/validation.js';

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyHcaptcha = (token, remoteip) => {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    return Promise.resolve({ success: true, skipped: true });
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteip) {
    body.append('remoteip', remoteip);
  }
  const payload = body.toString();

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: 'POST',
        hostname: 'hcaptcha.com',
        path: '/siteverify',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (parseError) {
            reject(parseError);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

// POST contact message
router.post('/', contactLimiter, async (req, res) => {
  try {
    const name = normalizeText(req.body?.name, 120);
    const email = normalizeEmail(req.body?.email);
    const message = normalizeText(req.body?.message, 2000);
    const captchaToken = String(req.body?.captchaToken || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (process.env.HCAPTCHA_SECRET) {
      if (!captchaToken) {
        return res.status(400).json({ error: 'Captcha is required.' });
      }
      try {
        const verification = await verifyHcaptcha(captchaToken, req.ip);
        if (!verification?.success) {
          return res.status(400).json({ error: 'Captcha verification failed.' });
        }
      } catch (captchaError) {
        console.error('Captcha verification error:', captchaError);
        return res.status(502).json({ error: 'Captcha verification failed.' });
      }
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials are not set in .env file');
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email to the specified address
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: 'ngwainnocentnweselie3@gmail.com',
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact API Error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
