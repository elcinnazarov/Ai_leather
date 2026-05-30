import { api } from "../lib/api";
import {
  ApiResponse,
  PageResponse,
  AdminShippingLocationResponse,
  CreateShippingLocationRequest,
  UpdateShippingLocationRequest,
} from "../types";

const API_BASE_URL = "/admin/shipping-locations";

export const shippingService = {
  // GET /admin/shipping-locations
  getAllLocations: async (page: number = 0, size: number = 20): Promise<PageResponse<AdminShippingLocationResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<AdminShippingLocationResponse>>>(API_BASE_URL, {
      params: { page, size },
    });
    return response.data.data;
  },

  // GET /admin/shipping-locations/{id}
  getLocationById: async (id: number): Promise<AdminShippingLocationResponse> => {
    const response = await api.get<ApiResponse<AdminShippingLocationResponse>>(`${API_BASE_URL}/${id}`);
    return response.data.data;
  },

  // POST /admin/shipping-locations
  createLocation: async (request: CreateShippingLocationRequest): Promise<AdminShippingLocationResponse> => {
    const response = await api.post<ApiResponse<AdminShippingLocationResponse>>(API_BASE_URL, request);
    return response.data.data;
  },

  // PUT /admin/shipping-locations/{id}
  updateLocation: async (id: number, request: UpdateShippingLocationRequest): Promise<AdminShippingLocationResponse> => {
    const response = await api.put<ApiResponse<AdminShippingLocationResponse>>(`${API_BASE_URL}/${id}`, request);
    return response.data.data;
  },

  // PATCH /admin/shipping-locations/{id}/status
  toggleLocationStatus: async (id: number): Promise<AdminShippingLocationResponse> => {
    const response = await api.patch<ApiResponse<AdminShippingLocationResponse>>(`${API_BASE_URL}/${id}/status`);
    return response.data.data;
  },

  // DELETE /admin/shipping-locations/{id}
  deleteLocation: async (id: number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${id}`);
  },
};
