export type DocumentType =
  | 'DRIVER_LICENSE' // Dùng cho CẢ 2 mặt giấy phép lái xe
  | 'ID_CARD_FRONT'
  | 'ID_CARD_BACK';

export type DocumentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface Document {
  _id?: string; 
  user_id: string; 
  type: DocumentType;
  number?: string;
  expiry?: Date | string;
  image_url: string;
  status?: DocumentStatus | "PENDING";
  reviewed_by?: string | null; 
  reviewed_at?: Date | string | null;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
