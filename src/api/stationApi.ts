import { apiClient } from './authApi';
import { Station, NearbyStationsParams, StationVehicle } from '../types/station';

const API_BASE_URL = '/v1'; // Base URL is already set in authApi

export const stationApi = {
  // Get nearby stations
  getNearbyStations: async (params: NearbyStationsParams): Promise<Station[]> => {
    const { lng, lat, radiusKm = 10 } = params;
    const response = await apiClient.get(`${API_BASE_URL}/stations/nearby`, {
      params: { lng, lat, radiusKm }
    });
    return response.data.data;
  },

  // Get station by ID
  getStationById: async (id: string, includeVehicles: boolean = false): Promise<Station> => {
    const response = await apiClient.get(`${API_BASE_URL}/stations/${id}`, {
      params: { includeVehicles }
    });
    return response.data.data;
  },

  // Get vehicles at a station
  getStationVehicles: async (id: string, status?: string): Promise<{
    station: {
      id: string;
      name: string;
      address: string;
    };
    vehicles: StationVehicle[];
    count: number;
  }> => {
    const response = await apiClient.get(`${API_BASE_URL}/stations/${id}/vehicles`, {
      params: status ? { status } : {}
    });
    return response.data.data;
  },

  // Get stations by city
  getStationsByCity: async (city: string): Promise<Station[]> => {
    const response = await apiClient.get(`${API_BASE_URL}/stations/city/${city}`);
    return response.data.data;
  },

  // List all stations
  listStations: async (filters?: any, options?: any): Promise<Station[]> => {
    const response = await apiClient.get(`${API_BASE_URL}/stations`, {
      params: { ...filters, ...options }
    });
    return response.data.data;
  }
};
