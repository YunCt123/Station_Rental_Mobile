export interface RentalPhoto {
  _id: string;
  phase: 'PICKUP' | 'RETURN';
  url: string;
  taken_at: string | Date;
}

export interface Rental {
  _id?: string;

  booking_id: string | any; // Can be string (ID) or populated booking object
  user_id?: string | any;
  vehicle_id?: string | any; // Can be populated with vehicle object
  station_id?: string | any; // Can be populated with station object

  pickup?: {
    at?: Date | string;
    photos?: RentalPhoto[];
    odo_km?: number;
    soc?: number;
    contract_id?: string;
    staff_id?: string;
    notes?: string;

    rejected?: {
      at?: Date | string;
      staff_id?: string;
      reason?: string;
      photos?: RentalPhoto[];
    };
  };

  return?: {
    at?: Date | string;
    photos?: RentalPhoto[];
    odo_km?: number;
    soc?: number;
  }; 
  status: 'CONFIRMED' | 'ONGOING' | 'RETURN_PENDING' | 'COMPLETED' | 'DISPUTED' | 'REJECTED';

  pricing_snapshot: {
    hourly_rate: number;
    daily_rate: number;
    currency?: string;
    deposit: number;

    total_price?: number;
    base_price?: number;
    insurance_price?: number;
    taxes?: number;

    details?: {
      rawBase?: number;
      rentalType?: 'hourly' | 'daily';
      hours?: number;
      days?: number;
    };

    policy_version?: string;
  };

  charges?: {
    rental_fee?: number;
    cleaning_fee?: number;
    damage_fee?: number;
    late_fee?: number;
    other_fees?: number;
    extra_fees?: number;
    total?: number;
  };

  closed_at?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
