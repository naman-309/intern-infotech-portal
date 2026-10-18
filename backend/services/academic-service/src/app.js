const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { config, errorHandler } = require('@portal/shared');

const courseRoutes = require('./routes/courseRoutes');
const batchRoutes = require('./routes/batchRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');
const successStoryRoutes = require('./routes/successStoryRoutes');
const feeRoutes = require('./routes/feeRoutes');
const publicRoutes = require('./routes/publicRoutes');
const mockInterviewRoutes = require('./routes/mockInterviewRoutes');

const app = express();

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
  res.status(200).json({ status: 'UP', service: 'academic-service', timestamp: new Date() });
});

// Routes
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/success-stories', successStoryRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/mock-interviews', mockInterviewRoutes);

app.use(errorHandler);

const PORT = config.ports.academic;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[AcademicService] Running on port ${PORT} in ${config.env} mode`);
  });
}

module.exports = app;
