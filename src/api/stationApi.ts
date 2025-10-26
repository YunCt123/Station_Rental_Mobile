/**
 * @deprecated Use stationService from services folder instead
 * This file is kept for backward compatibility
 */
import { stationService } from '../services/stationService';

// Re-export stationService as stationApi for backward compatibility
export const stationApi = {
  getNearbyStations: stationService.getNearbyStations.bind(stationService),
  getStationById: stationService.getStationById.bind(stationService),
  getStationVehicles: stationService.getStationVehicles.bind(stationService),
  getStationsByCity: stationService.getStationsByCity.bind(stationService),
  listStations: stationService.listStations.bind(stationService),
  searchStations: stationService.searchStations.bind(stationService),
};

