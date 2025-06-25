import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// 1. Sign access token
export function signAccessToken(userId, email) {
    return jwt.sign({ userId, email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

// 2. Sign refresh token
export function signRefreshToken(userId, email) {
    return jwt.sign({ userId, email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// 3. Verify access token
export function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET);
}

// 4. Verify refresh token
export function verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_SECRET);
}
