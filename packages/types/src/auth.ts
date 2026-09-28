import { UserRole } from './enums';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  department?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuthTokenPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: UserRecord;
}
