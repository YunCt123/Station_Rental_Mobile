import { api } from "../api/api";
import { ISSUE_ENDPOINTS } from "../constants/apiEndpoints";
import { IssueModel, CreateIssueRequest } from "../types/issue";
import { ApiResponse } from "../types/apiResponse";

export const issueService = {
  /**
   * Create a new issue
   */
  createIssue: async (issueData: CreateIssueRequest): Promise<IssueModel> => {
    const response = await api.post<ApiResponse<IssueModel>>(
      ISSUE_ENDPOINTS.CREATE,
      issueData
    );
    return response.data;
  },

  /**
   * Create issue for specific rental (ONGOING rentals only)
   */
  createRentalIssue: async (
    rentalId: string,
    issueData: Omit<CreateIssueRequest, 'rental_id'>
  ): Promise<IssueModel> => {
    const response = await api.post<ApiResponse<IssueModel>>(
      ISSUE_ENDPOINTS.CREATE_RENTAL_ISSUE(rentalId),
      issueData
    );
    return response.data;
  },

  /**
   * Get user's issues with optional filters
   */
  getUserIssues: async (params?: {
    rental_id?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<IssueModel[]> => {
    const response = await api.get<ApiResponse<IssueModel[]>>(
      ISSUE_ENDPOINTS.LIST,
      { params }
    );
    return response.data;
  },

  /**
   * Get issue detail for customer (own issues only)
   */
  getCustomerIssueDetail: async (issueId: string): Promise<IssueModel> => {
    const response = await api.get<ApiResponse<IssueModel>>(
      ISSUE_ENDPOINTS.DETAIL(issueId)
    );
    return response.data;
  },

  /**
   * Get issues by rental ID
   */
  getRentalIssues: async (
    rentalId: string,
    params?: { limit?: number; page?: number }
  ): Promise<IssueModel[]> => {
    const response = await api.get<ApiResponse<IssueModel[]>>(
      ISSUE_ENDPOINTS.GET_RENTAL_ISSUES(rentalId),
      { params }
    );
    return response.data;
  },

  /**
   * Get all issues (staff/admin only)
   */
  getAllIssues: async (params?: {
    status?: string;
    vehicle_id?: string;
    station_id?: string;
    rental_id?: string;
    limit?: number;
    page?: number;
  }): Promise<IssueModel[]> => {
    const response = await api.get<ApiResponse<IssueModel[]>>(
      ISSUE_ENDPOINTS.ALL,
      { params }
    );
    return response.data;
  },

  /**
   * Update issue (staff/admin only)
   */
  updateIssue: async (
    issueId: string,
    updateData: { status?: string; description?: string }
  ): Promise<IssueModel> => {
    const response = await api.patch<ApiResponse<IssueModel>>(
      ISSUE_ENDPOINTS.UPDATE(issueId),
      updateData
    );
    return response.data;
  },
};
