import { PAYMENT_ENDPOINTS } from "../constants/apiEndpoints";
import {
  CreatePayOSPaymentRequest,
  CreatePayOSPaymentResponse,
  PaymentsResponse,
  PaymentResponse,
} from "../types/payment";
import { api } from "../api/api";

export const paymentService = {
  async createDeposit(
    bookingId: string,
    redirect = false,
    amount: number
  ): Promise<{ checkoutUrl: string; transaction_ref: string }> {
    try {
      console.log(
        "[paymentService.createDeposit] Calling API:",
        bookingId,
        amount
      );
      const res = await api.post(
        `${PAYMENT_ENDPOINTS.CREATE_DEPOSIT(bookingId)}?redirect=${redirect}`,
        { amount }
      );
      console.log("[paymentService.createDeposit] Response:", res);
      console.log("[paymentService.createDeposit] Response data:", res.data);

      // Backend returns: { success: true, data: { payment, checkoutUrl, transaction_ref } }
      const responseData = res.data?.data || res.data;

      if (!responseData.checkoutUrl) {
        throw new Error("No checkoutUrl in response");
      }

      return {
        checkoutUrl: responseData.checkoutUrl,
        transaction_ref: responseData.transaction_ref || bookingId,
      };
    } catch (error: any) {
      console.error("[paymentService.createDeposit] Error:", error);
      console.error(
        "[paymentService.createDeposit] Error response:",
        error.response?.data
      );
      throw error;
    }
  },

  async createVNPAYDeposit(
    bookingId: string,
    amount: number
  ): Promise<{ checkoutUrl: string; transaction_ref: string }> {
    try {
      console.log(
        "[paymentService.createVNPAYDeposit] Calling API:",
        bookingId,
        amount
      );

      // Backend validator requires 'amount' field (required)
      // Send deposit amount from booking.pricing_snapshot.deposit
      const res = await api.post(
        PAYMENT_ENDPOINTS.CREATE_DEPOSIT(bookingId),
        { amount } // Required field
      );

      console.log("[paymentService.createVNPAYDeposit] Response:", res);
      console.log(
        "[paymentService.createVNPAYDeposit] Response data:",
        res.data
      );

      // Backend returns: { payment, checkoutUrl, transaction_ref }
      const data = res.data?.data || res.data;

      if (!data.checkoutUrl) {
        console.error(
          "[paymentService.createVNPAYDeposit] No checkoutUrl in response:",
          data
        );
        throw new Error("No checkoutUrl in response");
      }

      return {
        checkoutUrl: data.checkoutUrl,
        transaction_ref: data.transaction_ref || bookingId,
      };
    } catch (error: any) {
      console.error("[paymentService.createVNPAYDeposit] Error:", error);
      console.error(
        "[paymentService.createVNPAYDeposit] Error response:",
        error.response?.data
      );
      throw error;
    }
  },

  async createPayOSPayment(
    payload: CreatePayOSPaymentRequest
  ): Promise<CreatePayOSPaymentResponse> {
    try {
      const response = await api.post(PAYMENT_ENDPOINTS.CREATE_PAYOS, payload);
      return response.data;
    } catch (error: any) {
      console.error("[createPayOSPayment] Error:", error);
      throw error;
    }
  },

  async createFinalPayment(
    rentalId: string,
    redirect = false
  ): Promise<CreatePayOSPaymentResponse> {
    const res = await api.post(
      `${PAYMENT_ENDPOINTS.CREATE_FINAL(rentalId)}?redirect=${redirect}`
    );
    return res.data;
  },

  async getBookingPayments(bookingId: string): Promise<PaymentsResponse> {
    const res = await api.get(PAYMENT_ENDPOINTS.BY_BOOKING(bookingId));
    return res.data;
  },

  async getRentalPayments(rentalId: string): Promise<PaymentsResponse> {
    const res = await api.get(PAYMENT_ENDPOINTS.BY_RENTAL(rentalId));
    return res.data;
  },

  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    const res = await api.get(PAYMENT_ENDPOINTS.CHECK_STATUS(paymentId));
    return res.data;
  },

  async handlePayOSCallback(
    params: Record<string, any>
  ): Promise<PaymentResponse> {
    const res = await api.post(PAYMENT_ENDPOINTS.PAYOS_CALLBACK, params);
    return res.data;
  },

  async handlePayOSClientCallback(params: {
    transaction_ref: string;
    provider_payment_id: string;
    status: string;
    amount: number;
    code: string;
    bookingId: string;
  }): Promise<{ status: string; bookingId: string }> {
    try {
      console.log(
        "[paymentService.handlePayOSClientCallback] Calling API:",
        params
      );
      const res = await api.post(
        PAYMENT_ENDPOINTS.PAYOS_CLIENT_CALLBACK,
        params
      );
      console.log(
        "[paymentService.handlePayOSClientCallback] Response:",
        res.data
      );
      return res.data?.data || res.data;
    } catch (error: any) {
      console.error("[paymentService.handlePayOSClientCallback] Error:", error);
      throw error;
    }
  },

  async handleVnpayCallback(
    params: Record<string, any>
  ): Promise<PaymentResponse> {
    try {
      console.log("[paymentService.handleVnpayCallback] Calling API:", params);
      // VNPay callback can be GET or POST
      const res = await api.post(PAYMENT_ENDPOINTS.VNPAY_CALLBACK, params);
      console.log("[paymentService.handleVnpayCallback] Response:", res.data);
      return res.data;
    } catch (error: any) {
      console.error("[paymentService.handleVnpayCallback] Error:", error);
      throw error;
    }
  },

  async getPaymentHistory(): Promise<PaymentsResponse> {
    const res = await api.get(PAYMENT_ENDPOINTS.HISTORY);
    return res.data;
  },
};
