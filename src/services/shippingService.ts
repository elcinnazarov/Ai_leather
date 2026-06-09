import { api } from "../lib/api";
import {
  PageResponse,
  AdminShippingLocationResponse,
  CreateShippingLocationRequest,
  UpdateShippingLocationRequest,
} from "../types";

const API_BASE_URL = "/admin/shipping-locations";

const extractData = (res: any) => {
  if (!res) return null;
  if (res.success !== undefined && res.data !== undefined) return res.data;
  if (res.data?.success !== undefined && res.data?.data !== undefined) return res.data.data;
  if (res.content !== undefined || res.id !== undefined) return res;
  return res.data || res;
};

export const shippingService = {
  
  // GET /api/admin/shipping-locations
  getAllLocations: async (page: number = 0, size: number = 20): Promise<PageResponse<AdminShippingLocationResponse>> => {
    const response: any = await api.get(API_BASE_URL, {
      params: { page, size },
    });
    return extractData(response) || { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: size, last: true };
  },

  // GET /api/admin/shipping-locations/{id}
  getLocationById: async (id: number): Promise<AdminShippingLocationResponse> => {
    const response: any = await api.get(`${API_BASE_URL}/${id}`);
    return extractData(response);
  },

  // POST /api/admin/shipping-locations
  createLocation: async (request: CreateShippingLocationRequest): Promise<AdminShippingLocationResponse> => {
    const response: any = await api.post(API_BASE_URL, request);
    return extractData(response);
  },

  // PUT /api/admin/shipping-locations/{id}
  updateLocation: async (id: number, request: UpdateShippingLocationRequest): Promise<AdminShippingLocationResponse> => {
    const response: any = await api.put(`${API_BASE_URL}/${id}`, request);
    return extractData(response);
  },

  // PATCH /api/admin/shipping-locations/{id}/status
  toggleLocationStatus: async (id: number): Promise<AdminShippingLocationResponse> => {
    const response: any = await api.patch(`${API_BASE_URL}/${id}/status`);
    return extractData(response);
  },

  // DELETE /api/admin/shipping-locations/{id}
  deleteLocation: async (id: number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${id}`);
  },
};