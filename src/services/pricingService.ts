import { api } from "../lib/api";
import {
  PricingRuleResponse,
  CreatePricingRuleRequest,
  UpdatePricingRuleRequest,
  ApiResponse,
  Currency,
} from "../types";

const API_BASE_URL = "/admin/pricing";

export const pricingService = {
  getAllPricingRules: async (activeOnly: boolean = true): Promise<PricingRuleResponse[]> => {
    const response = await api.get<ApiResponse<PricingRuleResponse[]>>(`${API_BASE_URL}/rules`, {
      params: { activeOnly },
    });
    return response.data.data;
  },

  createPricingRule: async (data: CreatePricingRuleRequest): Promise<PricingRuleResponse> => {
    const response = await api.post<ApiResponse<PricingRuleResponse>>(`${API_BASE_URL}/rules`, data);
    return response.data.data;
  },

  updatePricingRule: async (
    currency: Currency,
    data: UpdatePricingRuleRequest
  ): Promise<PricingRuleResponse> => {
    const response = await api.put<ApiResponse<PricingRuleResponse>>(
      `${API_BASE_URL}/rules/${currency}`,
      data
    );
    return response.data.data;
  },

  deletePricingRule: async (currency: Currency): Promise<void> => {
    await api.delete(`${API_BASE_URL}/rules/${currency}`);
  },
};
