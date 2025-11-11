import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, STORAGE_KEYS } from '../api/api';
import { AUTH_ENDPOINTS } from '../constants/apiEndpoints';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
} from '../types/auth';
import { ApiResponse } from '../types/apiResponse';

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

    // Save tokens and user info
    await this.saveAuthData(response.data);

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
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
   * Get current user from API
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(AUTH_ENDPOINTS.ME);

    // api.get already returns response.data, so response is { success, data }
    // We need to extract the user from response.data
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
    const response = await api.patch<ApiResponse<User>>('/users/profile', data);

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
  private async saveAuthData(authData: AuthResponse['data']): Promise<void> {
    const { tokens, user } = authData;
    
    // Normalize _id to id for consistency
    if (user._id && !user._id) {
      user._id = user._id;
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
