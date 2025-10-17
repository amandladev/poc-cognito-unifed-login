import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CognitoService } from './services/cognitoService.js';
import { FirebaseService } from './services/firebaseService.js';
import { AuthController } from './controllers/authController.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Parse JSON bodies
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

console.log('🚀 Initializing services...');

// Validate required environment variables
const requiredEnvVars = [
  'AWS_REGION',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID',
  'FIREBASE_SERVICE_ACCOUNT_PATH'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Cognito Service
const cognitoService = new CognitoService(
  process.env.AWS_REGION!,
  process.env.COGNITO_USER_POOL_ID!,
  process.env.COGNITO_CLIENT_ID!
);

// Initialize Firebase Service
const firebaseService = new FirebaseService(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH!
);

// Initialize Auth Controller
const authController = new AuthController(cognitoService, firebaseService);

console.log('✅ All services initialized successfully\n');

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', authController.healthCheck);

// Main token exchange endpoint
app.post('/auth/exchange-token', authController.exchangeToken);

// Get user info from Firebase
app.get('/auth/user/:userId', authController.getUserInfo);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 Cognito-Firebase Bridge Server');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Token exchange: http://localhost:${PORT}/auth/exchange-token`);
  console.log(`👤 User info: http://localhost:${PORT}/auth/user/:userId`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('✅ Ready to accept requests');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
