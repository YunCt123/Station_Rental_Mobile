import { api } from "../api/api";
import { BOOKING_ENDPOINTS } from "../constants/apiEndpoints";
import {
  Booking,
  BookingQueryParams,
  CreateBookingRequest,
  ConfirmBookingRequest,
  CancelBookingRequest,
} from "../types/booking";
import { ApiResponse } from "../types/apiResponse";

class BookingService {
  /**
   * Get all bookings of current user
   */
  async getUserBookings(params?: BookingQueryParams): Promise<Booking[]> {
    try {
      console.log(
        "[bookingService.getUserBookings] Calling API with params:",
        params
      );

      // Add populate parameter to request vehicle and station details
      const requestParams = {
        ...params,
        populate: "vehicle_id,station_id",
      };

      const res = await api.get(BOOKING_ENDPOINTS.LIST, {
        params: requestParams,
      });

      // api.get returns the response body (not the full Axios response)
      console.log(
        "[bookingService.getUserBookings] Response body:",
        JSON.stringify(res, null, 2)
      );

      return this.parseBookingsResponse(res);
    } catch (error: any) {
      console.error("[bookingService.getUserBookings] Error:", error);
      console.error(
        "[bookingService.getUserBookings] Error response:",
        error.response?.data
      );
      throw error;
    }
  }

  /**
   * Parse bookings response from different formats
   */
  private parseBookingsResponse(responseData: any): Booking[] {
    // Backend returns: { total: 0, first_booking: null, all_bookings_summary: [] }
    if (
      responseData?.all_bookings_summary &&
      Array.isArray(responseData.all_bookings_summary)
    ) {
      console.log(
        "[parseBookingsResponse] Found all_bookings_summary:",
        responseData.all_bookings_summary.length
      );
      return responseData.all_bookings_summary;
    }

    // Check if data field exists
    if (responseData?.data && Array.isArray(responseData.data)) {
      console.log(
        "[parseBookingsResponse] Found data array:",
        responseData.data.length
      );
      return responseData.data;
    }

    // Check if response is array directly
    if (Array.isArray(responseData)) {
      console.log(
        "[parseBookingsResponse] Response is array:",
        responseData.length
      );
      return responseData;
    }

    console.warn("[parseBookingsResponse] No bookings found in response");
    console.warn(
      "[parseBookingsResponse] Response keys:",
      Object.keys(responseData || {})
    );
    return [];
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      console.log("[bookingService.getBookingById] Fetching booking:", id);

      // Request backend to populate vehicle_id and station_id with full objects
      const res: any = await api.get(BOOKING_ENDPOINTS.BY_ID(id), {
        params: {
          populate: "vehicle_id,station_id", // Request backend to populate these fields
        },
      });

      console.log(
        "[bookingService.getBookingById] Response:",
        JSON.stringify(res, null, 2)
      );

      // Backend may return either { success, data: booking } or booking directly
      const booking: Booking = res?.data ?? res;

      console.log("[bookingService.getBookingById] Final booking:", {
        id: booking._id,
        has_vehicle_id: !!booking.vehicle_id,
        vehicle_id_type: typeof booking.vehicle_id,
        has_vehicle_snapshot: !!booking.vehicle_snapshot,
      });

      return booking;
    } catch (error: any) {
      console.error("[bookingService.getBookingById] Error:", error);
      console.error(
        "[bookingService.getBookingById] Error response:",
        error.response?.data
      );
      throw error;
    }
  }

  /**
   * Create new booking (status: HELD)
   */
  async createBooking(payload: CreateBookingRequest): Promise<Booking> {
    const res: any = await api.post(BOOKING_ENDPOINTS.LIST, payload);
    return (res?.data ?? res) as Booking;
  }

  /**
   * Confirm booking (start rental)
   */
  async confirmBooking(payload: ConfirmBookingRequest): Promise<Booking> {
    const res: any = await api.post(
      BOOKING_ENDPOINTS.CONFIRM(payload.bookingId)
    );
    return (res?.data ?? res) as Booking;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    id: string,
    payload: CancelBookingRequest
  ): Promise<Booking> {
    const res: any = await api.post(BOOKING_ENDPOINTS.CANCEL(id), payload);
    return (res?.data ?? res) as Booking;
  }

  /**
   * Calculate booking price before create
   */
  async calculateBookingPrice(data: {
    vehicleId: string;
    startAt: string;
    endAt: string;
    insurancePremium?: boolean;
    currency?: string;
  }): Promise<any> {
    try {
      console.log("🚀 [Mobile bookingService] calculateBookingPrice request:", {
        ...data,
        timestamp: new Date().toISOString(),
      });

      // Ensure currency is VND
      const requestData = {
        ...data,
        currency: "VND",
      };

      console.log("📤 [Mobile] Sending to backend:", requestData);

      const res: any = await api.post(
        BOOKING_ENDPOINTS.CALCULATE_PRICE,
        requestData
      );

      console.log("📥 [Mobile] Raw backend response:", res);
      console.log("📥 [Mobile] Response structure:", {
        hasData: !!res?.data,
        hasSuccess: !!res?.success,
        dataKeys: res?.data ? Object.keys(res.data) : [],
      });

      // Handle different response formats (like Web does)
      let pricingData;

      if (res?.data?.success && res?.data?.data) {
        // Backend format: { success: true, data: {...} }
        pricingData = res.data.data;
        console.log("✅ [Mobile] Using res.data.data format");
      } else if (res?.data) {
        // Direct data format
        pricingData = res.data;
        console.log("✅ [Mobile] Using res.data format");
      } else {
        // Fallback to res
        pricingData = res;
        console.log("✅ [Mobile] Using res format (fallback)");
      }

      console.log("💰 [Mobile] Final pricing data:", {
        basePrice: pricingData.basePrice || pricingData.base_price,
        totalPrice: pricingData.totalPrice || pricingData.total_price,
        deposit: pricingData.deposit,
        hourlyRate: pricingData.hourly_rate,
        dailyRate: pricingData.daily_rate,
      });

      // Validate pricing data
      if (!pricingData.totalPrice && !pricingData.total_price) {
        console.error(
          "❌ [Mobile] Backend returned invalid pricing:",
          pricingData
        );
        throw new Error("Backend không trả về giá hợp lệ");
      }

      return pricingData;
    } catch (error: any) {
      console.error("💥 [Mobile] calculateBookingPrice error:", error);
      console.error("💥 [Mobile] Error response:", error.response?.data);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
