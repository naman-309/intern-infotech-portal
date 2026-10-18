const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { config, errorHandler, initEmailSubscriber } = require('@portal/shared');
const announcementRoutes = require('./routes/announcementRoutes');


const app = express();

app.use(helmet());
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'notification-service', timestamp: new Date() });
});

app.use('/api/v1/announcements', announcementRoutes);

app.use(errorHandler);

const PORT = config.ports.notification;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[NotificationService] Running on port ${PORT} in ${config.env} mode`);
    // Start Redis Pub/Sub subscriber — processes email jobs from all other microservices
    initEmailSubscriber();
  });
}

module.exports = app;
