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

const API_URL = "/admin/orders";
const PUBLIC_API_URL = "/orders";

export const orderService = {
  // --- Admin Endpoints ---
  getOrders: async (filter: OrderFilter = {}, page = 0, size = 20): Promise<BasePageResponse<AdminOrderListResponse>> => {
    const params = new URLSearchParams();
    if (filter.status) params.append("status", filter.status);
    if (filter.from) params.append("fromDate", filter.from);
    if (filter.to) params.append("toDate", filter.to);
    if (filter.customerEmail) params.append("customerEmail", filter.customerEmail);
    if (filter.customerName) params.append("customerName", filter.customerName);
    params.append("page", page.toString());
    params.append("size", size.toString());

    const response = await api.get<ApiResponse<BasePageResponse<AdminOrderListResponse>>>(API_URL, { params });
    return response.data.data;
  },

  getOrderById: async (id: number): Promise<AdminOrderDetailResponse> => {
    const response = await api.get<ApiResponse<AdminOrderDetailResponse>>(`${API_URL}/${id}`);
    return response.data.data;
  },

  updateOrderStatus: async (id: number, request: UpdateOrderStatusRequest): Promise<OrderStatusUpdateResponse> => {
    const response = await api.put<ApiResponse<OrderStatusUpdateResponse>>(`${API_URL}/${id}/status`, request);
    return response.data.data;
  },

  // --- Public / Customer Endpoints ---
  createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await api.post<ApiResponse<OrderResponse>>(PUBLIC_API_URL, request);
    return response.data.data;
  },

  getMyOrders: async (page = 0, size = 10): Promise<PageResponse<OrderSummaryResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<OrderSummaryResponse>>>(`${PUBLIC_API_URL}/me`, {
      params: { page, size }
    });
    return response.data.data;
  },

  getMyOrderDetail: async (id: number): Promise<OrderDetailResponse> => {
    const response = await api.get<ApiResponse<OrderDetailResponse>>(`${PUBLIC_API_URL}/${id}`);
    return response.data.data;
  },

  cancelOrder: async (id: number): Promise<OrderResponse> => {
    const response = await api.put<ApiResponse<OrderResponse>>(`${PUBLIC_API_URL}/${id}/cancel`);
    return response.data.data;
  }
};
