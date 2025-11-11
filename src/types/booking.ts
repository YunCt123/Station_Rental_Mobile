export interface Booking {
  _id: string;
  user_id: string;
  vehicle_id: string;
  station_id: string;
  rental_id?: string;

  // Backend uses snake_case
  start_at: string;
  end_at: string;

  // Also support camelCase for backward compatibility
  startAt?: string;
  endAt?: string;

  status: "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  hold_expires_at?: string;

  insuranceOption?: {
    premium?: boolean;
    note?: string;
  };
  totalPrice?: number;
  cancelled_by?: "USER" | "STAFF" | "SYSTEM";

  reason?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  cancel_reason?: string;
  lock_version?: number;
  source?: "WEB" | "APP" | "STAFF_PORTAL";

  pricing_snapshot?: PricingSnapshot;
  vehicle_snapshot?: VehicleSnapshot;
  station_snapshot?: StationSnapshot;
  payment?: Payment;
  agreement?: Agreement;
  insurance_option?: Insurance_Option;
}

export interface PricingSnapshot {
  hourly_rate: number;
  daily_rate: number;
  currency: string;
  deposit: number;
  total_price: number;
  base_price: number;
  insurance_price: number;
  taxes: number;
  details: {
    rawBase: number;
    rentalType: string | "hourly" | "daily";
    hours: number;
    days: number;
  };
  policy_version: string;
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
  status: "PENDING" | "SUCCESS" | "FAILED";
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
  stationId: string; // ✅ Optional: Backend will get from vehicle if not provided
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  pricing_snapshot?: {
    hourly_rate: number;
    daily_rate: number;
    currency: string;
    deposit: number;
    total_price: number;
    base_price: number;
    insurance_price: number;
    taxes: number;
    details: {
      rawBase: number;
      rentalType: string;
      hours: number;
      days: number;
    };
    policy_version: string;
  };
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
  cancelledBy?: "USER" | "STAFF" | "SYSTEM";
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
