import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from local server directory and workspace root
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://localhost:5175',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

// Handle Private Network Access (PNA) preflight header for Chromium-based browsers
app.use((req, res, next) => {
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  next();
});

// Dynamic CORS configuration supporting localhost, private LAN IPs, and production domains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile native apps, curl, postman)
      if (!origin) return callback(null, true);

      // Check explicit allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow loopback / localhost on any port
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow local Wi-Fi / private LAN subnets on any port (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      if (
        /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
          origin
        )
      ) {
        return callback(null, true);
      }

      // Allow Vercel preview domains
      if (/\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // In non-production environments, allow origin to facilitate local testing
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-refresh-token',
      'Access-Control-Request-Private-Network',
    ],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Serve static product images
const imagesDir = fs.existsSync(path.resolve(__dirname, '../public/images'))
  ? path.resolve(__dirname, '../public/images')
  : path.resolve(__dirname, '../client/public/images');
app.use('/images', express.static(imagesDir));

// API Root & Health Check
app.get('/', (req, res) => {
  res.json({
    message: '🌸 SEORA Backend API Server',
    health: '/api/health',
    status: 'active',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KoreanWeb Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contact', contactRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 SEORA Backend Server Running on port ${PORT} (0.0.0.0)`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${PORT} is already in use by another running instance.`);
      console.error(`💡 Tip: Close any other terminal running 'npm run dev' or kill the existing process.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

export default app;
