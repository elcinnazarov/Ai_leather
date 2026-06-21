import { api } from '../lib/api';

import {
  AdminProductModelResponse, ProductModelResponse, CreateProductModelRequest, UpdateProductModelRequest,
  ProductModelFilter, PageResponse, AvailabilityStatus, ApiResponse,
  ListProductPriceResponse, ListCreateProductPricesRequest, UpdateProductPriceRequest,
  ListManuelPricesResponse, ListCreateManualPricesRequest,
  ListDeleteManualPricesRequest, ProductPriceFilter, ProductPriceResponse
} from '../types/adminProduct';

export const adminProductService = {
  
  // ==========================================
  // 1. PRODUCT (BASE INFO)
  // ==========================================
  getProducts: async (filter: ProductModelFilter) => {
    const response = await api.get('/admin/products', { params: filter });
    console.log("SERVICE LAYER: Axios-dan gələn xam response:", response);

    if (response?.data?.data?.content) return response.data.data;
    if (response?.data?.content) return response.data;
    if (response?.data) return response.data;

    return { content: [], totalPages: 0, totalElements: 0 };
  },
  
  getProductById: async (id: number) => {
    const response = await api.get(`/admin/products/${id}`);
    console.log("SERVICE LAYER (Single Product):", response);

    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    
    return null;
  },
  
  createProduct: async (request: CreateProductModelRequest, images: File[]): Promise<ProductModelResponse> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    images.forEach(img => formData.append('image', img));

    const response = await api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    return response as any;
  },

  updateProduct: async (id: number, request: UpdateProductModelRequest): Promise<ProductModelResponse> => {
    const response = await api.put<ApiResponse<ProductModelResponse>>(`/admin/products/${id}`, request);
    return response.data.data;
  },

  updateProductStatus: async (productId: number, status: AvailabilityStatus) => {
    const response = await api.put(`/admin/products/${productId}/status`, null, {
      params: { status } 
    });
    
    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    return response;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },

  // ==========================================
  // 2. PRODUCT IMAGES (GALLERY)
  // ==========================================
  addImages: async (id: number, images: File[]): Promise<ProductModelResponse> => {
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    const response = await api.post<ApiResponse<ProductModelResponse>>(`/admin/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await api.delete(`/admin/products/images/${imageId}`);
  },

  setPrimaryImage: async (productId: number, imageId: number): Promise<void> => {
    await api.patch(`/admin/products/${productId}/images/${imageId}/primary`);
  },

  // ==========================================
  // 3. BASE PRICES (AZN)
  // ==========================================
  getProductPrices: async (productId: number): Promise<ListProductPriceResponse> => {
    const response = await api.get<ApiResponse<ListProductPriceResponse>>(`/admin/products/${productId}/prices`);
    return response.data.data;
  },

  createProductPrices: async (productId: number, request: ListCreateProductPricesRequest): Promise<ListProductPriceResponse> => {
    const response = await api.post<ApiResponse<ListProductPriceResponse>>(`/admin/products/${productId}/prices`, request);
    return response.data.data;
  },

  updateProductPrice: async (productId: number, gradeId: number, request: UpdateProductPriceRequest): Promise<void> => {
    await api.put(`/admin/products/${productId}/prices/${gradeId}`, request);
  },

  deleteProductPrice: async (productId: number, gradeId: number): Promise<void> => {
    await api.delete(`/admin/products/${productId}/prices/${gradeId}`);
  },

  // ==========================================
  // DİQQƏT: CALCULATED PRICES FUNKSİYASI BURADAN SİLİNDİ!
  // ==========================================

  // ==========================================
  // 4. MANUAL PRICES (OVERRIDES)
  // ==========================================
  getManualPrices: async (productId: number): Promise<ListManuelPricesResponse> => {
    const response = await api.get<ApiResponse<ListManuelPricesResponse>>(`/admin/products/${productId}/manual-prices`);
    return response.data.data;
  },

  createManualPrices: async (productId: number, request: ListCreateManualPricesRequest): Promise<ListManuelPricesResponse> => {
    const response = await api.post<ApiResponse<ListManuelPricesResponse>>(`/admin/products/${productId}/manual-prices`, request);
    return response.data.data;
  },

  updateManualPrices: async (productId: number, request: ListCreateManualPricesRequest): Promise<ListManuelPricesResponse> => {
    const response = await api.put<ApiResponse<ListManuelPricesResponse>>(`/admin/products/${productId}/manual-prices`, request);
    return response.data.data;
  },

  deleteManualPrices: async (productId: number, request: ListDeleteManualPricesRequest): Promise<ListManuelPricesResponse> => {
    const response = await api.delete<ApiResponse<ListManuelPricesResponse>>(`/admin/products/${productId}/manual-prices`, { data: request });
    return response.data.data;
  },

  getAllPrices: async (filter: ProductPriceFilter): Promise<PageResponse<ProductPriceResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<ProductPriceResponse>>>('/admin/products/prices', { params: filter });
    return response.data.data;
  },
};