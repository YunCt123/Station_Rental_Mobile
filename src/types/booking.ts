export interface Booking {
    _id: string;
    user_id: string;
    vehicle_id: string;
    station_id: string;
    rental_id?: string;
    startAt: string;
    endAt: string;
    insuranceOption?: {
      premium?: boolean;
      note?: string;
    };
    totalPrice?: number;
    status: "HELD" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    cancelled_by?: "USER" | "STAFF" | "SYSTEM";

    hold_expires_at?: string;
    reason?: string;
    createdAt?: string;
    updatedAt?: string;
    note?: string;
    cancel_reason?: string;
    pricing_snapshot?: PricingSnapshot;
    vehicle_snapshot?: VehicleSnapshot;
    station_snapshot?: StationSnapshot;
    payment?: Payment;
    agreement?: Agreement;
    insurance_option?: Insurance_Option;
  }

  export interface PricingSnapshot {
    hourly_rate: number,
    daily_rate: number,
    currency: string,
    deposit: number,
    total_price: number,
    base_price: number,
    insurance_price: number,
    taxes: number,
    details: {
      rawBase: number,
      rentalType: string | 'hourly' | 'daily',
        hours: number,
        days: number
      },
      policy_version: string,
  }

  export interface VehicleSnapshot {
    name: string;
    brand: string;
    model: string;
    type: string;
    seats: number;
    battery_kWh: number;
  }

  export interface StationSnapshot {
    name: string;
    address: string;
    city: string;

  }

  export interface Payment {
    deposit_required: boolean;
    method: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    deposit_payment_id: string;
  } 
  
  export interface Agreement {
    accepted: boolean;
    accepted_at: Date;
    terms_version: string;
  }

  export interface Insurance_Option {
    premium: boolean;
    note: string;
  }
  
  export interface CreateBookingRequest {
    vehicleId: string;
    stationId: string;
    startAt: string; // ISO date string
    endAt: string;   // ISO date string
    agreement: {
      accepted: boolean;
    };
    insuranceOption?: {
      premium?: boolean;
      note?: string;
    };
  }
  
  export interface ConfirmBookingRequest {
    bookingId: string;
  }
  
  export interface CancelBookingRequest {
    bookingId: string;
    reason: string;
    cancelledBy?: 'USER' | 'STAFF' | 'SYSTEM';
  }

  export interface BookingQueryParams {
    status?: string;
    stationId?: string;
    vehicleId?: string;
    userId?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }
  
  export interface BookingResponse {
    success: boolean;
    message?: string;
    data: Booking;
  }
  
  export interface BookingsResponse {
    success: boolean;
    message?: string;
    data: Booking[];
  }
  