  import { api } from "../lib/api";
  import {
    ApiResponse,
    ListManuelPricesResponse,
    ListCreateManualPricesRequest,
    ListDeleteManualPricesRequest,
  } from "../types";

  const API_BASE_URL = "/admin/products";

  export const manualPriceService = {
    // GET /admin/products/{productId}/manual-prices
    getManualPrices: async (productId: number): Promise<ListManuelPricesResponse> => {
      const response = await api.get<ApiResponse<ListManuelPricesResponse>>(`${API_BASE_URL}/${productId}/manual-prices`);
      return response.data.data;
    },

    // POST /admin/products/{productId}/manual-prices
    createManualPrices: async (
      productId: number,
      request: ListCreateManualPricesRequest
    ): Promise<ListManuelPricesResponse> => {
      const response = await api.post<ApiResponse<ListManuelPricesResponse>>(
        `${API_BASE_URL}/${productId}/manual-prices`,
        request
      );
      return response.data.data;
    },

    // PUT /admin/products/{productId}/manual-prices
    updateManualPrices: async (
      productId: number,
      request: ListCreateManualPricesRequest
    ): Promise<ListManuelPricesResponse> => {
      const response = await api.put<ApiResponse<ListManuelPricesResponse>>(
        `${API_BASE_URL}/${productId}/manual-prices`,
        request
      );
      return response.data.data;
    },

    // DELETE /admin/products/{productId}/manual-prices
    deleteManualPrices: async (
      productId: number,
      request: ListDeleteManualPricesRequest
    ): Promise<ListManuelPricesResponse> => {
      const response = await api.delete<ApiResponse<ListManuelPricesResponse>>(
        `${API_BASE_URL}/${productId}/manual-prices`,
        { data: request }
      );
      return response.data.data;
    },
  };
