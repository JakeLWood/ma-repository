export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}
