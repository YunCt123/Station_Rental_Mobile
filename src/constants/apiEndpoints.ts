/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.82:3000/api/v1',
  TIMEOUT: 30000, // 30 seconds
  VERSION: 'v1',
};

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

/**
 * Station Endpoints
 */
export const STATION_ENDPOINTS = {
  LIST: '/stations',
  NEARBY: '/stations/nearby',
  BY_ID: (id: string) => `/stations/${id}`,
  VEHICLES: (id: string) => `/stations/${id}/vehicles`,
  BY_CITY: (city: string) => `/stations/city/${city}`,
};

/**
 * Vehicle Endpoints
 */
export const VEHICLE_ENDPOINTS = {
  LIST: '/vehicles',
  BY_ID: (id: string) => `/vehicles/${id}`,
  AVAILABLE: '/vehicles/available',
  BY_STATION: (stationId: string) => `/vehicles/station/${stationId}`,
};

/**
 * Booking Endpoints
 */
export const BOOKING_ENDPOINTS = {
  CREATE: '/bookings',
  LIST: '/bookings',
  BY_ID: (id: string) => `/bookings/${id}`,
  ACTIVE: '/bookings/active',
  HISTORY: '/bookings/history',
  CANCEL: (id: string) => `/bookings/${id}/cancel`,
  COMPLETE: (id: string) => `/bookings/${id}/complete`,
};

/**
 * User Endpoints
 */
export const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  UPLOAD_AVATAR: '/users/avatar',
  VERIFICATION_STATUS: '/users/verification-status',
  UPLOAD_DOCUMENTS: '/users/verification/documents',
};

/**
 * Payment Endpoints
 */
export const PAYMENT_ENDPOINTS = {
  CREATE: '/payments',
  BY_ID: (id: string) => `/payments/${id}`,
  VERIFY: '/payments/verify',
  METHODS: '/payments/methods',
  ADD_METHOD: '/payments/methods',
  REMOVE_METHOD: (id: string) => `/payments/methods/${id}`,
};

