import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '2024', 10),
  host: process.env.HOST || '127.0.0.1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET_KEY || 'default_jwt_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
};
