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
      const { lng, lat, radiusKm = 10 } = params;
      
      console.log('[stationService.getNearbyStations] Fetching stations:', { lng, lat, radiusKm });

      const response = await api.get(STATION_ENDPOINTS.NEARBY, {
        params: { lng, lat, radiusKm },
      });

      console.log('[stationService.getNearbyStations] Response:', response);

      // Backend may return { data: stations[] } or stations[] directly
      const stations = (response as any)?.data ?? response;
      
      console.log('[stationService.getNearbyStations] Stations count:', stations?.length || 0);
      
      return Array.isArray(stations) ? stations : [];
    } catch (error: any) {
      console.error('[stationService.getNearbyStations] Error:', error);
      console.error('[stationService.getNearbyStations] Error response:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get station by ID
   */
  async getStationById(
    id: string,
    includeVehicles: boolean = false
  ): Promise<Station> {
    try {
      console.log('[stationService.getStationById] Fetching station:', id);

      const response = await api.get(STATION_ENDPOINTS.BY_ID(id), {
        params: { includeVehicles },
      });

      console.log('[stationService.getStationById] Response:', response);

      // Backend may return { data: station } or station directly
      const station = (response as any)?.data ?? response;
      
      return station;
    } catch (error: any) {
      console.error('[stationService.getStationById] Error:', error);
      console.error('[stationService.getStationById] Error response:', error.response?.data);
      throw error;
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
    try {
      console.log('[stationService.listStations] Fetching with filters:', filters, options);

      const response = await api.get(STATION_ENDPOINTS.LIST, {
        params: { 
          status: 'ACTIVE',
          ...filters, 
          ...options 
        },
      });

      console.log('[stationService.listStations] Response:', response);

      // Backend may return { data: stations[] } or stations[] directly
      const stations = (response as any)?.data ?? response;
      
      console.log('[stationService.listStations] Stations count:', stations?.length || 0);
      
      return Array.isArray(stations) ? stations : [];
    } catch (error: any) {
      console.error('[stationService.listStations] Error:', error);
      console.error('[stationService.listStations] Error response:', error.response?.data);
      throw error;
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
