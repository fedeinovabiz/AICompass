import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio en produccion');
}
if (isProduction && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL es obligatorio en produccion');
}
if (isProduction && !process.env.AI_API_KEY) {
  throw new Error('AI_API_KEY es obligatorio en produccion');
}

export const config = {
  port: parseInt(process.env.PORT || '3002'),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/ai_compass',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  aiModel: process.env.AI_MODEL || 'gemini-2.5-pro',
  aiApiKey: process.env.AI_API_KEY || '',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  nodeEnv: process.env.NODE_ENV || 'development',
};
