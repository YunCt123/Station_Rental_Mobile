import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, STORAGE_KEYS } from "../api/api";
import { AUTH_ENDPOINTS } from "../constants/apiEndpoints";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
} from "../types/auth";
import { ApiResponse } from "../types/apiResponse";

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Transform data to match backend expectations
    const requestBody = {
      name: data.fullName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
    };

    const response = await api.post<AuthResponse>(
      AUTH_ENDPOINTS.REGISTER,
      requestBody
    );

    // Save tokens and user info
    await this.saveAuthData(response.data);

    return response;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, data);

    // Save tokens first (required for /auth/me API call)
    const { tokens, user } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

    // Fetch complete user data from /auth/me to get verification fields
    try {
      const completeUser = await this.getCurrentUser();
      response.data.user = completeUser;
    } catch (error) {
      console.error("Failed to fetch complete user data:", error);
      await this.saveAuthData(response.data);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
      );
      if (refreshToken) {
        await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
      }
    } catch (error) {
      // Silent error handling
    } finally {
      // Clear all local data
      await this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REFRESH, data);

    // Update tokens in storage
    const { tokens } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

    return response;
  }

  /**
   * Get account verification status (for booking permission)
   * Calls: GET /users/verification/status
   * Returns verification status for CCCD + GPLX documents
   */
  async getAccountVerificationStatus(): Promise<{
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    hasImages: {
      idCardFront: boolean;
      idCardBack: boolean;
      driverLicense: boolean;
      selfiePhoto: boolean;
    };
    verifiedAt?: string;
    verifiedBy?: string;
  }> {
    try {
      console.log(
        "🔍 [AuthService] Calling API:",
        AUTH_ENDPOINTS.ACCOUNT_VERIFICATION_STATUS
      );
      const response = await api.get<ApiResponse<any>>(
        AUTH_ENDPOINTS.ACCOUNT_VERIFICATION_STATUS
      );
      console.log(
        "📦 [AuthService] Raw API Response:",
        JSON.stringify(response, null, 2)
      );

      // api.get already extracts response.data, so response is likely { success: true, data: {...} }
      // OR it might be the data directly depending on axios interceptor
      let verificationData = response;

      // If response has 'data' property, extract it
      if (
        verificationData &&
        typeof verificationData === "object" &&
        "data" in verificationData
      ) {
        verificationData = (verificationData as any).data;
        console.log(
          "📦 [AuthService] Extracted nested data:",
          JSON.stringify(verificationData, null, 2)
        );
      }

      // Now verificationData should be the actual verification object from backend
      console.log(
        "👤 [AuthService] Verification Data:",
        JSON.stringify(verificationData, null, 2)
      );

      // Backend returns this structure from getVerificationStatus:
      // {
      //   verificationStatus: user.verificationStatus,
      //   rejectionReason: user.rejectionReason,
      //   hasImages: { idCardFront: !!user.idCardFront, ... },
      //   verifiedAt: user.verifiedAt,
      //   verifiedBy: user.verifiedBy,
      // }

      // Validate that we have the expected structure
      if (!verificationData || typeof verificationData !== "object") {
        console.error("❌ [AuthService] Invalid verification data structure");
        throw new Error("Invalid response from verification status API");
      }

      // Check if verificationStatus exists in response
      const rawVerificationStatus = (verificationData as any)
        .verificationStatus;
      console.log(
        "🔍 [AuthService] Raw verificationStatus from API:",
        rawVerificationStatus
      );

      if (!rawVerificationStatus) {
        console.error(
          "❌ [AuthService] verificationStatus is missing in API response!"
        );
        console.error("❌ [AuthService] Full response data:", verificationData);
        throw new Error(
          "verificationStatus field is missing from API response. Please check backend."
        );
      }

      // Return the data as-is since backend already returns correct structure
      const result = {
        verificationStatus: rawVerificationStatus,
        rejectionReason: (verificationData as any).rejectionReason,
        hasImages: (verificationData as any).hasImages || {
          idCardFront: false,
          idCardBack: false,
          driverLicense: false,
          selfiePhoto: false,
        },
        verifiedAt: (verificationData as any).verifiedAt,
        verifiedBy: (verificationData as any).verifiedBy,
      };

      console.log(
        "✅ [AuthService] Final Result:",
        JSON.stringify(result, null, 2)
      );
      console.log(
        "✅ [AuthService] Verification Status =",
        result.verificationStatus
      );

      return result;
    } catch (error: any) {
      console.error(
        "❌ [AuthService] Error fetching verification status:",
        error
      );
      console.error("❌ [AuthService] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(AUTH_ENDPOINTS.ME);

      // api.get() returns axios response.data
      // Backend returns: { success: true, data: { user fields } }
      // So response = { success: true, data: {...} }
      // We need response.data to get the actual user object
      let userData: any;

      if ((response as any).success && (response as any).data) {
        // Response is { success, data } wrapper
        userData = (response as any).data;
      } else if (
        (response as any).id ||
        (response as any)._id ||
        (response as any).email
      ) {
        // Response is already the user object (direct)
        userData = response;
      } else {
        // Unexpected structure
        userData = (response as any).data || response;
      }

      // Normalize _id and id (support both directions)
      if (userData._id && !userData.id) {
        userData.id = userData._id;
      }
      if (userData.id && !userData._id) {
        userData._id = userData.id;
      }

      // ✅ Fetch verification status separately since /auth/me doesn't return it
      try {
        const verificationData = await api.get<ApiResponse<any>>(
          "users/verification/status"
        );
        let verificationStatus: any;

        if (
          (verificationData as any).success &&
          (verificationData as any).data
        ) {
          verificationStatus = (verificationData as any).data;
        } else {
          verificationStatus = verificationData;
        }

        // Merge verification data into user object
        if (verificationStatus) {
          userData.verificationStatus = verificationStatus.verificationStatus;
          userData.rejectionReason = verificationStatus.rejectionReason;
          userData.idCardFront = verificationStatus.idCardFront;
          userData.idCardBack = verificationStatus.idCardBack;
          userData.driverLicense = verificationStatus.driverLicense;
          userData.selfiePhoto = verificationStatus.selfiePhoto;
        }
      } catch (verificationError) {
        // If verification API fails, just continue without verification data
        console.warn("Could not fetch verification status:", verificationError);
      }

      // Update user info in storage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      return userData;
    } catch (error) {
      // If API fails, try to return stored user as fallback
      const storedUser = await this.getStoredUser();
      if (storedUser) {
        return storedUser;
      }
      throw error;
    }
  }

  /**
   * Alternative method: Get verification status from /auth/me endpoint
   * Use this as fallback if /users/verification/status fails
   */
  async getAccountVerificationStatusFromMe(): Promise<{
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    hasImages: {
      idCardFront: boolean;
      idCardBack: boolean;
      driverLicense: boolean;
      selfiePhoto: boolean;
    };
    verifiedAt?: string;
    verifiedBy?: string;
  }> {
    try {
      console.log(
        "🔍 [AuthService] Fallback: Getting verification from /auth/me"
      );
      const user = await this.getCurrentUser();

      console.log(
        "👤 [AuthService] User verificationStatus from /auth/me:",
        user.verificationStatus
      );

      // Check if verificationStatus is available
      if (!user.verificationStatus) {
        console.error(
          "❌ [AuthService] /auth/me does NOT return verificationStatus field!"
        );
        console.error(
          "❌ [AuthService] This means backend /auth/me endpoint needs to include this field."
        );
        throw new Error(
          "verificationStatus not available in /auth/me response. Backend needs to include this field."
        );
      }

      const result = {
        verificationStatus: user.verificationStatus,
        rejectionReason: user.rejectionReason,
        hasImages: {
          idCardFront: !!user.idCardFront,
          idCardBack: !!user.idCardBack,
          driverLicense: !!user.driverLicense,
          selfiePhoto: !!user.selfiePhoto,
        },
        verifiedAt: user.verifiedAt,
        verifiedBy: user.verifiedBy,
      };

      console.log(
        "✅ [AuthService] Verification from /auth/me:",
        JSON.stringify(result, null, 2)
      );
      return result;
    } catch (error) {
      console.error(
        "❌ [AuthService] Failed to get verification from /auth/me:",
        error
      );
      throw error;
    }
  }

  /**
   * Get stored user from local storage
   */
  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<ApiResponse<User>>("/users/profile", data);

    // api.patch already returns response.data, extract user data correctly
    const userData = (response as any).data || response;

    // Backend returns _id but we need id, so normalize it
    if (userData._id && !userData.id) {
      userData.id = userData._id;
    }

    // Update user info in storage
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    return userData;
  }

  /**
   * Helper: Save authentication data to storage
   */
  private async saveAuthData(authData: AuthResponse["data"]): Promise<void> {
    const { tokens, user } = authData;

    // Normalize _id to id for consistency
    if (user._id && !user.id) {
      user.id = user._id;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Helper: Clear all authentication data from storage
   */
  private async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  }
}

// Export singleton instance
export const authService = new AuthService();
