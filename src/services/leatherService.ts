import { api } from "../lib/api";
import {
  LeatherResponse,
  CreateLeatherRequest,
  UpdateLeatherRequest,
  ApiResponse,
  AvailabilityStatus,
  PageResponse
} from "../types";
import {
  LeatherListResponse,
  LeatherDetailResponse,
  LeatherByGradeResponse,
  LeatherFilterRequest
} from "../types/leather";

const API_BASE_URL = "/admin/leathers";

export const leatherService = {
  // GET all leathers (Assuming a standard list endpoint exists, though not explicitly in the snippet)
  getAllLeathers: async (): Promise<LeatherResponse[]> => {
    const response = await api.get<ApiResponse<LeatherResponse[]>>(API_BASE_URL);
    return response.data.data;
  },

  createLeather: async (
    data: CreateLeatherRequest,
    image: File
  ): Promise<LeatherResponse> => {
    const formData = new FormData();
    // Wrap JSON data in a Blob with application/json type
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    formData.append("image", image);

    const response = await api.post<ApiResponse<LeatherResponse>>(API_BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  deleteLeatherImage: async (leatherId: number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${leatherId}/image`);
  },

  updateLeatherImage: async (
    id: number,
    image: File
  ): Promise<LeatherResponse> => {
    const formData = new FormData();
    formData.append("image", image);

    const response = await api.put<ApiResponse<LeatherResponse>>(
      `${API_BASE_URL}/${id}/image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  updateLeather: async (
    leatherId: number,
    data: UpdateLeatherRequest
  ): Promise<LeatherResponse> => {
    const response = await api.put<ApiResponse<LeatherResponse>>(
      `${API_BASE_URL}/${leatherId}`,
      data
    );
    return response.data.data;
  },

  updateLeatherStatus: async (
    leatherId: number,
    status: AvailabilityStatus
  ): Promise<LeatherResponse> => {
    const response = await api.put<ApiResponse<LeatherResponse>>(
      `${API_BASE_URL}/${leatherId}/status`,
      null,
      {
        params: { status },
      }
    );
    return response.data.data;
  },

  deleteLeather: async (leatherId: number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${leatherId}`);
  },

  // --- SHOP ENDPOINTS ---

  getShopLeathers: async (filter: LeatherFilterRequest = {}): Promise<PageResponse<LeatherListResponse>> => {
    const params = new URLSearchParams();
    if (filter.color) params.append("color", filter.color);
    if (filter.origin) params.append("origin", filter.origin);
    if (filter.gradeType) params.append("gradeType", filter.gradeType);
    if (filter.page !== undefined) params.append("page", filter.page.toString());
    if (filter.size !== undefined) params.append("size", filter.size.toString());

    const response = await api.get<ApiResponse<PageResponse<LeatherListResponse>>>("/leathers", { params });
    return response.data.data;
  },

  getShopLeatherDetail: async (id: number): Promise<LeatherDetailResponse> => {
    const response = await api.get<ApiResponse<LeatherDetailResponse>>(`/leathers/${id}`);
    return response.data.data;
  },

  getShopLeathersByGrade: async (gradeType: string, page: number = 0, size: number = 20): Promise<PageResponse<LeatherByGradeResponse>> => {
    const response = await api.get<ApiResponse<PageResponse<LeatherByGradeResponse>>>(`/leathers/by-grade/${gradeType}`, {
      params: { page, size }
    });
    return response.data.data;
  }
};
