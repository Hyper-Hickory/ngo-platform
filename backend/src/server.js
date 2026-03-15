import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import eventRoutes from './routes/event.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import coordinatorRoutes from './routes/coordinator.routes.js';

// Import lifecycle service
import { updateEventLifecycles } from './services/event.service.js';

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use('/api', limiter);

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'NGO Platform API Server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/coordinator', coordinatorRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, async () => {
    // Sync event lifecycle statuses on startup
    await updateEventLifecycles();
    console.log('');
    console.log('🚀 ============================================');
    console.log(`🚀  NGO Platform API Server`);
    console.log(`🚀  Environment: ${config.env}`);
    console.log(`🚀  Port: ${PORT}`);
    console.log(`🚀  URL: http://localhost:${PORT}`);
    console.log('🚀 ============================================');
    console.log('');
    console.log('📡 Available Endpoints:');
    console.log('   GET  /health');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/auth/me');
    console.log('   GET  /api/events');
    console.log('   POST /api/events (admin)');
    console.log('   GET  /api/certificates/verify/:number');
    console.log('');
    console.log('📝 Default Admin Credentials:');
    console.log('   Email: admin@ngo.com');
    console.log('   Password: Admin@123');
    console.log('');
});

export default app;
