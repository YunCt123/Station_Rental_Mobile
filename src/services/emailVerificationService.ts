import { api } from "../api/api";
import { AUTH_ENDPOINTS } from "../constants/apiEndpoints";
import { ApiResponse } from "../types/apiResponse";
import {
  VerifyEmailRequest,
  EmailVerifiedData,
  ResendVerificationRequest,
  EmailVerificationData,
  SendVerificationRequest,
  VerificationStatusData,
} from "../types/emailVerification";

class EmailVerificationService {
  /**
   * Verify email with OTP code or token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<EmailVerifiedData>> {
    try {
      const response = await api.post<ApiResponse<EmailVerifiedData>>(
        AUTH_ENDPOINTS.VERIFY_EMAIL,
        data
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(
    data: ResendVerificationRequest
  ): Promise<ApiResponse<EmailVerificationData>> {
    try {
      const response = await api.post<ApiResponse<EmailVerificationData>>(
        AUTH_ENDPOINTS.RESEND_VERIFICATION,
        data
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Send verification email (for already registered users)
   */
  async sendVerification(
    data: SendVerificationRequest
  ): Promise<ApiResponse<EmailVerificationData>> {
    try {
      const response = await api.post<ApiResponse<EmailVerificationData>>(
        AUTH_ENDPOINTS.SEND_VERIFICATION,
        data
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Check verification status
   */
  async getVerificationStatus(
    email: string
  ): Promise<ApiResponse<VerificationStatusData>> {
    try {
      const response = await api.get<ApiResponse<VerificationStatusData>>(
        AUTH_ENDPOINTS.VERIFICATION_STATUS(email)
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
