import { api } from '../api/api';
import { ApiResponse } from '../types/apiResponse';

/**
 * Verification Service
 * Handles user verification operations (ID card, driver license)
 */
class VerificationService {
  private readonly BASE_PATH = 'users/verification';

  /**
   * Upload all verification images at once
   */
  async uploadVerificationImages(data: {
    idCardFront?: string;
    idCardBack?: string;
    driverLicense?: string;
    selfiePhoto?: string;
  }): Promise<any> {
    const response = await api.post<ApiResponse<any>>(
      `${this.BASE_PATH}/upload`,
      data
    );
    return response.data;
  }

  /**
   * Update a specific verification document
   */
  async updateVerificationDocument(
    documentType: 'idCardFront' | 'idCardBack' | 'driverLicense' | 'selfiePhoto',
    imageUrl: string
  ): Promise<any> {
    const response = await api.patch<ApiResponse<any>>(
      `${this.BASE_PATH}/upload/${documentType}`,
      { [documentType]: imageUrl }
    );
    return response.data;
  }

  /**
   * Get current verification status
   */
  async getVerificationStatus(): Promise<{
    verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    idCardFront?: string;
    idCardBack?: string;
    driverLicense?: string;
    selfiePhoto?: string;
  }> {
    const response = await api.get<ApiResponse<any>>(
      `${this.BASE_PATH}/status`
    );
    return response.data;
  }
}

export const verificationService = new VerificationService();
