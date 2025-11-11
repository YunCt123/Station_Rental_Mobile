import { api } from '../api/api';
import { STATION_ENDPOINTS } from '../constants/apiEndpoints';
import { Station, NearbyStationsParams, StationVehicle } from '../types/station';
import { ApiResponse } from '../types/apiResponse';

/**
 * Station Service
 * Handles all station-related operations
 */
class StationService {
  /**
   * Get nearby stations based on location
   */
  async getNearbyStations(params: NearbyStationsParams): Promise<Station[]> {
    try {
      const { lng, lat, radiusKm = 10 } = params;const response = await api.get(STATION_ENDPOINTS.NEARBY, {
        params: { lng, lat, radiusKm },
      });// Backend may return { data: stations[] } or stations[] directly
      const stations = (response as any)?.data ?? response;return Array.isArray(stations) ? stations : [];
    } catch (error: any) {throw error;
    }
  }

  /**
   * Get station by ID
   */
  async getStationById(
    id: string,
    includeVehicles: boolean = false
  ): Promise<Station> {
    try {const response = await api.get(STATION_ENDPOINTS.BY_ID(id), {
        params: { includeVehicles },
      });// Backend may return { data: station } or station directly
      const station = (response as any)?.data ?? response;
      
      return station;
    } catch (error: any) {throw error;
    }
  }

  /**
   * Get vehicles at a specific station
   */
  async getStationVehicles(
    id: string,
    status?: string
  ): Promise<{
    station: {
      id: string;
      name: string;
      address: string;
    };
    vehicles: StationVehicle[];
    count: number;
  }> {
    const response = await api.get<
      ApiResponse<{
        station: {
          id: string;
          name: string;
          address: string;
        };
        vehicles: StationVehicle[];
        count: number;
      }>
    >(STATION_ENDPOINTS.VEHICLES(id), {
      params: status ? { status } : {},
    });

    return response.data;
  }

  /**
   * Get stations by city
   */
  async getStationsByCity(city: string): Promise<Station[]> {
    const response = await api.get<ApiResponse<Station[]>>(
      STATION_ENDPOINTS.BY_CITY(city)
    );

    return response.data;
  }

  /**
   * List all stations with optional filters
   */
  async listStations(filters?: any, options?: any): Promise<Station[]> {
    try {const response = await api.get(STATION_ENDPOINTS.LIST, {
        params: { 
          status: 'ACTIVE',
          ...filters, 
          ...options 
        },
      });// Backend may return { data: stations[] } or stations[] directly
      const stations = (response as any)?.data ?? response;return Array.isArray(stations) ? stations : [];
    } catch (error: any) {throw error;
    }
  }

  /**
   * Search stations by name or address
   */
  async searchStations(query: string): Promise<Station[]> {
    const response = await api.get<ApiResponse<Station[]>>(
      STATION_ENDPOINTS.LIST,
      {
        params: { search: query },
      }
    );

    return response.data;
  }
}

// Export singleton instance
export const stationService = new StationService();
