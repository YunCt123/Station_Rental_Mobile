import { api } from "../api/api";
import { VEHICLE_ENDPOINTS } from "../constants/apiEndpoints";
import { Vehicle, VehicleQueryParams } from "../types/vehicle";
import { ApiResponse } from "../types/apiResponse";

/**
 * UI Vehicle - extends Vehicle with fields needed by components
 */
export interface UIVehicle extends Vehicle {
  id: string;
  location: string;
  hourlyRate: number;
  dailyRate: number;
}

/**
 * Map API Vehicle to UI format
 */
export const mapVehicleToUI = (vehicle: Vehicle): UIVehicle => ({
  ...vehicle,
  id: vehicle._id,
  rating: vehicle.rating || 0,
  reviewCount: vehicle.reviewCount || 0,
  batteryLevel: vehicle.batteryLevel || 0,
  range: vehicle.range || 0,
  seats: vehicle.seats || 0,
  station_name: vehicle.station_name || "",
  location: vehicle.station_name
    ? `Trạm ${vehicle.station_name}`
    : "Chưa có vị trí",
  pricePerHour: vehicle.pricePerHour || vehicle.pricing?.hourly || 0,
  hourlyRate: vehicle.pricePerHour || vehicle.pricing?.hourly || 0,
  pricePerDay: vehicle.pricePerDay || vehicle.pricing?.daily || 0,
  dailyRate: vehicle.pricePerDay || vehicle.pricing?.daily || 0,
  image: vehicle.image || "",
  features: vehicle.features || [],
  condition: vehicle.condition || "excellent",
  description:
    vehicle.description || `${vehicle.brand} ${vehicle.name} ${vehicle.year}`,
});

export const mapVehiclesToUI = (vehicles: Vehicle[]): UIVehicle[] =>
  vehicles.map(mapVehicleToUI);

class VehicleService {
  async getVehicles(params?: VehicleQueryParams): Promise<Vehicle[]> {
    const res = await api.get<ApiResponse<Vehicle[]>>(VEHICLE_ENDPOINTS.LIST, {
      params,
    });
    return res.data || [];
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const res = await api.get<ApiResponse<Vehicle>>(
      VEHICLE_ENDPOINTS.BY_ID(id)
    );
    return res.data;
  }

  async getAvailableVehicles(
    params?: Omit<VehicleQueryParams, "status">
  ): Promise<Vehicle[]> {
    const res = await api.get<ApiResponse<Vehicle[]>>(VEHICLE_ENDPOINTS.LIST, {
      params: { ...params, status: "AVAILABLE" },
    });
    return res.data || [];
  }

  async getVehiclesByStation(
    stationId: string,
    status?: string
  ): Promise<Vehicle[]> {
    const res = await api.get<ApiResponse<Vehicle[]>>(
      VEHICLE_ENDPOINTS.BY_STATION(stationId),
      {
        params: status ? { status } : {},
      }
    );
    return res.data || [];
  }

  async searchVehicles(query: string): Promise<Vehicle[]> {
    const res = await api.get<ApiResponse<Vehicle[]>>(
      VEHICLE_ENDPOINTS.SEARCH,
      {
        params: { search: query },
      }
    );
    return res.data || [];
  }

  async getFeaturedVehicles(limit = 3): Promise<Vehicle[]> {
    const res = await api.get<ApiResponse<Vehicle[]>>(VEHICLE_ENDPOINTS.LIST, {
      params: { sort: "-rating", limit },
    });
    return res.data || [];
  }

  async getVehiclesByType(type: string): Promise<Vehicle[]> {
    const res = await api.get<ApiResponse<Vehicle[]>>(VEHICLE_ENDPOINTS.LIST, {
      params: { type },
    });
    return res.data || [];
  }

  async getVehiclesByBrand(brand: string): Promise<Vehicle[]> {
    const res = await api.get<ApiResponse<Vehicle[]>>(VEHICLE_ENDPOINTS.LIST, {
      params: { brand },
    });
    return res.data || [];
  }

  async getBrands(): Promise<string[]> {
    const res = await api.get<ApiResponse<Vehicle[]>>(VEHICLE_ENDPOINTS.LIST);
    const vehicles = res.data || [];
    return [...new Set(vehicles.map((v) => v.brand))];
  }
}

export const vehicleService = new VehicleService();
