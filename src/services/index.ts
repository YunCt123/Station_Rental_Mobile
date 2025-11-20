/**
 * Services Index
 * Central export point for all services
 */

export { authService } from "./authService";
export { stationService } from "./stationService";
export { vehicleService } from "./vehicleService";
export { documentService } from "./documentService";
export { emailVerificationService } from "./emailVerificationService";
export { rentalService } from "./rentalService";
export { issueService } from "./issueService";

// Export types for convenience
export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerificationStatusResponse,
} from "../types/auth";
export type {
  Station,
  NearbyStationsParams,
  StationVehicle,
} from "../types/station";
export type {
  Vehicle,
  VehicleQueryParams,
  VehicleResponse,
  VehiclesResponse,
} from "../types/vehicle";
export type { Document, DocumentType, DocumentStatus } from "../types/document";
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
} from "../types/apiResponse";
