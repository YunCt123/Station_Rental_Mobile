import { ApiResponse } from "./apiResponse";

export interface EmailVerification {
  _id: string;
  user_id: string;
  email: string;
  verification_token: string;
  verification_code: string;
  expires_at: string;
  attempts: number;
  verified_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyEmailRequest {
  token?: string;
  code?: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface SendVerificationRequest {
  email: string;
}

export interface VerificationStatusParams {
  email: string;
}

export interface EmailVerificationData {
  email: string;
  verification_code?: string;
  expires_at: string;
  message: string;
}

export interface EmailVerifiedData {
  verified: boolean;
  verified_at: string;
  message: string;
  user?: {
    id: string;
    email: string;
    isEmailVerified: boolean;
  };
}

export interface VerificationStatusData {
  email: string;
  isVerified: boolean;
  verified_at?: string | null;
  attempts: number;
  maxAttempts: number;
  canResend: boolean;
  expiresAt?: string;
}

export type SendEmailVerificationResponse = ApiResponse<EmailVerificationData>;
export type VerifyEmailResponse = ApiResponse<EmailVerifiedData>;
export type ResendVerificationResponse = ApiResponse<EmailVerificationData>;
export type VerificationStatusResponse = ApiResponse<VerificationStatusData>;

