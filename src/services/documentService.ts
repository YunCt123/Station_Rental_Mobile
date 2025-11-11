import { api } from '../api/api';
import { Document, DocumentType } from '../types/document';
import { ApiResponse } from '../types/apiResponse';

/**
 * Document Service
 * Handles document verification operations
 */
class DocumentService {
  private readonly BASE_PATH = '/documents';

  /**
   * Upload document metadata (after uploading image to cloud storage)
   */
  async uploadDocumentMeta(data: {
    type: DocumentType;
    image_url: string;
    number?: string;
    expiry?: string;
  }): Promise<Document> {
    const response = await api.post<ApiResponse<Document>>(
      this.BASE_PATH,
      data
    );
    return response.data;
  }

  /**
   * Get all documents of current user
   */
  async getUserDocuments(params?: {
    limit?: number;
    page?: number;
  }): Promise<Document[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH;

    const response = await api.get<ApiResponse<Document[]>>(url);
    
    // Handle both array and object response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data || [];
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string): Promise<Document> {
    const response = await api.get<ApiResponse<Document>>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Upload multiple documents (batch upload)
   * Used for ID card front + back, driver license front + back
   * Upload TUẦN TỰ để tránh conflict khi có 2 documents cùng type
   */
  async uploadMultipleDocuments(
    documents: Array<{
      type: DocumentType;
      image_url: string;
      number?: string;
      expiry?: string;
    }>
  ): Promise<Document[]> {
    const results: Document[] = [];
    
    // Upload tuần tự thay vì parallel
    for (const doc of documents) {const result = await this.uploadDocumentMeta(doc);
      results.push(result);}
    
    return results;
  }

  /**
   * Check if user has uploaded all required documents
   */
  async checkDocumentsStatus(): Promise<{
    hasIdCardFront: boolean;
    hasIdCardBack: boolean;
    hasDriverLicense: boolean;
    allDocumentsApproved: boolean;
    pendingDocuments: Document[];
    rejectedDocuments: Document[];
  }> {
    const documents = await this.getUserDocuments({ limit: 50 });

    const idCardFront = documents.find(d => d.type === 'ID_CARD_FRONT');
    const idCardBack = documents.find(d => d.type === 'ID_CARD_BACK');
    const driverLicense = documents.find(d => d.type === 'DRIVER_LICENSE');

    const approvedDocs = documents.filter(d => d.status === 'APPROVED');
    const pendingDocs = documents.filter(d => d.status === 'PENDING');
    const rejectedDocs = documents.filter(d => d.status === 'REJECTED');

    return {
      hasIdCardFront: !!idCardFront,
      hasIdCardBack: !!idCardBack,
      hasDriverLicense: !!driverLicense,
      allDocumentsApproved: approvedDocs.length >= 3 && pendingDocs.length === 0,
      pendingDocuments: pendingDocs,
      rejectedDocuments: rejectedDocs,
    };
  }
}

// Export singleton instance
export const documentService = new DocumentService();
