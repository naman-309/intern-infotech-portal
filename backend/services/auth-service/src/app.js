const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { config, errorHandler } = require('@portal/shared');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.set('trust proxy', 1);

// Security and middleware
app.use(helmet());
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// CORS configuration (narrow & credential-enabled)
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'auth-service', timestamp: new Date() });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);

// Error Handling
app.use(errorHandler);

const PORT = config.ports.auth;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[AuthService] Running on port ${PORT} in ${config.env} mode`);
  });
}

module.exports = app;
