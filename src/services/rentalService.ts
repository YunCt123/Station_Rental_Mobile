import { api } from "../api/api";
import { ApiResponse } from "../types/apiResponse";

export interface Rental {
  _id: string;
  booking_id: string;
  user_id: string;
  vehicle_id: string;
  station_id: string;
  status:
    | "CONFIRMED"
    | "ONGOING"
    | "RETURN_PENDING"
    | "COMPLETED"
    | "DISPUTED"
    | "REJECTED";
  pickup?: {
    at?: Date;
    photos?: string[];
    odo_km?: number;
    soc?: number;
    staff_id?: string;
    notes?: string;
  };
  return?: {
    at?: Date;
    photos?: string[];
    odo_km?: number;
    soc?: number;
  };
  pricing_snapshot: {
    hourly_rate: number;
    daily_rate: number;
    currency: string;
    deposit: number;
    total_price?: number;
  };
  charges?: {
    rental_fee: number;
    cleaning_fee: number;
    damage_fee: number;
    late_fee: number;
    other_fees: number;
    extra_fees: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}

class RentalService {
  /**
   * Get rental by ID
   */
  async getRentalById(rentalId: string): Promise<Rental> {
    const response = await api.get<ApiResponse<Rental>>(`/rentals/${rentalId}`);

    // Handle potential double-wrapped response
    let rentalData: any;
    if ((response as any).success && (response as any).data) {
      rentalData = (response as any).data;
    } else {
      rentalData = response;
    }

    return rentalData;
  }
}

export const rentalService = new RentalService();
