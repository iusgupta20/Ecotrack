import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let mongoServer: MongoMemoryServer | null = null;
const isProduction = process.env.NODE_ENV === 'production';
const clientOrigin = process.env.CLIENT_ORIGIN;
const clientDistPath = path.resolve(__dirname, '../../client/dist');

app.disable('x-powered-by');

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: isProduction ? (clientOrigin ? [clientOrigin] : false) : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);

// Mount routes
app.use('/api', apiRouter);

// Root endpoint for status health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

if (isProduction) {
  app.use(express.static(clientDistPath));

  app.get(/^(?!\/api|\/health).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Database connection & Server Startup
const startServer = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (uri) {
      console.log('Connecting to external MongoDB...');
      await mongoose.connect(uri);
      console.log('Connected to external MongoDB successfully.');
    } else {
      console.log('No MONGODB_URI found. Bootstrapping MongoDB Memory Server...');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to local In-Memory MongoDB successfully.');
    }

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    console.log('In-memory MongoDB stopped.');
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

export { app }; // exported for supertest suite
