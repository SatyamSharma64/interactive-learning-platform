import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '1d'; // 10 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export const generateSalt = async (): Promise<string> => {
  return bcrypt.genSalt(10);
};

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate access token (short-lived)
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

// Generate both tokens
export const generateTokens = (userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  
  return { accessToken, refreshToken };
};

// Verify access token
export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Generate secure random token for refresh token storage
// export const generateSecureToken = (): string => {
//   return crypto.randomBytes(32).toString('hex');
// };

// Calculate refresh token expiration date
export const getRefreshTokenExpiration = (): Date => {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 7); // 7 days from now
  return expiration;
};