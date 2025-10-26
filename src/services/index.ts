/**
 * Services Index
 * Central export point for all services
 */

export { authService } from './authService';
export { stationService } from './stationService';
export { vehicleService } from './vehicleService';

// Export types for convenience
export type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
export type { Station, NearbyStationsParams, StationVehicle } from '../types/station';
export type { Vehicle, VehicleQueryParams, VehicleResponse, VehiclesResponse } from '../types/vehicle';
export type { ApiResponse, PaginatedResponse, ApiError } from '../types/apiResponse';
 