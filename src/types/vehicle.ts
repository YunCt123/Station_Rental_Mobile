
export interface Vehicle {
  _id: string;
  name: string;
  year: number;
  brand: string;
  model?: string;
  type: string;
  image?: string;

  // Station info
  station_id?: string;
  station_name?: string;

  // Status
  status: 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';
  status_reason?: string;
  lock_version?: number;

  // Battery info
  batteryLevel?: number;
  battery_soc?: number;
  battery_kWh?: number;
  range?: number;
  seats?: number;

  // Pricing
  pricePerHour?: number;
  pricePerDay?: number;
  pricing?: {
    hourly?: number;
    daily?: number;
    currency?: string;
  };

  // Ratings
  rating?: number;
  reviewCount?: number;
  trips?: number;

  // Details
  features?: string[];
  condition?: string;
  mileage?: number;
  odo_km?: number;
  fuelEfficiency?: string;
  consumption_wh_per_km?: number;

  // Maintenance
  lastMaintenance?: string | Date;
  inspectionDate?: string | Date;
  inspection_due_at?: string | Date;
  insuranceExpiry?: string | Date;
  insurance_expiry_at?: string | Date;

  // Extra info
  description?: string;
  active?: boolean;
  tags?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleQueryParams {
  stationId?: string;
  type?: string;
  brand?: string;
  status?: string;
  batteryLevel?: number;
  seats?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface VehicleResponse {
  success: boolean;
  message?: string;
  data: Vehicle;
}

export interface VehiclesResponse {
  success: boolean;
  message?: string;
  data: Vehicle[];
}
