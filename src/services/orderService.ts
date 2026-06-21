// src/services/orderService.ts
import { api } from "../lib/api";
import { 
  ApiResponse, 
  PageResponse as BasePageResponse, 
  AdminOrderListResponse, 
  AdminOrderDetailResponse, 
  UpdateOrderStatusRequest, 
  OrderStatusUpdateResponse,
  OrderFilter
} from "../types";

import { 
  CreateOrderRequest, 
  OrderResponse, 
  OrderSummaryResponse, 
  PageResponse, 
  OrderDetailResponse 
} from "../types/order";

// ✅ EXTRACT DATA — admin servislərdəki kimi
const extractData = (res: any) => {
  if (!res) return null;
  if (res.success !== undefined && res.data !== undefined) return res.data;
  if (res.data?.success !== undefined && res.data?.data !== undefined) return res.data.data;
  if (res.content !== undefined || res.id !== undefined) return res;
  return res.data || res;
};

const API_URL = "/admin/orders";
const PUBLIC_API_URL = "/orders";

export const orderService = {
  // --- Admin Endpoints (SƏNİN KODUN — dəyişmə) ---
  getOrders: async (filter: OrderFilter = {}, page = 0, size = 20): Promise<BasePageResponse<AdminOrderListResponse>>=> {
    const params = new URLSearchParams();
    if (filter.status) params.append("status", filter.status);
    if (filter.from) params.append("fromDate", filter.from);
    if (filter.to) params.append("toDate", filter.to);
    if (filter.customerEmail) params.append("customerEmail", filter.customerEmail);
    if (filter.customerName) params.append("customerName", filter.customerName);
    params.append("page", page.toString());
    params.append("size", size.toString());

    const response: any = await api.get(API_URL, { params });
    return extractData(response) || { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: size, last: true };
  },

  getOrderById: async (id: number): Promise<AdminOrderDetailResponse> => {
    const response: any = await api.get(`${API_URL}/${id}`);
    return extractData(response);
  },

  updateOrderStatus: async (id: number, request: UpdateOrderStatusRequest): Promise<OrderStatusUpdateResponse> => {
    const response: any = await api.put(`${API_URL}/${id}/status`, request);
    return extractData(response);
  },

  // --- Public / Customer Endpoints (extractData ilə) ---
  createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    const response: any = await api.post(PUBLIC_API_URL, request);
    return extractData(response);
  },

  getMyOrders: async (page = 0, size = 10): Promise<PageResponse<OrderSummaryResponse>> => {
    const response: any = await api.get(`${PUBLIC_API_URL}/me`, {
      params: { page, size }
    });
    return extractData(response) || { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: size, last: true };
  },

  getMyOrderDetail: async (id: number): Promise<OrderDetailResponse> => {
    const response: any = await api.get(`${PUBLIC_API_URL}/${id}`);
    return extractData(response);
  },

  cancelOrder: async (id: number): Promise<OrderResponse> => {
    const response: any = await api.put(`${PUBLIC_API_URL}/${id}/cancel`);
    return extractData(response);
  }
};