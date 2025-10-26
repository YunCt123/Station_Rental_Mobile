/**
 * API Index
 * Central export point for API client and utilities
 */

export { api, apiClient, STORAGE_KEYS } from './api';

// Backward compatibility exports
export { authApi, apiClient as legacyApiClient } from './authApi';
export { stationApi } from './stationApi';
