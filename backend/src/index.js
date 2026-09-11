const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { config, loadSecretsFromSecretManager } = require('./config/env');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const analyzeRouter = require('./routes/analyze');
const pdfRouter = require('./routes/pdf');
const speechRouter = require('./routes/speech');
const historyRouter = require('./routes/history');

const app = express();

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible media/blob URLs for audio & PDFs
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Cloud Run internal)
    if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in container
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'clarity-bridge-backend',
    environment: config.nodeEnv,
    projectId: config.gcpProjectId,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/pdf', pdfRouter);
app.use('/api/speech', speechRouter);
app.use('/api/history', historyRouter);

// Serve Frontend Static Files in Production (Container / Cloud Run)
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// SPA Fallback for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).json({
        message: 'ClarityBridge Backend API is running.',
        docs: '/docs/architecture.md',
        health: '/api/health'
      });
    }
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server if run directly
if (require.main === module) {
  (async () => {
    await loadSecretsFromSecretManager();
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`ClarityBridge Server listening on port ${config.port}`, {
        port: config.port,
        environment: config.nodeEnv,
        projectId: config.gcpProjectId
      });
    });
  })();
}

module.exports = app;
