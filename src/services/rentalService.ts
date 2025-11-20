import { api } from "../api/api";
import { ApiResponse } from "../types/apiResponse";
import { Rental } from "../types/rental";
import { RENTAL_ENDPOINTS } from "../constants/apiEndpoints";

interface GetRentalsParams {
  limit?: number;
  page?: number;
}

interface RentalIssue {
  id: string;
  rental_id: string;
  reported_by: string;
  issue_type: string;
  description: string;
  photos?: string[];
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface ReportIssueData {
  issue_type: string;
  description: string;
  photos?: string[];
}

class RentalService {
  /**
   * Get all user's rentals (customer)
   * GET /api/v1/rentals
   */
  async getUserRentals(params?: GetRentalsParams): Promise<{
    rentals: Rental[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    console.log("🔍 [RentalService] Calling getUserRentals with params:", params);
    console.log("🔍 [RentalService] Endpoint:", RENTAL_ENDPOINTS.LIST);
    
    const response = await api.get<ApiResponse<any>>(RENTAL_ENDPOINTS.LIST, {
      params,
    });

    console.log("📦 [RentalService] Raw response:", JSON.stringify(response, null, 2));

    // Handle potential double-wrapped response
    let data: any;
    if ((response as any).success && (response as any).data) {
      console.log("✅ [RentalService] Unwrapping double-wrapped response");
      data = (response as any).data;
    } else {
      console.log("ℹ️ [RentalService] Using response directly");
      data = response;
    }

    // Check if response is an array (direct rental list)
    if (Array.isArray(data)) {
      console.log("🔄 [RentalService] Response is array, converting to expected format");
      return {
        rentals: data,
        pagination: {
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1
        }
      };
    }

    console.log("📊 [RentalService] Final data:", {
      rentalsCount: data?.rentals?.length || 0,
      pagination: data?.pagination
    });

    return data;
  }

  /**
   * Get user's current active rental (customer)
   * GET /api/v1/rentals/active
   */
  async getUserActiveRental(): Promise<Rental | null> {
    const response = await api.get<ApiResponse<Rental>>(
      RENTAL_ENDPOINTS.ACTIVE
    );

    // Handle potential double-wrapped response
    let rentalData: any;
    if ((response as any).success && (response as any).data) {
      rentalData = (response as any).data;
    } else {
      rentalData = response;
    }

    return rentalData;
  }

  /**
   * Get rental by ID (customer)
   * GET /api/v1/rentals/:id
   */
  async getRentalById(rentalId: string): Promise<Rental> {
    const response = await api.get<ApiResponse<Rental>>(
      RENTAL_ENDPOINTS.BY_ID(rentalId)
    );

    // Handle potential double-wrapped response
    let rentalData: any;
    if ((response as any).success && (response as any).data) {
      rentalData = (response as any).data;
    } else {
      rentalData = response;
    }

    return rentalData;
  }

  /**
   * Report issue during rental (customer)
   * POST /api/v1/rentals/:id/report-issue
   */
  async reportRentalIssue(
    rentalId: string,
    issueData: ReportIssueData
  ): Promise<RentalIssue> {
    const response = await api.post<ApiResponse<RentalIssue>>(
      RENTAL_ENDPOINTS.REPORT_ISSUE(rentalId),
      issueData
    );

    // Handle potential double-wrapped response
    let data: any;
    if ((response as any).success && (response as any).data) {
      data = (response as any).data;
    } else {
      data = response;
    }

    return data;
  }

  /**
   * Get issues for specific rental (customer)
   * GET /api/v1/rentals/:id/issues
   */
  async getRentalIssues(
    rentalId: string,
    params?: GetRentalsParams
  ): Promise<{
    issues: RentalIssue[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await api.get<ApiResponse<any>>(
      RENTAL_ENDPOINTS.ISSUES(rentalId),
      { params }
    );

    // Handle potential double-wrapped response
    let data: any;
    if ((response as any).success && (response as any).data) {
      data = (response as any).data;
    } else {
      data = response;
    }

    return data;
  }

  /**
   * Complete return - Customer confirms final payment (customer)
   * POST /api/v1/rentals/:id/complete-return
   * This endpoint handles direct payment (not via VNPAY)
   */
  async completeReturn(rentalId: string): Promise<{
    rental: Rental;
    finalPayment: {
      amount: number;
      depositPaid: number;
      totalCharges: number;
      message: string;
    };
  }> {
    const response = await api.post(
      RENTAL_ENDPOINTS.COMPLETE_RETURN(rentalId)
    );

    // Handle double-wrapped response
    let data: any;
    if ((response as any).success && (response as any).data) {
      data = (response as any).data;
    } else if ((response as any).data) {
      data = (response as any).data;
    } else {
      data = response;
    }

    return data;
  }

  /**
   * Revert customer return payment (customer)
   * POST /api/v1/rentals/:id/revert-payment
   */
  async revertReturnPayment(rentalId: string): Promise<{
    rental: Rental;
    message: string;
  }> {
    const response = await api.post(
      RENTAL_ENDPOINTS.REVERT_PAYMENT(rentalId)
    );

    // Handle double-wrapped response
    let data: any;
    if ((response as any).success && (response as any).data) {
      data = (response as any).data;
    } else {
      data = response;
    }

    return data;
  }
}

export const rentalService = new RentalService();
