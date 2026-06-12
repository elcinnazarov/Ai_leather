// src/services/cartService.ts
import { api } from "../lib/api";
import { CartPreviewRequest, CartPreviewResponse } from "../types/cart";

// ✅ DÜZƏLİŞ: Artıq /api prefiksi əlavə etmirik (api instance-da var)
const CART_ENDPOINT = "/cart";

const extractData = (res: any) => {
  if (!res) return null;
  if (res.success !== undefined && res.data !== undefined) return res.data;
  if (res.data?.success !== undefined && res.data?.data !== undefined) return res.data.data;
  return res.data || res;
};

export const cartService = {
  previewCart: async (request: CartPreviewRequest): Promise<CartPreviewResponse> => {
    const response: any = await api.post(`${CART_ENDPOINT}/preview`, request);
    return extractData(response);
  }
};