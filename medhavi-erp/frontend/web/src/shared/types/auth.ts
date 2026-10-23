export interface AuthUser {
  id: string;
  instituteId: string | null;
  email: string;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  status: string;
  mfaEnabled: boolean;
  mustChangePassword: boolean;
}

export interface AuthRole {
  key: string;
  name: string;
  scopeType: string;
  scopeId: string | null;
  isPrimary: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
  roles: AuthRole[];
  permissions: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}
