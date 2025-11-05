  /**
   * API Configuration
   */
  export const API_CONFIG = {
    BASE_URL: 'http://192.168.100.190:3000/api/v1',
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
    SEARCH: '/vehicles/search',
    BY_STATION: (stationId: string) => `/vehicles/stations/${stationId}/available`,
  };
``
  /**
   * Booking Endpoints
   */
  export const BOOKING_ENDPOINTS = {
    LIST: '/bookings',
    CREATE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    CONFIRM: (id: string) => `/bookings/${id}/confirm`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    COMPLETE: (id: string) => `/bookings/${id}/complete`,
    CALCULATE_PRICE: '/bookings/calculate-price',
  };


  /**
   * Payment Endpoints
   */

  export const PAYMENT_ENDPOINTS = {
    LIST: '/payments',
    CREATE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    CHECK_STATUS: (id: string) => `/payments/${id}/status`,
    VERIFY: '/payments/verify',
    METHODS: '/payments/methods',
    ADD_METHOD: '/payments/methods',
    REMOVE_METHOD: (id: string) => `/payments/methods/${id}`,
    CREATE_DEPOSIT: (bookingId: string) => `/payments/${bookingId}/deposit`,
    CREATE_PAYOS: '/payments/payos/create',
    BY_BOOKING: (bookingId: string) => `/payments/booking/${bookingId}`,
    CREATE_FINAL: (rentalId: string) => `/payments/rental/${rentalId}/final`,
    BY_RENTAL: (rentalId: string) => `/payments/rental/${rentalId}`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    HISTORY: '/payments/history',
    PAYOS_CALLBACK: '/payments/payos/callback',
    PAYOS_CLIENT_CALLBACK: '/payments/payos/client-callback',
    VNPAY_CALLBACK: '/payments/vnpay/callback',
  };