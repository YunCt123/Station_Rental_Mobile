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
   * Uses /vehicles endpoint with station_id filter (same as web)
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
    try {
      // First, get station info
      const stationData = await this.getStationById(id, false);
      
      // Then, get vehicles using /vehicles endpoint with station_id filter (like web)
      const params: any = { station_id: id };
      if (status) params.status = status;
      
      const response = await api.get('/vehicles', { params });
      
      // Handle potential double-wrapped response
      let vehicles: any[] = [];
      if (Array.isArray(response)) {
        vehicles = response;
      } else if ((response as any).data) {
        vehicles = Array.isArray((response as any).data) ? (response as any).data : [];
      }

      // Map backend vehicles to frontend format (StationVehicle)
      const mappedVehicles: StationVehicle[] = vehicles.map((vehicle: any) => ({
        _id: vehicle._id,
        model: vehicle.model || vehicle.name || '',
        brand: vehicle.brand || '',
        type: vehicle.type || '',
        batteryLevel: vehicle.battery_soc || vehicle.batteryLevel || 0,
        pricePerHour: vehicle.pricing?.hourly || vehicle.pricePerHour || 0,
        image: vehicle.image || '',
        status: vehicle.status || 'AVAILABLE',
      }));
      
      return {
        station: {
          id: stationData._id,
          name: stationData.name,
          address: stationData.address
        },
        vehicles: mappedVehicles,
        count: mappedVehicles.length
      };
    } catch (error) {
      throw error;
    }
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
