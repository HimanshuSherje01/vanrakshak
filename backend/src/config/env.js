import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tadoba_portal',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  demoMode: process.env.DEMO_MODE === 'true' && (process.env.NODE_ENV || 'development') !== 'production',
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'Forest Officer',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@tadoba.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@12345',
  },
};

if (env.nodeEnv === 'production' && env.jwtSecret === 'dev-only-secret-change-me') {
  throw new Error('JWT_SECRET must be set in production');
}

