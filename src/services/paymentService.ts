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
      const res = await api.post(
        `${PAYMENT_ENDPOINTS.CREATE_DEPOSIT(bookingId)}?redirect=${redirect}`,
        { amount }
      ); // Backend returns: { success: true, data: { payment, checkoutUrl, transaction_ref } }
      const responseData = res.data?.data || res.data;

      if (!responseData.checkoutUrl) {
        throw new Error("No checkoutUrl in response");
      }

      return {
        checkoutUrl: responseData.checkoutUrl,
        transaction_ref: responseData.transaction_ref || bookingId,
      };
    } catch (error: any) {
      throw error;
    }
  },

  async createVNPAYDeposit(
    bookingId: string,
    amount: number
  ): Promise<{ checkoutUrl: string; transaction_ref: string }> {
    try {
      // Backend validator requires 'amount' field (required)
      // Send deposit amount from booking.pricing_snapshot.deposit
      const res = await api.post(
        PAYMENT_ENDPOINTS.CREATE_DEPOSIT(bookingId),
        { amount } // Required field
      ); // Backend returns: { payment, checkoutUrl, transaction_ref }
      const data = res.data?.data || res.data;

      if (!data.checkoutUrl) {
        throw new Error("No checkoutUrl in response");
      }

      return {
        checkoutUrl: data.checkoutUrl,
        transaction_ref: data.transaction_ref || bookingId,
      };
    } catch (error: any) {
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
      throw error;
    }
  },

  async createFinalPayment(
    rentalId: string,
    redirect = false
  ): Promise<{
    success: boolean;
    data: { payment: any; checkoutUrl: string; message: string };
  }> {
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
      const res = await api.post(
        PAYMENT_ENDPOINTS.PAYOS_CLIENT_CALLBACK,
        params
      );
      return res.data?.data || res.data;
    } catch (error: any) {
      throw error;
    }
  },

  async handleVnpayCallback(
    params: Record<string, any>
  ): Promise<PaymentResponse> {
    try {
      // VNPay callback can be GET or POST
      const res = await api.post(PAYMENT_ENDPOINTS.VNPAY_CALLBACK, params);
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  async getPaymentHistory(): Promise<PaymentsResponse> {
    const res = await api.get(PAYMENT_ENDPOINTS.HISTORY);
    return res.data;
  },
};
