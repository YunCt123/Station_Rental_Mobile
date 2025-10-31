export interface User {
  id: string;
  email: string;
  phone?: string;
  phoneNumber?: string; // API might return phoneNumber instead of phone
  name?: string;
  fullName?: string;
  dateOfBirth?: string;
  role: 'customer' | 'staff' | 'admin';
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest { 
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phoneNumber: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}
