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
    const res = await api.get<ApiResponse<Booking[]>>(BOOKING_ENDPOINTS.LIST, {
      params,
    });
    return res.data || [];
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const res = await api.get<ApiResponse<Booking>>(BOOKING_ENDPOINTS.BY_ID(id));
    return res.data;
  }

  /**
   * Create new booking (status: HELD)
   */
  async createBooking(payload: CreateBookingRequest): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>(
      BOOKING_ENDPOINTS.LIST,
      payload
    );
    return res.data;
  }

  /**
   * Confirm booking (start rental)
   */
  async confirmBooking(payload: ConfirmBookingRequest): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>(
      BOOKING_ENDPOINTS.CONFIRM(payload.bookingId)
    );
    return res.data;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    id: string,
    payload: CancelBookingRequest
  ): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>(
      BOOKING_ENDPOINTS.CANCEL(id),
      payload
    );
    return res.data;
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
    const res = await api.post<ApiResponse<any>>(
      BOOKING_ENDPOINTS.CALCULATE_PRICE,
      data
    );
    return res.data;
  }
}

export const bookingService = new BookingService();
