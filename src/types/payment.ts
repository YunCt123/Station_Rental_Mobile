export interface Payment {
  _id: string;
  booking_id?: string;
  rental_id?: string;
  type: "DEPOSIT" | "RENTAL" | "RENTAL_FINAL" | "EXTRA" | "REFUND";
  amount: number;
  currency?: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  provider?: string;
  transaction_ref?: string;
  idempotency_key?: string;
  provider_payment_id?: string;
  provider_metadata?: Record<string, any>;
  metadata?: Record<string, any>;
  vnpay_url?: string;
  webhook_processed?: boolean;
  processed_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePayOSPaymentRequest {
  bookingId: string;
  amount: number;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePayOSPaymentResponse {
  payment: any;
  checkoutUrl: string;
  transaction_ref: string;
}

export interface UpdatePaymentStatusRequest {
  paymentId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
}



export interface CreateDeposit {
    amount: number;
}

export interface PaymentQueryParams {
  booking_id?: string;
  rental_id?: string;
  type?: string;
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data: Payment;
}

export interface PaymentsResponse {
  success: boolean;
  message?: string;
  data: Payment[];
}
