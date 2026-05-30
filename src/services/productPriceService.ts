import { api } from "../lib/api";
import {
  ApiResponse,
  PageResponse,
  ProductPriceResponse,
  ListProductPriceResponse,
  ListCreateProductPricesRequest,
  UpdateProductPriceRequest,
  AdminCalculatedPriceResponse,
} from "../types";

const API_BASE_URL = "/admin/products";

export const productPriceService = {
  // GET /admin/products - Get all prices with filtering and pagination
  getPrices: async (filter: any, page: number = 0, size: number = 10): Promise<PageResponse<ProductPriceResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<ProductPriceResponse>>>(API_BASE_URL, {
      params: { ...filter, page, size },
    });
    return response.data.data;
  },

  // GET /admin/products/{productId}/prices
  getProductPrices: async (productId: number): Promise<ListProductPriceResponse> => {
    const response = await api.get<ApiResponse<ListProductPriceResponse>>(`${API_BASE_URL}/${productId}/prices`);
    return response.data.data;
  },

  // POST /admin/products/{productId}/prices
  createProductPrices: async (
    productId: number,
    request: ListCreateProductPricesRequest
  ): Promise<ListProductPriceResponse> => {
    const response = await api.post<ApiResponse<ListProductPriceResponse>>(
      `${API_BASE_URL}/${productId}/prices`,
      request
    );
    return response.data.data;
  },

  // PUT /admin/products/{productId}/prices/{gradeId}
  updateProductPrice: async (
    productId: number,
    gradeId: number,
    request: UpdateProductPriceRequest
  ): Promise<ProductPriceResponse> => {
    const response = await api.put<ApiResponse<ProductPriceResponse>>(
      `${API_BASE_URL}/${productId}/prices/${gradeId}`,
      request
    );
    return response.data.data;
  },

  // DELETE /admin/products/{productId}/prices/{gradeId}
  deleteProductPrice: async (productId: number, gradeId: number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${productId}/prices/${gradeId}`);
  },

  // GET /admin/products/{productId}/calculated-prices
  getCalculatedPrices: async (productId: number): Promise<AdminCalculatedPriceResponse> => {
    const response = await api.get<ApiResponse<AdminCalculatedPriceResponse>>(
      `${API_BASE_URL}/${productId}/calculated-prices`
    );
    return response.data.data;
  },
};
