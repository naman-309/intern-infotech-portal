const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { config } = require('@portal/shared');

const app = express();

app.use(helmet());
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// CORS configuration (enables credentials forwarding between React client & gateway)
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Gateway Health Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date(),
    services: {
      auth: config.serviceUrls.auth,
      user: config.serviceUrls.user,
      academic: config.serviceUrls.academic,
      notification: config.serviceUrls.notification,
    },
  });
});

const proxyOptions = {
  changeOrigin: true,
  ws: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      // Preserve client cookies and authorization headers
    },
    error: (err, req, res) => {
      console.error(`[GatewayProxyError] Target failure on ${req.method} ${req.url}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: 'Bad Gateway: Upstream microservice is temporarily unavailable. Please retry in a few seconds.',
        });
      }
    },
  },
};

// 1. Auth Service Routes
app.use(
  createProxyMiddleware({
    target: config.serviceUrls.auth,
    pathFilter: '/api/v1/auth',
    ...proxyOptions,
  })
);

// 2. User & Administration Service Routes
const userRoutesPrefixes = [
  '/api/v1/users',
  '/api/v1/students',
  '/api/v1/teachers',
  '/api/v1/registrations',
  '/api/v1/eligible-emails',
  '/api/v1/audit-logs',
  '/api/v1/profile',
  '/api/v1/change-password',
];
app.use(
  createProxyMiddleware({
    target: config.serviceUrls.user,
    pathFilter: userRoutesPrefixes,
    ...proxyOptions,
  })
);

// 3. Academic Service Routes
const academicRoutesPrefixes = [
  '/api/v1/courses',
  '/api/v1/batches',
  '/api/v1/exams',
  '/api/v1/results',
  '/api/v1/success-stories',
  '/api/v1/fees',
  '/api/v1/public',
];
app.use(
  createProxyMiddleware({
    target: config.serviceUrls.academic,
    pathFilter: academicRoutesPrefixes,
    ...proxyOptions,
  })
);

// 4. Notification Service Routes
app.use(
  createProxyMiddleware({
    target: config.serviceUrls.notification,
    pathFilter: '/api/v1/announcements',
    ...proxyOptions,
  })
);


const PORT = config.ports.gateway;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[APIGateway] Running on http://localhost:${PORT}`);
    console.log(`[APIGateway] Routing traffic to services:`);
    console.log(` - Auth: ${config.serviceUrls.auth}`);
    console.log(` - User: ${config.serviceUrls.user}`);
    console.log(` - Academic: ${config.serviceUrls.academic}`);
    console.log(` - Notification: ${config.serviceUrls.notification}`);
  });
}

module.exports = app;
