const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { config, errorHandler } = require('@portal/shared');

const userRoutes = require('./routes/userRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const eligibleEmailRoutes = require('./routes/eligibleEmailRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'user-service', timestamp: new Date() });
});

// Routes
app.use('/api/v1', userRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/eligible-emails', eligibleEmailRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);

app.use(errorHandler);

const PORT = config.ports.user;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[UserService] Running on port ${PORT} in ${config.env} mode`);
  });
}

module.exports = app;
