import { api } from "../lib/api";
import { ApiResponse } from "../types";
import { CartPreviewRequest, CartPreviewResponse } from "../types/cart";

const API_BASE_URL = "/cart";

export const cartService = {
  previewCart: async (request: CartPreviewRequest): Promise<CartPreviewResponse> => {
    const response = await api.post<ApiResponse<CartPreviewResponse>>(`${API_BASE_URL}/preview`, request);
    return response.data.data;
  }
};
