import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import passport from 'passport';
import connectDB from './config/db.js';
import configurePassport from './config/passport.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { csrfProtect } from './middleware/csrfMiddleware.js';

// Import Routes
import itemRoutes from './routes/itemRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import authRoutes from './routes/authRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
app.disable('x-powered-by');
const logFile = process.env.LOG_FILE;
if (logFile) {
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  app.use(morgan('combined', { stream: logStream }));
} else {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);
const allowedOrigins = new Set([process.env.CLIENT_URL || 'http://localhost:5173']);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    },
  })
);

// Passport
configurePassport(passport);
app.use(passport.initialize());

// Database Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/api/contact', contactRoutes);

// CSRF protection for authenticated cookie-based requests
app.use(csrfProtect);

app.use('/api/items', itemRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('MedTracker API is running...');
});

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy, retrying in 1 second...`);
      setTimeout(() => {
        server.close();
        startServer();
      }, 1000);
    }
  });
};

startServer();
