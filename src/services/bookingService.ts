import { api } from "../api/api";
import { BOOKING_ENDPOINTS } from "../constants/apiEndpoints";
import {
  Booking,
  BookingQueryParams,
  CreateBookingRequest,
  ConfirmBookingRequest,
  CancelBookingRequest,
} from "../types/booking";


class BookingService {
  /**
   * Get all bookings of current user
   */
  async getUserBookings(params?: BookingQueryParams): Promise<Booking[]> {
    try {
      // Add populate parameter to request vehicle and station details
      const requestParams = {
        ...params,
        populate: "vehicle_id,station_id",
      };

      const res = await api.get(BOOKING_ENDPOINTS.LIST, {
        params: requestParams,
      });

      return this.parseBookingsResponse(res);
    } catch (error: any) {
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
      return responseData.all_bookings_summary;
    }

    // Check if data field exists
    if (responseData?.data && Array.isArray(responseData.data)) {
      return responseData.data;
    }

    // Check if response is array directly
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    return [];
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      // Request backend to populate vehicle_id and station_id with full objects
      const res: any = await api.get(BOOKING_ENDPOINTS.BY_ID(id), {
        params: {
          populate: "vehicle_id,station_id",
        },
      });

      // Backend may return either { success, data: booking } or booking directly
      const booking: Booking = res?.data ?? res;

      return booking;
    } catch (error: any) {
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
    try {// Ensure currency is VND
      const requestData = {
        ...data,
        currency: "VND",
      };const res: any = await api.post(
        BOOKING_ENDPOINTS.CALCULATE_PRICE,
        requestData
      );// Handle different response formats (like Web does)
      let pricingData;

      if (res?.data?.success && res?.data?.data) {
        // Backend format: { success: true, data: {...} }
        pricingData = res.data.data;} else if (res?.data) {
        // Direct data format
        pricingData = res.data;} else {
        // Fallback to res
        pricingData = res;}// Validate pricing data
      if (!pricingData.totalPrice && !pricingData.total_price) {throw new Error("Backend không trả về giá hợp lệ");
      }

      return pricingData;
    } catch (error: any) {throw error;
    }
  }
}

export const bookingService = new BookingService();
