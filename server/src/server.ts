import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './utils/errors';

// Import routes
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import contactRoutes from './routes/contact.routes';
import dealRoutes from './routes/deal.routes';
import dealNestedRoutes from './routes/deal-nested.routes';
import documentRoutes from './routes/document.routes';
import checklistRoutes from './routes/checklist.routes';
import activityRoutes from './routes/activity.routes';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/deals', dealNestedRoutes);
app.use('/api', documentRoutes);
app.use('/api', checklistRoutes);
app.use('/api/activities', activityRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'M&A Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      companies: '/api/companies',
      contacts: '/api/contacts',
      deals: '/api/deals',
      documents: '/api/documents',
      checklists: '/api/checklists',
      activities: '/api/activities',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API: http://localhost:${config.port}/api`);
});

export default app;
