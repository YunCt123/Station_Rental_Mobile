export interface RentalCondition {
  title: string;
  items: string[];
}

export interface RentalPolicy {
  title: string;
  description?: string;
  items?: string[];
  conditions?: RentalCondition[];
}

export interface PaymentMethod {
  title: string;
  description: string;
  icon: string;
}

export interface FeeItem {
  label: string;
  description: string;
  price: string;
}

export interface RefundPolicy {
  title: string;
  conditions: string[];
}
