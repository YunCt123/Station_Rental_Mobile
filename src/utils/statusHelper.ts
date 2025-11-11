/**
 * Helper functions to format booking and payment status to Vietnamese
 */

// Booking Status Mapping
export const BOOKING_STATUS = {
  HELD: "Đang giữ chỗ",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
} as const;

// Payment Status Mapping
export const PAYMENT_STATUS = {
  PENDING: "Đang chờ",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
} as const;

// Booking Status Colors
export const BOOKING_STATUS_COLORS = {
  HELD: "#F59E0B", // Orange - Waiting
  CONFIRMED: "#10B981", // Green - Success
  CANCELLED: "#EF4444", // Red - Error
  EXPIRED: "#6B7280", // Gray - Neutral
} as const;

// Payment Status Colors
export const PAYMENT_STATUS_COLORS = {
  PENDING: "#F59E0B", // Orange - Waiting
  SUCCESS: "#10B981", // Green - Success
  FAILED: "#EF4444", // Red - Error
} as const;

/**
 * Get Vietnamese label for booking status
 */
export const getBookingStatusLabel = (
  status: "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
): string => {
  return BOOKING_STATUS[status] || status;
};

/**
 * Get Vietnamese label for payment status
 */
export const getPaymentStatusLabel = (
  status: "PENDING" | "SUCCESS" | "FAILED"
): string => {
  return PAYMENT_STATUS[status] || status;
};

/**
 * Get color for booking status
 */
export const getBookingStatusColor = (
  status: "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
): string => {
  return BOOKING_STATUS_COLORS[status] || "#6B7280";
};

/**
 * Get color for payment status
 */
export const getPaymentStatusColor = (
  status: "PENDING" | "SUCCESS" | "FAILED"
): string => {
  return PAYMENT_STATUS_COLORS[status] || "#6B7280";
};

/**
 * Get detailed description for booking status
 */
export const getBookingStatusDescription = (
  status: "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
): string => {
  const descriptions = {
    HELD: "Booking đang được giữ chỗ, chờ thanh toán cọc",
    CONFIRMED: "Booking đã được xác nhận, đã thanh toán cọc thành công",
    CANCELLED: "Booking đã bị hủy bởi người dùng hoặc hệ thống",
    EXPIRED: "Booking đã hết hạn do không thanh toán cọc đúng thời gian",
  };
  return descriptions[status] || "";
};

/**
 * Get detailed description for payment status
 */
export const getPaymentStatusDescription = (
  status: "PENDING" | "SUCCESS" | "FAILED"
): string => {
  const descriptions = {
    PENDING: "Thanh toán đang được xử lý, chờ xác nhận từ cổng thanh toán",
    SUCCESS: "Thanh toán thành công, booking đã được xác nhận",
    FAILED: "Thanh toán thất bại, vui lòng thử lại",
  };
  return descriptions[status] || "";
};

/**
 * Flow explanation:
 *
 * BOOKING FLOW:
 * 1. User creates booking → Status: HELD (Đang giữ chỗ)
 * 2. User pays deposit → Status: CONFIRMED (Đã xác nhận)
 * 3. User cancels OR doesn't pay in time:
 *    - If user cancels → CANCELLED (Đã hủy)
 *    - If timeout → EXPIRED (Hết hạn)
 *
 * PAYMENT FLOW:
 * 1. User initiates payment → Status: PENDING (Đang chờ)
 * 2. Payment gateway processes:
 *    - If success → SUCCESS (Thành công)
 *    - If failed → FAILED (Thất bại)
 */
