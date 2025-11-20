/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: "http://192.168.100.190:3000/api/v1",
  TIMEOUT: 30000, // 30 seconds
  VERSION: "v1",
};

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  ME: "/auth/me",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_VERIFICATION: "/auth/resend-verification",
  SEND_VERIFICATION: "/auth/send-verification",
  VERIFICATION_STATUS: (email: string) => `/auth/verification-status/${email}`,
  ACCOUNT_VERIFICATION_STATUS: "/users/verification/status", // ✅ Check account verification status (document verification)
};

/**
 * Station Endpoints
 */
export const STATION_ENDPOINTS = {
  LIST: "/stations",
  NEARBY: "/stations/nearby",
  BY_ID: (id: string) => `/stations/${id}`,
  VEHICLES: (id: string) => `/stations/${id}/vehicles`,
  BY_CITY: (city: string) => `/stations/city/${city}`,
};

/**
 * Vehicle Endpoints
 */
export const VEHICLE_ENDPOINTS = {
  LIST: "/vehicles",
  BY_ID: (id: string) => `/vehicles/${id}`,
  SEARCH: "/vehicles/search",
  BY_STATION: (stationId: string) =>
    `/vehicles/stations/${stationId}/available`,
};
``;
/**
 * Booking Endpoints
 */
export const BOOKING_ENDPOINTS = {
  LIST: "/bookings",
  CREATE: "/bookings",
  BY_ID: (id: string) => `/bookings/${id}`,
  CONFIRM: (id: string) => `/bookings/${id}/confirm`,
  CANCEL: (id: string) => `/bookings/${id}/cancel`,
  COMPLETE: (id: string) => `/bookings/${id}/complete`,
  CALCULATE_PRICE: "/bookings/calculate-price",
};
/**
 * Rental Endpoints
 */
export const RENTAL_ENDPOINTS = {
  LIST: "/rentals",
  ACTIVE: "/rentals/active",
  BY_ID: (id: string) => `/rentals/${id}`,
  REPORT_ISSUE: (id: string) => `/rentals/${id}/report-issue`,
  ISSUES: (id: string) => `/rentals/${id}/issues`,
  COMPLETE_RETURN: (id: string) => `/rentals/${id}/complete-return`,
  REVERT_PAYMENT: (id: string) => `/rentals/${id}/revert-payment`,
};

/**
 * Issue Endpoints
 */
export const ISSUE_ENDPOINTS = {
  LIST: "/issues", // Get user's issues
  ALL: "/issues/all", // Get all issues (staff/admin only)
  BY_ID: (id: string) => `/issues/${id}`, // Get issue detail (staff/admin)
  DETAIL: (id: string) => `/issues/${id}/detail`, // Get issue detail (customer own issues)
  CREATE: "/issues", // Create issue
  CREATE_RENTAL_ISSUE: (rentalId: string) => `/issues/rental/${rentalId}`, // Create issue for specific rental
  GET_RENTAL_ISSUES: (rentalId: string) => `/issues/rental/${rentalId}`, // Get issues by rental
  UPDATE: (id: string) => `/issues/${id}`, // Update issue (staff/admin)
  ADD_RESOLUTION: (id: string) => `/issues/${id}/resolution`, // Add resolution
  UPDATE_RESOLUTION: (id: string) => `/issues/${id}/resolution`, // Update resolution
  ASSIGN: (id: string) => `/issues/${id}/assign`, // Assign issue
  RESOLVE: (id: string) => `/issues/${id}/resolve`, // Resolve issue
};

/**
 * Payment Endpoints
 */
export const PAYMENT_ENDPOINTS = {
  LIST: "/payments",
  CREATE: "/payments",
  BY_ID: (id: string) => `/payments/${id}`,
  CHECK_STATUS: (id: string) => `/payments/${id}/status`,
  VERIFY: "/payments/verify",
  METHODS: "/payments/methods",
  ADD_METHOD: "/payments/methods",
  REMOVE_METHOD: (id: string) => `/payments/methods/${id}`,
  
  // Deposit payment for booking
  CREATE_DEPOSIT: (bookingId: string) => `/payments/${bookingId}/deposit`,
  
  // PayOS payment gateway
  CREATE_PAYOS: "/payments/payos/create",
  PAYOS_CALLBACK: "/payments/payos/callback",
  PAYOS_STATUS: (paymentId: string) => `/payments/payos/${paymentId}/status`,
  PAYOS_CLIENT_CALLBACK: "/payments/payos/client-callback",
  
  // VNPay payment gateway
  VNPAY_CALLBACK: "/payments/vnpay/callback",
  
  // Get payments by booking/rental
  BY_BOOKING: (bookingId: string) => `/payments/bookings/${bookingId}`,
  BY_RENTAL: (rentalId: string) => `/payments/rentals/${rentalId}`,
  
  // Final payment for rental (customer)
  CREATE_FINAL: (rentalId: string) => `/payments/rentals/${rentalId}/final`,
  
  // Manual payments (staff only)
  MANUAL_BOOKING: (bookingId: string) => `/payments/manual/bookings/${bookingId}`,
  MANUAL_RENTAL: (rentalId: string) => `/payments/manual/rentals/${rentalId}/final`,
  PENDING: "/payments/pending",
  
  // Refund and history
  REFUND: (id: string) => `/payments/${id}/refund`,
  HISTORY: "/payments/history",
};

