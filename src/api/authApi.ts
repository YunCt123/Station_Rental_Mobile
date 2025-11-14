/**
 * @deprecated Use authService from services folder instead
 * This file is kept for backward compatibility
 */
import { authService } from '../services/authService';

// Re-export authService as authApi for backward compatibility
export const authApi = {
  register: authService.register.bind(authService),
  login: authService.login.bind(authService),
  logout: authService.logout.bind(authService),
  refreshToken: authService.refreshToken.bind(authService),
  getCurrentUser: authService.getCurrentUser.bind(authService),
  getStoredUser: authService.getStoredUser.bind(authService),
  getAccessToken: authService.getAccessToken.bind(authService),
  getRefreshToken: authService.getRefreshToken.bind(authService),
  isAuthenticated: authService.isAuthenticated.bind(authService),
  updateProfile: authService.updateProfile.bind(authService),
  getAccountVerificationStatus: authService.getAccountVerificationStatus.bind(authService),
};

// Export apiClient for backward compatibility
export { apiClient } from './api';

