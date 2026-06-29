export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  tenantName: string;
}

export interface AuthSession {
  user: { id: string; email: string | null | undefined };
  tenantId: string;
  profile: { id: string; name: string; role: string };
}
