import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  LogoutRequest,
  User,
} from '../types/auth';

// API Base URL - URL của backend Express server, KHÔNG phải MongoDB connection string
const API_BASE_URL = 'http://192.168.1.82:3000/api/v1'; // Thay đổi nếu backend chạy ở port khác

// Storage keys
const ACCESS_TOKEN_KEY = '@access_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_KEY = '@user';

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm access token vào mọi request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Tự động refresh token khi hết hạn
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

          // Retry request với token mới
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token thất bại, logout user
        await authApi.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

  export const authApi = {
    // Register
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
      // Transform data to match backend expectations
      const requestBody = {
        name: data.fullName,  
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,  
        dateOfBirth: data.dateOfBirth,
      };
      
      const response = await apiClient.post<AuthResponse>('/auth/register', requestBody);
      
      console.log('Register response:', JSON.stringify(response.data, null, 2));
      
      // Lưu tokens và user info
      const { tokens, user } = response.data.data;
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return response.data;
    },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    console.log('Login response:', JSON.stringify(response.data, null, 2));
    
    // Lưu tokens và user info
    const { tokens, user } = response.data.data;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Xóa tất cả data local
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    }
  },

  // Refresh token
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
    
    const { tokens } = response.data.data;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    
    // Update user info in storage
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
    
    return response.data.data;
  },

  // Get stored user
  getStoredUser: async (): Promise<User | null> => {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Get stored access token
  getAccessToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Get stored refresh token
  getRefreshToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  },
};

// Export axios instance để dùng cho các API khác
export { apiClient };
