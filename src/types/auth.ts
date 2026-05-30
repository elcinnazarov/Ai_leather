export interface LoginRequest {
  email: string;
  password?: string; // Sometimes APIs omit this in responses, but it's for request
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number | string;
    name: string;
    email: string;
    role?: string;
  };
}
