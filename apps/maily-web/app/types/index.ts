export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

export interface PresenceData {
  userId: string;
  name: string;
  avatar?: string;
  cursor?: {
    start: number;
    end: number;
  };
  lastActive: number;
}

export type PresenceMap = Record<string, PresenceData>;

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface AnalyticsMetric {
  timestamp: number;
  opens: number;
  clicks: number;
  bounces: number;
  conversions: number;
} 