export interface Station {
  _id: string;
  name: string;
  address: string;
  city: string;
  geo: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  totalSlots: number;
  amenities: string[];
  fastCharging: boolean;
  rating: {
    avg: number;
    count: number;
  };
  operatingHours: {
    mon_fri?: string;
    weekend?: string;
    holiday?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  metrics: {
    vehicles_total: number;
    vehicles_available: number;
    vehicles_in_use: number;
    utilization_rate: number;
  };
  image?: string;
}

export interface NearbyStationsParams {
  lng: number;
  lat: number;
  radiusKm?: number;
}

export interface StationVehicle {
  _id: string;
  model: string;
  brand: string;
  type: string;
  batteryLevel: number;
  pricePerHour: number;
  image?: string;
  status: string;
}
