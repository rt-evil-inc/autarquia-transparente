import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { queries } from './server/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'parish';
  parish_id?: number;
  is_active: boolean;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'parish';
  parish_id?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    parish_id: user.parish_id,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = queries.getUserByEmail(email);

  if (!user || !user.is_active) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    parish_id: user.parish_id ?? undefined,
    is_active: user.is_active,
  };
}

export function getUserFromToken(token: string): User | null {
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const user = queries.getUserById(payload.userId);

  if (!user || !user.is_active) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    parish_id: user.parish_id ?? undefined,
    is_active: user.is_active,
  };
}